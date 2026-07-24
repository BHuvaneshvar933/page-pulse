import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzePage } from "../../src/services/analyzer.service.js";

global.fetch = vi.fn();

describe("Analyzer Service (Business Logic)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should measure response time and return correct metrics", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
      text: async () => "<html><title>Test</title><body>Word</body></html>"
    });

    const result = await analyzePage("https://fast-site.com");

    expect(result.url).toBe("https://fast-site.com");
    expect(result.httpStatus).toBe(200);
    expect(result.title).toBe("Test");
    expect(result.wordCount).toBe(1);
    expect(typeof result.responseTimeMs).toBe("number");
  });

  it("Should throw REQUEST_TIMEOUT if fetch aborts", async () => {
    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    global.fetch.mockRejectedValueOnce(abortError);

    await expect(analyzePage("https://slow-site.com")).rejects.toThrow(/too long/i);
    await expect(analyzePage("https://slow-site.com")).rejects.toHaveProperty("errorCode", "REQUEST_TIMEOUT");
  });

  it("Should map ECONNREFUSED to DOMAIN_NOT_FOUND", async () => {
    const connError = new Error("connect ECONNREFUSED");
    connError.code = "ECONNREFUSED";
    global.fetch.mockRejectedValueOnce(connError);

    await expect(analyzePage("https://refused.com")).rejects.toHaveProperty("errorCode", "DOMAIN_NOT_FOUND");
  });

  it("Should throw AppError with 404 for missing pages", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(analyzePage("https://example.com/notfound")).rejects.toThrow(/404/);
    await expect(analyzePage("https://example.com/notfound")).rejects.toHaveProperty("statusCode", 404);
  });
});
