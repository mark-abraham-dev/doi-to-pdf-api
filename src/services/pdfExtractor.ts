import axios from "axios";
import { logger } from "../utils/logger";

export class PdfExtractor {
  async extractPdf(url: string): Promise<Buffer | null> {
    try {
      // Get the HTML page that contains the embedded PDF
      logger.info(`Fetching page from ${url}`);
      const response = await axios.get(url);
      const html = response.data;

      if (!html) {
        logger.error("Received empty HTML response");
        return null;
      }

      // Debug - confirm we have HTML
      logger.info(`Received HTML response of length: ${html.length}`);

      // Use regex to find the PDF URL (embed with id="pdf")
      const pdfEmbedMatch = html.match(
        /<embed[^>]*id\s*=\s*["']pdf["'][^>]*src\s*=\s*["']([^"']+)["'][^>]*>/i
      );

      let pdfUrl = null;

      if (pdfEmbedMatch && pdfEmbedMatch[1]) {
        pdfUrl = pdfEmbedMatch[1];
        logger.info(`Found PDF embed with src: ${pdfUrl}`);
      } else {
        // Try to find download button instead
        const downloadBtnMatch = html.match(
          /button[^>]*onclick\s*=\s*["']location\.href='([^']+\?download=true)'["'][^>]*>/i
        );

        if (downloadBtnMatch && downloadBtnMatch[1]) {
          pdfUrl = downloadBtnMatch[1];
          logger.info(`Found download button with URL: ${pdfUrl}`);
        } else {
          logger.warn(`No PDF URL found in the HTML`);
          return null;
        }
      }

      // Make sure the URL is absolute
      const absolutePdfUrl = pdfUrl.startsWith("http")
        ? pdfUrl
        : `https:${pdfUrl}`;

      // For Sci-Hub, remove any fragment identifiers like #navpanes=0&view=FitH
      const cleanPdfUrl = absolutePdfUrl.split("#")[0];

      // Fetch the actual PDF content
      logger.info(`Fetching PDF from ${cleanPdfUrl}`);
      try {
        const pdfResponse = await axios.get(cleanPdfUrl, {
          responseType: "arraybuffer",
          headers: {
            Referer: url,
            Accept: "application/pdf"
          }
        });

        if (!pdfResponse.data || pdfResponse.data.length === 0) {
          logger.warn(`Received empty PDF from ${cleanPdfUrl}`);
          return null;
        }

        logger.info(
          `Successfully retrieved PDF (${pdfResponse.data.length} bytes)`
        );
        return Buffer.from(pdfResponse.data);
      } catch (pdfError) {
        logger.error(`Failed to download PDF: ${pdfError}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error extracting PDF from ${url}:`, error);
      throw error;
    }
  }
}
