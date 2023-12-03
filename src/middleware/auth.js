import jwt from "jsonwebtoken";
import { userModel } from "../../DB/models/user.model.js";
import openurl from "openurl";

export const roles = {
  ADMIN: "admin",
  USER: "user",
};
export const auth = (accessRoles = []) => {
  try {
    return async (req, res, next) => {
      const { authorization } = req.headers;
      if (!authorization?.startsWith(process.env.BEARERKEY)) {
        res
          .status(401)
          .json({ message: "In-valid token or In-valid Bearer Key" });
      } else {
        const token = authorization.split(process.env.BEARERKEY)[1];
        const decoded = jwt.verify(token, process.env.SIGNINTOKEN);
        if (!decoded?.id || !decoded?.isLoggedIn) {
          res.status(401).json({ message: "In-valid token payload" });
        } else {
          const user = await userModel.findById(decoded.id);
          if (!user) {
            res.status(404).json({ message: "User not found" });
          } else {
            if (!accessRoles.includes(user.role)) {
              res.status(400).json({ message: "In-valid Role" });
            } else {
              req.user = user;
              next();
            }
          }
        }
      }
    };
  } catch (error) {
    // In Case of Expiration
    if (error.name == "TokenExpiredError") {
      openurl.open(
        `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/expirationPage`
      );
    } else {
      res.status(500).json({ message: "CATCH ERROR" }, error.message);
    }
  }
};
