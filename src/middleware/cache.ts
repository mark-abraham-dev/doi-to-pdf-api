import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import config from "../config";
import { logger } from "../utils/logger";

// Configure cache
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || "86400", 10), // Default to 24 hours
  checkperiod: 120 // Check for expired keys every 2 minutes
});

export const cacheMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!config.cache.enabled) {
    next();
    return;
  }

  // Use the query parameters in the cache key
  const key = `${req.method}-${req.path}-${JSON.stringify(req.query)}`;
  const cachedResponse = cache.get<Buffer | object>(key);

  if (cachedResponse) {
    logger.info(`Cache hit for ${key}`);

    // If it's a PDF, we need to set the correct headers
    if (req.path === "/" && req.query.doi) {
      const doi = req.query.doi as string;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${doi.replace(/[\/\\:*?"<>|]/g, "_")}.pdf"`
      );
      res.setHeader("X-Cache", "HIT");
    }

    res.send(cachedResponse);
    return;
  }

  logger.info(`Cache miss for ${key}`);

  // Store the original send function
  const originalSend = res.send;

  // Override the send function to cache the response
  res.send = function (body): Response {
    // Don't cache error responses
    if (res.statusCode < 400) {
      cache.set(key, body);
      logger.info(`Cached response for ${key}`);
    }

    // Call the original send function
    return originalSend.call(this, body);
  };

  next();
};

// Export cache for testing and management
export { cache };
