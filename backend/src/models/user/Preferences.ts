import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPreferences extends Document {
  user: Types.ObjectId;
  defaultLanguage: string;
  theme: string;
  fontSize: number;
  tabSize: number;
}

const preferencesSchema = new Schema<IPreferences>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    defaultLanguage: { type: String, default: "javascript" },
    theme: { type: String, default: "dark" },
    fontSize: { type: Number, default: 14 },
    tabSize: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const Preferences = mongoose.model<IPreferences>(
  "Preferences",
  preferencesSchema
);
