import { DataTypes } from "sequelize";


export default (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'hospitals', key: 'id' },
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctors', key: 'id' },
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'patients', key: 'id' },
    },
    time_slot_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'time_slots', key: 'id' },
    },
    booked_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('booked', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'booked',
    },
    consultation_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'appointments',
    paranoid: true,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['doctor_id', 'appointment_date', 'time_slot_id'],
        where: { deleted_at: null },
        name: 'idx_appointments_booking_key',
      },
      {
        fields: ['doctor_id', 'appointment_date'],
        name: 'idx_appointments_doctor_date',
      },
      {
        fields: ['patient_id'],
        name: 'idx_appointments_patient_id',
      },
      {
        fields: ['hospital_id', 'appointment_date'],
        name: 'idx_appointments_hospital_date',
      },
    ],
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
    Appointment.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
    Appointment.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
    Appointment.belongsTo(models.TimeSlot, { foreignKey: 'time_slot_id', as: 'timeSlot' });
    Appointment.belongsTo(models.User, { foreignKey: 'booked_by', as: 'bookedBy' });
    Appointment.hasOne(models.Consultation, { foreignKey: "appointment_id", as: "consultation",});
  };

  return Appointment;
};
