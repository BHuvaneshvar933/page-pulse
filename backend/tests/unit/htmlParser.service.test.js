import { describe, it, expect } from "vitest";
import { extractHtmlData } from "../../src/services/htmlParser.service.js";

describe("htmlParser.service.js", () => {
  
  it("Happy Path: Should successfully extract all metrics from a well-formed HTML document", () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
          <meta name="description" content="This is a test description.">
        </head>
        <body>
          <h1>Welcome to the test page</h1>
          <p>This is a paragraph of text with several words.</p>
          <img src="valid.jpg" alt="A valid image">
          <img src="invalid.jpg">
        </body>
      </html>
    `;

    const result = extractHtmlData(html);

    expect(result.title).toBe("Test Page");
    expect(result.metaDescription).toBe("This is a test description.");
    
    expect(result.h1s).toHaveLength(1);
    expect(result.h1s[0]).toBe("Welcome to the test page");
    
    // Total 2 images, 1 is missing alt (hasAlt should be false for the second one)
    expect(result.images).toHaveLength(2);
    expect(result.images[0].hasAlt).toBe(true);
    expect(result.images[1].hasAlt).toBe(false);

    // Text extraction should capture all inner text in the body
    expect(result.rawText).toContain("Welcome to the test page");
    expect(result.rawText).toContain("This is a paragraph of text with several words.");
  });

  it("Failure Case 1: Should handle completely empty or missing elements gracefully without crashing", () => {
    // HTML with absolutely nothing we are looking for
    const html = `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div>Just some random div without h1s or images.</div>
        </body>
      </html>
    `;

    const result = extractHtmlData(html);

    expect(result.title).toBe("");
    expect(result.metaDescription).toBeNull();
    expect(result.h1s).toEqual([]);
    expect(result.images).toEqual([]);
    expect(result.rawText.trim()).toBe("Just some random div without h1s or images.");
  });

  it("Failure Case 2: Should prioritize og:description if name='description' is missing", () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:description" content="OpenGraph description fallback.">
        </head>
        <body></body>
      </html>
    `;

    const result = extractHtmlData(html);
    expect(result.metaDescription).toBe("OpenGraph description fallback.");
  });

  it("Failure Case 3: Should strip <script> and <style> tags so they aren't included in the raw text", () => {
    const html = `
      <html>
        <body>
          <p>Real text</p>
          <script>const malicious = "do not count these words";</script>
          <style>body { background: red; }</style>
        </body>
      </html>
    `;

    const result = extractHtmlData(html);
    
    // The raw text should ONLY contain "Real text", not the JS or CSS.
    expect(result.rawText.trim()).toBe("Real text");
    expect(result.rawText).not.toContain("malicious");
    expect(result.rawText).not.toContain("background: red");
  });

});
