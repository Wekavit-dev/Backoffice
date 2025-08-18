// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAllSavings = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/allsaves/list`, data).then(handleResponse).catch(handleError);
};

const getTodaySavings = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/Savings/today`).then(handleResponse).catch(handleError);
};

const getUserSavingsByEmail = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/allsaves/list/mail/?email=${data.email}`).then(handleResponse).catch(handleError);
};

const getAllTodaySavings = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/allsaves/today/list`).then(handleResponse).catch(handleError);
};

const SavingsApi = {
  getAllSavings,
  getUserSavingsByEmail,
  getAllTodaySavings,
  getTodaySavings
};

export default SavingsApi;
