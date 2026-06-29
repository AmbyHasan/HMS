import {sendSuccess} from  "../utils/response-helper.js";
import * as appointmentService from "../services/appointment.service.js";

const bookAppointment = async (req, res, next) => {
  try {
    const data = await appointmentService.bookAppointment(
      req.user.hospitalId,
      req.user.id,
      req.body
    );
    return sendSuccess(res, 201, 'Appointment booked successfully', data);
  } catch (error) {
    next(error);
  }
};

const rescheduleAppointment = async (req, res, next) => {
  try {
    const data = await appointmentService.rescheduleAppointment(
      req.params.id,
      req.user.hospitalId,
      req.body
    );
    return sendSuccess(res, 200, 'Appointment rescheduled successfully', data);
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const data = await appointmentService.cancelAppointment(
      req.params.id,
      req.user.hospitalId
    );
    return sendSuccess(res, 200, 'Appointment cancelled successfully', data);
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const filters = {
      doctorId: req.query.doctorId,
      patientId: req.query.patientId,
      status: req.query.status,
      date: req.query.date,
    };
    const data = await appointmentService.getAppointments(req.user.hospitalId, filters);
    return sendSuccess(res, 200, 'Appointments retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const getTodayAppointments = async (req, res, next) => {
  try {
    const data = await appointmentService.getTodayAppointments(req.user.hospitalId);
    return sendSuccess(res, 200, "Today's appointments retrieved successfully", data);
  } catch (error) {
    next(error);
  }
};

const getDoctorSchedule = async (req, res, next) => {
  try {
    const data = await appointmentService.getDoctorSchedule(
      req.user,
      req.query.doctorId,
      req.query.date
    );
    return sendSuccess(res, 200, 'Schedule retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const addConsultationNotes = async (req, res, next) => {
  try {
    const data = await appointmentService.addConsultationNotes(
      req.params.id,
      req.user.id,
      req.body.consultationNotes
    );
    return sendSuccess(res, 200, 'Consultation notes saved successfully', data);
  } catch (error) {
    next(error);
  }
};

const completeAppointment = async (req, res, next) => {
  try {
    const data = await appointmentService.completeAppointment(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Appointment marked as completed', data);
  } catch (error) {
    next(error);
  }
};

export {
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAppointments,
  getTodayAppointments,
  getDoctorSchedule,
  addConsultationNotes,
  completeAppointment,
};
