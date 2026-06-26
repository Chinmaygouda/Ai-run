"""
Pydantic schemas for candidate profile validation.
These models mirror the exact structure of candidates.jsonl and are used to
validate AI-extracted resume data before appending to the dataset.
"""
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class SkillModel(BaseModel):
    name: str
    proficiency: Literal["beginner", "intermediate", "advanced", "expert"] = "intermediate"
    endorsements: Optional[int] = Field(default=0, ge=0)
    duration_months: Optional[int] = Field(default=0, ge=0)


class CareerHistoryModel(BaseModel):
    company: str
    title: str
    duration_months: Optional[int] = Field(default=0, ge=0)
    description: Optional[str] = ""

    @field_validator("description", mode="before")
    @classmethod
    def coerce_none_desc(cls, v):
        return v or ""


class ProfileModel(BaseModel):
    current_title: str = ""
    years_of_experience: float = Field(default=0.0, ge=0.0)
    current_company: Optional[str] = ""
    location: Optional[str] = ""
    country: Optional[str] = ""
    summary: Optional[str] = ""


class RedrObSignalsModel(BaseModel):
    recruiter_response_rate: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)
    github_activity_score: Optional[float] = Field(default=0.0, ge=0.0)
    interview_completion_rate: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)
    offer_acceptance_rate: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)
    open_to_work_flag: Optional[bool] = True
    last_active_date: Optional[str] = None
    notice_period_days: Optional[int] = Field(default=30, ge=0)


class CandidateModel(BaseModel):
    """Full candidate profile — mirrors candidates.jsonl schema."""
    candidate_id: str
    profile: ProfileModel
    career_history: List[CareerHistoryModel] = []
    skills: List[SkillModel] = []
    redrob_signals: RedrObSignalsModel = RedrObSignalsModel()

    def to_jsonl_dict(self) -> Dict[str, Any]:
        """Return a dict ready to be serialized as a JSONL line."""
        return self.model_dump(exclude_none=False)
