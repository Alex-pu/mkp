import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

interface AuthRequest extends Request {
  user?: any;
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return sendError(res, 'Admin access required', 403);
  }
  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return sendError(res, 'Super admin access required', 403);
  }
  next();
};