import { Router } from "express";
import { getCurrentUser } from "../controllers/userControllers";
import authenticate from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getCurrentUser);

export default router;