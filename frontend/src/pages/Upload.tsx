import { useState } from "react";
import { useLocation } from "wouter";
import { UploadCloud, File, AlertTriangle, Loader2, Brain, TrendingUp, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Upload() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("exploratory");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setName(droppedFile.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_') + "_Analysis");
      setStep(2);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleAnalyze = async () => {
    setIsSubmitting(true);
    try {
      // If file is a resume (PDF/image), upload it via the resume API
      const isResume = file && (
        file.type === "application/pdf" ||
        file.type.startsWith("image/")
      );

      let uploaded = false;
      if (isResume && file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/resume/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.detail || `Upload failed: ${uploadRes.status}`);
        }
        const uploadData = await uploadRes.json();
        uploaded = uploadData.status === "success";
      }

      // Only trigger ranking pipeline if a resume was successfully uploaded
      if (!uploaded) {
        toast.error("Please upload a valid resume (PDF or image) to proceed.");
        setIsSubmitting(false);
        return;
      }

      // Trigger ranking pipeline
      const rankRes = await fetch("/api/rank", { method: "POST" });
      if (!rankRes.ok) throw new Error("Failed to trigger ranking");
      const rankData = await rankRes.json();
      const jobId = rankData.job_id;

      // Poll for completion (up to 60 seconds)
      let done = false;
      for (let i = 0; i < 20 && !done; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`/api/rank/status/${jobId}`);
        if (statusRes.ok) {
          const status = await statusRes.json();
          if (status.status === "completed") { done = true; break; }
          if (status.status === "failed") throw new Error(status.message || "Ranking failed");
        }
      }

      setLocation("/results/current");
    } catch (e: any) {
      toast.error(`Analysis error: ${e.message}`);
      setIsSubmitting(false);
    }
  };

  const analysisTypes = [
    { id: "exploratory", title: "Exploratory Analysis", desc: "Broad feature scan with pattern detection", icon: Brain },
    { id: "predictive", title: "Predictive Modeling", desc: "Train and validate predictive models", icon: TrendingUp },
    { id: "anomaly", title: "Anomaly Detection", desc: "Identify outliers and irregular patterns", icon: AlertTriangle },
    { id: "nlp", title: "Text Analysis", desc: "Sentiment, entities, and topic modeling", icon: MessageSquare }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mb-12">
        <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">New Analysis</motion.h1>
        
        <motion.div variants={fadeUp} className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-violet-500 transition-all duration-500 z-0" style={{ width: `${(step-1)*50}%` }} />
          
          {[1, 2, 3].map((num) => (
            <div key={num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-sm transition-colors duration-300",
                step === num ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] border-2 border-violet-400" :
                step > num ? "bg-emerald-500 text-white border-2 border-emerald-400" : "bg-[#09090b] border-2 border-white/20 text-zinc-500"
              )}>
                {num}
              </div>
              <span className={cn(
                "text-xs uppercase tracking-widest font-medium absolute top-12 whitespace-nowrap",
                step >= num ? "text-zinc-300" : "text-zinc-600"
              )}>
                {num === 1 ? "Upload" : num === 2 ? "Configure" : "Review"}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="p-1 rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-500/20 backdrop-blur-xl">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-xl p-16 text-center bg-black/60 transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500 border border-violet-500/20">
                    <div className="absolute inset-0 rounded-full border border-violet-500/30 group-hover:animate-[spin_4s_linear_infinite]" />
                    <UploadCloud className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Drag & drop your dataset</h3>
                  <p className="text-zinc-400 mb-8">or click to browse local files</p>
                  
                  <div className="flex justify-center gap-3 w-full flex-wrap">
                    {['CSV', 'JSON', 'PARQUET', 'XLSX'].map(ext => (
                      <div key={ext} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 flex items-center gap-2">
                        <File className="w-3 h-3 text-cyan-400" /> {ext}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 mt-6 font-mono">Max 25GB per file • E2E Encrypted</p>
                  
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile(f);
                        setName(f.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_') + "_Analysis");
                        setStep(2);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CONFIGURE */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Analysis Type Selection */}
            <div>
              <label className="text-sm font-semibold text-white mb-3 block">Analysis Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analysisTypes.map((type_opt) => (
                  <button
                    key={type_opt.id}
                    onClick={() => setType(type_opt.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      type === type_opt.id 
                        ? "border-violet-500 bg-violet-500/10" 
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    )}
                  >
                    <type_opt.icon className={cn("w-5 h-5 mb-2", type === type_opt.id ? "text-violet-400" : "text-zinc-400")} />
                    <p className="text-sm font-medium text-white">{type_opt.title}</p>
                    <p className="text-xs text-zinc-400 mt-1">{type_opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Analysis Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="e.g., Customer_Churn_Analysis"
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {tags.map((tag) => (
                  <div key={tag} className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-sm text-violet-300 flex items-center gap-2">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-violet-200">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="Type and press Enter to add tags"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Priority</label>
              <div className="flex gap-3">
                {['low', 'normal', 'high'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 transition-all capitalize",
                      priority === p 
                        ? "border-violet-500 bg-violet-500/10 text-violet-300" 
                        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>Continue to Review</Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">File</p>
                <p className="text-white font-medium">{file?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-zinc-500 mb-1">Analysis Name</p>
                  <p className="text-white font-medium">{name}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-zinc-500 mb-1">Type</p>
                  <p className="text-white font-medium capitalize">{type}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-zinc-500 mb-2">Tags</p>
                <div className="flex gap-2 flex-wrap">
                  {tags.length ? tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-300 text-xs font-mono">{tag}</span>
                  )) : <span className="text-zinc-500 text-xs">No tags</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleAnalyze}
                disabled={isSubmitting}
              >
                <Loader2 className={cn("w-4 h-4 mr-2", isSubmitting && "animate-spin")} />
                {isSubmitting ? "Analyzing..." : "Upload & Analyze"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
