import { VideoReq } from "../models/videoReq.model.js";
// req.user comes from th middleware & req.body from the frontend
const createRequest = async (req, res) => {
  const { topic_title, topic_details, expected_result, target_level } = req.body;
  try {
    const video_req = await VideoReq.create({
      author: req.user._id,
      topic_title,
      topic_details,
      expected_result,
      target_level: target_level ?? "beginner",
    });
    if (!video_req) {
      return res.status(400).json({ message: "error creating video-request" });
    }
    await video_req.populate("author");
    res.status(201).json(video_req);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVideoRequests = async (req, res) => {
  const { sortBy, filterBy, ...searchTerm } = req.query;
  const query = {};
  if (filterBy && filterBy!== "all") {
    query.status = filterBy;
  }
  try {
    let data;
    if (Object.entries(searchTerm).length) {
      query.topic_title = { $regex: searchTerm.topic_title, $options: "i" };
      data = await VideoReq.find(query).populate("author").sort({ createdAt: -1 });
    } else {
      data = await VideoReq.find(query).populate("author").sort({ createdAt: -1 });
    }
    if (!data) {
      return res.status(404).json("data not found");
    }
    if (sortBy === "New First") {
      data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "Top Voted First") {
      data = data.sort((a, b) => b.votes["ups"].length - b.votes["downs"].length - (a.votes["ups"].length - a.votes["downs"].length));
    }
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVideoRequestById = async (req, res) => {
  const video_Id = req.params.id;
  try {
    const video = await VideoReq.find({ _id: video_Id }).populate("author", ["author_name"]);
    if (!video.length) {
      return res.status(404).json("request not found");
    }
    res.status(200).json(video[0]);
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
  // only the super user can delete requests
  if (req.user.role !== "super user") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
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
    // scenarios
    // A. user hasn't voted before
    // B. user already voted and wants to remove his vote
    // C. user already voted other_type before and wants to change vote_type

    // mongoDb native option $addToSet, $pull
    let newRequest;
    // A)
    if (!oldRequest.votes[vote_type].includes(req.user._id) && !oldRequest.votes[other_type].includes(req.user._id)) {
      newRequest = await VideoReq.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: {
            [`votes.${vote_type}`]: req.user._id,
          },
        },
        { new: true },
      );
    }
    // B)
    if (oldRequest.votes[vote_type].includes(req.user._id)) {
      newRequest = await VideoReq.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            [`votes.${vote_type}`]: req.user._id,
          },
        },
        { new: true },
      );
    }
    // C)
    if (oldRequest.votes[other_type].includes(req.user._id)) {
      newRequest = await VideoReq.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            [`votes.${other_type}`]: req.user._id,
          },
          $addToSet: {
            [`votes.${vote_type}`]: req.user._id,
          },
        },
        { new: true },
      );
    }
    res.status(200).json({ message: "votes updated", oldRequest, newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVideoStatus = async (req, res) => {
  if (req.user.role !== "super user") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const { status } = req.body;
  try {
    const updatedVideoStatus = await VideoReq.findByIdAndUpdate(
      req.params.id,
      {
        status,
      },
      { new: true, runValidators: true },
    );
    if (!updatedVideoStatus) {
      throw new Error("video-request not found");
    }
    res.status(200).json(updatedVideoStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addVideoRef = async (req, res) => {
  if (req.user.role !== "super user") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const { link } = req.body;
  try {
    const updatedvideoRef = await VideoReq.findByIdAndUpdate(
      req.params.id,
      {
        video_ref: {
          link,
          date: `${new Date().toLocaleTimeString()} ${new Date().toDateString()}`,
        },
      },
      { new: true },
    );
    if (!updatedvideoRef) {
      return res.status(404).json("request not found");
    }
    res.status(200).json({ video_link: updatedvideoRef.video_ref.link });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createRequest, getAllVideoRequests, getVideoRequestById, updateVideoRequest, deleteVideoRequest, updateVoteForRequest, updateVideoStatus, addVideoRef };
