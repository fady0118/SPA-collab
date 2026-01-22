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
  const {sortBy, ...searchTerm} = req.query;
  try {
    let data;
    if(Object.entries(searchTerm).length){
      const {topic_title} = searchTerm
      data = await VideoReq.find({topic_title:{$regex:topic_title, $options:'i'}}).sort({ createdAt: -1 }); 
    } else {
      data = await VideoReq.find({}).sort({ createdAt: -1 }); 
    }
    if (!data) {
      return res.status(404).json("data not found");
    }
    if(sortBy === "New First"){
      data = data.sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt))
    }else if (sortBy === "Top Voted First"){
      data = data.sort((a, b)=>(b.votes["ups"]-b.votes["downs"])-(a.votes["ups"]-a.votes["downs"]))
    }
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

const updateVoteForRequest = async (req, res) => {
  const { vote_type } = req.body;
  const other_type = vote_type === "ups" ? "downs" : "ups";
  try {
    const oldRequest = await VideoReq.findById(req.params.id);
    if (!oldRequest) {
      return res.status(404).json("request not found");
    }
    const newRequest = await VideoReq.findByIdAndUpdate(req.params.id, 
      { votes: { 
        [vote_type]: ++oldRequest.votes[vote_type], 
        [other_type]: oldRequest.votes[other_type] 
      } }, 
        { new: true });
    res.status(200).json({ message: "votes updated", newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export { createRequest, getAllVideoRequests, getVideoRequestById, updateVideoRequest, deleteVideoRequest, updateVoteForRequest };
