import * as appointmentRepository from "../repositories/appointment.repository.js";
import * as doctorRepository from "../repositories/admin.doctor.repository.js";
import * as patientRepository from "../repositories/patient.repository.js";
import db from "../models/index.js";
import { isPastDate, getTodayDate } from "../utils/date-helper.js";
import publishEvent from "./notification.service.js";
import NOTIFICATION_TYPES from "../constants/notification-types.js";
import APPOINTMENT_STATUS from "../constants/appointment-status.js";
import ROLES from "../constants/roles.js";
import * as consultationRepository from "../repositories/consultation.repository.js"


const { TimeSlot, DoctorAvailability } = db;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const bookAppointment = async (hospitalId, bookedBy, payload) => {
  const { doctorId, patientId, appointmentDate, timeSlotId } = payload;

  // paste dates cannot be booked
  if (isPastDate(appointmentDate)) {
    throw new AppError('Appointment date cannot be in the past.', 400);
  }

  //checking whether doctor exists in this hospital
  const doctor = await doctorRepository.findByIdWithHospital(doctorId, hospitalId);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  // checking whether the patient exists in this hospital
  const patient = await patientRepository.findById(patientId);
  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  // checking whether the time slots exists and belong to the doctor
  const timeSlot = await TimeSlot.findOne({
    where: { id: timeSlotId, is_active: true },
    include: [{
      model: DoctorAvailability,
      as: 'availability',
      where: { doctor_id: doctorId, is_active: true },
      required: true,
    }],
  });

  if (!timeSlot) {
    throw new AppError('Time slot not found or does not belong to this doctor.', 404);
  }

  //preventing double booking
  const conflict = await appointmentRepository.findConflict(doctorId, appointmentDate, timeSlotId);
  if (conflict) {
    throw new AppError('This time slot is already booked for the selected date.', 409);
  }

  const appointment = await appointmentRepository.create({
    hospital_id: hospitalId,
    doctor_id: doctorId,
    patient_id: patientId,
    time_slot_id: timeSlotId,
    booked_by: bookedBy, //booked by receptionist or admin
    appointment_date: appointmentDate,
    status: APPOINTMENT_STATUS.BOOKED,
  });

  //get the created apt from db
  const fullAppointment = await appointmentRepository.findById(appointment.id);

  // publish notification asynchronously
  await publishEvent(NOTIFICATION_TYPES.APPOINTMENT_BOOKED, {   //here we are sending type and the payload
    patientName: patient.full_name, 
    patientEmail: patient.email,
    doctorName: fullAppointment.doctor.user.full_name,
    appointmentDate,
    slotTime: timeSlot.slot_time,
  });

  return formatAppointment(fullAppointment);
};

const rescheduleAppointment = async (appointmentId, hospitalId, payload) => {
  const { appointmentDate, timeSlotId } = payload; //here we will new time slot id for which the apt is to be scheduled

  const appointment = await appointmentRepository.findByIdRaw(appointmentId);

  if (!appointment || appointment.hospital_id !== hospitalId) {
    throw new AppError('Appointment not found.', 404);
  }

  // only booked appointments can be rescheduled
  if (appointment.status !== APPOINTMENT_STATUS.BOOKED) {
    throw new AppError(
      `Cannot reschedule an appointment with status '${appointment.status}'.`,
      422
    );
  }
  //appointments from past date can not be booked
  if (isPastDate(appointmentDate)) {
    throw new AppError('Appointment date cannot be in the past.', 400);
  }

  // check that the new time slot belong to the same doctor
  const timeSlot = await TimeSlot.findOne({
    where: { id: timeSlotId, is_active: true },
    include: [{
      model: DoctorAvailability,
      as: 'availability',
      where: { doctor_id: appointment.doctor_id, is_active: true },
      required: true,
    }],
  });

  if (!timeSlot) {
    throw new AppError('Time slot not found or does not belong to this doctor.', 404);
  }

  // check for double booking excluding current appointment
  const conflict = await appointmentRepository.findConflict(
    appointment.doctor_id,
    appointmentDate,
    timeSlotId,
    appointmentId
  );

  if (conflict) {
    throw new AppError('This time slot is already booked for the selected date.', 409);
  }

  await appointmentRepository.update(appointment, {
    appointment_date: appointmentDate,
    time_slot_id: timeSlotId,
  });

  const updated = await appointmentRepository.findById(appointmentId);

  // publish notification
  await publishEvent(NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED, {
    patientName: updated.patient.full_name,
    patientEmail: updated.patient.email,
    doctorName: updated.doctor.user.full_name,
    appointmentDate,
    slotTime: timeSlot.slot_time,
  });

  return formatAppointment(updated);
};

const cancelAppointment = async (appointmentId, hospitalId) => {
  const appointment = await appointmentRepository.findByIdRaw(appointmentId);

  if (!appointment || appointment.hospital_id !== hospitalId) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new AppError('Appointment is already cancelled.', 422);
  }

  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new AppError('Cannot cancel a completed appointment.', 422);
  }

  const cancelledAt = new Date();

  

  await appointmentRepository.update(appointment, {
    status: APPOINTMENT_STATUS.CANCELLED,
    cancelled_at: cancelledAt,
  });

  const updated = await appointmentRepository.findById(appointmentId);

  // publish notification
  await publishEvent(NOTIFICATION_TYPES.APPOINTMENT_CANCELLED, {
  patientName: updated.patient.full_name,
  patientEmail: updated.patient.email,
  doctorName: updated.doctor.user.full_name,
  appointmentDate: updated.appointment_date,
  slotTime: updated.timeSlot.slot_time,

  });

  return {
    id: appointmentId,
    status: APPOINTMENT_STATUS.CANCELLED,
    cancelledAt: cancelledAt.toISOString(),
  };
};

const getAppointments = async (hospitalId, filters) => {
  const appointments = await appointmentRepository.findAll(hospitalId, filters);
  return appointments.map(formatAppointment);
};

const getTodayAppointments = async (hospitalId) => {
  const today = getTodayDate();
  const appointments = await appointmentRepository.findToday(hospitalId, today);
  return appointments.map(formatAppointment);
};



//if you want the schedule of a specific date , then send date also in the query paramater
const getDoctorSchedule = async (requestingUser, queryDoctorId, date) => {
  let doctorId;

  if (requestingUser.role === ROLES.DOCTOR) {
    const doctorProfile = await doctorRepository.findByUserId(requestingUser.id);
    if (!doctorProfile) {
      throw new AppError('Doctor profile not found.', 404);
    }
    doctorId = doctorProfile.id;
  } else {
    // admin must provide doctorId
    if (!queryDoctorId) {
      throw new AppError('doctorId query parameter is required for admin.', 400);
    }
    const doctor = await doctorRepository.findByIdWithHospital(queryDoctorId, requestingUser.hospitalId);
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }
    doctorId = queryDoctorId;
  }

  const targetDate = date || getTodayDate();
  const appointments = await appointmentRepository.findByDoctorAndDate(doctorId, targetDate);

  return appointments.map((appt) => ({
    id: appt.id,
    patient: {
      fullName: appt.patient.full_name,
      gender: appt.patient.gender,
      dateOfBirth: appt.patient.date_of_birth,
    },
    appointmentDate: appt.appointment_date,
    slotTime: appt.timeSlot ? appt.timeSlot.slot_time.substring(0, 5) : null,
    status: appt.status,
    consultationNotes: appt.consultation ? appt.consultation.notes : null,
  }));
};

const addConsultationNotes = async (appointmentId, doctorUserId, notes) => {
  const doctorProfile = await doctorRepository.findByUserId(doctorUserId);
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const appointment = await appointmentRepository.findByIdRaw(appointmentId);

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.doctor_id !== doctorProfile.id) {
    throw new AppError('You are not authorized to update this appointment.', 403);
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new AppError('Cannot add notes to a cancelled appointment.', 422);
  }

  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new AppError('Cannot modify a completed appointment.', 422);
  }
  const existingConsultation = await consultationRepository.findByAppointmentIdRaw(appointmentId);
  if (existingConsultation) {
    throw new AppError(
      "Consultation notes have already been added for this appointment", 409
    );
  }

  await consultationRepository.create({
    appointment_id: appointment.id,
    notes,
    created_by: doctorProfile.user_id,
  });

  const updatedAppointment =
    await appointmentRepository.findById(appointmentId);

  return formatAppointment(updatedAppointment);
};

const completeAppointment = async (appointmentId, doctorUserId) => {
  const doctorProfile = await doctorRepository.findByUserId(doctorUserId);
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const appointment = await appointmentRepository.findByIdRaw(appointmentId);

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.doctor_id !== doctorProfile.id) {
    throw new AppError('You are not authorized to complete this appointment.', 403);
  }

  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new AppError('Appointment is already completed.', 422);
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new AppError('Cannot complete a cancelled appointment.', 422);
  }

  const consultation =
    await consultationRepository.findByAppointmentIdRaw(appointmentId);

  if (!consultation) {
    throw new AppError(
      "Consultation notes must be added before completing the appointment.",
      422
    );
  }


  const completedAt = new Date();
  await appointmentRepository.update(appointment, {
    status: APPOINTMENT_STATUS.COMPLETED,
    completed_at: completedAt,
  });

  return {
    id: appointmentId,
    status: APPOINTMENT_STATUS.COMPLETED,
    completedAt: completedAt.toISOString(),
  };
};

const formatAppointment = (appt) => ({
  id: appt.id,
  doctor: appt.doctor ? {
    id: appt.doctor.id,
    fullName: appt.doctor.user ? appt.doctor.user.full_name : null,
    specialization: appt.doctor.specialization,
  } : null,
  patient: appt.patient ? {
    id: appt.patient.id,
    fullName: appt.patient.full_name,
  } : null,
  appointmentDate: appt.appointment_date,
  slotTime: appt.timeSlot ? appt.timeSlot.slot_time.substring(0, 5) : null,
  timeSlotId:appt.time_slot_id,
  status: appt.status,
 consultationNotes: appt.consultation
  ? appt.consultation.notes
  : null,
});

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
