module.exports =  {
async up(queryInterface, Sequelize) {
  await queryInterface.createTable("consultations", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    appointment_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "appointments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    notes: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    created_by: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });
} ,

async  down(queryInterface) {
  await queryInterface.dropTable("consultations");
}
}