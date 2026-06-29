export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("patients", "email", {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("patients", "email");
}