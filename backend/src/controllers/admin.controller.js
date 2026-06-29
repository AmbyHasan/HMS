import {sendSuccess} from "../utils/response-helper.js";
import doctorService from "../services/doctor.service.js";

//all of these can only be performed by an admin
const createDoctor = async (req, res, next) => {
  try {
    const data = await doctorService.createDoctor(req.user.hospitalId, req.body);
    return sendSuccess(res, 201, 'Doctor created successfully', data);
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const data = await doctorService.getDoctors(req.user.hospitalId);
    return sendSuccess(res, 200, 'Doctors retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const data = await doctorService.getDoctorById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Doctor retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const data = await doctorService.updateDoctor(req.params.id, req.user.hospitalId, req.body);
    return sendSuccess(res, 200, 'Doctor updated successfully', data);
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    await doctorService.deleteDoctor(req.params.id, req.user.hospitalId);
    return sendSuccess(res, 200, 'Doctor deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor };
