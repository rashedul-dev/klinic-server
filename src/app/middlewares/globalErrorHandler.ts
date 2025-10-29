import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let errorDetails = err;

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;

    const errorMappings = {
      P2000: { message: "The provided value is too long for the field.", status: httpStatus.BAD_REQUEST },
      P2001: {
        message: "The record searched for in the where condition does not exist.",
        status: httpStatus.NOT_FOUND,
      },
      P2002: { message: "Duplicate field value.", status: httpStatus.CONFLICT },
      P2003: { message: "Foreign key constraint failed.", status: httpStatus.BAD_REQUEST },
      P2004: { message: "A constraint failed on the database.", status: httpStatus.BAD_REQUEST },
      P2005: { message: "Invalid value for field type.", status: httpStatus.BAD_REQUEST },
      P2006: { message: "Invalid value provided.", status: httpStatus.BAD_REQUEST },
      P2007: { message: "Data validation error.", status: httpStatus.BAD_REQUEST },
      P2008: { message: "Failed to parse the query.", status: httpStatus.BAD_REQUEST },
      P2009: { message: "Failed to validate the query.", status: httpStatus.BAD_REQUEST },
      P2010: { message: "Raw query failed.", status: httpStatus.BAD_REQUEST },
      P2011: { message: "Null constraint violation.", status: httpStatus.BAD_REQUEST },
      P2012: { message: "Missing a required value.", status: httpStatus.BAD_REQUEST },
      P2013: { message: "Missing a required argument.", status: httpStatus.BAD_REQUEST },
      P2014: {
        message: "The change you are trying to make would violate a required relation.",
        status: httpStatus.BAD_REQUEST,
      },
      P2015: { message: "A related record could not be found.", status: httpStatus.NOT_FOUND },
      P2016: { message: "Query interpretation error.", status: httpStatus.BAD_REQUEST },
      P2017: { message: "The records for relation are not connected.", status: httpStatus.BAD_REQUEST },
      P2018: { message: "The required connected records were not found.", status: httpStatus.NOT_FOUND },
      P2019: { message: "Input error.", status: httpStatus.BAD_REQUEST },
      P2020: { message: "Value out of range for the type.", status: httpStatus.BAD_REQUEST },
      P2021: { message: "The table does not exist in the current database.", status: httpStatus.BAD_REQUEST },
      P2022: { message: "The column does not exist in the current database.", status: httpStatus.BAD_REQUEST },
      P2023: { message: "Inconsistent column data.", status: httpStatus.BAD_REQUEST },
      P2024: { message: "Timed out while fetching results from the database.", status: httpStatus.REQUEST_TIMEOUT },
      P2025: { message: "Record not found.", status: httpStatus.NOT_FOUND },
      P2026: { message: "The current database provider doesn't support a feature.", status: httpStatus.BAD_REQUEST },
      P2027: { message: "Multiple errors occurred on the database.", status: httpStatus.BAD_REQUEST },
    };

    const errorConfig = errorMappings[err.code as keyof typeof errorMappings] || {
      message: "Unknown database error",
      status: httpStatus.BAD_REQUEST,
    };

    message = errorConfig.message;
    statusCode = errorConfig.status;
    errorDetails = {
      code: err.code,
      meta: err.meta,
      target: (err.meta as any)?.target,
    };
  }
  // Prisma Validation Error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid query parameters or database schema mismatch";
    errorDetails = { message: "Check your query parameters and database schema" };
  }
  // Prisma Initialization Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Database connection failed";
    errorDetails = { message: "Unable to connect to the database" };
  }
  // Prisma Unknown Request Error
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Unknown database error occurred";
    errorDetails = { message: "An unexpected database error occurred" };
  }
  // Prisma Rust Panic Error
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Database engine crashed";
    errorDetails = { message: "The database engine encountered a fatal error" };
  }
  // Handle other common error types
  else if (err instanceof SyntaxError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid JSON in request body";
  } else if (err instanceof TypeError) {
    message = "Type error occurred";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token expired";
  }

  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      meta: err.meta,
    });
  }

  // Final response
  res.status(statusCode).json({
    success,
    message,
    error: errorDetails,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default globalErrorHandler;
