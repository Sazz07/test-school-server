import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { User } from '../user/user.model';
import {
  TLogin,
  TJwtPayload,
  TRegister,
  TChangePassword,
} from './auth.interface';
import AppError from '../../errors/AppError';
import { USER_ROLE } from '../user/user.constant';
import { createToken, verifyToken } from './auth.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import { validateAuthenticatedUser } from '../../helpers/validateAuthenticatedUser';

const userRegister = async (payload: TRegister) => {
  const isUserExist = await User.isUserExist(payload.email);

  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const user = await User.create({ ...payload, role: USER_ROLE.USER });
  const JwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    JwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string,
  );

  const refreshToken = createToken(
    JwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string,
  );

  return { accessToken, refreshToken };
};

// In the userLogin function
const userLogin = async (payload: TLogin) => {
  // Check if user exists with email
  const user = await User.isUserExist(payload.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user is deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User has been deleted');
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  // Check if password is correct
  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: JwtPayload | undefined,
  payload: TChangePassword,
) => {
  const authenticatedUser = validateAuthenticatedUser(userData);

  const user = await User.isUserExist(authenticatedUser.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload.oldPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password not matched');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findByIdAndUpdate(user._id, {
    password: hashedNewPassword,
    passwordChangedAt: new Date(),
  });

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt.refresh_secret as string);

  const { userId, email, role } = decoded;

  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTissuedBeforePasswordChange(
      user.passwordChangedAt,
      decoded.iat as number,
    )
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Password changed after token issue',
    );
  }

  const JwtPayload: TJwtPayload = {
    userId,
    email,
    role,
  };

  const accessToken = createToken(
    JwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string,
  );

  return { accessToken };
};

const forgetPassword = async (email: string) => {
  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const JwtPayload: TJwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const resetToken = createToken(
    JwtPayload,
    config.jwt.access_secret as string,
    '10m',
  );
  const resetUILink = `${config.reset_pass_ui_link}?id=${user._id}&token=${resetToken} `;

  return { resetUILink };
};

const resetPassword = async (
  payload: {
    email: string;
    newPassword: string;
  },
  token: string,
) => {
  const user = await User.isUserExist(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const decoded = verifyToken(
    token,
    config.jwt.access_secret as string,
  ) as TJwtPayload;

  if (decoded.email !== payload.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findByIdAndUpdate(decoded.userId, {
    password: hashedNewPassword,
    passwordChangedAt: new Date(),
  });
};

export const AuthService = {
  userRegister,
  userLogin,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
