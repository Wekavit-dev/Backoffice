// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAdmins = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/admin/list`).then(handleResponse).catch(handleError);
};

const createAdmin = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD}/admin/add`, data).then(handleResponse).catch(handleError);
};

const UpdateAdmin = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/admin/update/?id=${id}`, data).then(handleResponse).catch(handleError);
};

const AdminsApi = {
  getAdmins,
  createAdmin,
  UpdateAdmin
};

export default AdminsApi;
