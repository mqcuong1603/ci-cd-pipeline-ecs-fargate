import { createApp, VERSION, COMMIT } from "./app";

// Bind to 0.0.0.0, not 127.0.0.1. Inside a container, 127.0.0.1 only
// accepts traffic from the container itself, so the ALB health check
// would never reach us.
const PORT = Number(process.env.PORT ?? 3000);
const server = createApp().listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT} version=${VERSION} commit=${COMMIT}`);
});

// ECS sends SIGTERM first, then SIGKILL after a timeout. Closing the
// server here lets in-flight requests finish during a deploy.
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => process.exit(0));
});
