import { Schema, model, Types } from "mongoose";

const commentSchema = new Schema(
  {
    commentBody: { type: String, required: true },
    createdBy: { type: Types.ObjectId, required: true, ref: "User" },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    postId: { type: Types.ObjectId, ref: "Post" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    commentType: {
      type: String,
      enum: ["reply", "comment"],
      default: "comment",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    replies: [{ type: Types.ObjectId, ref: "Comment" }],
  },

  {
    timestamps: true,
  }
);

export const commentModel = model("Comment", commentSchema);
