export class AppError extends Error {
  constructor(errorCode, statusCode, message) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
