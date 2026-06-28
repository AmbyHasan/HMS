'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports= {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      specialization: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      mobile: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      consultation_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

   
  },

  async down(queryInterface) {
    await queryInterface.dropTable('doctors');
  },
};