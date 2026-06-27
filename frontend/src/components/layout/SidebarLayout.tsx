import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  UploadCloud, 
  History as HistoryIcon, 
  FileText, 
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Server,
  Menu,
  X,
  Trophy,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecentlyReviewed } from "@/hooks/useRecentlyReviewed";

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { reviewed } = useRecentlyReviewed();

  const navGroups = [
    {
      label: "Workspace",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "New Analysis", href: "/upload", icon: UploadCloud },
      ]
    },
    {
      label: "Data",
      items: [
        { name: "History", href: "/history", icon: HistoryIcon },
        { name: "Reports", href: "/reports", icon: FileText },
        { name: "Candidate Ranking", href: "/ranking", icon: Trophy },
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Settings", href: "/settings", icon: SettingsIcon },
      ]
    }
  ];

  const recent5 = reviewed.slice(0, 5);

  return (
    <div className="min-h-[100dvh] bg-[#09090b] flex text-white font-sans selection:bg-violet-500/30">
      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black/50 backdrop-blur-md border border-white/10 text-white p-2 rounded"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col fixed inset-y-0 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group w-full">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              NeuralSight
            </span>
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-sm text-white shrink-0">
            SC
          </div>
          <div className="overflow-hidden">
            <div className="font-medium text-sm text-white truncate">Dr. Sarah Chen</div>
            <div className="text-xs font-medium text-violet-400">Pro Plan</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                    <button
                      className={cn(
                        "w-full justify-start h-10 px-3 text-sm font-medium transition-all duration-200 mb-1 flex items-center rounded",
                        isActive
                          ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-cyan-400 border border-violet-500/30"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 mr-3", isActive ? "text-cyan-400" : "text-zinc-500")} />
                      {item.name}
                      {/* Badge for History showing how many reviewed */}
                      {item.href === "/history" && reviewed.length > 0 && (
                        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/20">
                          {reviewed.length}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* ── Recently Reviewed Widget ─────────────────── */}
          {recent5.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recently Reviewed
              </div>
              <div className="space-y-0.5">
                {recent5.map((c) => {
                  const scoreColor = c.final_score >= 0.55
                    ? "text-emerald-400"
                    : c.final_score >= 0.35
                    ? "text-violet-400"
                    : "text-zinc-500";
                  const hasTrap = c.keyword_stuffer_flag || c.honeypot_flag || c.duplicate_flag;
                  return (
                    <Link
                      key={c.candidate_id}
                      href="/history"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
                        {/* Score dot */}
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          c.final_score >= 0.55 ? "bg-emerald-400" :
                          c.final_score >= 0.35 ? "bg-violet-400" : "bg-zinc-600"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-zinc-300 truncate group-hover:text-white transition-colors">
                            {c.candidate_id}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn("text-[10px] font-mono font-bold", scoreColor)}>
                              {(c.final_score * 100).toFixed(0)}%
                            </span>
                            {hasTrap && (
                              <span className="text-[9px] px-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">⚑</span>
                            )}
                            {c.rank !== "N/A" && c.rank !== "NEW" && (
                              <span className="text-[9px] text-zinc-600">#{c.rank}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {reviewed.length > 5 && (
                <Link href="/history" onClick={() => setIsOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-zinc-600 hover:text-violet-400 transition-colors">
                    +{reviewed.length - 5} more
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-4 shrink-0">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-medium">Usage</span>
              <span className="text-zinc-300 font-mono">47/100</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 w-[47%]" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-zinc-500 bg-white/5 rounded-lg border border-white/10">
            <Server className="w-4 h-4" />
            <span>Engine: <span className="text-green-400">Online</span></span>
          </div>
          <Link href="/" onClick={() => setIsOpen(false)}>
            <button className="w-full justify-start h-10 px-3 text-zinc-400 hover:text-white hover:bg-white/5 flex items-center rounded">
              <LogOut className="w-4 h-4 mr-3 text-zinc-500" />
              Sign Out
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-[100dvh] relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <div className="relative z-10 flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
