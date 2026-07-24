import { analyzePage } from "../services/analyzer.service.js";
import { successResponse } from "../utils/responseFormatter.js";
import { logger } from "../utils/logger.js";

export const analyzeController = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    logger.info(`Starting analysis for URL: ${url}`);
    
    // All heavy lifting and logic is pushed to the service layer
    const report = await analyzePage(url);
    
    logger.info(`Successfully analyzed URL: ${url}`, { responseTime: report.responseTimeMs });
    
    return res.status(200).json(successResponse(report));
  } catch (error) {
    // Pass the error (whether AppError or unknown) to the global error handler
    next(error);
  }
};
