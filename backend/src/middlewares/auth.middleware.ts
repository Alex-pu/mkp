import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config';
import { sendError } from '../utils/apiResponse';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, config.jwtSecret) as any;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return sendError(res, 'Token expired', 401, 'Token expired');
      }

      if (error instanceof JsonWebTokenError) {
        return sendError(res, 'Invalid token', 401, 'Invalid token');
      }

      return next(error);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Session invalid', 401, 'Session invalid');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};