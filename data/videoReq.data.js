import { VideoReq } from "../models/videoReq.model.js";
// req.user comes from th middleware & req.body from the frontend
const createRequest = async (req, res) => {
  const { author_name, author_email, topic_title, topic_details, expected_result, target_level } = req.body;
  try {
    const video_req = await VideoReq.create({
      author_name,
      author_email,
      topic_title,
      topic_details,
      expected_result,
      target_level: target_level ?? undefined,
    });

    if (!video_req) {
      return res.status(400).json({ message: "error creating video-request" });
    }
    res.status(201).json(video_req );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVideoRequests = async (req, res) => {
  try {
    const data = await VideoReq.find({}).sort({ createdAt: -1 }); 
    if (!data) {
      return res.status(404).json("data not found");
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export { createRequest, getAllVideoRequests };
