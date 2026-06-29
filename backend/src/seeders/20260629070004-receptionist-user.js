"use strict";

import bcrypt from "bcryptjs";

export default {
  async up(queryInterface, Sequelize) {
    // fetch the first hospital
    const [hospitals] = await queryInterface.sequelize.query(`
      SELECT id
      FROM hospitals
      LIMIT 1;
    `);

    if (!hospitals.length) {
      throw new Error(
        "No hospital found. Please seed the hospitals table before seeding users."
      );
    }

    const hospitalId = hospitals[0].id;

    const hashedPassword = await bcrypt.hash("Amber@3105", 10);

    await queryInterface.bulkInsert("users", [
      {
        hospital_id: hospitalId,
        full_name: "Receptionist",
        email: "receptionist@hospital.com",
        password: hashedPassword,
        role: "receptionist",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: "receptionist@hospital.com",
    });
  },
};