import express from "express";
import { Profile, getTopScores, saveOrUpdateScore, signin, signup, deleteAccount } from "../controllers/userAuthController.js";
import middleware from "../middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", middleware, Profile);
router.post("/score", middleware, saveOrUpdateScore);
router.get("/leaderboard", getTopScores);
router.delete('/delete', middleware, deleteAccount);

export default router;