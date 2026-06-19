import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, FileText, ChevronLeft, ChevronRight, Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockReports = [
  {
    id: 1,
    title: "Q3 Customer Churn Analysis",
    description: "Comprehensive analysis of customer churn patterns with predictive insights.",
    date: "2025-06-19",
    status: "generated",
    file_size: "4.2 MB",
    pages: 24,
    type: "Predictive",
    charts: ["Churn Distribution", "Trend Analysis", "Cohort Comparison", "Risk Segments"],
    color: "from-violet-600 to-purple-600"
  },
  {
    id: 2,
    title: "H1 2025 Market Trends Report",
    description: "Market analysis with competitive benchmarking and opportunity identification.",
    date: "2025-06-15",
    status: "generated",
    file_size: "5.8 MB",
    pages: 32,
    type: "Exploratory",
    charts: ["Market Share", "Growth Trends", "Seasonality", "Forecasts"],
    color: "from-cyan-600 to-blue-600"
  },
  {
    id: 3,
    title: "API Performance Anomalies Report",
    description: "Detailed report on detected anomalies in system performance and usage patterns.",
    date: "2025-06-10",
    status: "generated",
    file_size: "3.1 MB",
    pages: 18,
    type: "Anomaly Detection",
    charts: ["Latency Spikes", "Error Rates", "Load Patterns", "Correlation Analysis"],
    color: "from-emerald-600 to-teal-600"
  },
  {
    id: 4,
    title: "Customer Sentiment & NLP Analysis",
    description: "Natural language processing analysis of customer feedback and sentiment trends.",
    date: "2025-06-05",
    status: "generated",
    file_size: "2.9 MB",
    pages: 20,
    type: "NLP",
    charts: ["Sentiment Distribution", "Topic Cloud", "Emotion Trends", "Key Phrases"],
    color: "from-orange-600 to-red-600"
  }
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Reports() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReport, setSelectedReport] = useState(mockReports[0]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % mockReports.length);
    setSelectedReport(mockReports[(currentIndex + 1) % mockReports.length]);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + mockReports.length) % mockReports.length);
    setSelectedReport(mockReports[(currentIndex - 1 + mockReports.length) % mockReports.length]);
  };

  const goToReport = (idx: number) => {
    setCurrentIndex(idx);
    setSelectedReport(mockReports[idx]);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Generated Reports</h1>
        <p className="text-zinc-400">{mockReports.length} reports available for download</p>
      </motion.div>

      {/* Main Carousel */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-6">
        {/* Large Card Display */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative rounded-2xl overflow-hidden border border-white/10 h-96 shadow-2xl",
                `bg-gradient-to-br ${selectedReport.color}`
              )}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-8">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-white mb-4">
                        {selectedReport.type}
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-3">{selectedReport.title}</h2>
                      <p className="text-white/80 text-sm">{selectedReport.description}</p>
                    </div>
                    <FileText className="w-12 h-12 text-white/30" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Charts Preview */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.charts.map((chart, i) => (
                      <div key={i} className="text-xs text-white/70 flex items-center gap-2">
                        {i % 2 === 0 ? <BarChart3 className="w-3 h-3" /> : <PieChartIcon className="w-3 h-3" />}
                        {chart}
                      </div>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex justify-between text-xs text-white/70 pt-4 border-t border-white/10">
                    <span>{selectedReport.pages} pages</span>
                    <span>{selectedReport.file_size}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {selectedReport.date}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-white text-black hover:bg-white/90" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button className="flex-1 bg-white/20 hover:bg-white/30" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              className="p-2 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2 flex-1 mx-4 justify-center">
              {mockReports.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToReport(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === currentIndex
                      ? "w-8 bg-violet-500"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Report List */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">All Reports</h3>
          {mockReports.map((report, i) => (
            <motion.button
              key={report.id}
              onClick={() => goToReport(i)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                i === currentIndex
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              )}
            >
              <p className={cn(
                "text-sm font-semibold mb-1",
                i === currentIndex ? "text-violet-300" : "text-white"
              )}>
                {report.title}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className={i === currentIndex ? "text-violet-200/70" : "text-zinc-400"}>
                  {report.date}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                  {report.pages}p
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: mockReports.length, icon: FileText },
          { label: "Total Pages", value: mockReports.reduce((sum, r) => sum + r.pages, 0), icon: BarChart3 },
          { label: "Total Size", value: `${(mockReports.reduce((sum, r) => sum + parseFloat(r.file_size), 0)).toFixed(1)} MB`, icon: TrendingUp },
          { label: "Latest", value: mockReports[0].date, icon: Calendar }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
              <Icon className="w-4 h-4 text-violet-400 mb-2" />
              <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
