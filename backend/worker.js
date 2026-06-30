import dotenv from "dotenv";
import logger from "./src/utils/logger.js";
import * as notificationWorker from "./src/workers/notification.worker.js";

dotenv.config();

//THIS FILE IS RESPONSIBLE FOR STARTING THE NOTIFICATION WORKER
logger.info("HMS Notification Worker starting...");

notificationWorker.start();  //starts the notification server.

process.on("SIGTERM", async () => {  //manual interruption
  logger.info("SIGTERM received. Shutting down worker gracefully...");
  await notificationWorker.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {  //interuption by some other process
  logger.info("SIGINT received. Shutting down worker gracefully...");
  await notificationWorker.stop();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception in worker:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection in worker:", reason);
  process.exit(1);
});