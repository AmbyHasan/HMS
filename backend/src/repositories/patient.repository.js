
import db from '../models/index.js';

const {Patient , User}= db;

const create = async (data) => {
  return Patient.create(data);
};

const findAll = async (registered_by_id) => {
  return Patient.findAll({
    where: { registered_by: registered_by_id},
    attributes: { exclude: ['deleted_at'] },
    order: [['created_at', 'DESC']],
  });
};

const findAllByHospital = async (hospitalId) => {
   return  Patient.findAll({
    include: [{
      model: User,
      as: 'user',
      where: { hospital_id: hospitalId, is_active: true },
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
    }],
  });
}

const findById = async (id) => {
  return Patient.findByPk(id);
};

const findByIdAndRegistrarId = async (id, registered_by_id) => {
  return Patient.findOne({ where: { id, registered_by : registered_by_id} });
};

const update = async (patient, data) => {
  return patient.update(data);
};

export { create, findAll, findById, findByIdAndRegistrarId,findAllByHospital , update };
