// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const getAllTodayUsers = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken.get(`${IP_ADD}/system/users/today`).then(handleResponse).catch(handleError);
};

const getAllTodayDeposits = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken.get(`${IP_ADD}/system/deposits/today`).then(handleResponse).catch(handleError);
};

const getAllTodayWithdrawls = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken.get(`${IP_ADD}/system/withdraws/today`).then(handleResponse).catch(handleError);
};

const getAllTodayAddsOn = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken.get(`${IP_ADD}/system/addson/today`).then(handleResponse).catch(handleError);
};

const getAdminHistory = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken.get(`${IP_ADD}/history`).then(handleResponse).catch(handleError);
};

const systemApi = {
  getAllTodayUsers,
  getAllTodayDeposits,
  getAllTodayWithdrawls,
  getAllTodayAddsOn,
  getAdminHistory
};

export default systemApi;
