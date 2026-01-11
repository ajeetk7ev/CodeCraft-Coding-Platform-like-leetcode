import { useState } from "react";
import {
  Shield,
  Palette,
  Globe,
  Lock,
  User,
  Bell,
  Save,
  RotateCcw,
  AlertTriangle,
  Server,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            System <span className="text-indigo-500">Configuration</span>
          </h1>
          <p className="text-slate-400 font-medium">Manage platform-wide settings, security, and appearance</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-800 text-slate-400 hover:bg-slate-900"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? (
              <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-1.5 rounded-2xl mb-8 inline-flex w-full md:w-auto overflow-x-auto scrollbar-none">
          <TabsList className="bg-transparent h-auto gap-1">
            {[
              { id: "general", label: "General", icon: Globe },
              { id: "appearance", label: "Appearance", icon: Palette },
              { id: "security", label: "Security", icon: Lock },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "system", label: "System Health", icon: Server },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-xl px-5 py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* General Tab */}
          <TabsContent value="general" className="m-0 space-y-6">
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-indigo-400" />
                  Basic Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Platform Name</label>
                    <Input defaultValue="CodeCraft" className="bg-slate-950 border-slate-800 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Support Email</label>
                    <Input defaultValue="support@codecraft.com" className="bg-slate-950 border-slate-800 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400">Platform Description</label>
                  <textarea
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:ring-1 ring-indigo-500 resize-none"
                    placeholder="Enter platform bio..."
                    defaultValue="A high-performance coding platform for technical interviews and competitive programming."
                  />
                </div>
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100">Maintenance Mode</h3>
                  <p className="text-sm text-slate-500">Only administrators will be able to access the platform</p>
                </div>
                <div className="h-6 w-11 bg-slate-800 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 bg-slate-400 rounded-full" />
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="m-0 space-y-6">
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center border-dashed">
              <Palette className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300">Theme Editor coming soon</h3>
              <p className="text-slate-500 mt-2">Personalize the platform colors, fonts and layouts</p>
            </section>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="m-0 space-y-6">
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  Authentication Settings
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Add an extra layer of security to account logins</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs text-indigo-400 font-bold">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">Session Management</p>
                      <p className="text-xs text-slate-500">Control active sessions and login duration</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs text-indigo-400 font-bold">Manage</Button>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "CPU Usage", value: "12%", status: "Healthy" },
                { label: "Memory Usage", value: "1.2GB / 8GB", status: "Healthy" },
                { label: "Database Latency", value: "14ms", status: "Optimal" },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-100">{stat.value}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{stat.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-100">Incident Logs</h3>
              </div>
              <div className="space-y-3">
                {[
                  { msg: "Submission queue overflow detected", time: "2 hours ago", type: "warning" },
                  { msg: "Database backup completed successfully", time: "5 hours ago", type: "info" },
                  { msg: "Failed login attempt from 192.168.1.1", time: "12 hours ago", type: "error" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-950/30 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 truncate pr-4">{log.msg}</span>
                    <span className="text-[10px] text-slate-600 font-mono italic shrink-0">{log.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
