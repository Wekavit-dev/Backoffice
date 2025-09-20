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

// 🔥 Nouveau : Users avec peu de dépôts
const getUsersWithFewDeposits = async (token, countryId, topSecretkey) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken
    .get(`${IP_ADD}/system/users/fewDeposits`, {
      params: { countryId, topSecretkey }
    })
    .then(handleResponse)
    .catch(handleError);
};

// 🔥 Nouveau : Users avec dépôt mais sans plans
const getUsersWithDepositNoPlans = async (token, countryId, topSecretkey) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken
    .get(`${IP_ADD}/system/users/depositNoplans`, {
      params: { countryId, topSecretkey }
    })
    .then(handleResponse)
    .catch(handleError);
};

// 🔥 Nouveau : Meilleurs épargnants du système
const getBestSavers = async (token, params) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);

  // Filter out undefined/null values to avoid sending empty params
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([value]) => value !== undefined && value !== null && value !== '')
  );

  return await axiosInstanceWithToken
    .get(`${IP_ADD}/system/saves/best`, {
      params: filteredParams
    })
    .then(handleResponse)
    .catch(handleError);
};

const systemApi = {
  getAllTodayUsers,
  getAllTodayDeposits,
  getAllTodayWithdrawls,
  getAllTodayAddsOn,
  getAdminHistory,
  getUsersWithFewDeposits,
  getUsersWithDepositNoPlans,
  getBestSavers // 👈 nouveau endpoint ajouté
};

export default systemApi;
