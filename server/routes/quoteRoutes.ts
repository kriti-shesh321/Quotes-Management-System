import { Router } from "express";
import { addQuote, deleteQuote, getQuoteById, getQuotes, updateQuote } from "../controllers/quoteControllers";
import authenticate from "../middleware/authMiddleware";
import optionalAuth from "../middleware/optionalAuthMiddleware";

const router = Router();

router.post("/", authenticate, addQuote);
router.put("/:id", authenticate, updateQuote);
router.delete("/:id", authenticate, deleteQuote);
router.get("/", optionalAuth, getQuotes);
router.get("/:id", authenticate, getQuoteById);

export default router;