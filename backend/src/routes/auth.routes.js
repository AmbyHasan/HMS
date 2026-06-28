
import { Router } from 'express';
import * as authController from "../controllers/auth.controller.js";
import * as authenticate from "../middlewares/authenticate.middleware.js";
import * as validate from "../middlewares/validate.middleware.js";
import { loginValidator , forgotPasswordValidator } from '../validators/auth.validator';

const router = Router();

router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);

export default router;
