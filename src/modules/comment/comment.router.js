import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoints } from "./comment.endPoint.js";
import * as commentController from "./controller/comment.js";
const router = Router();

router.post(
  "/:postId",
  auth(endPoints.userOnly),
  commentController.createComment
);
router.put("/:_id", auth(endPoints.userOnly), commentController.updateComment);
router.patch(
  "/:_id",
  auth(endPoints.userOnly),
  commentController.deleteComment
);
router.post(
  "/likecomment/:_id",
  auth(endPoints.userOnly),
  commentController.likeComment
);
router.post(
  "/replaycomment/:_id",
  auth(endPoints.userOnly),
  commentController.addReply
);
router.get("/commentbyreplies", commentController.getCommentsAndReplies);
router.patch(
  "/softdeletereplies/:_id",
  auth(endPoints.userOnly),
  commentController.softDeleteReplies
);

export default router;
