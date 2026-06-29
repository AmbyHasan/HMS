import db from '../models/index.js';
import sequelize from '../config/db/db.js';
const {Doctor , User , Hospital} = db;

const createDoctor = async (userData, doctorData) => {
  
  const t = await sequelize.transaction();
  try {
    const user = await User.create(userData, { transaction: t });
    const doctor = await Doctor.create({ ...doctorData, user_id: user.id }, { transaction: t });
    await t.commit();
    return { user, doctor };
  } catch (err) {
     

  await t.rollback();
  throw err;

  }
};

const findAll = async (hospitalId) => {
  return Doctor.findAll({
    include: [{
      model: User,
      as: 'user',
      where: { hospital_id: hospitalId, is_active: true },
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
    }],
  });
};

const findById = async (id) => {
  return Doctor.findByPk(id, {
    include: [{   //include user associated with doctor
      model: User,
      as: 'user',
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
      include: [{ model: Hospital, as: 'hospital', attributes: ['id', 'name'] }],   //include hospital associated with user
    }],
  });
};

const findByIdWithHospital = async (id, hospitalId) => {
  return Doctor.findOne({
    where: { id },
    include: [{
      model: User,
      as: 'user',
      where: { hospital_id: hospitalId },
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
    }],
  });
};

const updateDoctor = async (doctor, user, doctorData, userData) => {
 
  const t = await sequelize.transaction();
  try {
    if (userData && Object.keys(userData).length > 0) {  //if the user data is not null or undefined and the userData has some key or info for updation
      await user.update(userData, { transaction: t });  //execute the update inside transaction
    }
    if (doctorData && Object.keys(doctorData).length > 0) {
      await doctor.update(doctorData, { transaction: t });
    }
    await t.commit();  //commit the transaction
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const softDeleteDoctor = async (doctor, user) => {
 
  const t = await sequelize.transaction();
  try {
    await doctor.destroy({ transaction: t });
    await user.destroy({ transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const findByUserId = async (userId) => {
  return Doctor.findOne({ where: { user_id: userId } });
};

export{
  createDoctor,
  findAll,
  findById,
  findByIdWithHospital,
  updateDoctor,
  softDeleteDoctor,
  findByUserId,
};
