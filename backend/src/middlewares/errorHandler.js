import { AppError } from "../utils/AppError.js";
import { errorResponse } from "../utils/responseFormatter.js";
import { logger } from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.errorCode}`, { message: err.message, path: req.path });
    return res.status(err.statusCode).json(errorResponse(err.errorCode, err.message));
  }

  logger.error("Unhandled Exception:", err);
  
  return res.status(500).json(
    errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong while processing the request."
    )
  );
};

export default errorHandler;
