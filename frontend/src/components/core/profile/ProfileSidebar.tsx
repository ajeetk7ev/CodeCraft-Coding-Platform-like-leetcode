import { Github, Linkedin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/stores/profileStore";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

export default function ProfileSidebar() {
  const { profile } = useProfileStore();
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const { user } = profile;

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.avatar || "https://i.pravatar.cc/150?img=12"}
            className="w-28 h-28 rounded-full border-4 border-gray-800"
          />

          <h2 className="mt-4 text-xl font-semibold">
            {user.fullName}
          </h2>
          <p className="text-gray-400">@{user.username}</p>

          <p className="text-sm text-gray-400 mt-2">
            {user.bio || "No bio available"}
          </p>

          <div className="flex gap-4 mt-4">
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 hover:text-white" />
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5 hover:text-white" />
              </a>
            )}
          </div>

          <Button
            variant="secondary"
            className="mt-6 w-full flex gap-2"
            onClick={() => setOpen(true)}
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <EditProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
