import { DataTypes } from "sequelize";

export default (sequelize) => {
const Consultation = sequelize.define(
  "Consultation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "consultations",
    underscored: true,
    paranoid: true,
  }
);

Consultation.associate = (models) =>{
Consultation.belongsTo(models.Appointment, { foreignKey: "appointment_id", as: "appointment",});
Consultation.belongsTo(models.User, { foreignKey: "created_by", as: "doctor",});

}
return Consultation;
}


