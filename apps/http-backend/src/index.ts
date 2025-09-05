import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

//all imports
import authRoutes from "./routes/authRoutes"


app.listen(5000);