import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/stores/profileStore";
import { Camera, LoaderCircle, Github, Linkedin, User, MessageSquare, AtSign, Save, X } from "lucide-react";


interface Props {
  open: boolean;
  onClose: () => void;
}

const modalInputClass = "bg-slate-950/50 border-slate-800 focus:border-indigo-500 focus:ring-1 ring-indigo-500 text-slate-100 placeholder:text-slate-600 h-11 rounded-xl transition-all duration-300";

export default function EditProfileModal({ open, onClose }: Props) {
  const { profile, updateProfile } = useProfileStore();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    fullName: profile?.user.fullName || "",
    gender: profile?.user.gender || "other",
    bio: profile?.user.bio || "",
    avatar: profile?.user.avatar || "",
    github: profile?.user.github || "",
    linkedin: profile?.user.linkedin || "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Update form when profile data changes
  React.useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.user.fullName,
        gender: profile.user.gender || "other",
        bio: profile.user.bio || "",
        avatar: profile.user.avatar || "",
        github: profile.user.github || "",
        linkedin: profile.user.linkedin || "",
      });
    }
  }, [profile]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setForm({ ...form, avatar: previewUrl });
  }

  async function handleSave(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("gender", form.gender);
    formData.append("bio", form.bio);
    formData.append("github", form.github);
    formData.append("linkedin", form.linkedin);

    if (fileRef.current?.files?.[0]) {
      formData.append("avatar", fileRef.current.files[0]);
    }
    setIsUpdating(true);
    try {
      const result = await updateProfile(formData);

      if (result.success) {
        onClose();
      } else {
        alert(`Failed to update profile: ${result.message}`);
      }
    } catch (error) {
      alert("An error occurred while updating profile.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent showCloseButton={false} className="bg-slate-900/90 backdrop-blur-2xl border-white/10 text-slate-200 max-w-xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

        <DialogHeader className="p-8 pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight text-white">Edit Profile</DialogTitle>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Customize Your Identity</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-8 relative z-10 overflow-y-auto max-h-[70vh] scrollbar-none">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src={form.avatar || "https://i.pravatar.cc/150?img=12"}
                className="w-32 h-32 rounded-[2.5rem] border-4 border-slate-950 shadow-2xl object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute inset-x-0 bottom-0 top-0 rounded-[2.5rem] bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500 z-20">
                <Camera className="w-8 h-8 text-white mb-2" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`${modalInputClass} pl-11`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender Identity</Label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className={`${modalInputClass} w-full pl-11 pr-4 appearance-none bg-slate-950/50 cursor-pointer`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Personal Bio</Label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-slate-600" />
                <Textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell your story..."
                  className={`${modalInputClass} pl-11 py-3 resize-none h-24`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GitHub URL</Label>
              <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  name="github"
                  value={form.github}
                  onChange={handleChange}
                  placeholder="github.com/username"
                  className={`${modalInputClass} pl-11`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">LinkedIn URL</Label>
              <div className="relative">
                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                  className={`${modalInputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-white/[0.02] relative z-10 border-t border-white/5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isUpdating}
              className="rounded-xl px-6 font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl px-8 h-12 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-[0.1em] text-[11px]"
            >
              {isUpdating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Identity
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
