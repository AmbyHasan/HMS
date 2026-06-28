import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Hospital = sequelize.define(
    "Hospital",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Hospital name is required.",
          },
          len: {
            args: [2, 150],
            msg: "Hospital name must be between 2 and 150 characters.",
          },
        },
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Hospital address is required.",
          },
        },
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Hospital phone number is required.",
          },
          len: {
            args: [10, 20],
            msg: "Phone number must be between 10 and 20 characters.",
          },
        },
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Hospital email is required.",
          },
          isEmail: {
            msg: "Please provide a valid email address.",
          },
        },
      },
    },
    {
      tableName: "hospitals",

      timestamps: true,

      paranoid: true,

      underscored: true,
    }
  );

    Hospital.associate = (models) => {
    Hospital.hasMany(models.User, { foreignKey: 'hospital_id', as: 'users' });
    Hospital.hasMany(models.Patient, { foreignKey: 'hospital_id', as: 'patients' });
    Hospital.hasMany(models.Appointment, { foreignKey: 'hospital_id', as: 'appointments' });
  };

  return Hospital;
};