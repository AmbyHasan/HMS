const { DataTypes } = require('sequelize');

export default (sequelize) => {
  const DoctorAvailability = sequelize.define('DoctorAvailability', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctors', key: 'id' },
    },
    day_of_week: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    slot_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'doctor_availabilities',
    paranoid: true,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['doctor_id', 'day_of_week'],
        where: { deleted_at: null },
        name: 'idx_availability_doctor_day',
      },
    ],
  });

  

  return DoctorAvailability;
};
