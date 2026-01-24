import express from "express";
import cors from "cors";
import { connectDB } from "./models/mongo.config.js";
import { createRequest, getAllVideoRequests, getVideoRequestById, updateVideoRequest, deleteVideoRequest, updateVoteForRequest } from "./data/videoReq.data.js";
import multer from "multer";
import { createUser, getAllUsers, loginUser } from "./data/user.data.js";
import authMiddleware from "./middleware/authMiddleware.js";


const PORT = process.env.PORT || 7334;
const app = express();
const upload = multer();

app.use(cors()); // allow CORS
app.use(express.static("public")); // serve static files in public

// parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// homepage
app.get("/", (req, res) => {
  res.send("hello");
});

// videoReq routes
app.get("/video-request", getAllVideoRequests);
app.get("/video-request/:id", getVideoRequestById);
app.post("/video-request", authMiddleware, upload.none(),createRequest);
app.patch("/video-request/:id", updateVideoRequest);
app.patch("/video-request/vote/:id", updateVoteForRequest);
app.delete("/video-request/:id", deleteVideoRequest);
// user routes
app.get("/user/", getAllUsers)
app.post("/user/signup", upload.none(), createUser);
app.post("/user/login", upload.none(), loginUser);

const startServer = async () => {
  connectDB();
  try {
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
