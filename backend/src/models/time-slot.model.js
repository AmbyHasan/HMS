const { DataTypes } = require('sequelize');

export default (sequelize) => {
  const TimeSlot = sequelize.define('TimeSlot', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    doctor_availability_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctor_availabilities', key: 'id' },
    },
    slot_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'time_slots',
    paranoid: false,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['doctor_availability_id', 'slot_time'],
        name: 'idx_timeslots_unique',
      },
    ],
  });

  TimeSlot.associate = (models) => {
    TimeSlot.belongsTo(models.DoctorAvailability, { foreignKey: 'doctor_availability_id', as: 'availability' });
    TimeSlot.hasMany(models.Appointment, { foreignKey: 'time_slot_id', as: 'appointments' });
  };
  return TimeSlot;
};
