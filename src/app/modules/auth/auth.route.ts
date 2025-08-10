import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidation),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidation),
  AuthController.userLogin,
);

router.post('/logout', AuthController.userLogout);

router.post(
  '/change-password',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPERVISOR),

  validateRequest(AuthValidation.changePasswordValidation),
  AuthController.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidation),
  AuthController.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidation),
  AuthController.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidation),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
