import db from '../models/index.js';
const {Appointment, Doctor, Patient, TimeSlot, User, Consultation}=db;
import {Op}  from 'sequelize';

const APPOINTMENT_INCLUDES = [
  {
    model: Doctor,
    as: 'doctor',
    include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
    attributes: ['id', 'specialization'],
  },
  {
    model: Patient,
    as: 'patient',
    attributes: ['id', 'full_name', 'mobile' ,'email'],
  },
  {
    model: TimeSlot,
    as: 'timeSlot',
    attributes: ['id', 'slot_time'],
  },
  {
    model: Consultation,
    as: "consultation",
    attributes: ["id", "notes", "created_at"],
  }
];

const create = async (data) => {
  return Appointment.create(data);
};

const findConflict = async (doctorId, appointmentDate, timeSlotId, excludeId = null) => {
  const where = {
    doctor_id: doctorId,
    appointment_date: appointmentDate,
    time_slot_id: timeSlotId,
    status: 'booked',
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };   //check if anyother appt apart from current appt has this slot
  return Appointment.findOne({ where });
};

const findById = async (id) => {
  return Appointment.findByPk(id, { include: APPOINTMENT_INCLUDES });
};

const findByIdRaw = async (id) => {
  return Appointment.findByPk(id);
};

const findAll = async (hospitalId, filters = {}) => {
  const where = { hospital_id: hospitalId };
  if (filters.doctorId) where.doctor_id = filters.doctorId;
  if (filters.patientId) where.patient_id = filters.patientId;
  if (filters.status) where.status = filters.status;
  if (filters.date) where.appointment_date = filters.date;

  return Appointment.findAll({
    where,
    include: APPOINTMENT_INCLUDES,
    order: [['appointment_date', 'DESC'], ['created_at', 'DESC']],
  });
};

const findToday = async (hospitalId, today) => {
  return Appointment.findAll({
    where: { hospital_id: hospitalId, appointment_date: today },
    include: APPOINTMENT_INCLUDES,
    order: [['time_slot_id', 'ASC']],
  });
};

const findByDoctorAndDate = async (doctorId, date) => {
  const where = { doctor_id: doctorId };
  if (date) where.appointment_date = date;

  return Appointment.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'mobile', 'gender', 'date_of_birth' ,'email'] },
      { model: TimeSlot, as: 'timeSlot', attributes: ['id', 'slot_time'] },
      {model :Consultation , as : "consultation" , attributes: ['notes'] }
    ],
    order: [['appointment_date', 'ASC'], ['time_slot_id', 'ASC']],
  });
};

const update = async (appointment, data) => {
  return appointment.update(data);
};

const countByHospital = async (hospitalId) => {
  return Appointment.count({ where: { hospital_id: hospitalId } });
};

const countTodayByHospital = async (hospitalId, today) => {
  return Appointment.count({ where: { hospital_id: hospitalId, appointment_date: today } });
};

const countByDoctor = async (doctorId, status) => {
  const where = { doctor_id: doctorId };
  if (status) where.status = status;
  return Appointment.count({ where });
};

const countTodayByDoctor = async (doctorId, today) => {
  return Appointment.count({ where: { doctor_id: doctorId, appointment_date: today } });
};

const countUpcoming = async (hospitalId, today) => {
  return Appointment.count({
    where: {
      hospital_id: hospitalId,
      appointment_date: { [Op.gte]: today },
      status: 'booked',
    },
  });
};

const hasFutureAppointmentsForAvailability = async (availabilityId, today) => {
  const appointment = await Appointment.findOne({
    include: [{
      model: TimeSlot,
      as: 'timeSlot',
      where: { doctor_availability_id: availabilityId },
      required: true,
    }],
    where: {
      appointment_date: { [Op.gte]: today },
      status: 'booked',
    },
  });
  return !!appointment;
};

const findBookedSlotIds = async (doctorId, date) => {
  const appointments = await Appointment.findAll({
    where: { doctor_id: doctorId, appointment_date: date, status: 'booked' },
    attributes: ['time_slot_id'],
  });
  return appointments.map((a) => a.time_slot_id);
};

export {
  create,
  findConflict,
  findById,
  findByIdRaw,
  findAll,
  findToday,
  findByDoctorAndDate,
  update,
  countByHospital,
  countTodayByHospital,
  countByDoctor,
  countTodayByDoctor,
  countUpcoming,
  hasFutureAppointmentsForAvailability,
  findBookedSlotIds,
};
