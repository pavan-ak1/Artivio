import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

//all imports
import authRoutes from "./routes/authRoutes"
import roomRoutes from "./routes/roomRoutes"


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/room',roomRoutes);

const port = 5000;

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
});