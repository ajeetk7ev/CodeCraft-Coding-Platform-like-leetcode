import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBookmark extends Document {
  user: Types.ObjectId;
  problem: Types.ObjectId;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
  },
  { timestamps: true }
);


export const Bookmark = mongoose.model<IBookmark>("Bookmark", bookmarkSchema);
