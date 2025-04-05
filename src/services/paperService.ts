import { DoiResolver } from "./doiResolver";
import { PdfExtractor } from "./pdfExtractor";
import { PdfTextExtractor, PdfTextContent } from "./pdfTextExtractor";
import { logger } from "../utils/logger";
import { Paper } from "../models/Paper";

export class PaperService {
  private doiResolver: DoiResolver;
  private pdfExtractor: PdfExtractor;
  private pdfTextExtractor: PdfTextExtractor;

  constructor() {
    this.doiResolver = new DoiResolver();
    this.pdfExtractor = new PdfExtractor();
    this.pdfTextExtractor = new PdfTextExtractor();
  }

  async getPaperByDoi(doi: string): Promise<Buffer | null> {
    try {
      logger.info(`Processing request for DOI: ${doi}`);
      const pageUrl = await this.doiResolver.resolveDoiToUrl(doi);

      if (!pageUrl) {
        logger.warn(`Could not resolve DOI: ${doi}`);
        return null;
      }

      logger.info(`Extracting PDF from: ${pageUrl}`);
      const pdfBuffer = await this.pdfExtractor.extractPdf(pageUrl);

      if (!pdfBuffer) {
        logger.warn(`Failed to extract PDF for DOI: ${doi}`);
        return null;
      }

      return pdfBuffer;
    } catch (error) {
      logger.error(`Error retrieving paper for DOI ${doi}:`, error);
      throw error;
    }
  }

  async getPaperText(doi: string): Promise<PdfTextContent | null> {
    try {
      logger.info(`Getting text content for DOI: ${doi}`);

      // First, get the PDF buffer
      const pdfBuffer = await this.getPaperByDoi(doi);

      if (!pdfBuffer) {
        logger.warn(`Failed to get PDF for text extraction for DOI: ${doi}`);
        return null;
      }

      // Extract text from the PDF
      logger.info(`Extracting text from PDF for DOI: ${doi}`);
      const textContent = await this.pdfTextExtractor.extractText(pdfBuffer);

      return textContent;
    } catch (error) {
      logger.error(`Error extracting text for DOI ${doi}:`, error);
      throw error;
    }
  }

  async getPaperStructuredContent(doi: string): Promise<PdfTextContent | null> {
    try {
      logger.info(`Getting structured content for DOI: ${doi}`);

      // First, get the PDF buffer
      const pdfBuffer = await this.getPaperByDoi(doi);

      if (!pdfBuffer) {
        logger.warn(
          `Failed to get PDF for structured content extraction for DOI: ${doi}`
        );
        return null;
      }

      // Extract structured content from the PDF
      logger.info(`Extracting structured content from PDF for DOI: ${doi}`);
      const structuredContent =
        await this.pdfTextExtractor.extractStructuredContent(pdfBuffer);

      return structuredContent;
    } catch (error) {
      logger.error(
        `Error extracting structured content for DOI ${doi}:`,
        error
      );
      throw error;
    }
  }

  async getPaperMetadata(doi: string): Promise<Paper | null> {
    try {
      logger.info(`Getting metadata for DOI: ${doi}`);
      return await this.doiResolver.getMetadata(doi);
    } catch (error) {
      logger.error(`Error retrieving metadata for DOI ${doi}:`, error);
      throw error;
    }
  }
}
