import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NOTIFICATION_TYPES from "../constants/notification-types.js";
import * as userRepository from "../repositories/user.repository.js";
import publishEvent from "./notification.service.js";

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const login = async (email, password) => {

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.is_active) {
    throw new AppError('Your account has been deactivated. Please contact the administrator.', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      hospitalId: user.hospital_id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

const logout = async () => {
  //client will discard the token
  return null;
};

const forgotPassword = async (email) => {
  const user = await userRepository.findActiveByEmail(email);

  if (user) {
    // generate a resest token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await publishEvent(NOTIFICATION_TYPES.PASSWORD_RESET, {
      recipientEmail: user.email,
      recipientName: user.full_name,
      resetToken,
    });
  }

  
  return null;
};

export  { login, logout, forgotPassword };
