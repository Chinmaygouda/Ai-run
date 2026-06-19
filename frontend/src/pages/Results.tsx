import { Loader2, Download, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, FileText, ArrowLeft, BarChart2, Activity, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const mockResults = {
  confidence: 0.94,
  summary: "Neural analysis complete. Significant patterns detected in user engagement metrics. Churn probability has increased by 14% across the mid-tier segment, strongly correlated with feature usage drop-offs in the last 14 days.",
  metrics: [
    { label: "Overall Accuracy", value: "94.7", unit: "%", trend: "up" },
    { label: "Anomalies Detected", value: "1,243", unit: "events", trend: "up" },
    { label: "Processing Speed", value: "142", unit: "ms/epoch", trend: "down" },
    { label: "Feature Correlation", value: "0.82", unit: "r²", trend: "stable" }
  ],
  insights: [
    { id: 1, title: "Elevated Churn Risk in Mid-Tier", description: "Users who have not interacted with the dashboard in 7 days show a 68% higher probability of churning within the month.", category: "Predictive", severity: "critical" },
    { id: 2, title: "Usage Spikes Linked to Errors", description: "500-level errors on the API gateway correlate strongly with subsequent support ticket volume.", category: "Correlation", severity: "high" },
    { id: 3, title: "Feature Adoption Lag", description: "The new reporting tool has only seen 12% adoption among active users, lower than the expected baseline.", category: "Descriptive", severity: "medium" },
    { id: 4, title: "Optimal Notification Time", description: "Push notifications sent between 2PM and 4PM local time have a 3x higher click-through rate.", category: "Prescriptive", severity: "low" }
  ],
  recommendations: [
    "Initiate targeted re-engagement campaign for mid-tier users inactive for >7 days.",
    "Investigate API gateway performance during peak load times to reduce 500-level errors.",
    "Deploy in-app tooltips to drive awareness of the new reporting feature.",
    "Adjust global notification schedules to optimize for the 2PM-4PM window."
  ]
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Results() {
  const [activeTab, setActiveTab] = useState("overview");
  const results = mockResults;

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return "text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      case 'high': return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case 'medium': return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case 'low': return "text-green-400 bg-green-500/10 border-green-500/30";
      default: return "text-zinc-400 bg-white/5 border-white/10";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return "#f87171";
      case 'high': return "#fb923c";
      case 'medium': return "#facc15";
      case 'low': return "#4ade80";
      default: return "#a1a1aa";
    }
  };

  const chartData = [
    { name: "Accuracy", value: 94.7 },
    { name: "Precision", value: 91.2 },
    { name: "Recall", value: 88.5 },
    { name: "F1-Score", value: 89.8 }
  ];

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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analysis Results</h1>
          <p className="text-zinc-400">Customer_Churn_Model • Completed 2 minutes ago</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Confidence Summary */}
      <motion.div 
        variants={fadeUp}
        className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">Model Confidence</p>
            <p className="text-5xl font-bold text-white">{Math.round(results.confidence * 100)}%</p>
            <p className="text-sm text-zinc-400 mt-4 max-w-xl">{results.summary}</p>
          </div>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="8"
                strokeDasharray={`${results.confidence * 340} 340`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="70" textAnchor="middle" className="text-2xl font-bold fill-white">94%</text>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div>
        <motion.h2 variants={fadeUp} className="text-lg font-bold text-white mb-4">Performance Metrics</motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.metrics.map((metric, i) => (
            <motion.div 
              key={i}
              variants={fadeUp}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <p className="text-xs text-zinc-500 mb-3 flex items-center justify-between">
                {metric.label}
                {metric.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                {metric.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                {metric.trend === 'stable' && <Minus className="w-3 h-3 text-zinc-500" />}
              </p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-xs text-zinc-500 mt-2">{metric.unit}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <motion.div 
        variants={fadeUp}
        className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl h-80"
      >
        <h3 className="text-lg font-bold text-white mb-4">Model Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"][index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Insights & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Insights */}
        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-violet-400" />
            Key Insights
          </h2>
          <div className="space-y-3">
            {results.insights.map((insight) => (
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
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">•</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">{insight.severity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Recommendations
          </h2>
          <div className="space-y-3">
            {results.recommendations.map((rec, i) => (
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
        <Button variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </motion.div>
    </motion.div>
  );
}
