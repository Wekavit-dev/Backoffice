// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAllDeposits = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/deposits/list`).then(handleResponse).catch(handleError);
};

const getAllTodayDeposits = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/Savings/today`).then(handleResponse).catch(handleError);
};

const getAllDepositsByUserMail = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/deposits/user/?email=${data.email}`).then(handleResponse).catch(handleError);
};

const DepositsApi = {
  getAllDeposits,
  getAllDepositsByUserMail,
  getAllTodayDeposits
};

export default DepositsApi;
