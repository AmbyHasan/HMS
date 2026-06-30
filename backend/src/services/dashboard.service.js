import * as appointmentRepository from "../repositories/appointment.repository.js";
import * as doctorRepository from "../repositories/admin.doctor.repository.js";
import * as patientRepository from "../repositories/patient.repository.js";
import { getTodayDate} from "../utils/date-helper.js";
import APPOINTMENT_STATUS from "../constants/appointment-status.js";


class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getAdminDashboard = async (hospitalId ,registered_by_id) => {
  const today = getTodayDate();

  const [totalDoctors, totalPatients, totalAppointments, todaysAppointments] = await Promise.all([
    doctorRepository.findAll(hospitalId).then((docs) => docs.length),
    patientRepository.findAll(registered_by_id).then((patients) => patients.length),
    appointmentRepository.countByHospital(hospitalId),
    appointmentRepository.countTodayByHospital(hospitalId, today),
  ]);

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    todaysAppointments,
  };
};

const getReceptionistDashboard = async (hospitalId) => {
  const today = getTodayDate();

  const [todaysAppointments, upcomingAppointments] = await Promise.all([
    appointmentRepository.countTodayByHospital(hospitalId, today),
    appointmentRepository.countUpcoming(hospitalId, today),
  ]);

  return {
    todaysAppointments,
    upcomingAppointments,
  };
};

const getDoctorDashboard = async (doctorUserId) => {
  const today = getTodayDate();

  const doctorProfile = await doctorRepository.findByUserId(doctorUserId);
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404); //pas the error to the global error handler
  }

  const [todaysSchedule, completedConsultations] = await Promise.all([
    appointmentRepository.countTodayByDoctor(doctorProfile.id, today),
    appointmentRepository.countByDoctor(doctorProfile.id, APPOINTMENT_STATUS.COMPLETED),
  ]);

  return {
    todaysSchedule,
    completedConsultations,
  };
};

export  { getAdminDashboard, getReceptionistDashboard, getDoctorDashboard };
