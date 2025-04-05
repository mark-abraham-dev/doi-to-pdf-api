import serverless from "serverless-http";
import app from "./app";
import { logger } from "./utils/logger";

// Configure serverless handler
const handler = serverless(app);

// Export the handler for AWS Lambda
export { handler };

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
    logger.info(`Paper endpoint: http://localhost:${PORT}/api/paper?doi={DOI}`);
    logger.info(
      `Metadata endpoint: http://localhost:${PORT}/api/paper/metadata?doi={DOI}`
    );
    logger.info(`Test endpoint: http://localhost:${PORT}/api/paper/test`);
  });
}
