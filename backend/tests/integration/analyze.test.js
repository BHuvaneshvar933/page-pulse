import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

// Mock native fetch to avoid real network requests
global.fetch = vi.fn();

describe("POST /api/analyze", () => {
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Happy Path: Should analyze a valid URL successfully using mocked HTML", async () => {
    const mockHtml = `
      <html>
        <head>
          <title>Mocked Title</title>
          <meta name="description" content="Mocked description">
        </head>
        <body>
          <h1>Hello</h1>
          <p>This is a test.</p>
        </body>
      </html>
    `;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => mockHtml
    });

    const response = await request(app)
      .post("/api/analyze")
      .send({ url: "https://mockdomain.com" })
      .expect("Content-Type", /json/)
      .expect(200);

    const { success, data } = response.body;

    expect(success).toBe(true);
    expect(data.url).toBe("https://mockdomain.com");
    expect(data.httpStatus).toBe(200);
    expect(data.title).toBe("Mocked Title");
    expect(data.metaDescription).toBe("Mocked description");
    expect(data.h1Count).toBe(1);
    expect(typeof data.responseTimeMs).toBe("number");
    expect(data.wordCount).toBe(5); // "Hello" + "This" + "is" + "a" + "test."
  });

  it("Failure: Should reject invalid URL formats without calling fetch", async () => {
    const response = await request(app)
      .post("/api/analyze")
      .send({ url: "not-a-valid-url" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_URL");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Failure: Should handle non-existent domains gracefully", async () => {
    const networkError = new Error("getaddrinfo ENOTFOUND");
    networkError.code = "ENOTFOUND";
    global.fetch.mockRejectedValueOnce(networkError);

    const response = await request(app)
      .post("/api/analyze")
      .send({ url: "https://this-domain-definitely-does-not-exist-123.com" })
      .expect(400); 

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("DOMAIN_NOT_FOUND");
  });

  it("Failure: Should handle non-HTML responses", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => "{}"
    });

    const response = await request(app)
      .post("/api/analyze")
      .send({ url: "https://mockdomain.com/api/data" })
      .expect(422); 

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NON_HTML_RESPONSE");
  });

  it("Failure: Should reject missing URL in body", async () => {
    const response = await request(app)
      .post("/api/analyze")
      .send({}) // Empty body
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_URL");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
