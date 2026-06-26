import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, Trophy, BarChart3, Users, Flag, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface Stats {
  total: number;
  avgScore: number;
  flagged: number;
  clean: number;
  top1Id: string;
  top1Score: number;
}

const REPORTS = [
  {
    id: "top100",
    title: "Top 100 Candidates",
    description: "Ranked list of the top 100 candidates from the India Runs AI Challenge dataset, scored by the full pipeline including rule-based filters and semantic reranking.",
    type: "Ranking Output",
    charts: ["Final Score Distribution", "Skill Score Breakdown", "Experience Analysis", "Flag Summary"],
    color: "from-violet-600 to-purple-600",
    filename: "top100.csv",
    exportKey: "top100" as const,
  },
  {
    id: "submission",
    title: "Challenge Submission",
    description: "Official submission file in the required format for the India Runs AI Challenge. Contains candidate_id and rank columns as specified by the challenge organizers.",
    type: "Submission Format",
    charts: ["Candidate Rankings", "Score Validation", "Trap Detection Results", "Submission Ready"],
    color: "from-cyan-600 to-blue-600",
    filename: "submission.csv",
    exportKey: "submission" as const,
  }
];

export default function Reports() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isRanking, setIsRanking] = useState(false);
  const [rankJobId, setRankJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/candidates?page=1&limit=100");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const candidates = data.candidates || [];
        const total = data.pagination?.total ?? candidates.length;
        const avgScore = candidates.length > 0
          ? candidates.reduce((s: number, c: any) => s + c.final_score, 0) / candidates.length
          : 0;
        const flagged = candidates.filter((c: any) => c.keyword_stuffer_flag || c.honeypot_flag).length;
        const top1 = candidates[0];
        setStats({
          total,
          avgScore,
          flagged,
          clean: candidates.length - flagged,
          top1Id: top1?.candidate_id ?? "N/A",
          top1Score: top1?.final_score ?? 0,
        });
      } catch (_) {
        setStats(null);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Poll ranking job status
  useEffect(() => {
    if (!rankJobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rank/status/${rankJobId}`);
        const data = await res.json();
        if (data.status === "completed") {
          setIsRanking(false);
          setRankJobId(null);
          toast.success("Ranking pipeline completed! Reports are now updated.");
          clearInterval(interval);
          // Refresh stats
          const statsRes = await fetch("/api/candidates?page=1&limit=100");
          if (statsRes.ok) {
            const d = await statsRes.json();
            const c = d.candidates || [];
            const total = d.pagination?.total ?? c.length;
            const avg = c.length > 0 ? c.reduce((s: number, x: any) => s + x.final_score, 0) / c.length : 0;
            const flagged = c.filter((x: any) => x.keyword_stuffer_flag || x.honeypot_flag).length;
            const top1 = c[0];
            setStats({ total, avgScore: avg, flagged, clean: c.length - flagged, top1Id: top1?.candidate_id ?? "N/A", top1Score: top1?.final_score ?? 0 });
          }
        } else if (data.status === "failed") {
          setIsRanking(false);
          setRankJobId(null);
          toast.error(`Ranking failed: ${data.message}`);
          clearInterval(interval);
        }
      } catch (_) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [rankJobId]);

  const handleDownload = async (exportKey: "top100" | "submission") => {
    setIsDownloading(exportKey);
    try {
      const res = await fetch(`/api/export/${exportKey}`);
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportKey}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${exportKey}.csv downloaded successfully`);
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleRerank = async () => {
    setIsRanking(true);
    try {
      const res = await fetch("/api/rank", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRankJobId(data.job_id);
      toast.info(`Ranking pipeline started (Job: ${data.job_id}). This may take a few minutes…`);
    } catch (e) {
      setIsRanking(false);
      toast.error("Failed to start ranking pipeline");
    }
  };

  const selected = REPORTS[selectedIdx];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Generated Reports</h1>
          <p className="text-zinc-400">
            {loading ? "Loading…" : stats ? `${stats.total.toLocaleString()} candidates ranked • ${stats.flagged} flagged` : "Pipeline output reports"}
          </p>
        </div>
        <Button
          onClick={handleRerank}
          disabled={isRanking}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isRanking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
          {isRanking ? "Running Pipeline…" : "Re-run Ranking"}
        </Button>
      </motion.div>

      {/* Main Report Cards */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-6">
        {/* Large Card Display */}
        <div className="lg:col-span-2">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "relative rounded-2xl overflow-hidden border border-white/10 h-96 shadow-2xl",
              `bg-gradient-to-br ${selected.color}`
            )}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex flex-col justify-between h-full p-8">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-white mb-4">
                      {selected.type}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">{selected.title}</h2>
                    <p className="text-white/80 text-sm leading-relaxed">{selected.description}</p>
                  </div>
                  <FileText className="w-12 h-12 text-white/30" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {selected.charts.map((chart, i) => (
                    <div key={i} className="text-xs text-white/70 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      {chart}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-xs text-white/70 pt-4 border-t border-white/10">
                  <span className="font-mono">{selected.filename}</span>
                  {stats && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {Math.min(100, stats.total)} candidates
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Today
                  </span>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-white text-black hover:bg-white/90"
                    size="sm"
                    onClick={() => handleDownload(selected.exportKey)}
                    disabled={isDownloading === selected.exportKey}
                  >
                    {isDownloading === selected.exportKey
                      ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      : <Download className="w-4 h-4 mr-2" />
                    }
                    Download {selected.filename}
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />
          </motion.div>

          {/* Report Selector Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {REPORTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === selectedIdx ? "w-8 bg-violet-500" : "w-2 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">All Reports</h3>
          {REPORTS.map((report, i) => (
            <button
              key={report.id}
              onClick={() => setSelectedIdx(i)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                i === selectedIdx
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              )}
            >
              <p className={cn("text-sm font-semibold mb-1", i === selectedIdx ? "text-violet-300" : "text-white")}>
                {report.title}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className={i === selectedIdx ? "text-violet-200/70" : "text-zinc-400"}>
                  {report.type}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                  {report.filename}
                </span>
              </div>
            </button>
          ))}

          {/* Quick Download All */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-zinc-500 mb-3">Quick Downloads</p>
            {REPORTS.map(r => (
              <button
                key={r.id}
                onClick={() => handleDownload(r.exportKey)}
                disabled={isDownloading === r.exportKey}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/3 hover:bg-white/10 transition-colors mb-2 text-sm"
              >
                <div className="flex items-center gap-2 text-zinc-300">
                  <FileText className="w-4 h-4 text-violet-400" />
                  {r.filename}
                </div>
                {isDownloading === r.exportKey
                  ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                  : <Download className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
                }
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: loading ? "…" : stats?.total.toLocaleString() ?? "0", icon: Users },
          { label: "Avg Score", value: loading ? "…" : stats ? `${(stats.avgScore * 100).toFixed(1)}%` : "N/A", icon: BarChart3 },
          { label: "Top Candidate", value: loading ? "…" : stats?.top1Id ?? "N/A", icon: Trophy },
          { label: "Flagged Candidates", value: loading ? "…" : stats?.flagged.toString() ?? "0", icon: Flag },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
              <Icon className="w-4 h-4 text-violet-400 mb-2" />
              <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white font-mono truncate">{stat.value}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Pipeline Info */}
      <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" /> Report Generation Info
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Source Dataset</p>
            <p className="text-zinc-300 font-mono">data/candidates.jsonl</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Top 100 Output</p>
            <p className="text-zinc-300 font-mono">outputs/top100.csv</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Submission Output</p>
            <p className="text-zinc-300 font-mono">outputs/submission.csv</p>
          </div>
        </div>
        <p className="text-xs text-zinc-600 mt-4">
          Use "Re-run Ranking" to regenerate reports after uploading new resumes. The pipeline applies rule-based filtering, trap detection, and semantic reranking.
        </p>
      </motion.div>
    </motion.div>
  );
}
