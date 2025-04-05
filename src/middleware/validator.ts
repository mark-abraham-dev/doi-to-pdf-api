import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler";

export const validateDoi = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const doi = req.query.doi as string;

  if (!doi) {
    next(new AppError("DOI query parameter is required", 400));
    return;
  }

  // Basic DOI format validation
  // DOIs typically follow the pattern 10.XXXX/XXXXX
  const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;

  if (!doiRegex.test(doi)) {
    next(new AppError("Invalid DOI format", 400));
    return;
  }

  next();
};
