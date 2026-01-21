import express from "express";
import cors from "cors";
import { connectDB } from "./models/mongo.config.js";
import { createRequest, getAllVideoRequests, getVideoRequestById, updateVideoRequest, deleteVideoRequest } from "./data/videoReq.data.js";

const PORT = process.env.PORT || 7334;
const app = express();

app.use(cors()); // allow CORS
app.use(express.static("public")); // serve static files in public

// parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// homepage
app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/video-request", getAllVideoRequests);
app.get("/video-request/:id", getVideoRequestById);
app.post("/video-request", createRequest);
app.patch("/video-request/:id", updateVideoRequest);
app.delete("/video-request/:id", deleteVideoRequest);


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
