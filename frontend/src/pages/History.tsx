import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Eye, ArrowUpDown, CheckCircle, AlertCircle, Loader2, Filter, Trophy, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Candidate {
  candidate_id: string;
  rank: number;
  final_score: number;
  final_rule_score: number;
  semantic_score: number;
  title_score: number;
  career_score: number;
  skill_score: number;
  experience_score: number;
  behavior_score: number;
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
  const LIMIT = 20;

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
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder(key === "rank" ? "asc" : "desc");
    }
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
      toast.success(`${type}.csv downloaded successfully`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
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
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-2 hover:text-white transition-colors"
    >
      {label}
      <ArrowUpDown className={cn(
        "w-3 h-3 transition-all",
        sortBy === sortKey ? "opacity-100 text-violet-400" : "opacity-30"
      )} />
    </button>
  );

  const cleanCount = candidates.filter(c => !c.keyword_stuffer_flag && !c.honeypot_flag && !c.duplicate_flag).length;
  const flaggedCount = candidates.filter(c => c.keyword_stuffer_flag || c.honeypot_flag).length;
  const dupCount = candidates.filter(c => c.duplicate_flag).length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Candidate Rankings</h1>
          <p className="text-zinc-400">
            {loading ? "Loading…" : `${totalCount} total candidates • Page ${page} of ${totalPages}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("top100")}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Top 100 CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("submission")}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Submission CSV
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
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
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Failed to load candidates</p>
            <p className="text-sm opacity-70 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/2">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <SortHeader label="Rank" sortKey="rank" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <SortHeader label="Candidate ID" sortKey="candidate_id" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <SortHeader label="Final Score" sortKey="final_score" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Skill</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Flags</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">Loading candidates…</p>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-zinc-500">No candidates match this filter.</p>
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <motion.tr
                    key={item.candidate_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                        item.rank === 1 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                        item.rank <= 3 ? "bg-violet-500/20 text-violet-400 border-violet-500/40" :
                        "bg-white/5 text-zinc-400 border-white/10"
                      )}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white font-mono">{item.candidate_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[80px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                            style={{ width: `${item.final_score * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-medium w-10 text-xs">{(item.final_score * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">{(item.skill_score * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">{(item.experience_score * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {item.keyword_stuffer_flag && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">KW</span>
                        )}
                        {item.honeypot_flag && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20">HP</span>
                        )}
                        {item.duplicate_flag && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">DUP</span>
                        )}
                        {!item.keyword_stuffer_flag && !item.honeypot_flag && !item.duplicate_flag && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLocation("/results/current")}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                          title="View results"
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
            <span className="text-xs text-zinc-500 font-mono">
              Page {page} of {totalPages} • {totalCount} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </motion.div>
    </motion.div>
  );
}
