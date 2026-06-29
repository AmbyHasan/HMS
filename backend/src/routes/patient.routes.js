import { Router } from 'express';
import * as patientController from "../controllers/patient.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import ROLES from '../constants/roles.js';
import {createPatientValidator, updatePatientValidator, patientIdValidator} from "../validators/patient.validator.js";
const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  createPatientValidator,
  validate,
  patientController.registerPatient
);

router.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  patientController.getPatients
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  patientIdValidator,
  validate,
  patientController.getPatientById
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  updatePatientValidator,
  validate,
  patientController.updatePatient
);

export default router;
