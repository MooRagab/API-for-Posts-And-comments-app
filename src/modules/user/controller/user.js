import { userModel } from "../../../../DB/models/user.model.js";
import cloudinary from "../../../services/cloudinary.js";
import { paginate } from "../../../services/pagination.js";

// ADD PROFILE PICTURE

export const profilePic = async (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ message: "Please Upload Profile Picture" });
  } else {
    const image = await cloudinary.uploader.upload(req.file.path, {
      folder: `user/${req.user._id}/profilePic`,
    });
    await userModel.updateOne(
      { _id: req.user._id },
      { profilePic: image.secure_url }
    );
    res.status(200).json({ message: "Done" });
  }
};

// ADD PROFILE COVER

export const profileCoverPic = async (req, res, next) => {
  try {
    if (!req.files) {
      res.status(400).json({ message: "Please Upload Profile Picture" });
    } else {
      let imageCover = [];
      const user = await userModel.findOne({ _id: req.user._id });
      for (const file of req.files) {
        const image = await cloudinary.uploader.upload(file.path, {
          folder: `user/${req.user._id}/CoverPic`,
        });
        imageCover.push(image.secure_url);
      }

      await userModel.updateOne(
        { _id: req.user._id },
        { coverPic: [...user.coverPic, ...imageCover] }
      );
      res.status(200).json({ message: "Done" });
    }
  } catch (error) {
    res.status(500).json({ message: "CATCH ERROR" }, error.message);
  }
};

// GET USER PROFILE

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ message: "Done", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Catch Error", error });
  }
};

// Update Profile

export const updateProfile = async (req, res) => {
  try {
    const { userName, age, gender } = req.body;
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      { userName, age, gender },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json({
        message: "Updated Done",
      });
    } else {
      res.status(400).json({ message: "Updated Fail" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" }, error.message);
  }
};

//SOFT DELETE 

export const softDelete = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const { _id } = req.body;
      const userFound = await userModel.findOneAndUpdate(
        { _id, isDeleted: false, role: "user" },
        { isDeleted: true },
        { new: true }
      );
      if (userFound) {
        res.status(200).json({ message: "Done" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      const userFound = await userModel.findOneAndUpdate(
        { _id: req.user._id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      if (userFound) {
        res.status(200).json({ message: "Done" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//BAN ACCOUTNS

export const bannedProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    const userFound = await userModel.findOneAndUpdate(
      { _id, isBanned: false, role: "user" },
      { isBanned: true },
      {
        new: true,
      }
    );
    if (userFound) {
      res.json({ message: "Done" });
    } else {
      res.json({ message: "fail to find the user" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const { skip, limit } = paginate(req.query.page, req.query.size);
    const users = await userModel
      .find({ isDeleted: false })
      .populate([
        {
          path: "posts",
          select: ["postBody", "createdBy", "comments"],
          match: { isDeleted: false },
          populate: [
            {
              path: "comments",
              select: ["commentBody", "replies"],
              match: { isDeleted: false },
              populate: {
                path: "replies",
                select: "commentBody replies",
                populate: {
                  path: "replies",
                  select: "commentBody",
                },
              },
            },
          ],
        },
      ])
      .select("email posts")
      .limit(limit)
      .skip(skip);

    users.length
      ? res.status(200).json({ message: "Done", users })
      : res.status(404).json({ message: "There are no users" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
