import { Sequelize } from "sequelize";
import sequelize from "../config/db.js";

import HospitalModel from "./hospital.model.js";
import UserModel from "./user.model.js";
import DoctorModel from "./doctor.model.js";
import PatientModel from "./patient.model.js";
import DoctorAvailabilityModel from "./doctorAvailability.model.js";
import TimeSlotModel from "./timeSlot.model.js";
import AppointmentModel from "./appointment.model.js";

const db = {};

db.Hospital = HospitalModel(sequelize);
db.User = UserModel(sequelize);
db.Doctor = DoctorModel(sequelize);
db.Patient = PatientModel(sequelize);
db.DoctorAvailability = DoctorAvailabilityModel(sequelize);
db.TimeSlot = TimeSlotModel(sequelize);
db.Appointment = AppointmentModel(sequelize);

Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;