'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      hospital_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'hospitals', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      time_slot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'time_slots', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      booked_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      appointment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('booked', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'booked',
      },
      consultation_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('appointments', ['doctor_id', 'appointment_date', 'time_slot_id'], {
      unique: true,
      name: 'idx_appointments_booking_key',
      where: { deleted_at: null },
    });
    await queryInterface.addIndex('appointments', ['doctor_id', 'appointment_date'], {
      name: 'idx_appointments_doctor_date',
    });
    await queryInterface.addIndex('appointments', ['patient_id'], {
      name: 'idx_appointments_patient_id',
    });
    await queryInterface.addIndex('appointments', ['hospital_id', 'appointment_date'], {
      name: 'idx_appointments_hospital_date',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_appointments_status";');
  },
};
