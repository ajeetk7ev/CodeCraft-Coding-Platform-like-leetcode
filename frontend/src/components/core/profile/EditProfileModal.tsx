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
import { Camera } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ open, onClose }: Props) {
  const { profile, updateProfile, isLoading } = useProfileStore();
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

  async function handleSave() {
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
        console.log("Profile updated successfully, closing modal");
       
      } else {
        console.error("Failed to update profile:", result.message);
        alert(`Failed to update profile: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  const handleClose = () => {
    console.log("Modal close requested");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} >
      <DialogContent className="bg-gray-950 border border-gray-800 text-gray-200 max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {/* Avatar Section */}
        <div className="flex justify-center">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <img
              src={form.avatar || "https://i.pravatar.cc/150?img=12"}
              className="w-28 h-28 rounded-full border-4 border-gray-800 object-cover"
            />

            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="w-6 h-6 text-white" />
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
        <div className="space-y-3 mt-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Gender</Label>
            <select
              name="gender"
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>GitHub</Label>
            <Input
              name="github"
              value={form.github}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label>LinkedIn</Label>
            <Input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700"
            />
          </div>
        </div>

        <DialogFooter className="mt-5">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
