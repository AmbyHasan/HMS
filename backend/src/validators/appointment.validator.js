
import {body , query , param} from "express-validator"

//body validates the data sent in the req body
const bookAppointmentValidator = [
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required.')
    .isUUID().withMessage('Doctor ID must be a valid UUID.'),
  body('patientId')
    .notEmpty().withMessage('Patient ID is required.')
    .isUUID().withMessage('Patient ID must be a valid UUID.'),
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Appointment date must be in YYYY-MM-DD format.'),
  body('timeSlotId')
    .notEmpty().withMessage('Time slot ID is required.')
    .isUUID().withMessage('Time slot ID must be a valid UUID.'),
];

//param validates the data sent as url parameters
const rescheduleAppointmentValidator = [
  param('id').isUUID().withMessage('Invalid appointment ID.'),
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Appointment date must be in YYYY-MM-DD format.'),
  body('timeSlotId')
    .notEmpty().withMessage('Time slot ID is required.')
    .isUUID().withMessage('Time slot ID must be a valid UUID.'),
];

const appointmentIdValidator = [
  param('id').isUUID().withMessage('Invalid appointment ID.'),
];

const appointmentNotesValidator = [
  param('id').isUUID().withMessage('Invalid appointment ID.'),
  body('consultationNotes')
    .notEmpty().withMessage('Consultation notes are required.')
    .isString().withMessage('Consultation notes must be a string.'),
];

//query validates the data sent in query strings
const appointmentListValidator = [
  query('doctorId').optional().isUUID().withMessage('Doctor ID must be a valid UUID.'),
  query('patientId').optional().isUUID().withMessage('Patient ID must be a valid UUID.'),
  query('status').optional().isIn(['booked', 'completed', 'cancelled']).withMessage('Status must be booked, completed, or cancelled.'),
  query('date').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),
];

const scheduleValidator = [
  query('doctorId').optional().isUUID().withMessage('Doctor ID must be a valid UUID.'),
  query('date').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),
];

export {
  bookAppointmentValidator,
  rescheduleAppointmentValidator,
  appointmentIdValidator,
  appointmentNotesValidator,
  appointmentListValidator,
  scheduleValidator,
};
