import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';

const router = express.Router();

// User routes (accessible by both user and admin)
router.get(
  '/my-profile',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPERVISOR),

  UserController.getMyProfile,
);

router.patch(
  '/my-profile',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPERVISOR),

  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateMyProfile,
);

export const UserRoutes = router;
