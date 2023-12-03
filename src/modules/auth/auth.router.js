import { Router } from "express";
import * as authController from "./controller/registration.js";
const router = Router();
import * as validator from "./auth.validation.js";
import { validation } from "../../middleware/valdiation.js";

router.post("/signup", validation(validator.signUp), authController.signUp);
router.get("/confirmEmail/:token", authController.confirmEmail);
router.post("/signin", validation(validator.signIn), authController.signIn);
router.get("/expirationPage", authController.expirationPage);

export default router;
