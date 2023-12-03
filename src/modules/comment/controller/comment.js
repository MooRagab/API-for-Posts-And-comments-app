import { commentModel } from "../../../../DB/models/comment.model.js";
import { postModel } from "../../../../DB/models/post.model.js";

//CREATE COMMENT

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { commentBody } = req.body;
    const postFound = await postModel.findOne({ _id: postId });
    if (!postFound) {
      res.status(404).json({ message: "Post not found" });
    } else {
      const newComment = new commentModel({
        postId,
        commentBody,
        createdBy: req.user._id,
      });
      const savedComment = await newComment.save();
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $addToSet: { comments: savedComment._id } }
      );
      res
        .status(201)
        .json({ message: "Comment added successfully", savedComment });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE COMMENT

export const updateComment = async (req, res) => {
  try {
    const { _id } = req.params;
    const { commentBody } = req.body;

    const newComment = await commentModel.findOneAndUpdate(
      {
        _id,
        createdBy: req.user._id,
      },
      {
        commentBody,
      }
    );
    newComment
      ? res.status(200).json({ message: "Updated Done !" })
      : res.status(401).json({ message: "Unauthorized to edit the comment" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error ", error: error.message });
  }
};

//DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { _id } = req.params;
    const findComment = await commentModel.findOne({
      _id,
      isDeleted: false,
      createdBy: req.user._id,
    });
    if (!findComment) {
      res.status(404).json({
        message: "Comment not found",
      });
    } else {
      const comment = await commentModel.findOneAndUpdate(
        { _id, isDeleted: false, Comment_type: "comment" },
        { isDeleted: true, deletedBy: req.user._id }
      );
      await postModel.findOneAndUpdate(
        { _id: comment.postId },
        {
          $pull: { comments: comment._id },
        }
      );
      if (!comment) {
        res.status(400).json({
          message: "Comment is already marked as deleted",
        });
      } else {
        res.status(200).json({
          message: "Comment marked as deleted successfully",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//LIKE COMMENTS
export const likeComment = async (req, res) => {
  try {
    const { _id } = req.params;
    const likescomment = await commentModel.findOneAndUpdate(
      {
        _id,
        likes: { $nin: [req.user._id] },
      },
      {
        $addToSet: { likes: req.user._id },
      },
      {
        new: true,
      }
    );
    if (likescomment) {
      res.status(200).json({ message: "liked done" });
    } else {
      res.status(400).json({ message: "liked fail" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// REPLAY ON COMMENT AND REPLAY
export const addReply = async (req, res) => {
  try {
    const { _id } = req.params;
    const { commentBody } = req.body;
    const commentFound = await commentModel.findOne({ _id });
    if (!commentFound) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      const newReply = new commentModel({
        commentBody,
        createdBy: req.user._id,
        commentType: "reply",
      });
      const savedReply = await newReply.save();
      await commentModel.findOneAndUpdate(
        { _id },
        { $addToSet: { replies: savedReply._id } }
      );
      res.status(201).json({ message: "Reply added successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//GET ONE COMMENT AND RAPLAYS ON COMMENT

export const getCommentsAndReplies = async (req, res) => {
  try {
    const comments = await commentModel
      .find({ commentType: "comment", isDeleted: false })
      .populate([
        {
          path: "replies",
          select: "commentBody replies",
          match: { isDeleted: false },
          populate: {
            path: "replies",
            select: "commentBody",
          },
        },
      ]);
    comments.length
      ? res.status(200).json({ message: "Done", comments })
      : res.status(404).json({ message: "Comment not found" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " });
  }
};

//DELETE REPLIES

export const softDeleteReplies = async (req, res) => {
  try {
    const { _id } = req.params;
    const findRelpy = await commentModel.findOne({
      _id,
      isDeleted: false,
      createdBy: req.user._id,
    });
    if (!findRelpy) {
      res.status(404).json({
        message: "Reply not found",
      });
    } else {
      const reply = await commentModel.findOneAndUpdate(
        { _id, isDeleted: false, commentType: "reply" },
        { isDeleted: true, deletedBy: req.user._id }
      );
      await commentModel.findOneAndUpdate(
        { _id: reply.commentId },
        {
          $pull: { replies: reply._id },
        }
      );
      if (!reply) {
        res.status(400).json({
          message: "Reply is already Deleted",
        });
      } else {
        res.status(200).json({
          message: "Reply Is Deleted successfully !",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};
