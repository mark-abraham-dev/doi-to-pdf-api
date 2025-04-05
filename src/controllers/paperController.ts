import { Router, Request, Response, NextFunction } from "express";
import { validateDoi } from "../middleware/validator";
import { cacheMiddleware } from "../middleware/cache";
import { PaperService } from "../services/paperService";
import { logger } from "../utils/logger";

export const paperRouter = Router();
const paperService = new PaperService();

// GET /api/paper?doi=10.1145/3025453.3025501
paperRouter.get(
  "/",
  validateDoi,
  cacheMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doi = req.query.doi as string;
      logger.info(`Processing request for DOI: ${doi}`);

      const pdfData = await paperService.getPaperByDoi(doi);

      if (!pdfData) {
        res.status(404).json({ error: "Paper not found" });
        return;
      }

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${doi.replace(/[\/\\:*?"<>|]/g, "_")}.pdf"`
      );

      res.send(pdfData);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/paper/text?doi=10.1145/3025453.3025501
paperRouter.get(
  "/text",
  validateDoi,
  cacheMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doi = req.query.doi as string;
      logger.info(`Processing text extraction request for DOI: ${doi}`);

      const textContent = await paperService.getPaperText(doi);

      if (!textContent) {
        res.status(404).json({ error: "Failed to extract text from paper" });
        return;
      }

      res.json(textContent);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/paper/content?doi=10.1145/3025453.3025501
paperRouter.get(
  "/content",
  validateDoi,
  cacheMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doi = req.query.doi as string;
      logger.info(
        `Processing structured content extraction request for DOI: ${doi}`
      );

      const structuredContent = await paperService.getPaperStructuredContent(
        doi
      );

      if (!structuredContent) {
        res
          .status(404)
          .json({ error: "Failed to extract structured content from paper" });
        return;
      }

      res.json(structuredContent);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/paper/metadata?doi=10.1145/3025453.3025501
paperRouter.get(
  "/metadata",
  validateDoi,
  cacheMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doi = req.query.doi as string;
      const metadata = await paperService.getPaperMetadata(doi);

      if (!metadata) {
        res.status(404).json({ error: "Paper metadata not found" });
        return;
      }

      res.json(metadata);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/paper/complete?doi=10.1145/3025453.3025501
// Returns both metadata and text content in one request
paperRouter.get(
  "/complete",
  validateDoi,
  cacheMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doi = req.query.doi as string;
      logger.info(`Processing complete paper info request for DOI: ${doi}`);

      // Get both metadata and text content in parallel
      const [metadata, textContent] = await Promise.all([
        paperService.getPaperMetadata(doi),
        paperService.getPaperText(doi)
      ]);

      if (!metadata && !textContent) {
        res.status(404).json({ error: "Paper not found" });
        return;
      }

      res.json({
        metadata: metadata || { error: "Metadata not available" },
        content: textContent || { error: "Text content not available" }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Test endpoint
paperRouter.get("/test", (req, res) => {
  res.json({
    message: "Paper router is working",
    usage: {
      pdf: "/api/paper?doi=10.1145/3025453.3025501",
      text: "/api/paper/text?doi=10.1145/3025453.3025501",
      structured: "/api/paper/content?doi=10.1145/3025453.3025501",
      metadata: "/api/paper/metadata?doi=10.1145/3025453.3025501",
      complete: "/api/paper/complete?doi=10.1145/3025453.3025501"
    }
  });
});

// Test endpoint with examples
paperRouter.get("/test", (req, res) => {
  res.json({
    message: "DOI-to-PDF API is running successfully",
    version: "1.0.0",
    endpoints: {
      pdf: {
        description: "Get the PDF document for a DOI",
        url: "/api/paper?doi=10.1145/3025453.3025501",
        method: "GET",
        contentType: "application/pdf"
      },
      text: {
        description: "Extract plain text from the PDF",
        url: "/api/paper/text?doi=10.1145/3025453.3025501",
        method: "GET",
        contentType: "application/json"
      },
      structured: {
        description: "Extract structured content with page information",
        url: "/api/paper/content?doi=10.1145/3025453.3025501",
        method: "GET",
        contentType: "application/json"
      },
      metadata: {
        description: "Get paper metadata (title, authors, etc.)",
        url: "/api/paper/metadata?doi=10.1145/3025453.3025501",
        method: "GET",
        contentType: "application/json"
      },
      complete: {
        description: "Get both metadata and text content in one request",
        url: "/api/paper/complete?doi=10.1145/3025453.3025501",
        method: "GET",
        contentType: "application/json"
      }
    },
    exampleDOIs: [
      "10.1145/3025453.3025501",
      "10.1038/s41586-019-1724-z",
      "10.1371/journal.pone.0115069"
    ],
    testCommand:
      'curl "http://localhost:3000/api/paper/text?doi=10.1145/3025453.3025501"'
  });
});
