import mongoose, { Schema } from "mongoose";

const VideoRequestsSchema = new Schema(
  {
    // author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    author_name: { type: String, required: true, trim: true },
    author_email: { type: String, required: true, trim: true },
    topic_title: { type: String, required: true },
    topic_details: { type: String, required: true },
    expected_result: { type: String },
    votes: {
      ups: { type: Number, default: 0 },
      downs: { type: Number, default: 0 },
    },
    target_level: { type: String, default: "beginner" },
    status: { type: String, default: "new" },
    video_ref: {
      link: { type: String, default: "" },
      date: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const VideoReq = mongoose.model("videoRequest", VideoRequestsSchema);
