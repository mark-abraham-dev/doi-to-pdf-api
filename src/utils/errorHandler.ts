import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`${req.method} ${req.path} -> ${error.message}`, {
    stack: err.stack,
    errorDetails: err
  });

  // Return friendly error
  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.isOperational ? error.message : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export { AppError };
