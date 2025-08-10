import { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

// Helper function to validate authenticated user
export const validateAuthenticatedUser = (userData: JwtPayload | undefined) => {
  if (!userData) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }
  return userData;
};
