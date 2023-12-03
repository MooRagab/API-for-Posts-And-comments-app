import { Router } from "express";
import * as userController from "./controller/user.js";
import { auth } from "../../middleware/auth.js";
import { HME, fileValidation, myMulter } from "../../services/multer.js";
import { endPoints } from "./user.endPoint.js";
const router = Router();

router.patch(
  "/profilepic",
  auth(endPoints.userOnly),
  myMulter(fileValidation.image).single("image"),
  HME,
  userController.profilePic
);
router.patch(
  "/profilecoverpic",
  auth(endPoints.userOnly),
  myMulter(fileValidation.image).array("images", 5),
  HME,
  userController.profileCoverPic
);

router.put(
  "/updateprofile",
  auth(endPoints.userOnly),
  userController.updateProfile
);

router.patch(
  "/softDelete",
  auth(endPoints.userAndAdmin),
  userController.softDelete
);

router.patch(
  "/banaccount",
  auth(endPoints.adminOnly),
  userController.bannedProfile
);

router.get("/profile", auth(endPoints.userOnly), userController.getUserProfile);
router.get("/getallusers", userController.getAllUsers);
export default router;
