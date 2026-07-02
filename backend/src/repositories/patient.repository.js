
import db from '../models/index.js';

const {Patient , User}= db;

const create = async (data) => {
  return Patient.create(data);
};

const findAll = async (hospitalId) => {
  return  Patient.findAll({
    include: [{
      model: User,
      as: 'registeredBy',
      where: { hospital_id: hospitalId, is_active: true },
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
    }],
  });
};

const findAllByHospital = async (hospitalId) => {
   return  Patient.findAll({
    include: [{
      model: User,
      as: 'registeredBy',
      where: { hospital_id: hospitalId, is_active: true },
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
    }],
  });
}

const findById = async (id) => {
  return Patient.findByPk(id);
};

const findByIdAndHospitalId = async (id, hospital_id) => {
  return Patient.findOne({ 
     where: {
      id,
    },
     include: [{
      model: User,
      as: 'registeredBy',
      where: { hospital_id: hospital_id, is_active: true },
      attributes: ['id', 'full_name', 'email', 'hospital_id'],
    }],
   });
};

const update = async (patient, data) => {
  return patient.update(data);
};

export { create, findAll, findById, findByIdAndHospitalId,findAllByHospital , update };
