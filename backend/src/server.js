import app from "./app.js";
import config from "./config/config.js";

const server = app.listen(config.port, () => {
  console.log(`
========================================
Page Pulse API Started

Environment : ${config.nodeEnv}
Port        : ${config.port}

========================================
`);
});

const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down...`);

  server.close(() => {
    console.log("HTTP server closed.");

    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));