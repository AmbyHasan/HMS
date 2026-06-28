
import {body , query , param} from "express-validator";
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createAvailabilityValidator = [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  body('dayOfWeek')
    .notEmpty().withMessage('Day of week is required.')
    .custom((val) => DAYS_OF_WEEK.includes(val.toLowerCase()))
    .withMessage('Day of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday.'),
  body('startTime')
    .notEmpty().withMessage('Start time is required.')
    .matches(TIME_REGEX).withMessage('Start time must be in HH:MM format.'),
  body('endTime')
    .notEmpty().withMessage('End time is required.')
    .matches(TIME_REGEX).withMessage('End time must be in HH:MM format.')
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime <= req.body.startTime) {
        throw new Error('End time must be later than start time.');
      }
      return true;
    }),
  body('slotDuration')
    .notEmpty().withMessage('Slot duration is required.')
    .isInt({ gt: 0 }).withMessage('Slot duration must be a positive integer.'),
];

const updateAvailabilityValidator = [
  param('id').isUUID().withMessage('Invalid availability ID.'),
  body('startTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Start time must be in HH:MM format.'),
  body('endTime')
    .optional()
    .matches(TIME_REGEX).withMessage('End time must be in HH:MM format.')
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime && endTime <= req.body.startTime) {
        throw new Error('End time must be later than start time.');
      }
      return true;
    }),
  body('slotDuration')
    .optional()
    .isInt({ gt: 0 }).withMessage('Slot duration must be a positive integer.'),
];

const availabilityIdValidator = [
  param('id').isUUID().withMessage('Invalid availability ID.'),
];

const availableSlotsValidator = [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  query('date')
    .notEmpty().withMessage('Date is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),
];

export {
  createAvailabilityValidator,
  updateAvailabilityValidator,
  availabilityIdValidator,
  availableSlotsValidator,
};
