import { Loader2, Download, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, FileText, ArrowLeft, BarChart2, Activity, Lightbulb, Trophy, Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useLocation } from "wouter";
import { toast } from "sonner";

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
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Results() {
  const [, setLocation] = useLocation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/candidates?page=1&limit=100");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch (e: any) {
        setError(e.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading ranking results…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-red-400 font-medium">Failed to load results</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <Button variant="outline" onClick={() => setLocation("/upload")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
        </Button>
      </div>
    );
  }

  const top10 = candidates.slice(0, 10);

  // Compute real summary stats
  const totalCandidates = candidates.length;
  const avgScore = totalCandidates > 0
    ? candidates.reduce((s, c) => s + c.final_score, 0) / totalCandidates
    : 0;
  const flaggedCount = candidates.filter(c => c.keyword_stuffer_flag || c.honeypot_flag).length;
  const cleanCount = totalCandidates - flaggedCount;

  // Chart data from top 10 candidates' scores
  const chartData = top10.map((c, i) => ({
    name: `#${c.rank}`,
    score: Math.round(c.final_score * 100),
    ruleScore: Math.round(c.final_rule_score * 100),
  }));

  // Score distribution insights
  const insights = [
    {
      id: 1,
      title: `Top Candidate: ${top10[0]?.candidate_id ?? "N/A"}`,
      description: top10[0]?.reasoning?.split("\n").slice(0, 3).join(" ") || "No reasoning available.",
      category: "Top Rank",
      severity: "critical"
    },
    {
      id: 2,
      title: `${flaggedCount} Flagged Candidates Detected`,
      description: `${flaggedCount} candidates were flagged for keyword stuffing or honeypot traps and excluded from the top rankings.`,
      category: "Quality Control",
      severity: flaggedCount > 0 ? "high" : "low"
    },
    {
      id: 3,
      title: `Average Score: ${(avgScore * 100).toFixed(1)}%`,
      description: `The average final score across all ${totalCandidates} ranked candidates is ${(avgScore * 100).toFixed(1)}%. Top 10 candidates scored above ${top10.length > 0 ? (top10[top10.length - 1].final_score * 100).toFixed(1) : 0}%.`,
      category: "Statistical",
      severity: "medium"
    },
    {
      id: 4,
      title: `${cleanCount} Clean Candidates Processed`,
      description: `${cleanCount} candidates passed all quality filters and were considered for ranking. Results are available in top100.csv and submission.csv.`,
      category: "Pipeline",
      severity: "low"
    }
  ];

  const recommendations = [
    `Review the top ${Math.min(10, totalCandidates)} ranked candidates for immediate outreach — they match key NLP/ML requirements.`,
    flaggedCount > 0
      ? `${flaggedCount} candidates were flagged for manipulative behavior. Exclude from shortlist.`
      : "No suspicious candidates detected — the dataset appears clean.",
    `Download submission.csv for the official challenge submission format.`,
    `Run /api/rank again after uploading new resumes to refresh rankings.`
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return "text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      case 'high': return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case 'medium': return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case 'low': return "text-green-400 bg-green-500/10 border-green-500/30";
      default: return "text-zinc-400 bg-white/5 border-white/10";
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Ranking Results</h1>
          <p className="text-zinc-400">India Runs AI Challenge • {totalCandidates} candidates ranked</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("top100")}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export Top 100
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("submission")}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Submission CSV
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ranked", value: totalCandidates, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Avg Score", value: `${(avgScore * 100).toFixed(1)}%`, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Clean Candidates", value: cleanCount, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Flagged", value: flaggedCount, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3 border border-white/5", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Top 10 Score Chart */}
      <motion.div
        variants={fadeUp}
        className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl h-80"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Top 10 Candidates — Final Scores
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              formatter={(val: any) => [`${val}%`, "Score"]}
            />
            <Bar dataKey="score" fill="#7c3aed" radius={[8, 8, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#f59e0b" : index < 3 ? "#7c3aed" : "#06b6d4"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top 10 Leaderboard */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Top 10 Leaderboard
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Ranked by final_score</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/2 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-zinc-400 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400 uppercase tracking-wider">Candidate ID</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400 uppercase tracking-wider">Final Score</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400 uppercase tracking-wider">Skill</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400 uppercase tracking-wider">Experience</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400 uppercase tracking-wider">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {top10.map((c) => (
                <tr key={c.candidate_id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <span className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      c.rank === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                      c.rank <= 3 ? "bg-violet-500/20 text-violet-400 border border-violet-500/40" :
                      "bg-white/5 text-zinc-400 border border-white/10"
                    )}>
                      {c.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-white">{c.candidate_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                          style={{ width: `${c.final_score * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium text-xs w-10">{(c.final_score * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{(c.skill_score * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{(c.experience_score * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Insights & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-violet-400" />
            Key Insights
          </h2>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn("p-4 rounded-xl border-2 transition-all", getSeverityStyle(insight.severity))}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{insight.title}</p>
                    <p className="text-xs opacity-90 leading-relaxed">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-75">{insight.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div variants={fadeUp} className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => setLocation("/upload")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>
        <Button
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          onClick={() => setLocation("/ranking")}
        >
          <Activity className="w-4 h-4 mr-2" />
          View Full Ranking
        </Button>
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => handleExport("submission")}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Submission
        </Button>
      </motion.div>
    </motion.div>
  );
}
