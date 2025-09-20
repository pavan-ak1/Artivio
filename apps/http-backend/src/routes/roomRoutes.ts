import { roomController } from "../controllers/socketController";

import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
const router:Router = Router();

router.post("/",authenticateUser, roomController);

export default router;