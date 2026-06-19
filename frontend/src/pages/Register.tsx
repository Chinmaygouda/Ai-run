import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-[100dvh] bg-[#09090b] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">NeuralSight</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create your account</h2>
          <p className="text-zinc-400">Join thousands of data teams</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <input placeholder="Full Name" className="w-full h-12 rounded-xl bg-black/50 border border-white/10 text-white px-4 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
          <input type="email" placeholder="Email" className="w-full h-12 rounded-xl bg-black/50 border border-white/10 text-white px-4 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
          <input type="password" placeholder="Password" className="w-full h-12 rounded-xl bg-black/50 border border-white/10 text-white px-4 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
          
          <Link href="/dashboard" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium flex items-center justify-center">
            Create Account
          </Link>
        </div>

        <p className="text-center text-sm text-zinc-400 mt-8">
          Already have an account? <Link href="/login" className="text-white hover:text-cyan-400 font-medium">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}
