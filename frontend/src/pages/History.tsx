import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, ArrowUpDown, AlertCircle, Loader2, Filter, Trophy, Clock, Trash2, ChevronRight, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRecentlyReviewed, ReviewedCandidate } from "@/hooks/useRecentlyReviewed";
import { formatDistanceToNow } from "date-fns";

interface Candidate {
  candidate_id: string;
  rank: number | string;
  final_score: number;
  final_rule_score: number;
  semantic_score: number;
  title_score: number;
  career_score: number;
  skill_score: number;
  experience_score: number;
  product_company_score?: number;
  behavior_score?: number;
  location_score?: number;
  keyword_stuffer_flag: boolean;
  honeypot_flag: boolean;
  duplicate_flag: boolean;
  reasoning: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

type SortKey = "rank" | "final_score" | "candidate_id";

function ScoreBar({ value, color = "from-violet-500 to-cyan-500" }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, value * 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-400 w-8">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

function FlagBadges({ c }: { c: Pick<Candidate, "keyword_stuffer_flag" | "honeypot_flag" | "duplicate_flag"> }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {c.keyword_stuffer_flag && (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">KW</span>
      )}
      {c.honeypot_flag && (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20">HP</span>
      )}
      {c.duplicate_flag && (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">DUP</span>
      )}
      {!c.keyword_stuffer_flag && !c.honeypot_flag && !c.duplicate_flag && (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ Clean</span>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number | string }) {
  if (rank === "NEW") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
        NEW
      </span>
    );
  }
  if (rank === "N/A") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-zinc-700/30 text-zinc-500 border border-white/5">
        N/A
      </span>
    );
  }
  return (
    <span className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
      rank === 1 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
      (rank as number) <= 3 ? "bg-violet-500/20 text-violet-400 border-violet-500/40" :
      "bg-white/5 text-zinc-400 border-white/10"
    )}>
      {rank}
    </span>
  );
}

// ── Recently Reviewed Card ─────────────────────────────────────────
function RecentCard({ c, onRemove }: { c: ReviewedCandidate; onRemove: () => void }) {
  const isClean = !c.keyword_stuffer_flag && !c.honeypot_flag && !c.duplicate_flag;
  const scoreColor = c.final_score >= 0.55 ? "from-emerald-500 to-cyan-500" :
                     c.final_score >= 0.35 ? "from-violet-500 to-cyan-400" :
                     "from-zinc-500 to-zinc-600";
  const scoreTextColor = c.final_score >= 0.55 ? "text-emerald-400" :
                         c.final_score >= 0.35 ? "text-violet-400" :
                         "text-zinc-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="relative p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all group"
    >
      {/* Subtle glow based on score */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        c.final_score >= 0.55 ? "bg-emerald-500/5" : "bg-violet-500/5"
      )} />

      <div className="relative flex items-start gap-3">
        {/* Score ring */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono border shrink-0",
          c.final_score >= 0.55 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          c.final_score >= 0.35 ? "bg-violet-500/10 border-violet-500/20 text-violet-400" :
          "bg-zinc-800 border-white/10 text-zinc-400"
        )}>
          {(c.final_score * 100).toFixed(0)}%
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono font-medium text-white text-sm truncate">{c.candidate_id}</span>
            <div className="flex items-center gap-1 shrink-0">
              <RankBadge rank={c.rank} />
              <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded hover:bg-white/10 text-zinc-600 hover:text-red-400 transition-all"
                title="Remove from history"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Score bars row */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-600 w-10 shrink-0">Skill</span>
              <ScoreBar value={c.skill_score} color={scoreColor} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-600 w-10 shrink-0">Exp</span>
              <ScoreBar value={c.experience_score} color={scoreColor} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <FlagBadges c={c} />
            <span className="text-[10px] text-zinc-600 flex items-center gap-1 shrink-0">
              <Clock className="w-2.5 h-2.5" />
              {formatDistanceToNow(new Date(c.reviewedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main History Page ─────────────────────────────────────────────
export default function History() {
  const [, setLocation] = useLocation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterFlag, setFilterFlag] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"reviewed" | "all">("reviewed");
  const LIMIT = 20;

  const { reviewed, clearHistory, addReview, removeReview } = useRecentlyReviewed();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/candidates?page=${page}&limit=${LIMIT}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setCandidates(data.candidates || []);
        setTotalPages(data.pagination?.pages ?? 1);
        setTotalCount(data.pagination?.total ?? 0);
      } catch (e: any) {
        setError(e.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [page]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortOrder(key === "rank" ? "asc" : "desc"); }
  };

  const handleExport = async (type: "top100" | "submission") => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export/${type}`);
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${type}.csv downloaded`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewCandidate = (c: Candidate) => {
    addReview({
      candidate_id: c.candidate_id,
      rank: c.rank,
      final_score: c.final_score,
      final_rule_score: c.final_rule_score,
      skill_score: c.skill_score,
      experience_score: c.experience_score,
      product_company_score: c.product_company_score,
      behavior_score: c.behavior_score,
      location_score: c.location_score,
      keyword_stuffer_flag: c.keyword_stuffer_flag,
      honeypot_flag: c.honeypot_flag,
      duplicate_flag: c.duplicate_flag,
      reasoning: c.reasoning,
    });
    setLocation("/ranking");
  };

  const removeReviewed = (id: string) => {
    removeReview(id);
  };

  const filtered = candidates.filter(c => {
    if (filterFlag === "all") return true;
    if (filterFlag === "clean") return !c.keyword_stuffer_flag && !c.honeypot_flag && !c.duplicate_flag;
    if (filterFlag === "flagged") return c.keyword_stuffer_flag || c.honeypot_flag;
    if (filterFlag === "duplicate") return c.duplicate_flag;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: any = a[sortBy];
    let vb: any = b[sortBy];
    if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return sortOrder === "asc" ? -1 : 1;
    if (va > vb) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button onClick={() => handleSort(sortKey)} className="flex items-center gap-2 hover:text-white transition-colors">
      {label}
      <ArrowUpDown className={cn("w-3 h-3 transition-all", sortBy === sortKey ? "opacity-100 text-violet-400" : "opacity-30")} />
    </button>
  );

  const cleanCount = candidates.filter(c => !c.keyword_stuffer_flag && !c.honeypot_flag && !c.duplicate_flag).length;
  const flaggedCount = candidates.filter(c => c.keyword_stuffer_flag || c.honeypot_flag).length;
  const dupCount = candidates.filter(c => c.duplicate_flag).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Candidate History</h1>
          <p className="text-zinc-400 text-sm">
            {loading ? "Loading…" : `${totalCount} ranked candidates • ${reviewed.length} recently reviewed`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("top100")} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Top 100 CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("submission")} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Submission CSV
          </Button>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {([
          { key: "reviewed", label: "Recently Reviewed", icon: Clock, count: reviewed.length },
          { key: "all",      label: "All Rankings",      icon: Trophy, count: totalCount },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-violet-600/30 text-white border border-violet-500/40"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-mono",
              activeTab === tab.key ? "bg-violet-500/20 text-violet-300" : "bg-white/10 text-zinc-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── RECENTLY REVIEWED TAB ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "reviewed" && (
          <motion.div
            key="reviewed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {reviewed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-violet-400 opacity-60" />
                </div>
                <p className="text-zinc-400 font-medium mb-1">No recently reviewed candidates</p>
                <p className="text-zinc-600 text-sm">Click the 👁 eye icon on any candidate to review their profile — it'll appear here.</p>
                <button
                  onClick={() => setActiveTab("all")}
                  className="mt-4 flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                >
                  Browse all rankings <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Summary strip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-zinc-400">
                      <span className="text-white font-semibold">{reviewed.length}</span> candidates reviewed
                      {reviewed.length > 0 && (
                        <span className="ml-2 text-zinc-600">· avg score {(reviewed.reduce((s, c) => s + c.final_score, 0) / reviewed.length * 100).toFixed(1)}%</span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      clearHistory();
                      toast.success("Review history cleared");
                    }}
                    className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                {/* Cards grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {reviewed.map(c => (
                      <RecentCard
                        key={c.candidate_id}
                        c={c}
                        onRemove={() => removeReviewed(c.candidate_id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Detail table for reviewed candidates */}
                <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden mt-2">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <h2 className="font-semibold text-white text-sm">Detailed Score Breakdown</h2>
                    <span className="text-xs text-zinc-500 font-mono ml-auto">{reviewed.length} entries</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/10">
                        <tr>
                          {["Candidate ID", "Rank", "Final", "Skill", "Experience", "Prod Co.", "Behavior", "Location", "Flags", "Reviewed"].map(h => (
                            <th key={h} className="px-4 py-3 text-zinc-500 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {reviewed.map(c => (
                          <tr key={c.candidate_id + c.reviewedAt} className="hover:bg-white/3 transition-colors group">
                            <td className="px-4 py-3 font-mono font-medium text-white">{c.candidate_id}</td>
                            <td className="px-4 py-3"><RankBadge rank={c.rank} /></td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "font-bold font-mono",
                                c.final_score >= 0.55 ? "text-emerald-400" :
                                c.final_score >= 0.35 ? "text-violet-400" : "text-zinc-400"
                              )}>
                                {(c.final_score * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3"><ScoreBar value={c.skill_score} /></td>
                            <td className="px-4 py-3"><ScoreBar value={c.experience_score} /></td>
                            <td className="px-4 py-3"><ScoreBar value={c.product_company_score ?? 0} /></td>
                            <td className="px-4 py-3"><ScoreBar value={c.behavior_score ?? 0} /></td>
                            <td className="px-4 py-3"><ScoreBar value={c.location_score ?? 0} /></td>
                            <td className="px-4 py-3"><FlagBadges c={c} /></td>
                            <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                              {formatDistanceToNow(new Date(c.reviewedAt), { addSuffix: true })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* ── ALL RANKINGS TAB ───────────────────────────────── */}
        {activeTab === "all" && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "clean", label: "✓ Clean" },
                { key: "flagged", label: "⚑ Flagged" },
                { key: "duplicate", label: "≈ Duplicate" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterFlag(key)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all capitalize font-medium text-sm flex items-center gap-2",
                    filterFlag === key
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                  )}
                >
                  <Filter className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-400 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Failed to load candidates</p>
                  <p className="text-sm opacity-70 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/2">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider"><SortHeader label="Rank" sortKey="rank" /></th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider"><SortHeader label="Candidate ID" sortKey="candidate_id" /></th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider"><SortHeader label="Final Score" sortKey="final_score" /></th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Skill</th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Flags</th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr><td colSpan={7} className="px-6 py-16 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">Loading candidates…</p>
                      </td></tr>
                    ) : sorted.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-16 text-center">
                        <p className="text-zinc-500">No candidates match this filter.</p>
                      </td></tr>
                    ) : (
                      sorted.map((item) => (
                        <motion.tr
                          key={item.candidate_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-white/2 transition-colors"
                        >
                          <td className="px-6 py-4"><RankBadge rank={item.rank} /></td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-white font-mono">{item.candidate_id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-full max-w-[80px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${item.final_score * 100}%` }} />
                              </div>
                              <span className="text-white font-medium w-10 text-xs">{(item.final_score * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs">{(item.skill_score * 100).toFixed(0)}%</td>
                          <td className="px-6 py-4 text-zinc-400 text-xs">{(item.experience_score * 100).toFixed(0)}%</td>
                          <td className="px-6 py-4"><FlagBadges c={item} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewCandidate(item)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-cyan-400"
                                title="View & add to recently reviewed"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExport("top100")}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-emerald-400"
                                title="Download top100.csv"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">Page {page} of {totalPages} • {totalCount} total</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
                    >← Prev</button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
                    >Next →</button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Candidates", value: loading ? "…" : totalCount, color: "bg-white/5 border-white/10", textColor: "text-white" },
                { label: "Clean", value: loading ? "…" : cleanCount, color: "bg-emerald-500/10 border-emerald-500/30", textColor: "text-emerald-300" },
                { label: "Flagged", value: loading ? "…" : flaggedCount, color: "bg-red-500/10 border-red-500/30", textColor: "text-red-300" },
                { label: "Duplicates", value: loading ? "…" : dupCount, color: "bg-yellow-500/10 border-yellow-500/30", textColor: "text-yellow-300" },
              ].map((stat, i) => (
                <div key={i} className={cn("p-4 rounded-xl border", stat.color)}>
                  <p className={cn("text-xs mb-1", stat.textColor === "text-white" ? "text-zinc-500" : stat.textColor.replace("300", "400"))}>{stat.label}</p>
                  <p className={cn("text-2xl font-bold", stat.textColor)}>{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
