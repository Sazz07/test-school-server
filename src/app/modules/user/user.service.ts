import { User } from './user.model';
import { TUser } from './user.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { validateAuthenticatedUser } from '../../helpers/validateAuthenticatedUser';

const getMyProfile = async (userData: JwtPayload | undefined) => {
  const authenticatedUser = validateAuthenticatedUser(userData);

  const result = await User.findById(authenticatedUser.userId).select(
    '-password',
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const updateMyProfile = async (
  userData: JwtPayload | undefined,
  payload: Partial<TUser>,
) => {
  const authenticatedUser = validateAuthenticatedUser(userData);

  const result = await User.findByIdAndUpdate(
    authenticatedUser.userId,
    payload,
    {
      new: true,
      runValidators: true,
    },
  ).select('-password');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
};
