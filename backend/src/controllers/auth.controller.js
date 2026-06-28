
import * as authService from "../services/auth.service.js";
import {sendError , sendSuccess} from "../utils/response-helper.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return sendSuccess(res, 200, 'Login successful', data);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout();
    return sendSuccess(res, 200, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return sendSuccess(
      res,
      200,
      'If this email is registered, a reset link has been sent.',
      null
    );
  } catch (error) {
    next(error);
  }
};

export { login, logout, forgotPassword };
