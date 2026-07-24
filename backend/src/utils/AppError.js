export class AppError extends Error {
  constructor(errorCode, statusCode, message) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
