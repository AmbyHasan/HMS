'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctor_availabilities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      day_of_week: {
        type: Sequelize.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      slot_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('doctor_availabilities', ['doctor_id', 'day_of_week'], {
      unique: true,
      name: 'idx_availability_doctor_day',
      where: { deleted_at: null },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('doctor_availabilities');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_doctor_availabilities_day_of_week";');
  },
};
