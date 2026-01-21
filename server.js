import express from "express";
import cors from "cors";

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

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
