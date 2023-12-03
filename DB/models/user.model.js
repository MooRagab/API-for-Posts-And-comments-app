import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: [true, "Password Is Required"] },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    age: Number,
    profilePic: String,
    isConfirmed: { type: Boolean, default: false },
    coverPic: Array,
    isDeleted: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    QR_code: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    posts: [{ type: Types.ObjectId, ref: "Post" }]
  },
  {
    timestamps: true,
  }
);

export const userModel = model("User", userSchema);
