
import {body , param} from "express-validator";

const createDoctorValidator = [
  body('fullName')
    .notEmpty().withMessage('Full name is required.')
    .isString().withMessage('Full name must be a string.')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters.'),
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('specialization')
    .notEmpty().withMessage('Specialization is required.')
    .isString().withMessage('Specialization must be a string.'),
  body('mobile')
    .notEmpty().withMessage('Mobile number is required.')
    .isMobilePhone().withMessage('Must be a valid mobile number.'),
  body('consultationFee')
    .notEmpty().withMessage('Consultation fee is required.')
    .isFloat({ gt: 0 }).withMessage('Consultation fee must be a positive number.'),
];

const updateDoctorValidator = [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  body('fullName')
    .optional()
    .isString().withMessage('Full name must be a string.')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters.'),
  body('specialization')
    .optional()
    .isString().withMessage('Specialization must be a string.')
    .notEmpty().withMessage('Specialization cannot be empty.'),
  body('mobile')
    .optional()
    .isMobilePhone().withMessage('Must be a valid mobile number.'),
  body('consultationFee')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Consultation fee must be a positive number.'),
];

const doctorIdValidator = [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
];

export { createDoctorValidator, updateDoctorValidator, doctorIdValidator };
