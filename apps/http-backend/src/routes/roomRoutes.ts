import { roomController } from "../controllers/socketController";

import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
const router = Router();

router.post("/room",authenticateUser, roomController);

