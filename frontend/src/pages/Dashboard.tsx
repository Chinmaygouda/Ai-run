import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Activity, HardDrive, BarChart3, Target, Loader2, ArrowUpRight, ArrowDownRight, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const mockSummary = { 
  totalAnalyses: 47, 
  completedAnalyses: 39, 
  processingAnalyses: 2, 
  totalInsights: 184, 
  totalReports: 12, 
  avgConfidence: 0.947, 
  storageUsedMb: 582.4, 
  accuracyRate: 94.7 
};

const mockTrends = Array.from({length: 14}, (_, i) => { 
  const d = new Date(); 
  d.setDate(d.getDate() - (13-i)); 
  return { 
    date: d.toISOString().split('T')[0], 
    analyses: 2 + Math.floor(Math.sin(i)*3+4), 
    insights: 10 + Math.floor(Math.cos(i)*8+12) 
  }; 
});

const mockActivity = [
  { id: 1, title: "Q3_Revenue_Analysis completed", type: "completed", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 2, title: "Customer_Churn_Model processing", type: "processing", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 3, title: "Server logs anomalous patterns found", type: "completed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 4, title: "Corrupted dataset uploaded", type: "failed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 5, title: "Executive Report generated", type: "completed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

function getRelativeTime(dateString: string) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60));

  if (Math.abs(minutesDifference) < 60) return rtf.format(minutesDifference, 'minute');
  if (Math.abs(hoursDifference) < 24) return rtf.format(hoursDifference, 'hour');
  return rtf.format(daysDifference, 'day');
}

export default function Dashboard() {
  const summary = mockSummary;
  const trends = mockTrends;
  const activity = mockActivity;

  const stats = [
    { label: "Total Analyses", value: summary.totalAnalyses, icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10", trend: "+12%", trendUp: true },
    { label: "Insights Found", value: summary.totalInsights, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10", trend: "+28%", trendUp: true },
    { label: "Avg Confidence", value: `${Math.round(summary.avgConfidence * 100)}%`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "+1.2%", trendUp: true },
    { label: "Storage Used", value: `${Math.round(summary.storageUsedMb)} MB`, icon: HardDrive, color: "text-amber-400", bg: "bg-amber-500/10", trend: "+8.4%", trendUp: false }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
      </motion.div>

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
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
                stat.trendUp ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              )}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</div>
              <div className="text-4xl font-bold font-mono text-white tracking-tight">{stat.value}</div>
            </div>
            <div className={cn(
              "absolute -bottom-10 -right-10 w-32 h-32 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
              stat.bg.replace('/10', '')
            )} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Platform Activity</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-zinc-400 font-mono">Analyses</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /><span className="text-zinc-400 font-mono">Insights</span></div>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInsights" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="insights" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorInsights)" />
                <Area type="monotone" dataKey="analyses" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorAnalyses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              Active Queue
              {summary.processingAnalyses > 0 ? (
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              )}
            </h2>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                      <FileText className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Customer_Churn_Model</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> ~2 min left
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-violet-500 w-[60%] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-0 flex-1 overflow-y-auto pr-2">
              {activity.map((item, i) => {
                let color = "text-zinc-500 bg-white/10";
                let dotGlow = "";
                if (item.type === "completed") { color = "text-emerald-400"; dotGlow = "shadow-[0_0_8px_rgba(52,211,153,0.5)] bg-emerald-400"; }
                if (item.type === "processing") { color = "text-violet-400"; dotGlow = "shadow-[0_0_8px_rgba(124,58,237,0.5)] bg-violet-400 animate-pulse"; }
                if (item.type === "failed") { color = "text-red-400"; dotGlow = "shadow-[0_0_8px_rgba(248,113,113,0.5)] bg-red-400"; }
                
                return (
                  <div key={item.id} className="relative pl-6 pb-6 last:pb-0">
                    {i !== activity.length - 1 && (
                      <div className="absolute left-[3px] top-2 bottom-0 w-px bg-white/10" />
                    )}
                    <div className={cn("absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full z-10", dotGlow || "bg-zinc-600")} />
                    
                    <div className="text-sm font-medium text-white mb-1 group-hover:text-white transition-colors">{item.title}</div>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs uppercase tracking-wider font-bold", color)}>{item.type}</span>
                      <span className="text-xs text-zinc-500 font-mono">{getRelativeTime(item.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
