import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import pdfParse from "pdf-parse";
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";
import { logger } from "../utils/logger";

export interface PdfTextContent {
  text: string;
  numPages: number;
  title?: string;
  author?: string;
  structuredContent?: {
    pages: {
      pageNumber: number;
      text: string;
    }[];
  };
}

export class PdfTextExtractor {
  private pdfExtract: PDFExtract;

  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  /**
   * Extract text from a PDF buffer using pdf-parse (faster but simpler extraction)
   */
  async extractText(pdfBuffer: Buffer): Promise<PdfTextContent> {
    try {
      logger.info(`Extracting text from PDF of ${pdfBuffer.length} bytes`);

      // Use pdf-parse for basic text extraction
      const data = await pdfParse(pdfBuffer);

      return {
        text: data.text,
        numPages: data.numpages,
        title: data.info?.Title || undefined,
        author: data.info?.Author || undefined
      };
    } catch (error) {
      logger.error(`Error extracting text from PDF: ${error}`);
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }

  /**
   * Extract detailed structured content from a PDF buffer
   * This method is more detailed but slower than extractText
   */
  async extractStructuredContent(pdfBuffer: Buffer): Promise<PdfTextContent> {
    try {
      logger.info(
        `Extracting structured content from PDF of ${pdfBuffer.length} bytes`
      );

      // First save the buffer to a temporary file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `pdf-${Date.now()}.pdf`);

      await fs.promises.writeFile(tempFilePath, pdfBuffer);

      // Extract the PDF content
      const options: PDFExtractOptions = {
        firstPage: 1,
        lastPage: undefined, // Extract all pages
        password: "" // In case the PDF is password protected
      };

      const data = await this.pdfExtract.extract(tempFilePath, options);

      // Clean up the temporary file
      await fs.promises.unlink(tempFilePath);

      // Process and structure the content
      const pages = data.pages.map((page, index) => {
        return {
          pageNumber: index + 1,
          text: page.content.map((item) => item.str).join(" ")
        };
      });

      // Also create a simple text version for backwards compatibility
      const fullText = pages.map((page) => page.text).join("\n\n");

      return {
        text: fullText,
        numPages: data.pages.length,
        structuredContent: {
          pages
        }
      };
    } catch (error) {
      logger.error(`Error extracting structured content from PDF: ${error}`);
      throw new Error(
        `Failed to extract structured content from PDF: ${error}`
      );
    }
  }
}
