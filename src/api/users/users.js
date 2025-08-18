// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAllUsers = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/users`, data, token).then(handleResponse).catch(handleError);
};

const getTodayUsers = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/users/today`).then(handleResponse).catch(handleError);
};

const deleteUser = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.delete(`${IP_ADD}/user/delete/?id=${data.id}`).then(handleResponse).catch(handleError);
};

const UpdateUser = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/system/user/update/?id=${id}`, data).then(handleResponse).catch(handleError);
};

const getUserByEmail = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/users/mail/?email=${data.email}`).then(handleResponse).catch(handleError);
};

const getUserHistory = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${IP_ADD}/system/users/history/?idUser=${data.idUser}&&total=${data.total}`)
    .then(handleResponse)
    .catch(handleError);
};

const getUserBalanceHistory = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${IP_ADD}/system/users/history/balance/?idUser=${data.idUser}&&total=${data.total}`)
    .then(handleResponse)
    .catch(handleError);
};

const getAllUsersByCountry = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${IP_ADD}/agent/email/?idcountry=${data?.email}&&total=${data?.total}`)
    .then(handleResponse)
    .catch(handleError);
};

const UsersApi = {
  getAllUsers,
  deleteUser,
  UpdateUser,
  getUserByEmail,
  getAllUsersByCountry,
  getTodayUsers,
  getUserHistory,
  getUserBalanceHistory
};

export default UsersApi;
