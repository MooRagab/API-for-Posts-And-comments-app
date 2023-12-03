import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });
import express from "express";
const app = express();
const baseUrl = process.env.BASEURL;
const port = process.env.PORT;
import * as indexRouter from "./src/modules/index.router.js";
import connectDB from "./DB/connection.js";

app.use(express.json());
app.use(`${baseUrl}/user`, indexRouter.userRouter);
app.use(`${baseUrl}/post`, indexRouter.postRouter);
app.use(`${baseUrl}/comment`, indexRouter.commentRouter);
app.use(`${baseUrl}/auth`, indexRouter.authRouter);
app.use("*", (req, res) => res.send("In-valid Routing"));

connectDB();
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
