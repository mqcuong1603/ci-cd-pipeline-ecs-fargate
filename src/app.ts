import express from "express";
import type { Request, Response } from "express";

// These are injected at build time by CI (Phase 3).
// Locally they are not set, so we fall back to "dev".
export const VERSION = process.env.APP_VERSION ?? "dev";
export const COMMIT = process.env.GIT_COMMIT ?? "unknown";

// The app is built here but NOT started. server.ts starts it.
// Tests import this function so they can call routes without a real port.
export function createApp() {
  const app = express();

  // The ALB calls this endpoint to decide if the task is healthy.
  //
  // FAIL_HEALTHCHECK is a kill switch for Phase 5. When it is "true",
  // the process keeps running but /healthz answers 500, so the ALB marks
  // the task unhealthy and ECS stops it. It is read on every request,
  // not at startup, so tests can flip it without rebuilding the app.
  app.get("/healthz", (_req: Request, res: Response) => {
    if (process.env.FAIL_HEALTHCHECK === "true") {
      res.status(500).json({ status: "failing" });
      return;
    }
    res.status(200).json({ status: "ok" });
  });

  // Proves which image is actually running. Used in Phase 5
  // to watch the rollback happen.
  app.get("/version", (_req: Request, res: Response) => {
    res.status(200).json({ version: VERSION, commit: COMMIT });
  });

  return app;
}
