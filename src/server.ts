import express from "express";
import type { Request, Response } from "express";

const app = express();

// These are injected at build time by CI (Phase 3).
// Locally they are not set, so we fall back to "dev".
const VERSION = process.env.APP_VERSION ?? "dev";
const COMMIT = process.env.GIT_COMMIT ?? "unknown";

// The ALB will call this endpoint to decide if the task is healthy.
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Proves which image is actually running. We use this in Phase 5
// to see the rollback happen.
app.get("/version", (_req: Request, res: Response) => {
  res.status(200).json({ version: VERSION, commit: COMMIT });
});

// Bind to 0.0.0.0, not 127.0.0.1. Inside a container, 127.0.0.1 only
// accepts traffic from the container itself, so the ALB health check
// would never reach us.
const PORT = Number(process.env.PORT ?? 3000);
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT} version=${VERSION} commit=${COMMIT}`);
});

// ECS sends SIGTERM first, then SIGKILL after a timeout. Closing the
// server here lets in-flight requests finish during a deploy.
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => process.exit(0));
});
