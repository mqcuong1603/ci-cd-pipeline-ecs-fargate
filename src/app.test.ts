import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app";

describe("app", () => {
  const app = createApp();

  it("GET /healthz returns 200 and status ok", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /version returns version and commit fields", async () => {
    const res = await request(app).get("/version");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("commit");
  });
});
