import { Router } from "express";
import { analyzeController } from "../controllers/analyze.controller.js";
import { validateAnalyzeRequest } from "../validators/analyze.validator.js";

const router = Router();

// Define the POST /analyze route.
// Notice how clean this reads: Route -> Validate -> Controller
router.post("/analyze", validateAnalyzeRequest, analyzeController);

export default router;
