import { Link } from "wouter";
import { Sparkles, Mail, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#09090b] flex font-sans selection:bg-violet-500/30">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-black border-r border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-black to-cyan-900/20 z-0" />
        
        {/* Abstract Geometry */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 border border-violet-500 rounded-[100px] rotate-12" />
          <div className="absolute inset-12 border border-cyan-500 rounded-[80px] -rotate-6" />
          <div className="absolute inset-24 border border-white rounded-[60px] rotate-3" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">NeuralSight</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-3xl font-medium leading-tight text-white mb-6">
            "NeuralSight found a customer churn signal our data team had missed for 6 months. ROI in week one."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold font-mono text-white border border-white/20">MT</div>
            <div>
              <div className="font-bold text-white">Marcus T.</div>
              <div className="text-zinc-400 text-sm">VP Data Science, Fintech Scale</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">NeuralSight</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
            <p className="text-zinc-400">Sign in to your workspace</p>
          </div>

          <div className="space-y-6">
            <button className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-3 transition-colors">
              <FaGoogle className="w-5 h-5 text-zinc-300" />
              Continue with Google
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">or continue with email</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                <input 
                  type="email" 
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-zinc-600" 
                  placeholder="name@company.com" 
                />
              </div>
              
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-zinc-600" 
                  placeholder="Password" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-end">
                <Link href="#" className="text-sm text-zinc-400 hover:text-violet-400 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Link href="/dashboard" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-0 block">
                Sign In
              </Link>
            </div>

            <p className="text-center text-sm text-zinc-400 mt-8">
              Don't have an account? <Link href="/register" className="text-white hover:text-cyan-400 font-medium transition-colors">Start free →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
