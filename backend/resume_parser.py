"""
Resume Parser — converts PDF or image resumes to structured JSONL candidates
using Groq's LLM API.

Strategy:
  - PDF  → extract text with pdfplumber → send text to llama3-70b-8192
  - Image → base64-encode → send to llama-4-scout (vision model) directly
"""
import base64
import json
import os
import re
import uuid
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

# ---------------------------------------------------------------------------
# Optional dependency guards — provide clear errors on missing packages
# ---------------------------------------------------------------------------
try:
    import pdfplumber
    _PDFPLUMBER_AVAILABLE = True
except ImportError:
    _PDFPLUMBER_AVAILABLE = False

try:
    from groq import Groq
    _GROQ_AVAILABLE = True
except ImportError:
    _GROQ_AVAILABLE = False

from backend.schemas import CandidateModel


# ---------------------------------------------------------------------------
# Groq model constants
# ---------------------------------------------------------------------------
TEXT_MODEL  = "llama-3.3-70b-versatile"  # Groq recommended successor to llama3-70b-8192
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Vision-capable


# ---------------------------------------------------------------------------
# Structured extraction prompt
# ---------------------------------------------------------------------------
EXTRACTION_PROMPT = """You are an expert resume parser. 
Extract the following structured information from this resume and return ONLY valid JSON.
Do NOT include any explanation, markdown code blocks, or prose — just the raw JSON object.

Required JSON schema:
{
  "candidate_id": "<generate a short slug from the person's name, lowercase with underscores, e.g. jane_doe>",
  "profile": {
    "current_title": "<most recent job title>",
    "years_of_experience": <float — total years of professional experience>,
    "current_company": "<most recent employer>",
    "location": "<city, state/region>",
    "country": "<country name>",
    "summary": "<2-3 sentence professional summary from the resume or infer one>"
  },
  "career_history": [
    {
      "company": "<employer name>",
      "title": "<role title>",
      "duration_months": <integer — approximate months in this role>,
      "description": "<1-2 sentence summary of key responsibilities and achievements>"
    }
  ],
  "skills": [
    {
      "name": "<skill name>",
      "proficiency": "<one of: beginner | intermediate | advanced | expert — infer from context>",
      "endorsements": 0,
      "duration_months": <integer — approximate months using this skill>
    }
  ],
  "redrob_signals": {
    "recruiter_response_rate": 0.75,
    "open_to_work_flag": true
  }
}

Rules:
- years_of_experience must be a number (e.g., 5.0, 3.5).
- duration_months must be integers (e.g., 24).
- proficiency must be exactly one of: beginner, intermediate, advanced, expert.
- Extract ALL jobs and ALL skills mentioned in the resume.
- If a field is not found, use a sensible default (empty string for strings, 0 for numbers).
- candidate_id must be URL-safe (lowercase, underscores only, no spaces).

Resume text:
"""


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file using pdfplumber."""
    if not _PDFPLUMBER_AVAILABLE:
        raise ImportError(
            "pdfplumber is not installed. Run: pip install pdfplumber"
        )
    text_parts = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())
    return "\n\n".join(text_parts)


def _encode_image_base64(file_bytes: bytes, mime_type: str) -> str:
    """Encode image bytes to base64 data URI."""
    b64 = base64.b64encode(file_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{b64}"


def _clean_llm_response(raw: str) -> str:
    """
    Strip markdown code fences and leading/trailing whitespace from LLM output.
    e.g. ```json\\n{...}\\n``` → '{...}'
    """
    raw = raw.strip()
    # Remove ```json ... ``` or ``` ... ``` blocks
    raw = re.sub(r"^```(?:json)?\\s*", "", raw)
    raw = re.sub(r"\\s*```$", "", raw)
    # Also handle if there's a leading/trailing newline inside fences
    raw = raw.strip()
    return raw


def _call_groq_text(client: Groq, resume_text: str) -> str:
    """Send extracted PDF text to Groq text model."""
    completion = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {
                "role": "user",
                "content": EXTRACTION_PROMPT + resume_text
            }
        ],
        temperature=0.1,   # Low temperature for deterministic structured output
        max_tokens=4096,
    )
    return completion.choices[0].message.content or ""


def _call_groq_vision(client: Groq, data_uri: str) -> str:
    """Send base64 image to Groq vision model."""
    completion = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT + "\n(Extract information from the resume shown in the image above.)"
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": data_uri}
                    }
                ]
            }
        ],
        temperature=0.1,
        max_tokens=4096,
    )
    return completion.choices[0].message.content or ""


def parse_resume(
    file_bytes: bytes,
    filename: str,
    groq_api_key: Optional[str] = None,
) -> Tuple[CandidateModel, Dict[str, Any]]:
    """
    Parse a resume (PDF or image) and return a validated CandidateModel.

    Args:
        file_bytes:    Raw bytes of the uploaded file.
        filename:      Original filename (used to determine file type).
        groq_api_key:  Groq API key. Falls back to GROQ_API_KEY env variable.

    Returns:
        Tuple of (CandidateModel, raw_dict_from_llm).

    Raises:
        ValueError:   If file type is unsupported or LLM response is not valid JSON.
        ImportError:  If required dependency is not installed.
        RuntimeError: If Groq API call fails.
    """
    if not _GROQ_AVAILABLE:
        raise ImportError(
            "groq package is not installed. Run: pip install groq"
        )

    api_key = groq_api_key or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "Groq API key not found. Set the GROQ_API_KEY environment variable "
            "or pass groq_api_key parameter."
        )

    client = Groq(api_key=api_key)
    ext = Path(filename).suffix.lower()

    # -----------------------------------------------------------------
    # Step 1: Extract text or encode image
    # -----------------------------------------------------------------
    if ext == ".pdf":
        print(f"[ResumeParser] Extracting text from PDF: {filename}")
        resume_text = _extract_text_from_pdf(file_bytes)
        if not resume_text.strip():
            raise ValueError(
                "Could not extract any text from the PDF. "
                "The file may be a scanned image — try uploading as PNG/JPG instead."
            )
        print(f"[ResumeParser] Extracted {len(resume_text)} characters from PDF.")
        raw_response = _call_groq_text(client, resume_text)

    elif ext in (".jpg", ".jpeg"):
        print(f"[ResumeParser] Sending image to Groq Vision: {filename}")
        data_uri = _encode_image_base64(file_bytes, "image/jpeg")
        raw_response = _call_groq_vision(client, data_uri)

    elif ext == ".png":
        print(f"[ResumeParser] Sending image to Groq Vision: {filename}")
        data_uri = _encode_image_base64(file_bytes, "image/png")
        raw_response = _call_groq_vision(client, data_uri)

    elif ext == ".webp":
        print(f"[ResumeParser] Sending image to Groq Vision: {filename}")
        data_uri = _encode_image_base64(file_bytes, "image/webp")
        raw_response = _call_groq_vision(client, data_uri)

    else:
        raise ValueError(
            f"Unsupported file type: '{ext}'. "
            "Supported types: .pdf, .jpg, .jpeg, .png, .webp"
        )

    # -----------------------------------------------------------------
    # Step 2: Parse and validate the LLM JSON response
    # -----------------------------------------------------------------
    print("[ResumeParser] Parsing LLM response...")
    cleaned = _clean_llm_response(raw_response)

    try:
        raw_dict = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM returned invalid JSON. Parse error: {e}\n"
            f"Raw LLM output (first 500 chars):\n{cleaned[:500]}"
        )

    # Ensure candidate_id is always set and unique-ish
    if not raw_dict.get("candidate_id") or raw_dict["candidate_id"] == "":
        raw_dict["candidate_id"] = f"resume_{uuid.uuid4().hex[:8]}"
    else:
        # Append short UUID suffix to prevent collisions on bulk upload
        raw_dict["candidate_id"] = f"{raw_dict['candidate_id']}_{uuid.uuid4().hex[:6]}"

    # Validate against Pydantic schema
    try:
        candidate = CandidateModel(**raw_dict)
    except Exception as e:
        raise ValueError(
            f"Parsed resume data failed schema validation: {e}\n"
            f"Raw parsed dict: {json.dumps(raw_dict, indent=2)[:800]}"
        )

    print(f"[ResumeParser] Successfully parsed candidate: {candidate.candidate_id}")
    return candidate, raw_dict


def append_candidate_to_jsonl(candidate: CandidateModel, jsonl_path: str) -> bool:
    """
    Safely append a new candidate to the candidates.jsonl file.
    Checks for duplicate candidate_id before writing.

    Args:
        candidate:   Validated CandidateModel to append.
        jsonl_path:  Path to the candidates.jsonl file.

    Returns:
        True if successfully appended, False if duplicate was found (skip).
    """
    target_id = candidate.candidate_id

    # Check for existing duplicate
    if os.path.exists(jsonl_path):
        with open(jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    existing = json.loads(line)
                    if existing.get("candidate_id") == target_id:
                        print(f"[ResumeParser] Duplicate candidate_id '{target_id}' — skipping.")
                        return False
                except json.JSONDecodeError:
                    continue

    # Append new candidate
    os.makedirs(os.path.dirname(jsonl_path) if os.path.dirname(jsonl_path) else ".", exist_ok=True)
    with open(jsonl_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(candidate.to_jsonl_dict()) + "\n")

    print(f"[ResumeParser] Appended candidate '{target_id}' to {jsonl_path}.")
    return True
