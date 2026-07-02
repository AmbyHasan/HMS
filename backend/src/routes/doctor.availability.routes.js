import { Router } from 'express';
import * as availabilityController from "../controllers/doctor.availability.controller.js";
import authorize from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createAvailabilityValidator , updateAvailabilityValidator , availabilityIdValidator , availableSlotsValidator } from '../validators/availability.validator.js';
import ROLES from "../constants/roles.js";
import authenticate from '../middlewares/authenticate.middleware.js';

const router = Router();


router.post(
  '/doctors/:id/availability',
  authenticate,
  authorize(ROLES.ADMIN ,ROLES.RECEPTIONIST),
  createAvailabilityValidator,
  validate,
  availabilityController.createAvailability
);

router.get(
  '/doctors/:id/availability',
  authenticate,
  authorize(ROLES.ADMIN , ROLES.RECEPTIONIST),
  availabilityController.getDoctorAvailability
);

router.get(
  '/doctors/:id/available-slots',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  availableSlotsValidator,
  validate,
  availabilityController.getAvailableSlots
);

//here we will put the availability id
router.put(
  '/doctors/availability/:id',
  authenticate,
  authorize(ROLES.ADMIN ,ROLES.RECEPTIONIST),
  updateAvailabilityValidator,
  validate,
  availabilityController.updateAvailability
);

router.delete(
  '/availability/:id',
  authenticate,
  authorize(ROLES.ADMIN ,ROLES.RECEPTIONIST),
  availabilityIdValidator,
  validate,
  availabilityController.deleteAvailability
);

export default router;
