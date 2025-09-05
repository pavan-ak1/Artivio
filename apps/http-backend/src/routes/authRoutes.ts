import { Router } from "express";
import {signup, signin} from "../controllers/authController"

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

export default router; 