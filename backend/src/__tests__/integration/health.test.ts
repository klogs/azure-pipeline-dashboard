process.env.NODE_ENV = "test";
import request from "supertest";
import app from "../../index";

describe("GET /api/health", () => {
  it("200 döndürür ve status:ok içerir", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });
});
