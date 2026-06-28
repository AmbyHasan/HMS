
import {User, Hospital} from "../models";

const findByEmail = async (email) => {
  return User.findOne({
    where: { email },
    include: [{ model: Hospital, as: 'hospital', attributes: ['id', 'name'] }],
  });
};

const findById = async (id) => {
  return User.findByPk(id, {
    include: [{ model: Hospital, as: 'hospital', attributes: ['id', 'name'] }],
  });
};

const findActiveByEmail = async (email) => {
  return User.findOne({
    where: { email, is_active: true },
  });
};

export { findByEmail, findById, findActiveByEmail };
