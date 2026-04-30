import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const isDatabaseConnectionError = err?.code === 'P1001'
    || err?.name === 'PrismaClientInitializationError'
    || (typeof err?.message === 'string' && err.message.includes("Can't reach database server"));

  if (isDatabaseConnectionError) {
    return sendError(
      res,
      'Database connection failed. Please try again shortly.',
      503,
      'Database connection failed'
    );
  }

  const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 400;
  const message = typeof err?.message === 'string' && err.message.trim().length > 0
    ? err.message
    : 'Internal server error';

  sendError(res, message, statusCode, message);
};