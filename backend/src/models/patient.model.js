import { DataTypes } from "sequelize";


export default (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    registered_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'patients',
    paranoid: true,
    underscored: true,
    timestamps: true,
  });

  Patient.associate = (models) => {
    Patient.belongsTo(models.User, { foreignKey: 'registered_by', as: 'registeredBy' });
    Patient.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
  };

  return Patient;
};
