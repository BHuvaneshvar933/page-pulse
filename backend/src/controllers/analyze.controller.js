import { analyzePage } from "../services/analyzer.service.js";
import { successResponse } from "../utils/responseFormatter.js";
import { logger } from "../utils/logger.js";

export const analyzeController = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    logger.info(`Starting analysis for URL: ${url}`);
    
    const report = await analyzePage(url);
    
    logger.info(`Successfully analyzed URL: ${url}`, { responseTime: report.responseTimeMs });
    
    return res.status(200).json(successResponse(report));
  } catch (error) {
    next(error);
  }
};
