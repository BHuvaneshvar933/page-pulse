import { AppError } from "../utils/AppError.js";

export const validateAnalyzeRequest = (req, res, next) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    throw new AppError(
      "INVALID_URL",
      400,
      "Please provide a URL in the request body."
    );
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new AppError(
        "INVALID_URL",
        400,
        "URL must start with http:// or https://"
      );
    }
  } catch (err) {
    throw new AppError(
      "INVALID_URL",
      400,
      "Please enter a valid URL."
    );
  }

  next();
};
