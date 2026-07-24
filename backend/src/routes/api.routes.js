import { Router } from "express";
import { analyzeController } from "../controllers/analyze.controller.js";
import { validateAnalyzeRequest } from "../validators/analyze.validator.js";

const router = Router();

router.post("/analyze", validateAnalyzeRequest, analyzeController);

export default router;
