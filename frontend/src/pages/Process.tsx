import { motion } from "framer-motion";

export default function Process() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-white mb-6">Processing Analysis</h1>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Analysis in progress...</p>
        </div>
      </div>
    </motion.div>
  );
}
