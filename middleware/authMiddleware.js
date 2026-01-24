import { User } from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const userId = req.query;
  try {
    const user = await User.findById(userId.id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(404).json({
      error: error.message,
      message: "Unauthorized",
    });
  }
};

export default authMiddleware;
