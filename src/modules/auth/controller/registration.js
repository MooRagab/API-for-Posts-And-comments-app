import { userModel } from "../../../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../services/email.js";
import { generateQrCode } from "../../../services/QRcode.js";

export const signUp = async (req, res) => {
  try {
    const { userName, password, email, age, gender } = req.body;
    const user = await userModel.findOne({ email }).select("email");
    if (user) {
      res.status(409).json({ message: "Email is already in exist" });
    } else {
      const hash = bcrypt.hashSync(password, parseInt(process.env.SALTROUND));
      const newUser = new userModel({
        email,
        userName,
        password: hash,
        age,
        gender,
      });
      if (!newUser) {
        res
          .status(400)
          .json({ message: "Fail to register, please try again later" });
      } else {
      }
      const token = jwt.sign({ id: newUser._id }, process.env.EMAILTOKEN);
      const message = `<a href='${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}'>
    Follow Me To Confirm your E-Mail
    </a>`;
      const info = await sendEmail(email, "Confirm Email", message);
      const QR_link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/user/profile`;
      const QR_code_string = await generateQrCode(QR_link);
      newUser.QR_code = QR_code_string;
      newUser.save();
      newUser
        ? res
            .status(201)
            .json({ message: "Done", code: newUser, QR_link })
        : res.status(400).json({ message: "Fail to signUp" });
    }
  } catch (error) {
    res.status(500).json({ message: "Catch Error", error: error.message });
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.EMAILTOKEN);
    if (!decoded?.id) {
      res.status(400).json({ message: "In-Valid token Payload" });
    } else {
      const user = await userModel.updateOne(
        { _id: decoded.id, isConfirmed: false },
        { isConfirmed: true }
      );
      user.modifiedCount
        ? res
            .status(200)
            .json({ message: "Your account is confirmed successfully" })
        : res
            .status(400)
            .json({ message: "Your account is already confirmed" });
    }
  } catch (error) {
    res.status(500).json({ message: "CATCH ERROR", error: error.message });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    if (!user.isConfirmed) {
      res.status(401).json({
        message:
          "Your account is not confirmed.Please confirm your account first",
      });
    } else {
      if (user.isDeleted) {
        res.status(401).json({
          message: "Your account is Deleted",
        });
      } else {
        if (user.isBanned) {
          res.status(401).json({
            message:
              "Your account is Banned . Please contact with us to know the reason for this",
          });
        } else {
          const match = bcrypt.compareSync(password, user.password);
          if (!match) {
            res.status(400).json({ message: "Wrong password" });
          } else {
            const token = jwt.sign(
              { id: user._id, isLoggedIn: true },
              process.env.SIGNINTOKEN,
              { expiresIn: 60 * 60 * 24 }
            );
            res.status(200).json({ message: "Done", token });
          }
        }
      }
    }
  }
};

export const expirationPage = (req, res) => {
  res
    .status(401)
    .send(
      "Your token is expired please try to login again or request to refresh your token"
    );
};
