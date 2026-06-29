import { Router } from 'express';
import * as appointmentController from "../controllers/appointment.controller.js";
import authenticate from "../middlewares/authenticate.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {bookAppointmentValidator,
  rescheduleAppointmentValidator,
  appointmentIdValidator,
  appointmentNotesValidator,
  appointmentListValidator,
  scheduleValidator} from "../validators/appointment.validator.js";
import ROLES from '../constants/roles.js';


const router = Router();


router.get(
  '/today',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  appointmentController.getTodayAppointments
);

router.get(
  '/schedule',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCTOR),
  scheduleValidator,
  validate,
  appointmentController.getDoctorSchedule
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  bookAppointmentValidator,
  validate,
  appointmentController.bookAppointment
);

router.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  appointmentListValidator,
  validate,
  appointmentController.getAppointments
);

router.put(
  '/:id/reschedule',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  rescheduleAppointmentValidator,
  validate,
  appointmentController.rescheduleAppointment
);

router.put(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  appointmentIdValidator,
  validate,
  appointmentController.cancelAppointment
);

router.put(
  '/:id/notes',
  authenticate,
  authorize(ROLES.DOCTOR),
  appointmentNotesValidator,
  validate,
  appointmentController.addConsultationNotes
);

router.put(
  '/:id/complete',
  authenticate,
  authorize(ROLES.DOCTOR),
  appointmentIdValidator,
  validate,
  appointmentController.completeAppointment
);

export default router;
