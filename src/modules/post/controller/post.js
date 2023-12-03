import { postModel } from "../../../../DB/models/post.model.js";
import { userModel } from "../../../../DB/models/user.model.js";
import cloudinary from "../../../services/cloudinary.js";
import { paginate } from "../../../services/pagination.js";

// CREATE POST

export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      const { postBody } = req.body;
      const newPost = new postModel({
        postBody: postBody,
        createdBy: req.user._id,
      });
      const savedPost = await newPost.save();
      await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { $addToSet: { posts: savedPost._id } }
      );
      res.status(201).json({ message: "Post created successfully", savedPost });
    } else {
      const { postBody } = req.body;
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Gallery/${req.user._id}`,
      });
      const newPost = new postModel({
        postPicture: secure_url,
        postBody,
        createdBy: req.user._id,
      });
      const savedPost = await newPost.save();
      await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { $addToSet: { posts: savedPost._id } }
      );
      res.status(201).json({ message: "Done", savedPost });
    }
  } catch (error) {
    res.status(500).json({ message: "CATCH ERROR", error: error.message });
  }
};

//UPDATE POST

export const updatePost = async (req, res) => {
  if (!req.file) {
    const { postBody } = req.body;
    const { id } = req.params;
    const post = await postModel.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user._id,
      },
      { postBody }
    );
    if (!post) {
      res.status(404).json({ message: "No post found" });
    } else {
      res.status(200).json({ message: "Post is updated successfully" });
    }
  }
};

//DELETE POST

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await postModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!post) {
    res.status(404).json({ message: "No post found" });
  } else {
    res.status(200).json({ message: "Post is Deleted successfully" });
  }
};

//LIKE POST

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const likepost = await postModel.findOneAndUpdate(
      {
        _id: id,
        likes: { $nin: [req.user._id] },
      },
      {
        $push: { likes: req.user._id },
        $pull: { unLikes: req.user._id },
      }
    );
    if (likepost) {
      res.status(200).json({ message: "You are liked this post successfully" });
    } else {
      res.status(400).json({ message: "liked fail" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//UN LIKE POSTS

export const unLikesPost = async (req, res) => {
  try {
    const { id } = req.params;
    const unlikespost = await postModel.findOneAndUpdate(
      {
        _id: id,
        unLikes: { $nin: [req.user._id] },
      },
      {
        $addToSet: { unLikes: req.user._id },
        $pull: { likes: req.user._id },
      }
    );
    if (unlikespost) {
      res.status(200).json({
        message: "You are unliked this post successfully",
      });
    } else {
      res.status(400).json({ message: "unliked fail" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GET ALL POSTS

export const getAllPosts = async (req, res) => {
  const { limit, skip } = paginate({
    page: req.query.page,
    size: req.query.size,
  });
  const posts = await postModel
    .find({ isDeleted: false })
    .populate({
      path: "createdBy",
      select: "email userName gender age",
      match: { isDeleted: false },
    })
    .limit(limit)
    .skip(skip);

  res.status(200).json({ message: "Done successfully !", posts });
};

// GET ALL POSTS FOR ONE USER

export const getPostsForUser = async (req, res) => {
  try {
    const { skip, limit } = paginate(req.query.page, req.query.size);
    const posts = await postModel
      .find({ createdBy: req.user._id, isDeleted: false })
      .populate({
        path: "createdBy",
        select: "email",
        match: { isDeleted: false },
      })
      .select("createdBy postBody")
      .limit(limit)
      .skip(skip);

    if (!posts) {
      res.status(404).json({ message: "There is no posts" });
    } else {
      res.status(200).json({ message: "Done successfully !", posts });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
