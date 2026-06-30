
import { Op } from 'sequelize';
import db from '../models/index.js';

const { DoctorAvailability , TimeSlot}= db;
import sequelize from '../config/db/db.js'

const create = async (data) => {
  return DoctorAvailability.create(data);
};

const findByDoctorAndDay = async (doctorId, dayOfWeek, excludeId = null) => {    //if exclude id is null it means we are checking if the availability of the doctor for that day exists or not
  const where = { doctor_id: doctorId, day_of_week: dayOfWeek };
  if (excludeId) where.id = { [Op.ne]: excludeId };    //if the exlude id is not null  , it means we have to exclude this id and then check for the availability
  return DoctorAvailability.findOne({ where });
};

const findByDoctorId = async (doctorId) => {
  return DoctorAvailability.findAll({
    where: { doctor_id: doctorId },
    order: [['day_of_week', 'ASC']],
  });
};

const findById = async (id) => {
  return DoctorAvailability.findByPk(id, {
    include: [{ model: TimeSlot, as: 'timeSlots' }],
  });
};

const findByIdRaw = async (id) => {
  return DoctorAvailability.findByPk(id);
};

const update = async (availability, data) => {
  return availability.update(data);
};

const softDelete = async (availability) => {
  return availability.destroy();
};

const createTimeSlots = async (availabilityId, slotTimes) => {
  const slots = slotTimes.map((slot_time) => ({
    doctor_availability_id: availabilityId,
    slot_time,
    is_active: true,
  }));
  return TimeSlot.bulkCreate(slots ,{ returning: true }); //storing the time slots in db
};

const deactivateTimeSlots = async (availabilityId) => {
  return TimeSlot.update({ is_active: false }, { where: { doctor_availability_id: availabilityId } });
};

const deleteTimeSlots = async (availabilityId) => {
  return TimeSlot.destroy({ where: { doctor_availability_id: availabilityId } });
};

const findSlotsByAvailabilityId = async (availabilityId) => {
  return TimeSlot.findAll({
    where: { doctor_availability_id: availabilityId, is_active: true },
    order: [['slot_time', 'ASC']],
  });
};

const findAvailabilityByDoctorAndDayOfWeek = async (doctorId, dayOfWeek) => {
  return DoctorAvailability.findOne({
    where: { doctor_id: doctorId, day_of_week: dayOfWeek, is_active: true },
    include: [{ model: TimeSlot, as: 'timeSlots', where: { is_active: true }, required: false }],
  });
};

export {
  create,
  findByDoctorAndDay,
  findByDoctorId,
  findById,
  findByIdRaw,
  update,
  softDelete,
  createTimeSlots,
  deactivateTimeSlots,
  deleteTimeSlots,
  findSlotsByAvailabilityId,
  findAvailabilityByDoctorAndDayOfWeek,
};
