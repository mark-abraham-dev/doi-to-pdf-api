import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10", 10),
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after some time"
  },
  standardHeaders: true,
  legacyHeaders: false
});
