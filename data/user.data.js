import cookieParser from "cookie-parser";
import { User } from "../models/user.model.js";
import JWT from "jsonwebtoken";

const createUser = async (req, res) => {
  const { author_name, author_email } = req.body;
  if (!author_name || !author_email) {
    return res.status(400).json({ message: "name or email is missing" });
  }
  try {
    const userExists = await User.findOne({ author_name, author_email });
    if (userExists) {
      return res.status(400).json({ message: "user already exists" });
    }
    const user = await User.create({ author_name, author_email });
    if (!user) {
      return res.status(400).json({ message: "failed to create user" });
    }
    const token = JWT.sign({ userId:user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res
      .status(201)
      .cookie("JWT", token, { httpOnly: true, sameSite: true, secure: true, maxAge: 1000 * 60 * 60 * 24 })
      .json({ message: "user registered!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const loginUser = async (req, res) => {
  const { author_name, author_email } = req.body;
  if (!author_name || !author_email) {
    return res.status(400).json({ message: "name or email is missing" });
  }
  try {
    const user = await User.findOne({ author_name, author_email }).populate("videoRequests");
    if (!user) {
      return res.status(400).json({ message: "user doesn't exist" });
    }
    const token = JWT.sign({ userId:user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res
      .status(200)
      .cookie("JWT", token, { httpOnly: true, sameSite: "strict", secure: true, maxAge: 1000 * 60 * 60 * 24 })
      .json({ message: "login successful!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  if (!req.user._id) {
    return res.status(403).json({ message: "no user provided!" });
  }
  const user = await User.find({ _id: req.user._id });
  if (!user) {
    return res.status(404).json({ message: "user no found!" });
  } else if (user.role !== "super user") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const users = await User.find({});
    if (!users) {
      throw new Error("no users found");
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
    // remove JWT cookie
    res.clearCookie("JWT", { httpOnly: true, sameSite: "strict", secure: true })
    res.status(200).json({message:"user logged out"})
}

export { createUser, loginUser, getAllUsers, getUserById, logoutUser };
