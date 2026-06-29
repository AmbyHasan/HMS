
import bcrypt from "bcryptjs";
import ROLES from "../constants/roles.js";
import * as userRepository from "../repositories/user.repository.js";
import * as doctorRepository from "../repositories/admin.respository.js"


class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createDoctor = async (hospitalId, payload) => {
  const { fullName, email, password, specialization, mobile, consultationFee } = payload;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('A user with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const userData = {
    hospital_id: hospitalId,
    full_name: fullName,
    email,
    password: hashedPassword,
    role: ROLES.DOCTOR,
    is_active: true,
  };

  const doctorData = {
    specialization,
    mobile,
    consultation_fee: consultationFee,
  };

  const { user, doctor } = await doctorRepository.createDoctor(userData, doctorData);

  return {
    id: doctor.id,
    fullName: user.full_name,
    email: user.email,
    specialization: doctor.specialization,
    mobile: doctor.mobile,
    consultationFee: parseFloat(doctor.consultation_fee),
  };
};

const getDoctors = async (hospitalId) => {
  const doctors = await doctorRepository.findAll(hospitalId);

  return doctors.map((doc) => ({
    id: doc.id,
    fullName: doc.user.full_name,
    email: doc.user.email,
    specialization: doc.specialization,
    mobile: doc.mobile,
    consultationFee: parseFloat(doc.consultation_fee),
  }));
};

const getDoctorById = async (id, requestingUser) => {
  const doctor = await doctorRepository.findById(id);

  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  // Doctors can only view their own profile
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctorProfile = await doctorRepository.findByUserId(requestingUser.id);
    if (!doctorProfile || doctorProfile.id !== id) {
      throw new AppError('You do not have permission to view this profile.', 403);
    }
  }

  return {
    id: doctor.id,
    fullName: doctor.user.full_name,
    email: doctor.user.email,
    specialization: doctor.specialization,
    mobile: doctor.mobile,
    consultationFee: parseFloat(doctor.consultation_fee),
    hospital: doctor.user.hospital ? {
      id: doctor.user.hospital.id,
      name: doctor.user.hospital.name,
    } : null,
  };
};

const updateDoctor = async (id, hospitalId, payload) => {
  const doctor = await doctorRepository.findByIdWithHospital(id, hospitalId);

  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  const doctorData = {};
  const userData = {};

  if (payload.fullName) userData.full_name = payload.fullName;
  if (payload.specialization) doctorData.specialization = payload.specialization;
  if (payload.mobile) doctorData.mobile = payload.mobile;
  if (payload.consultationFee !== undefined) doctorData.consultation_fee = payload.consultationFee;

  await doctorRepository.updateDoctor(doctor, doctor.user, doctorData, userData);

  const updated = await doctorRepository.findById(id);

  return {
    id: updated.id,
    fullName: updated.user.full_name,
    specialization: updated.specialization,
    mobile: updated.mobile,
    consultationFee: parseFloat(updated.consultation_fee),
  };
};

const deleteDoctor = async (id, hospitalId) => {
  const doctor = await doctorRepository.findByIdWithHospital(id, hospitalId);

  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  await doctorRepository.softDeleteDoctor(doctor, doctor.user);
  return null;
};

export default { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor };
