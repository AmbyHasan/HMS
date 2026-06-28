'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('time_slots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      doctor_availability_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'doctor_availabilities', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      slot_time: {
        type: Sequelize.TIME,
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
    });

    await queryInterface.addIndex('time_slots', ['doctor_availability_id', 'slot_time'], {
      unique: true,
      name: 'idx_timeslots_unique',
    });
    await queryInterface.addIndex('time_slots', ['doctor_availability_id'], {
      name: 'idx_timeslots_availability_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('time_slots');
  },
};
