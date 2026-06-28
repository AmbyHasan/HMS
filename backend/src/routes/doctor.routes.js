import { Router } from 'express';
import * as doctorController from "../controllers/doctor.controller.js";
import authenticate from '../middlewares/authenticate.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import validate from "../middlewares/validate.middleware.js"
import {createDoctorValidator,updateDoctorValidator,doctorIdValidator} from "../validators/doctor.validator.js"
import ROLES from '../constants/roles.js';

const router = Router();

router.post( '/', authenticate, authorize(ROLES.ADMIN), createDoctorValidator, validate, doctorController.createDoctor);

router.get('/',authenticate,authorize(ROLES.ADMIN),doctorController.getDoctors);

router.get( '/:id',authenticate,authorize(ROLES.ADMIN, ROLES.DOCTOR),doctorIdValidator, validate, doctorController.getDoctorById);

router.put( '/:id', authenticate, authorize(ROLES.ADMIN), updateDoctorValidator, validate, doctorController.updateDoctor);

router.delete( '/:id', authenticate, authorize(ROLES.ADMIN), doctorIdValidator, validate, doctorController.deleteDoctor);

export default router;
