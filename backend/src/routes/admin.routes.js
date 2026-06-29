import { Router } from 'express';
import * as adminController from "../controllers/admin.controller.js"
import authenticate from '../middlewares/authenticate.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import validate from "../middlewares/validate.middleware.js"
import {createDoctorValidator,updateDoctorValidator,doctorIdValidator} from "../validators/doctor.validator.js"
import ROLES from '../constants/roles.js';

const router = Router();

router.post( '/', authenticate, authorize(ROLES.ADMIN), createDoctorValidator, validate, adminController.createDoctor);

router.get('/',authenticate,authorize(ROLES.ADMIN),adminController.getDoctors);

router.get( '/:id',authenticate,authorize(ROLES.ADMIN, ROLES.DOCTOR),doctorIdValidator, validate, adminController.getDoctorById);

router.put( '/:id', authenticate, authorize(ROLES.ADMIN), updateDoctorValidator, validate, adminController.updateDoctor);

router.delete( '/:id', authenticate, authorize(ROLES.ADMIN), doctorIdValidator, validate, adminController.deleteDoctor);

export default router;
