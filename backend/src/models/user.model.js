import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      hospital_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      full_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Full name is required.",
          },
          len: {
            args: [2, 150],
            msg: "Full name must be between 2 and 150 characters.",
          },
        },
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Email is required.",
          },
          isEmail: {
            msg: "Please enter a valid email address.",
          },
        },
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required.",
          },
          len: {
            args: [8, 255],
            msg: "Password must be at least 8 characters long.",
          },
        },
      },

      role: {
        type: DataTypes.ENUM("admin", "receptionist", "doctor"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["admin", "receptionist", "doctor"]],
            msg: "Invalid user role.",
          },
        },
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

   User.associate = (models) => {
    User.belongsTo(models.Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
    User.hasOne(models.Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
    User.hasMany(models.Patient, { foreignKey: 'registered_by', as: 'registeredPatients' });
    User.hasMany(models.Appointment, { foreignKey: 'booked_by', as: 'bookedAppointments' });
  };

  

  return User;
};