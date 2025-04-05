import pdfParse from "pdf-parse";
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
  /**
   * Extract text from a PDF buffer using pdf-parse
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
   * This method simulates the structured extraction using only pdf-parse
   */
  async extractStructuredContent(pdfBuffer: Buffer): Promise<PdfTextContent> {
    try {
      logger.info(
        `Extracting structured content from PDF of ${pdfBuffer.length} bytes`
      );

      // Use pdf-parse with a custom render callback to get page-level content
      const pageTexts: string[] = [];
      let currentPage = 0;

      const options = {
        // Custom page render function to capture text from each page
        pagerender: (pageData: any) => {
          currentPage++;
          return pageData.getTextContent().then((textContent: any) => {
            // Extract text items and join them
            const texts = textContent.items.map((item: any) => item.str);
            const pageText = texts.join(" ");

            // Store this page's text
            pageTexts.push(pageText);

            // We must return a string to conform to the API
            return pageText;
          });
        }
      };

      // Extract the PDF content
      const data = await pdfParse(pdfBuffer, options);

      // Process and structure the content
      const pages = pageTexts.map((text, index) => {
        return {
          pageNumber: index + 1,
          text: text
        };
      });

      return {
        text: data.text, // The full text from the PDF
        numPages: data.numpages,
        title: data.info?.Title || undefined,
        author: data.info?.Author || undefined,
        structuredContent: {
          pages
        }
      };
    } catch (error) {
      logger.error(`Error extracting structured content from PDF: ${error}`);

      // Fall back to basic extraction if structured content fails
      logger.info("Falling back to basic text extraction");
      try {
        const basicContent = await this.extractText(pdfBuffer);

        // Create a simple structured content with all text in a single page
        return {
          ...basicContent,
          structuredContent: {
            pages: [
              {
                pageNumber: 1,
                text: basicContent.text
              }
            ]
          }
        };
      } catch (fallbackError) {
        // If even the fallback fails, throw the original error
        throw new Error(
          `Failed to extract structured content from PDF: ${error}`
        );
      }
    }
  }

  /**
   * Utility method to split text into pages based on line breaks
   * Used as a fallback when detailed page extraction isn't available
   */
  private splitIntoPages(
    text: string,
    approximatePageSize: number = 3000
  ): string[] {
    // If the text is very small, return it as a single page
    if (text.length < approximatePageSize) {
      return [text];
    }

    const pages: string[] = [];
    const paragraphs = text.split(/\n\s*\n/); // Split by double line breaks
    let currentPage = "";

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed the approximate page size,
      // start a new page (unless the current page is empty)
      if (
        currentPage.length > 0 &&
        currentPage.length + paragraph.length > approximatePageSize
      ) {
        pages.push(currentPage);
        currentPage = paragraph;
      } else {
        // Add to the current page with a separator if needed
        currentPage =
          currentPage.length > 0 ? `${currentPage}\n\n${paragraph}` : paragraph;
      }
    }

    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }
}
