import { Schema, model, Types } from "mongoose";

const postSchema = new Schema(
  {
    postBody: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    unLikes: [{ type: Types.ObjectId, required: true, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
    postPicture: String,
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

export const postModel = model("Post", postSchema);
