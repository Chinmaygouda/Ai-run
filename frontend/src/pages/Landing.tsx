import { Link } from "wouter";
import { Sparkles, ArrowRight, Brain, Zap, Shield, Database, BarChart3, Target, Share2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  useEffect(() => {
    // Load Visme forms embed script
    const script = document.createElement('script');
    script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30 relative overflow-hidden font-sans">
      {/* Global Background effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#09090b]/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NeuralSight</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-medium bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center max-w-5xl mb-32">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>NeuralSight Engine 2.0 is now live</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-8">
              Extract truth from <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-blue-500">
                chaos.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12">
              The premium AI analysis platform for enterprise data teams. Turn terabytes of raw data into actionable insights in seconds, not weeks.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/register" className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:scale-105 active:scale-95">
                Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all">
                View Demo
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Brain, title: "Neural Pattern Detection", desc: "Proprietary transformers trained on 10B+ data points to find invisible correlations." },
              { icon: Zap, title: "Real-time Processing", desc: "Sub-5-minute analysis for datasets up to 100GB with distributed computing." },
              { icon: Target, title: "Insight Prioritization", desc: "Every finding ranked by business impact and confidence score." },
              { icon: Database, title: "Enterprise Security", desc: "SOC2, HIPAA-ready, end-to-end encryption with dedicated instances available." },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Comprehensive dashboards with 50+ visualization types and custom reports." },
              { icon: Shield, title: "API-First Design", desc: "REST API with SDKs for Python, R, and JavaScript for seamless integration." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={fadeUp}
                className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:scale-[1.02] transition-all cursor-default group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              Ready to transform your data?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join thousands of enterprise teams using NeuralSight to make smarter decisions faster.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/register" className="inline-flex items-center justify-center h-12 px-8 text-lg font-medium rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all">
                Get Started Free
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Visme Event Sign Up Form */}
        <section className="container mx-auto px-6 mt-20">
          <div className="visme_d" data-title="Online Event Sign Up Form" data-url="rzn7ye08-online-event-sign-up-form" data-domain="forms" data-full-page="false" data-min-height="500px" data-form-id="186603"></div>
        </section>
      </main>
    </div>
  );
}
