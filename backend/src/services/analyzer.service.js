import config from "../config/config.js";
import { AppError } from "../utils/AppError.js";
import { extractHtmlData } from "./htmlParser.service.js";

/**
 * Computes the word count from a raw text string.
 */
const computeWordCount = (text) => {
  if (!text) return 0;
  // Replace newlines and multiple spaces with a single space, trim, and split
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === "" ? 0 : words.length;
};

/**
 * Core Orchestrator for analyzing a page.
 * 1. Fetches the URL
 * 2. Validates Response
 * 3. Passes HTML to parser
 * 4. Computes business metrics
 */
export const analyzePage = async (url) => {
  const startTime = Date.now();
  let response;

  try {
    // 1. Fetch with Timeout handling using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Adding a User-Agent prevents many sites from blocking the request (403 Forbidden)
        "User-Agent": "PagePulse-Analyzer/1.0"
      }
    });

    clearTimeout(timeoutId);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError("REQUEST_TIMEOUT", 504, "The website took too long to respond.");
    }
    // DNS Failure or network error
    throw new AppError("DOMAIN_NOT_FOUND", 400, "The domain could not be resolved or reached.");
  }

  // 2. Validate Response
  if (!response.ok) {
    if (response.status === 404) {
      throw new AppError(
        "NOT_FOUND",
        404,
        "HTTP Error (404): The requested page does not exist on the target website."
      );
    }
    throw new AppError(
      "UPSTREAM_ERROR", 
      502, 
      `The target server responded with an error (${response.status}).`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new AppError("NON_HTML_RESPONSE", 422, "The URL does not return an HTML page.");
  }

  // 3. Parse HTML
  const html = await response.text();
  const rawData = extractHtmlData(html);

  // 4. Compute Metrics
  const responseTimeMs = Date.now() - startTime;
  const wordCount = computeWordCount(rawData.rawText);
  const imagesMissingAlt = rawData.images.filter(img => !img.hasAlt).length;
  const h1Count = rawData.h1s.length;

  return {
    url,
    httpStatus: response.status,
    responseTimeMs,
    title: rawData.title,
    metaDescription: rawData.metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount
  };
};
