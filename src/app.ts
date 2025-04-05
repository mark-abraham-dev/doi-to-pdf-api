import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { paperRouter } from "./controllers/paperController";
import { errorHandler } from "./utils/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { logger } from "./utils/logger";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use("/api/paper", paperRouter);
logger.info("Registered paper router at /api/paper");

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling
app.use(errorHandler);

export default app;
