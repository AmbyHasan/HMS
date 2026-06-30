import { Router } from 'express';
import * as dashboardController from "../controllers/dashboard.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import ROLES from '../constants/roles.js';

const router = Router();

router.get(
  '/admin',
  authenticate,
  authorize(ROLES.ADMIN),
  dashboardController.getAdminDashboard
);

router.get(
  '/receptionist',
  authenticate,
  authorize(ROLES.RECEPTIONIST),
  dashboardController.getReceptionistDashboard
);

router.get(
  '/doctor',
  authenticate,
  authorize(ROLES.DOCTOR),
  dashboardController.getDoctorDashboard
);

export default router;
