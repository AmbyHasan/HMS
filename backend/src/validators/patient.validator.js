
import {body , param} from "express-validator";

const createPatientValidator = [
  body('fullName')
    .notEmpty().withMessage('Full name is required.')
    .isString().withMessage('Full name must be a string.')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters.'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date of birth must be in YYYY-MM-DD format.')
    .custom((val) => {
      if (new Date(val) >= new Date()) {
        throw new Error('Date of birth must be in the past.');
      }
      return true;
    }),
  body('gender')
    .notEmpty().withMessage('Gender is required.')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be one of: male, female, other.'),
  body('mobile')
    .notEmpty().withMessage('Mobile number is required.')
    .isMobilePhone().withMessage('Must be a valid mobile number.'),
  body('address')
    .optional()
    .isString().withMessage('Address must be a string.'),
];

const updatePatientValidator = [
  param('id').isUUID().withMessage('Invalid patient ID.'),
  body('fullName')
    .optional()
    .isString().withMessage('Full name must be a string.')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters.'),
  body('mobile')
    .optional()
    .isMobilePhone().withMessage('Must be a valid mobile number.'),
  body('address')
    .optional()
    .isString().withMessage('Address must be a string.'),
];

const patientIdValidator = [
  param('id').isUUID().withMessage('Invalid patient ID.'),
];

export { createPatientValidator, updatePatientValidator, patientIdValidator };
