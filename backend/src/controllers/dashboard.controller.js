import {sendSuccess} from "../utils/response-helper.js";
import * as dashboardService from "../services/dashboard.service.js";
const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard(req.user.hospitalId , req.user.id);
    return sendSuccess(res, 200, 'Admin dashboard data retrieved', data);
  } catch (error) {
    next(error);
  }
};

const getReceptionistDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getReceptionistDashboard(req.user.hospitalId );
    return sendSuccess(res, 200, 'Receptionist dashboard data retrieved', data);
  } catch (error) {
    next(error);
  }
};

const getDoctorDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDoctorDashboard(req.user.id);
    return sendSuccess(res, 200, 'Doctor dashboard data retrieved', data);
  } catch (error) {
    next(error);
  }
};

export { getAdminDashboard, getReceptionistDashboard, getDoctorDashboard };
