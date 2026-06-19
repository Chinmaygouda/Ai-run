import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Copy, Check, Bell, Lock, Shield, User, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState("");
  const [formState, setFormState] = useState({
    fullName: "Dr. Sarah Chen",
    email: "sarah.chen@neuralsight.ai",
    phone: "+1 (555) 123-4567",
    organization: "TechCorp Analytics",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    slackNotifications: false,
    apiKey: "sk_live_51P8oCK2eZvKL4s7K6h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e"
  });

  const [saved, setSaved] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SettingSection = ({ title, description, icon: Icon, children }: any) => (
    <motion.div 
      variants={fadeUp}
      className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6 text-violet-400" />
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your account preferences and security settings</p>
      </motion.div>

      {/* Profile Settings */}
      <SettingSection
        title="Profile Information"
        description="Update your personal details"
        icon={User}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Full Name</label>
            <input 
              type="text"
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Email</label>
            <input 
              type="email"
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Phone</label>
              <input 
                type="tel"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Organization</label>
              <input 
                type="text"
                value={formState.organization}
                onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Password Settings */}
      <SettingSection
        title="Change Password"
        description="Update your security credentials"
        icon={Lock}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={formState.currentPassword}
                onChange={(e) => setFormState({ ...formState, currentPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">New Password</label>
            <input 
              type="password"
              value={formState.newPassword}
              onChange={(e) => setFormState({ ...formState, newPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Confirm New Password</label>
            <input 
              type="password"
              value={formState.confirmPassword}
              onChange={(e) => setFormState({ ...formState, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-200">
            🔐 Password must be at least 12 characters with uppercase, numbers, and symbols.
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        title="Notifications"
        description="Choose how you want to be notified"
        icon={Bell}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 transition-colors">
            <div>
              <p className="font-medium text-white">Email Notifications</p>
              <p className="text-xs text-zinc-400">Receive analysis completion alerts</p>
            </div>
            <div className={cn(
              "relative w-12 h-6 rounded-full cursor-pointer transition-colors",
              formState.emailNotifications ? "bg-violet-600" : "bg-white/10"
            )}
            onClick={() => setFormState({ ...formState, emailNotifications: !formState.emailNotifications })}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                formState.emailNotifications ? "translate-x-7" : "translate-x-1"
              )} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 transition-colors">
            <div>
              <p className="font-medium text-white">Slack Notifications</p>
              <p className="text-xs text-zinc-400">Send alerts to your Slack workspace</p>
            </div>
            <div className={cn(
              "relative w-12 h-6 rounded-full cursor-pointer transition-colors",
              formState.slackNotifications ? "bg-violet-600" : "bg-white/10"
            )}
            onClick={() => setFormState({ ...formState, slackNotifications: !formState.slackNotifications })}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                formState.slackNotifications ? "translate-x-7" : "translate-x-1"
              )} />
            </div>
          </div>
        </div>
      </SettingSection>

      {/* API Key Management */}
      <SettingSection
        title="API Keys"
        description="Manage your API credentials for programmatic access"
        icon={Zap}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Live API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  type={showApiKey ? "text" : "password"}
                  value={formState.apiKey}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => handleCopy(formState.apiKey, 'apiKey')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white flex items-center gap-2"
              >
                {copied === 'apiKey' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200">
            ⚠️ Keep your API key confidential. Regenerate if you suspect it's been compromised.
          </div>
          <Button variant="outline" className="w-full">Regenerate API Key</Button>
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection
        title="Danger Zone"
        description="Irreversible actions that require caution"
        icon={Shield}
      >
        <div className="space-y-3">
          <button className="w-full px-4 py-3 rounded-lg border-2 border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-medium transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out from All Devices
          </button>
          <button className="w-full px-4 py-3 rounded-lg border-2 border-red-600/50 bg-red-600/5 hover:bg-red-600/10 text-red-400 font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </SettingSection>

      {/* Save Button */}
      <motion.div variants={fadeUp} className="flex gap-3 sticky bottom-4">
        <button
          onClick={handleSave}
          className={cn(
            "flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
            saved 
              ? "bg-emerald-600 text-white" 
              : "bg-violet-600 hover:bg-violet-700 text-white"
          )}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Changes Saved
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
        <Button variant="outline">Cancel</Button>
      </motion.div>
    </motion.div>
  );
}
