import { User } from "../models/user.model.js";
import JWT from "jsonwebtoken"
const authMiddleware = async (req, res, next) => {
  // update authMiddleware to rely on generated token instead of userId in req.body
      // const {userId} = req.body;
  let token;
  if(req.cookies?.JWT){
    token = req.cookies.JWT;
  }
  if(!token){
    return res.status(401).json({ message: "Unauthorized, no token provided!" });
  }
  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  try {
    const user = await User.findById(decoded.userId);
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
