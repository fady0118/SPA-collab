import { User } from "../models/user.model.js"

const createUser = async (req, res) => {
    const {author_name, author_email} = req.body;
    if(!author_name || !author_email){
        return res.status(400).json({message:"name or email is missing"});
    }
    try {
        const userExists = await User.findOne({author_name, author_email});
        console.log(userExists)
        if(userExists){
            return res.status(400).json({message:"user already exists"})
        }
        const user = await User.create({author_name, author_email});
        if(!user){
            return res.status(400).json({message:"failed to create user"})
        }
        // res.status(201).json({message:"user registered!", user});
        res.redirect(`http://127.0.0.1:5500/project/index.html?id=${user._id}`)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}
const loginUser = async (req, res) => {
    const {author_name, author_email} = req.body;
    if(!author_name || !author_email){
        return res.status(400).json({message:"name or email is missing"});
    }
    try {
        const user = await User.findOne({author_name, author_email});
        if(!user){
            return res.status(400).json({message:"user doesn't exist"})
        }
        // res.status(200).json({message:"login successful!", user});
        res.redirect(`http://127.0.0.1:5500/project/index.html?id=${user._id}`)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

const getAllUsers = async (req, res)=>{
    try {
        const users = await User.find({});
        if(!users){
            throw new Error("no users found")
        }
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export {createUser, loginUser, getAllUsers}