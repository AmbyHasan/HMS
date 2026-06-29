import * as availabilityRepository from "../repositories/admin.doctor.availability.repository.js";
import * as appointmentRepository from "../repositories/appointment.repository.js";
import * as adminRepostory from "../repositories/admin.doctor.repository.js";
import generateTimeSlots from "../utils/time-slot-generator.js";
import {getTodayDate, isPastDate, getDayOfWeek } from "../utils/date-helper.js";


class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createAvailability = async (doctorId, hospitalId, payload) => {
  const { dayOfWeek, startTime, endTime, slotDuration } = payload;

  const doctor = await adminRepository.findByIdWithHospital(doctorId, hospitalId);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  const dayLower = dayOfWeek.toLowerCase();
  const existing = await availabilityRepository.findByDoctorAndDay(doctorId, dayLower);
  if (existing) {
    throw new AppError(`Availability already exists for ${dayOfWeek}. Update the existing record instead.`, 409);
  }

  const availability = await availabilityRepository.create({
    doctor_id: doctorId,
    day_of_week: dayLower,
    start_time: startTime,
    end_time: endTime,
    slot_duration: slotDuration,
    is_active: true,
  });

  const slotTimes = generateTimeSlots(startTime, endTime, slotDuration);
  await availabilityRepository.createTimeSlots(availability.id, slotTimes);

  return {
    id: availability.id,
    doctorId: availability.doctor_id,
    dayOfWeek: availability.day_of_week,
    startTime: availability.start_time,
    endTime: availability.end_time,
    slotDuration: availability.slot_duration,
  };
};

const getDoctorAvailability = async (doctorId, hospitalId) => {
  const doctor = await adminRepository.findByIdWithHospital(doctorId, hospitalId);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  const availabilities = await availabilityRepository.findByDoctorId(doctorId);

  return availabilities.map((a) => ({
    id: a.id,
    dayOfWeek: a.day_of_week,
    startTime: a.start_time,
    endTime: a.end_time,
    slotDuration: a.slot_duration,
    isActive: a.is_active,
  }));
};

const updateAvailability = async (availabilityId, payload) => {
  const availability = await availabilityRepository.findByIdRaw(availabilityId);
  if (!availability) {
    throw new AppError('Availability record not found.', 404);
  }

  const today = getTodayDate();
  const hasFutureAppointments = await appointmentRepository.hasFutureAppointmentsForAvailability(
    availabilityId,
    today
  );

  if (hasFutureAppointments) {
    throw new AppError(
      'Cannot update availability because future appointments exist for this schedule.',
      422
    );
  }

  const updateData = {};
  if (payload.startTime) updateData.start_time = payload.startTime;
  if (payload.endTime) updateData.end_time = payload.endTime;
  if (payload.slotDuration) updateData.slot_duration = payload.slotDuration;

  await availabilityRepository.update(availability, updateData);

  // regenerate time slots
  const updatedAvailability = await availabilityRepository.findByIdRaw(availabilityId);
  await availabilityRepository.deleteTimeSlots(availabilityId);
  const slotTimes = generateTimeSlots(
    updatedAvailability.start_time,
    updatedAvailability.end_time,
    updatedAvailability.slot_duration
  );
  await availabilityRepository.createTimeSlots(availabilityId, slotTimes);

  return {
    id: updatedAvailability.id,
    dayOfWeek: updatedAvailability.day_of_week,
    startTime: updatedAvailability.start_time,
    endTime: updatedAvailability.end_time,
    slotDuration: updatedAvailability.slot_duration,
  };
};

const deleteAvailability = async (availabilityId) => {
  const availability = await availabilityRepository.findByIdRaw(availabilityId);
  if (!availability) {
    throw new AppError('Availability record not found.', 404);
  }

  const today = getTodayDate();
  const hasFutureAppointments = await appointmentRepository.hasFutureAppointmentsForAvailability(
    availabilityId,
    today
  );

  if (hasFutureAppointments) {
    throw new AppError(
      'Cannot deactivate availability because future appointments exist for this schedule.',
      422
    );
  }

  await availabilityRepository.deactivateTimeSlots(availabilityId);
  await availability.update({ is_active: false });
  await availabilityRepository.softDelete(availability);

  return null;
};

const getAvailableSlots = async (doctorId, hospitalId, date) => {
  if (isPastDate(date)) {
    throw new AppError('Cannot retrieve slots for a past date.', 400);
  }

  const doctor = await adminRepository.findByIdWithHospital(doctorId, hospitalId);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  const dayOfWeek = getDayOfWeek(date);
  const availability = await availabilityRepository.findAvailabilityByDoctorAndDayOfWeek(
    doctorId,
    dayOfWeek
  );

  if (!availability || !availability.is_active) {
    return [];
  }

  const bookedSlotIds = await appointmentRepository.findBookedSlotIds(doctorId, date);
  const bookedSet = new Set(bookedSlotIds);

  const slots = (availability.timeSlots || []).filter(
    (slot) => slot.is_active && !bookedSet.has(slot.id)
  );

  const slotDuration = availability.slot_duration;

  return slots.map((slot) => {
    const [h, m] = slot.slot_time.split(':').map(Number);
    const endMinutes = h * 60 + m + slotDuration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    return {
      id: slot.id,
      startTime: slot.slot_time.substring(0, 5),
      endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
    };
  });
};

export {
  createAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailableSlots,
};
