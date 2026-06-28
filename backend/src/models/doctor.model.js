import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },

      specialization: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      mobile: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      consultation_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'doctors',
      paranoid: true,
      underscored: true,
      timestamps: true,
    }
  );
  
   Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Doctor.hasMany(models.DoctorAvailability, { foreignKey: 'doctor_id', as: 'availabilities' });
    Doctor.hasMany(models.Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
  };


  return Doctor;
};