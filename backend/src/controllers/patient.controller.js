
import {sendSuccess} from "../utils/response-helper.js";
import * as patientService from "../services/patient.service.js";

const registerPatient = async (req, res, next) => {
  try {
    const data = await patientService.registerPatient(
    
      req.user.id,
      req.body
    );
    return sendSuccess(res, 201, 'Patient registered successfully', data);
  } catch (error) {
    next(error);
  }
};

//here we are getting all the patients that have been registered by a single admin or receptionist
const getPatients = async (req, res, next) => {
  try {
    const data = await patientService.getPatients(req.user.id);  //admin or recpetionist id
    return sendSuccess(res, 200, 'Patients retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const data = await patientService.getPatientById(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Patient retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const data = await patientService.updatePatient(
      req.params.id,
      req.user.id,
      req.body
    );
    return sendSuccess(res, 200, 'Patient updated successfully', data);
  } catch (error) {
    next(error);
  }
};

export { registerPatient, getPatients, getPatientById, updatePatient };
