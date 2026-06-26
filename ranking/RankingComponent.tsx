import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Server, 
  RefreshCw, 
  FileText, 
  Play, 
  Check, 
  UploadCloud, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  User, 
  Briefcase, 
  Award, 
  MapPin, 
  Info, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Brain,
  Terminal,
  Activity,
  Layers,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to format score percentage
const formatPercent = (val: any) => {
  if (val === undefined || val === null) return "0%";
  const num = typeof val === "number" ? val : parseFloat(val);
  return `${Math.round(num * 100)}%`;
};

// Sub-component: Score Bar Indicator
const ScoreBar = ({ label, val, colorClass = "bg-violet-500" }: { label: string; val: any; colorClass?: string }) => {
  const percentage = formatPercent(val);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-bold">{percentage}</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: percentage }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colorClass} rounded-full`}
        />
      </div>
    </div>
  );
};

export default function RankingComponent() {
  // API Health state
  const [health, setHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Job Description state
  const [jdText, setJdText] = useState("");
  const [jdLoading, setJdLoading] = useState(false);
  const [jdSaving, setJdSaving] = useState(false);

  // Resume upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Pipeline execution state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobMessage, setJobMessage] = useState<string>("");
  const [pipelineLoading, setPipelineLoading] = useState(false);

  // Candidates state
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidateDetail, setCandidateDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"ranking" | "jd" | "upload">("ranking");

  // Fetch API health info
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        toast.error("Failed to load backend system health.");
      }
    } catch (e) {
      console.error(e);
      toast.error("FastAPI server offline or unreachable.");
    } finally {
      setHealthLoading(false);
    }
  };

  // Fetch current Job Description
  const fetchJD = async () => {
    setJdLoading(true);
    try {
      const res = await fetch("/api/job-description");
      if (res.ok) {
        const data = await res.json();
        setJdText(data.jd_text || "");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error retrieving job description.");
    } finally {
      setJdLoading(false);
    }
  };

  // Save updated Job Description
  const handleSaveJD = async () => {
    if (!jdText.trim()) {
      toast.error("Job Description cannot be empty.");
      return;
    }
    setJdSaving(true);
    try {
      const res = await fetch("/api/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdText })
      });
      if (res.ok) {
        toast.success("Job Description updated successfully.");
      } else {
        toast.error("Failed to save job description.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving job description.");
    } finally {
      setJdSaving(false);
    }
  };

  // Handle file drop/upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadResult(data);
        toast.success(data.status === "success" ? "Resume parsed and ingested!" : "Resume processed (duplicate).");
        setUploadFile(null);
        fetchHealth(); // refresh candidate counts
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error uploading resume.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error during resume ingestion.");
    } finally {
      setUploading(false);
    }
  };

  // Trigger Asynchronous Pipeline
  const handleTriggerRanking = async () => {
    setPipelineLoading(true);
    setJobStatus("queued");
    setJobMessage("Connecting to engine...");
    try {
      const res = await fetch("/api/rank", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setJobId(data.job_id);
        toast.success("Candidate screening & ranking pipeline initiated.");
      } else {
        toast.error("Failed to trigger pipeline.");
        setPipelineLoading(false);
        setJobStatus(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to communicate with ranking engine.");
      setPipelineLoading(false);
      setJobStatus(null);
    }
  };

  // Poll Job Status
  useEffect(() => {
    if (!jobId) return;

    let timer: any;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/rank/status/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJobStatus(data.status);
          setJobMessage(data.message || "");

          if (data.status === "completed") {
            toast.success("Ranking pipeline complete!");
            setPipelineLoading(false);
            setJobId(null);
            fetchCandidates(1); // refresh candidate table
          } else if (data.status === "failed") {
            toast.error(`Pipeline failed: ${data.message}`);
            setPipelineLoading(false);
            setJobId(null);
          } else {
            // Keep polling
            timer = setTimeout(checkStatus, 2000);
          }
        }
      } catch (e) {
        console.error(e);
        setJobStatus("failed");
        setJobMessage("Failed to poll pipeline status.");
        setPipelineLoading(false);
        setJobId(null);
      }
    };

    timer = setTimeout(checkStatus, 1500);
    return () => clearTimeout(timer);
  }, [jobId]);

  // Fetch Ranked Candidates
  const fetchCandidates = async (page: number = 1) => {
    setCandidatesLoading(true);
    try {
      const res = await fetch(`/api/candidates?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
        setCurrentPage(page);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error retrieving candidate list.");
    } finally {
      setCandidatesLoading(false);
    }
  };

  // Fetch Candidate Profile detail (candidates.jsonl)
  const fetchCandidateDetail = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setDetailLoading(true);
    setCandidateDetail(null);
    try {
      const res = await fetch(`/api/candidates/${candidate.candidate_id}`);
      if (res.ok) {
        const data = await res.json();
        setCandidateDetail(data.candidate);
      } else {
        toast.error("Failed to load candidate raw profile.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error retrieving candidate profile.");
    } finally {
      setDetailLoading(false);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchHealth();
    fetchJD();
    fetchCandidates(1);
  }, []);

  // Filter candidates on SearchTerm
  const filteredCandidates = candidates.filter(c => 
    c.candidate_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-mono text-sm mb-1 uppercase tracking-widest">
            <Cpu className="w-4 h-4 animate-pulse" />
            AI Screening System
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Candidate screening & Ranking
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Ingest resume pipelines, analyze features, detect resume inflation frauds, and rank software engineering candidates against job definitions.
          </p>
        </div>

        {/* System Health Monitor */}
        <div className="flex items-center gap-4 bg-zinc-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${health?.status === "ok" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="font-mono text-zinc-300">Engine: {health?.status === "ok" ? "Online" : "Offline"}</span>
              <button 
                onClick={fetchHealth} 
                disabled={healthLoading}
                className="text-zinc-500 hover:text-white transition-colors duration-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 space-y-0.5">
              <div>Dataset size: <span className="text-zinc-300">{health?.dataset?.candidates_count || 0} candidates</span></div>
              <div>Semantic models: <span className={health?.models?.semantic_reranker_available ? "text-green-400" : "text-amber-400"}>
                {health?.models?.semantic_reranker_available ? "Active" : "Fallback (0.5)"}
              </span></div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex border-b border-white/5 gap-2">
        <button 
          onClick={() => setActiveTab("ranking")}
          className={`px-4 py-2.5 font-medium text-sm transition-all relative border-b-2 ${
            activeTab === "ranking" ? "text-cyan-400 border-cyan-400" : "text-zinc-400 border-transparent hover:text-zinc-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Candidate Ranking
          </div>
        </button>
        <button 
          onClick={() => setActiveTab("jd")}
          className={`px-4 py-2.5 font-medium text-sm transition-all relative border-b-2 ${
            activeTab === "jd" ? "text-cyan-400 border-cyan-400" : "text-zinc-400 border-transparent hover:text-zinc-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Job Description
          </div>
        </button>
        <button 
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2.5 font-medium text-sm transition-all relative border-b-2 ${
            activeTab === "upload" ? "text-cyan-400 border-cyan-400" : "text-zinc-400 border-transparent hover:text-zinc-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Ingest Resume
          </div>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="grid grid-cols-1 gap-6">

        {/* TAB 1: CANDIDATE RANKING */}
        {activeTab === "ranking" && (
          <div className="space-y-6">
            
            {/* Run Pipeline CTA */}
            <div className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/20 via-zinc-950 to-zinc-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Synchronize Screening Pipeline
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Run rule-based feature extraction and semantic cross-encoder reranking to re-compute candidate matches.
                </p>
              </div>

              {!pipelineLoading ? (
                <button
                  onClick={handleTriggerRanking}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all flex items-center gap-2 self-stretch md:self-auto justify-center"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Run Ranking Pipeline
                </button>
              ) : (
                <div className="w-full md:w-80 space-y-2 bg-zinc-900/60 p-3 rounded-lg border border-white/5 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      Status: <span className="capitalize text-cyan-400">{jobStatus}</span>
                    </span>
                    <span>Running</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                      animate={{ 
                        left: ["-100%", "100%"], 
                        width: ["40%", "40%"]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        ease: "linear"
                      }}
                    />
                  </div>
                  <p className="text-zinc-500 truncate text-[10px]">{jobMessage}</p>
                </div>
              )}
            </div>

            {/* Candidates Table Card */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Top Ranked Candidates
                </h2>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search candidate ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-white/15 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-950/30 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Candidate ID</th>
                      <th className="px-6 py-4">Final Score</th>
                      <th className="px-6 py-4">Rule Base</th>
                      <th className="px-6 py-4">Semantic Match</th>
                      <th className="px-6 py-4">Status & Traps</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {candidatesLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-mono">
                          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                          Loading ranked candidates...
                        </td>
                      </tr>
                    ) : filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                          No candidates found. Trigger the ranking pipeline to compute candidates.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => {
                        const hasTrap = c.keyword_stuffer_flag || c.honeypot_flag || c.duplicate_flag;
                        return (
                          <tr 
                            key={c.candidate_id} 
                            onClick={() => fetchCandidateDetail(c)}
                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <td className="px-6 py-4">
                              <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg font-mono font-bold text-xs ${
                                c.rank === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                c.rank === 2 ? "bg-zinc-300/20 text-zinc-300 border border-zinc-300/30" :
                                c.rank === 3 ? "bg-amber-700/20 text-amber-600 border border-amber-700/30" :
                                "bg-zinc-800/40 text-zinc-400 border border-white/5"
                              }`}>
                                {c.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono font-medium text-white group-hover:text-cyan-400 transition-colors">
                              {c.candidate_id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white font-mono">{formatPercent(c.final_score)}</span>
                                <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400" style={{ width: formatPercent(c.final_score) }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-300">
                              {formatPercent(c.final_rule_score)}
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-300">
                              {formatPercent(c.semantic_score)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {c.keyword_stuffer_flag && (
                                  <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30 text-[10px] font-semibold uppercase text-red-400 font-mono">
                                    Stuffer
                                  </span>
                                )}
                                {c.honeypot_flag && (
                                  <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] font-semibold uppercase text-amber-400 font-mono">
                                    Honeypot
                                  </span>
                                )}
                                {c.duplicate_flag && (
                                  <span className="px-2 py-0.5 rounded bg-orange-950/40 border border-orange-500/30 text-[10px] font-semibold uppercase text-orange-400 font-mono">
                                    Twin
                                  </span>
                                )}
                                {!hasTrap && (
                                  <span className="px-2 py-0.5 rounded bg-green-950/30 border border-green-500/20 text-[10px] font-semibold uppercase text-green-400 font-mono">
                                    Clean
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-zinc-500 hover:text-white font-mono text-xs border border-white/10 hover:border-white/20 rounded px-2.5 py-1 bg-zinc-950/40 transition-colors">
                                Analyze &rarr;
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/10 font-mono">
                <div>
                  Showing {candidates.length} of {pagination.total} results
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1 || candidatesLoading}
                    onClick={() => fetchCandidates(currentPage - 1)}
                    className="p-1.5 border border-white/10 hover:border-white/20 rounded bg-zinc-900/60 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <span>Page {pagination.page} of {pagination.pages}</span>
                  <button 
                    disabled={currentPage === pagination.pages || candidatesLoading}
                    onClick={() => fetchCandidates(currentPage + 1)}
                    className="p-1.5 border border-white/10 hover:border-white/20 rounded bg-zinc-900/60 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOB DESCRIPTION EDIT */}
        {activeTab === "jd" && (
          <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/40 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                Target Job Description
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                The semantic search module utilizes this text to score and rank candidate profiles using cosine similarity. Use exact terms, libraries, and frameworks desired.
              </p>
            </div>

            {jdLoading ? (
              <div className="py-12 text-center text-zinc-500 font-mono">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                Retrieving Job Description...
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={8}
                  placeholder="Insert candidate job description here..."
                  className="w-full p-4 bg-zinc-950 border border-white/10 rounded-xl text-sm font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-relaxed"
                />
                
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={fetchJD}
                    className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-lg text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    Reset Changes
                  </button>
                  <button
                    onClick={handleSaveJD}
                    disabled={jdSaving}
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    {jdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Job Description
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESUME UPLOAD */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/40 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                  Ingest Candidate Resume
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload a candidate resume (PDF, JPG, PNG, WEBP). The screening system will extract profile metrics using Groq AI, validate formatting, and insert the record into `candidates.jsonl`.
                </p>
              </div>

              {/* Upload Drop Zone / Input */}
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-xl p-10 text-center bg-black/40 transition-all cursor-pointer relative group">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <UploadCloud className="w-8 h-8 text-cyan-400" />
                    </div>
                    
                    {uploadFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white font-mono">{uploadFile.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">Click to browse file</p>
                        <p className="text-xs text-zinc-500">PDF, JPG, PNG, WEBP (Max 10MB)</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setUploadFile(f);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  {uploadFile && (
                    <button 
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="px-4 py-2 border border-white/10 hover:bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-white"
                    >
                      Clear File
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-5 py-2.5 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:pointer-events-none transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Resume with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Upload & Ingest Candidate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Ingestion results preview */}
            {uploadResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md space-y-4"
              >
                <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {uploadResult.status === "success" ? "Candidate successfully parsed & ingested" : "Duplicate profile detected (skipped DB insertion)"}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-0.5">Candidate ID</span>
                    <span className="text-sm font-bold text-white font-mono">{uploadResult.candidate_id}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-0.5">Current Title</span>
                    <span className="text-sm font-bold text-zinc-200 truncate block">{uploadResult.preview?.name || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-0.5">Current Employer</span>
                    <span className="text-sm font-bold text-zinc-200 truncate block">{uploadResult.preview?.company || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-0.5">Years Experience</span>
                    <span className="text-sm font-bold text-zinc-200 font-mono block">{uploadResult.preview?.years_of_experience || 0} years</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-zinc-400 font-mono">
                    Skills: <span className="text-zinc-200 font-bold">{uploadResult.preview?.skills_count || 0}</span> • Jobs: <span className="text-zinc-200 font-bold">{uploadResult.preview?.jobs_count || 0}</span>
                  </div>
                  <button 
                    onClick={() => {
                      fetchCandidates(1);
                      setActiveTab("ranking");
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold font-mono"
                  >
                    View Ranking list &rarr;
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* CANDIDATE DETAILS MODAL (SIDE SHEET / DRAWER ACTION) */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            
            {/* Modal backdrop tap to dismiss */}
            <div className="absolute inset-0" onClick={() => setSelectedCandidate(null)} />
            
            {/* Modal panel body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="relative w-full max-w-2xl bg-zinc-950 border-l border-white/10 h-full flex flex-col z-10 overflow-hidden shadow-2xl"
            >
              
              {/* Modal header */}
              <div className="p-6 border-b border-white/10 bg-zinc-900/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Candidate Analytics Profile</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold font-mono text-zinc-400">Rank #{selectedCandidate.rank}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-mono mt-1">{selectedCandidate.candidate_id}</h2>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 border border-white/10 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Modal content body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {detailLoading && (
                  <div className="py-24 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
                    Retrieving full candidate details...
                  </div>
                )}

                {!detailLoading && candidateDetail && (
                  <div className="space-y-6">

                    {/* Section: Basic Profile info */}
                    <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">
                          {candidateDetail.profile?.current_title || "Unknown Profile Title"}
                        </h3>
                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs font-mono text-zinc-400">
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {candidateDetail.profile?.current_company || "N/A"}</span>
                          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {candidateDetail.profile?.years_of_experience || 0} yrs Experience</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidateDetail.profile?.location || "N/A"}, {candidateDetail.profile?.country || ""}</span>
                        </div>
                        {candidateDetail.profile?.summary && (
                          <p className="text-zinc-300 text-xs italic leading-relaxed pt-2">
                            &ldquo;{candidateDetail.profile.summary}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section: AI Reasoning Explanations */}
                    {selectedCandidate.reasoning && (
                      <div className="p-4 bg-violet-950/10 border border-violet-500/20 rounded-2xl space-y-2">
                        <h4 className="text-violet-400 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <Brain className="w-4 h-4" />
                          AI Screening Reasoning
                        </h4>
                        <div className="text-zinc-300 text-xs leading-relaxed space-y-1 whitespace-pre-line font-sans">
                          {selectedCandidate.reasoning}
                        </div>
                      </div>
                    )}

                    {/* Section: Scoring Breakdown */}
                    <div className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-4">
                      <h4 className="text-zinc-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        Core Feature Score Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScoreBar label="Semantic Similarity" val={selectedCandidate.semantic_score} colorClass="bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <ScoreBar label="AI/ML Career Score" val={selectedCandidate.career_score} colorClass="bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                        <ScoreBar label="Technical Skill Match" val={selectedCandidate.skill_score} />
                        <ScoreBar label="Experience Level Match" val={selectedCandidate.experience_score} />
                        <ScoreBar label="Title Affinity Score" val={selectedCandidate.title_score} colorClass="bg-cyan-500" />
                        <ScoreBar label="Profile Behavior Fit" val={selectedCandidate.behavior_score} colorClass="bg-sky-500" />
                      </div>
                    </div>

                    {/* Section: Fraud & Penality Alerts */}
                    <div className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-3">
                      <h4 className="text-zinc-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        Resume Integrity & Fraud Inspections
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs p-2.5 rounded bg-zinc-950 border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedCandidate.keyword_stuffer_flag ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                            <span className="font-mono text-zinc-300">Keyword Stuffing Trap</span>
                          </div>
                          <span className={`font-mono font-bold ${selectedCandidate.keyword_stuffer_flag ? "text-red-400" : "text-green-400"}`}>
                            {selectedCandidate.keyword_stuffer_flag ? "FLAGGED" : "PASS"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs p-2.5 rounded bg-zinc-950 border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedCandidate.honeypot_flag ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
                            <span className="font-mono text-zinc-300">Honeypot Resume Inflation</span>
                          </div>
                          <span className={`font-mono font-bold ${selectedCandidate.honeypot_flag ? "text-amber-400" : "text-green-400"}`}>
                            {selectedCandidate.honeypot_flag ? "FLAGGED" : "PASS"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs p-2.5 rounded bg-zinc-950 border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedCandidate.duplicate_flag ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
                            <span className="font-mono text-zinc-300">Behavioral Twin Detection</span>
                          </div>
                          <span className={`font-mono font-bold ${selectedCandidate.duplicate_flag ? "text-orange-400" : "text-green-400"}`}>
                            {selectedCandidate.duplicate_flag ? "FLAGGED" : "PASS"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section: Career History */}
                    {candidateDetail.career_history && candidateDetail.career_history.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-zinc-400 font-mono text-xs uppercase tracking-wider font-semibold">
                          Employment History
                        </h4>
                        <div className="space-y-3">
                          {candidateDetail.career_history.map((job: any, index: number) => (
                            <div key={index} className="p-3 bg-zinc-900/10 border border-white/5 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between font-bold text-white">
                                <span>{job.title}</span>
                                <span className="font-mono text-cyan-400">{job.duration_months} mos</span>
                              </div>
                              <div className="text-zinc-400 font-mono text-[10px]">{job.company}</div>
                              {job.description && (
                                <p className="text-zinc-300 mt-1.5 leading-relaxed">{job.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section: Technical Skills */}
                    {candidateDetail.skills && candidateDetail.skills.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-zinc-400 font-mono text-xs uppercase tracking-wider font-semibold">
                          Identified Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {candidateDetail.skills.map((skill: any, index: number) => (
                            <div key={index} className="px-2.5 py-1 bg-zinc-900 border border-white/5 rounded-lg text-xs flex items-center gap-2">
                              <span className="text-white font-medium">{skill.name}</span>
                              <span className="px-1 py-0.5 rounded bg-zinc-800 text-[9px] font-bold text-cyan-400 uppercase font-mono">{skill.proficiency}</span>
                              {skill.duration_months > 0 && (
                                <span className="text-[10px] text-zinc-500 font-mono">{skill.duration_months}m</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
