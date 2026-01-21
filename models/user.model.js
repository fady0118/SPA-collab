import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    author_name: {
      type: String,
      required: true,
      trim: true,
    },
    author_email: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
