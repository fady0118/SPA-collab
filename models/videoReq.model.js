import mongoose, { Schema } from "mongoose";

const VideoRequestsSchema = new Schema(
  {
    // author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    author_name: { type: String, required: true, trim: true },
    author_email: { type: String, required: true, trim: true },
    topic_title: { type: String, required: true, trim: true },
    topic_details: { type: String, required: true, trim: true },
    expected_result: { type: String, trim: true },
    votes: {
      ups: { type: [String], default: [],  },
      downs: { type: [String], default: [],  },
    },
    target_level: { type: String, enum:[ "beginner", "medium", "advanced"], lowercase: true, default: "beginner" },
    status: { type: String, default: "new" },
    video_ref: {
      link: { type: String, default: "" },
      date: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const VideoReq = mongoose.model("videoRequest", VideoRequestsSchema);
