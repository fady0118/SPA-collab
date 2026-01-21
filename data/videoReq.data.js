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

const searchRequests = async (req, res) => {
  // rn we only search for topic but we can search for author name or email, target_level or status
  const { topic_title } = req.query;
  try {
    const topics = await VideoReq.find({ topic_title }).sort({ createdAt: -1 });
    if (!topics) {
      return res.status(404).json("no request found");
    }
    res.status(200).json({ topics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVideoReq = async (req, res) => {
  const searchTerm = req.query;
  if(Object.entries(searchTerm).length){
    return searchRequests(req, res)
  } else{
    return getAllVideoRequests(req, res)
  }
}

const getVideoRequestById = async (req, res) => {
  const video_Id = req.params.id;
  try {
    const video = await VideoReq.find({ _id: video_Id });
    if (!video) {
      return res.status(404).json("request not found");
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVideoRequest = async (req, res) => {
  const allowedFields = ["topic_title", "topic_details", "expected_result", "target_level"];
  let updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  try {
    // find & update request in database
    const updatedRequest = await VideoReq.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updatedRequest) {
      return res.status(404).json("request not found");
    }
    res.status(200).json({ message: "video-request updated", updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVideoRequest = async (req, res) => {
  try {
    const deletedRequest = await VideoReq.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json("request not found");
    }
    res.status(200).json({ message: "request deleted", deletedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export { createRequest, getVideoReq, getVideoRequestById, updateVideoRequest, deleteVideoRequest };
