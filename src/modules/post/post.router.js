import { Router } from "express";
import * as postController from "./controller/post.js";
import { auth } from "../../middleware/auth.js";
import { endPoints } from "./post.endPoint.js";
import { fileValidation, myMulter } from "../../services/multer.js";
const router = Router();

router.post(
  "/createpost",
  auth(endPoints.userAndAdmin),
  myMulter(fileValidation.image).single("image"),
  postController.createPost
);
router.put(
  "/updatepost/:id",
  auth(endPoints.userOnly),
  myMulter(fileValidation.image).single("image"),
  postController.updatePost
);
router.delete(
  "/deletepost/:id",
  auth(endPoints.userOnly),
  postController.deletePost
);
router.post("/likepost/:id", auth(endPoints.userOnly), postController.likePost);
router.post(
  "/unlikepost/:id",
  auth(endPoints.userOnly),
  postController.unLikesPost
);

router.get("/getall", auth(endPoints.adminOnly), postController.getAllPosts);
router.get(
  "/getallpostsforuser",
  auth(endPoints.userOnly),
  postController.getPostsForUser
);
export default router;
