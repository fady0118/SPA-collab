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
    role: {
      type: String,
      trim: true,
      default: "user",
      enum: ["user", "super user"],
      required: true,
    },
    videoRequests:[{
      type: Schema.Types.ObjectId,
      ref: "videoRequest"
    }]
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
