import db from "../models/index.js";

const { Consultation, Appointment, Doctor, Patient, User } = db;

const CONSULTATION_INCLUDES = [
  {
    model: Appointment,
    as: "appointment",
    include: [
      {
        model: Doctor,
        as: "doctor",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "full_name", "email"],
          },
        ],
        attributes: ["id", "specialization"],
      },
      {
        model: Patient,
        as: "patient",
        attributes: ["id", "full_name", "mobile"],
      },
    ],
  },
  {
    model: User,
    as: "doctor",
    attributes: ["id", "full_name", "email"],
  },
];

const create = async (data) => {
  return Consultation.create(data);
};

const findById = async (id) => {
  return Consultation.findByPk(id, {
    include: CONSULTATION_INCLUDES,
  });
};

const findByAppointmentId = async (appointmentId) => {
  return Consultation.findOne({
    where: {
      appointment_id: appointmentId,
    },
    include: CONSULTATION_INCLUDES,
  });
};

const findByAppointmentIdRaw = async (appointmentId) => {
  return Consultation.findOne({
    where: {
      appointment_id: appointmentId,
    },
  });
};

const update = async (consultation, data) => {
  return consultation.update(data);
};

const remove = async (consultation) => {
  return consultation.destroy();
};

export {
  create,
  findById,
  findByAppointmentId,
  findByAppointmentIdRaw,
  update,
  remove,
};