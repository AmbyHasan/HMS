import { Router } from 'express';
import * as availabilityController from "../controllers/availability.controller.js";
import authorize from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createAvailabilityValidator , updateAvailabilityValidator , availabilityIdValidator , availableSlotsValidator } from '../validators/availability.validator.js';
import ROLES from "../constants/roles.js";
import authenticate from '../middlewares/authenticate.middleware.js';

const router = Router();


router.post(
  '/doctors/:id/availability',
  authenticate,
  authorize(ROLES.ADMIN),
  createAvailabilityValidator,
  validate,
  availabilityController.createAvailability
);

router.get(
  '/doctors/:id/availability',
  authenticate,
  authorize(ROLES.ADMIN),
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

// standalone availability resource routes
router.put(
  '/availability/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  updateAvailabilityValidator,
  validate,
  availabilityController.updateAvailability
);

router.delete(
  '/availability/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  availabilityIdValidator,
  validate,
  availabilityController.deleteAvailability
);

export default router;
