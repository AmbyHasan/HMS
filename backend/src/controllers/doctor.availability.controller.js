
import { sendSuccess } from '../utils/response-helper.js';
import * as availabilityService from "../services/doctor.availability.service.js";

const createAvailability = async (req, res, next) => {
  try {
    const data = await availabilityService.createAvailability(
      req.params.id,
      req.user.hospitalId,
      req.body
    );
    return sendSuccess(res, 201, 'Doctor availability created successfully', data);
  } catch (error) {
    next(error);
  }
};

const getDoctorAvailability = async (req, res, next) => {
  try {
    const data = await availabilityService.getDoctorAvailability(
      req.params.id,
      req.user.hospitalId
    );
    return sendSuccess(res, 200, 'Doctor availability retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const data = await availabilityService.updateAvailability(req.params.id, req.body);
    return sendSuccess(res, 200, 'Doctor availability updated successfully', data);
  } catch (error) {
    next(error);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    await availabilityService.deleteAvailability(req.params.id);
    return sendSuccess(res, 200, 'Doctor availability deactivated successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const data = await availabilityService.getAvailableSlots(
      req.params.id,
      req.user.hospitalId,
      req.query.date
    );
    return sendSuccess(res, 200, 'Available slots retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export {
  createAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailableSlots,
};
