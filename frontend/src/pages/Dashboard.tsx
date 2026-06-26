import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { Activity, HardDrive, BarChart3, Target, Loader2, Trophy, FileText, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface Candidate {
  candidate_id: string;
  rank: number;
  final_score: number;
  skill_score: number;
  experience_score: number;
  keyword_stuffer_flag: boolean;
  honeypot_flag: boolean;
  duplicate_flag: boolean;
  reasoning: string;
}

interface HealthData {
  status: string;
  version: string;
  dataset: { candidates_count: number; jsonl_path: string };
  models: { groq_api_key_configured: boolean; semantic_reranker_available: boolean };
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, candidatesRes] = await Promise.all([
          fetch("/api/health"),
          fetch("/api/candidates?page=1&limit=100"),
        ]);
        if (healthRes.ok) setHealth(await healthRes.json());
        if (candidatesRes.ok) {
          const data = await candidatesRes.json();
          setCandidates(data.candidates || []);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalCandidates = health?.dataset.candidates_count ?? candidates.length;
  const rankedCount = candidates.length;
  const flaggedCount = candidates.filter(c => c.keyword_stuffer_flag || c.honeypot_flag).length;
  const avgScore = rankedCount > 0
    ? candidates.reduce((s, c) => s + c.final_score, 0) / rankedCount
    : 0;

  const stats = [
    { label: "Total Candidates", value: loading ? "…" : totalCandidates.toLocaleString(), icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Ranked", value: loading ? "…" : rankedCount, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Avg Score", value: loading ? "…" : `${(avgScore * 100).toFixed(1)}%`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Flagged", value: loading ? "…" : flaggedCount, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  // Score distribution chart: bucket scores into ranges
  const scoreBuckets = loading ? [] : (() => {
    const buckets: { range: string; count: number }[] = [
      { range: "0-40%", count: 0 },
      { range: "40-50%", count: 0 },
      { range: "50-60%", count: 0 },
      { range: "60-70%", count: 0 },
      { range: "70-80%", count: 0 },
      { range: "80%+", count: 0 },
    ];
    candidates.forEach(c => {
      const s = c.final_score * 100;
      if (s < 40) buckets[0].count++;
      else if (s < 50) buckets[1].count++;
      else if (s < 60) buckets[2].count++;
      else if (s < 70) buckets[3].count++;
      else if (s < 80) buckets[4].count++;
      else buckets[5].count++;
    });
    return buckets;
  })();

  const top5 = candidates.slice(0, 5);

  const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
          <p className="text-zinc-400 text-sm mt-1">India Runs AI Challenge — Candidate Screening Dashboard</p>
        </div>
        {health && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
            health.status === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              health.status === "ok" ? "bg-emerald-400" : "bg-red-400"
            )} />
            API {health.status === "ok" ? "Online" : "Offline"} • v{health.version}
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={cn("p-2.5 rounded-xl border border-white/5", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</div>
              <div className="text-4xl font-bold font-mono text-white tracking-tight">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-500" /> : stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Distribution Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Score Distribution</h2>
            <span className="text-xs text-zinc-500 font-mono">{rankedCount} candidates</span>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="range"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                    formatter={(val: any) => [val, "Candidates"]}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {scoreBuckets.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Top 5 Sidebar */}
        <div className="flex flex-col gap-6">
          <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex-1">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Top 5 Candidates
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : top5.length === 0 ? (
              <p className="text-zinc-500 text-sm">No candidates ranked yet. Run the pipeline first.</p>
            ) : (
              <div className="space-y-3">
                {top5.map((c, i) => (
                  <div key={c.candidate_id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
                        i === 0 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                        i < 3 ? "bg-violet-500/20 text-violet-400 border-violet-500/40" :
                        "bg-white/5 text-zinc-400 border-white/10"
                      )}>
                        {c.rank}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white font-mono">{c.candidate_id}</div>
                        <div className="text-xs text-zinc-500">{(c.final_score * 100).toFixed(1)}% score</div>
                      </div>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                        style={{ width: `${c.final_score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Model Status */}
          {health && (
            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" /> System Status
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Groq API Key", ok: health.models.groq_api_key_configured },
                  { label: "Semantic Reranker", ok: health.models.semantic_reranker_available },
                  { label: "Dataset Loaded", ok: health.dataset.candidates_count > 0 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                      item.ok
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {item.ok ? "✓ Active" : "✗ Missing"}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs text-zinc-500 font-mono">{health.dataset.candidates_count.toLocaleString()} candidates in dataset</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
