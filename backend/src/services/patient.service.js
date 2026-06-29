import * as patientRepository from "../repositories/patient.repository.js";

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

//we are not storing hospital id with patient ,to keey user table as the single source of truth for hospital_id
  const registerPatient = async ( registeredBy, payload) => {
   const { fullName, dateOfBirth, gender, mobile, address } = payload;


  const patient = await patientRepository.create({
   
    registered_by: registeredBy,  //this entity exists in the user table from where we can extract the hospital id if needed
    full_name: fullName,
    date_of_birth: dateOfBirth,
    gender,
    mobile,
    address: address || null,
  });

  return {
    id: patient.id,
    fullName: patient.full_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    mobile: patient.mobile,
    address: patient.address,
  };
};

const getPatients = async (id) => {  //here id -> admin or receptionist id that registered the patient
  const patients = await patientRepository.findAll(id);

  return patients.map((p) => ({
    id: p.id,
    fullName: p.full_name,
    dateOfBirth: p.date_of_birth,
    gender: p.gender,
    mobile: p.mobile,
  }));
};

const getPatientById = async (id ,registered_by_id) => {
  const patient = await patientRepository.findByIdAndRegistrarId(id, registered_by_id);

  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  return {
    id: patient.id,
    fullName: patient.full_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    mobile: patient.mobile,
    address: patient.address,
  };
};

const updatePatient = async (id, registered_by_id, payload) => {
  const patient = await patientRepository.findByIdAndRegistrarId(id, registered_by_id);

  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  const updateData = {};
  if (payload.fullName) updateData.full_name = payload.fullName;
  if (payload.mobile) updateData.mobile = payload.mobile;
  if (payload.address !== undefined) updateData.address = payload.address;

  await patientRepository.update(patient, updateData);

  const updated = await patientRepository.findById(id);

  return {
    id: updated.id,
    fullName: updated.full_name,
    mobile: updated.mobile,
    address: updated.address,
  };
};

export { registerPatient, getPatients, getPatientById, updatePatient };
