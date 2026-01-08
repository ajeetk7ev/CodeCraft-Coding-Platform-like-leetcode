import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import axios from "axios";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";
import MonacoEditorField from "./MonacoEditorField";

export default function ProblemFormDialog({
  open,
  onClose,
  initialData,
  onSuccess,
}: any) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    difficulty: initialData?.difficulty || "easy",
    description: initialData?.description || "",
    userCodeTemplate: initialData?.boilerplates?.[0]?.userCodeTemplate || "",
    fullCodeTemplate: initialData?.boilerplates?.[0]?.fullCodeTemplate || "",
  });

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.put(
          `${API_URL}/admin/problems/${initialData._id}`,
          form
        );
        toast.success("Problem updated");
      } else {
        await axios.post(`${API_URL}/admin/problems`, form);
        toast.success("Problem created");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save problem");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-slate-900 border border-slate-800">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Problem" : "Create Problem"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Problem Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <select
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2"
            value={form.difficulty}
            onChange={(e) =>
              setForm({ ...form, difficulty: e.target.value })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <textarea
            placeholder="Problem description (HTML allowed)"
            className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-3"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* Monaco Editors */}
          <MonacoEditorField
            label="User Code Template"
            value={form.userCodeTemplate}
            onChange={(v:any) =>
              setForm({ ...form, userCodeTemplate: v })
            }
          />

          <MonacoEditorField
            label="Full Code Template"
            value={form.fullCodeTemplate}
            onChange={(v:any) =>
              setForm({ ...form, fullCodeTemplate: v })
            }
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
