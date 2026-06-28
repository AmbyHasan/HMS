import jwt from "jsonwebtoken"
import {sendError} from "../utils/response-helper.js";


const authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access token is required.');
  }

  const token = authHeader.split(' ')[1]; //get the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      hospitalId: decoded.hospitalId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid access token.');
  }
};

export default authenticate;
