import axios from "axios";
import { logger } from "../utils/logger";
import { Paper } from "../models/Paper";

export class DoiResolver {
  private readonly BASE_URL = "https://sci-hub.ru/";

  async resolveDoiToUrl(doi: string): Promise<string | null> {
    try {
      const url = `${this.BASE_URL}${doi}`;
      logger.info(`Resolved DOI ${doi} to URL: ${url}`);
      return url;
    } catch (error) {
      logger.error(`Error resolving DOI ${doi}:`, error);
      return null;
    }
  }

  async getMetadata(doi: string): Promise<Paper | null> {
    try {
      // For more accurate metadata, we would typically query CrossRef or another academic API
      const url = `https://api.crossref.org/works/${doi}`;

      try {
        const response = await axios.get(url);

        if (response.status !== 200) {
          logger.warn(
            `Failed to get metadata from CrossRef for DOI ${doi}: ${response.status}`
          );
          return this.createBasicMetadata(doi);
        }

        const data = response.data.message;

        return {
          doi: data.DOI,
          title: data.title?.[0] || "Unknown Title",
          authors:
            data.author?.map((a: any) => `${a.given} ${a.family}`).join(", ") ||
            "Unknown Author",
          publishedDate: data.created?.["date-time"] || null,
          journal: data["container-title"]?.[0] || null,
          abstract: data.abstract || null
        };
      } catch (error) {
        logger.warn(
          `Error getting metadata from CrossRef for DOI ${doi}: ${error}`
        );
        return this.createBasicMetadata(doi);
      }
    } catch (error) {
      logger.error(`Error getting metadata for DOI ${doi}:`, error);
      return null;
    }
  }

  private createBasicMetadata(doi: string): Paper {
    return {
      doi: doi,
      title: "Title not available",
      authors: "Authors not available",
      publishedDate: null,
      journal: null,
      abstract: null
    };
  }
}
