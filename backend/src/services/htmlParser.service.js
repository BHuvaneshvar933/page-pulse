import * as cheerio from "cheerio";

/**
 * Pure extraction logic.
 * Parses HTML and returns raw data without computing business metrics.
 * 
 * @param {string} html 
 * @returns {Object} Extracted raw data
 */
export const extractHtmlData = (html) => {
  const $ = cheerio.load(html);

  // Extract Title
  const title = $("title").text().trim();

  // Extract Meta Description 
  let metaDescription = $('meta[name="description"]').attr("content");
  if (!metaDescription) {
    metaDescription = $('meta[property="og:description"]').attr("content");
  }

  // Extract all H1 headings
  const h1s = [];
  $("h1").each((_, el) => {
    h1s.push($(el).text().trim());
  });

  // Extract Images and whether they have an alt attribute
  const images = [];
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    images.push({
      hasAlt: alt !== undefined
    });
  });

  // Extract body text for word count
  // We remove script and style tags first so we don't count JS/CSS code as words.
  $("script, style").remove();
  const rawText = $("body").text();

  return {
    title,
    metaDescription: metaDescription ? metaDescription.trim() : null,
    h1s,
    images,
    rawText
  };
};
