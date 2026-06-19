import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, Eye, ArrowUpDown, Clock, CheckCircle, AlertCircle, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockHistory = [
  { id: 1, filename: "customer_data.csv", date: "2025-06-19", time: "14:32", status: "completed", confidence: 0.94, size: "2.4 MB", type: "Predictive" },
  { id: 2, filename: "sales_metrics.xlsx", date: "2025-06-18", time: "09:15", status: "completed", confidence: 0.89, size: "1.8 MB", type: "Exploratory" },
  { id: 3, filename: "user_behavior.json", date: "2025-06-17", time: "16:42", status: "processing", confidence: 0, size: "3.2 MB", type: "Anomaly" },
  { id: 4, filename: "transaction_log.csv", date: "2025-06-16", time: "11:08", status: "failed", confidence: 0, size: "5.1 MB", type: "Predictive" },
  { id: 5, filename: "feedback_sentiment.txt", date: "2025-06-15", time: "13:22", status: "completed", confidence: 0.92, size: "0.9 MB", type: "NLP" },
  { id: 6, filename: "product_catalog.json", date: "2025-06-14", time: "10:45", status: "completed", confidence: 0.87, size: "2.1 MB", type: "Exploratory" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

type SortKey = "date" | "filename" | "status";

export default function History() {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const filteredData = mockHistory.filter(item => 
    filterStatus === "all" ? true : item.status === filterStatus
  );

  const sortedData = [...filteredData].sort((a, b) => {
    let compareA, compareB;
    
    if (sortBy === "date") {
      compareA = new Date(a.date).getTime();
      compareB = new Date(b.date).getTime();
    } else if (sortBy === "filename") {
      compareA = a.filename.toLowerCase();
      compareB = b.filename.toLowerCase();
    } else {
      compareA = a.status;
      compareB = b.status;
    }

    if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
    if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "processing": return <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "processing": return "bg-violet-500/10 text-violet-300 border-violet-500/30";
      case "failed": return "bg-red-500/10 text-red-300 border-red-500/30";
      default: return "bg-zinc-500/10 text-zinc-300 border-zinc-500/30";
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analysis History</h1>
          <p className="text-zinc-400">{filteredData.length} analyses • {filterStatus !== "all" && `Filtered by ${filterStatus}`}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
        {["all", "completed", "processing", "failed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-4 py-2 rounded-lg border-2 transition-all capitalize font-medium text-sm flex items-center gap-2",
              filterStatus === status
                ? "border-violet-500 bg-violet-500/10 text-violet-300"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
            )}
          >
            <Filter className="w-3 h-3" />
            {status}
          </button>
        ))}
      </motion.div>

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
                  <SortHeader label="Filename" sortKey="filename" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <SortHeader label="Date" sortKey="date" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <SortHeader label="Status" sortKey="status" />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedData.map((item) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-white/2 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{item.filename}</p>
                      <p className="text-xs text-zinc-500">{item.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{item.size}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit text-xs font-medium capitalize",
                      getStatusColor(item.status)
                    )}>
                      {getStatusIcon(item.status)}
                      {item.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.confidence > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[80px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-medium w-8">{Math.round(item.confidence * 100)}%</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === "completed" && (
                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-emerald-400">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-zinc-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Footer Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-zinc-500 mb-1">Total Analyses</p>
          <p className="text-2xl font-bold text-white">{mockHistory.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-xs text-emerald-300 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-300">{mockHistory.filter(i => i.status === "completed").length}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-300 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-300">{mockHistory.filter(i => i.status === "failed").length}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
