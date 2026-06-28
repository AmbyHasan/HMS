
import { validationResult } from 'express-validator';
import {sendError} from "../utils/response-helper.js"

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(res, 400, 'Validation failed. Please check the provided data.', formattedErrors);
  }

  next();
};

export default validate;
