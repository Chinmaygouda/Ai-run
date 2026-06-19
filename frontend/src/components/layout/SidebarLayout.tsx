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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Settings", href: "/settings", icon: SettingsIcon },
      ]
    }
  ];

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

        <div className="px-4 py-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-sm text-white shrink-0">
            SC
          </div>
          <div className="overflow-hidden">
            <div className="font-medium text-sm text-white truncate">Dr. Sarah Chen</div>
            <div className="text-xs font-medium text-violet-400">Pro Plan</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
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
                    </button>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

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
