import { useRef, useState } from "react";
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
import { user as mockUser } from "@/data/profile.mock";
import { Camera } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    fullName: mockUser.fullName,
    username: mockUser.username,
    gender: mockUser.gender || "other",
    bio: mockUser.bio || "",
    avatar: mockUser.avatar || "",
    github: mockUser.github || "",
    linkedin: mockUser.linkedin || "",
  });

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

  function handleSave() {
    console.log("Updated Profile Payload 👉", form);
    // later: upload avatar → get URL → PATCH /users/me
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose} >
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
              src={form.avatar}
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
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
