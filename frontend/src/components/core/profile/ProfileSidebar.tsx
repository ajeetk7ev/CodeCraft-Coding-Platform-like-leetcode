import { Github, Linkedin, Pencil, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/stores/profileStore";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import { motion } from "framer-motion";

export default function ProfileSidebar() {
  const { profile } = useProfileStore();
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const { user } = profile;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 group sticky top-28"
      >
        <div className="flex flex-col items-center text-center">
          {/* Avatar Section */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <img
                src={user.avatar || "https://i.pravatar.cc/150?img=12"}
                className="w-36 h-36 rounded-[2.5rem] border-4 border-slate-900 shadow-2xl object-cover ring-2 ring-indigo-500/20"
                alt={user.fullName}
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 border-4 border-slate-950 rounded-full shadow-lg" />
            </motion.div>
          </div>

          {/* User Info */}
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {user.fullName}
            </h2>
            <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
              @{user.username}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                Rating: {user.rating || 1500}
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 px-2">
            {user.bio || "Crafting code and solving challenges. No bio set yet."}
          </p>

          {/* Metadata */}
          <div className="w-full space-y-4 mb-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 text-slate-400 group/item hover:text-indigo-300 transition-colors">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium truncate">{user.email}</span>
            </div>

            {/* These could be added to user model later or placeholders for now */}
            <div className="flex items-center gap-3 text-slate-400 group/item hover:text-indigo-300 transition-colors">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">Remote / Earth</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 group/item hover:text-indigo-300 transition-colors">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Joined Jan 2026</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3 mb-8 w-full">
            {user.github ? (
              <a
                href={user.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800/50 border border-white/5 hover:bg-slate-700 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/10"
              >
                <Github className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">GitHub</span>
              </a>
            ) : (
              <div className="flex-1 py-3 rounded-2xl bg-white/5 border border-dashed border-white/10 text-slate-600 flex items-center justify-center gap-2 grayscale">
                <Github className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Disconnected</span>
              </div>
            )}

            {user.linkedin ? (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800/50 border border-white/5 hover:bg-slate-700 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/10"
              >
                <Linkedin className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">LinkedIn</span>
              </a>
            ) : (
              <div className="flex-1 py-3 rounded-2xl bg-white/5 border border-dashed border-white/10 text-slate-600 flex items-center justify-center gap-2 grayscale">
                <Linkedin className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Disconnected</span>
              </div>
            )}
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="w-full h-14 bg-white text-slate-950 hover:bg-indigo-50 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-white/5 flex items-center justify-center gap-3 active:scale-95 transition-all group/btn"
          >
            <Pencil className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      <EditProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
