import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

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

const getMe = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/admin/me`).then(handleResponse).catch(handleError);
};

const getMenuCatalog = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/admin/menus/catalog`).then(handleResponse).catch(handleError);
};

const getAdminMenuAccess = async (adminId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/admin/${adminId}/menu-access`).then(handleResponse).catch(handleError);
};

const updateAdminMenuAccess = async (adminId, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/admin/${adminId}/menu-access`, data).then(handleResponse).catch(handleError);
};

const AdminsApi = {
  getAdmins,
  createAdmin,
  UpdateAdmin,
  getMe,
  getMenuCatalog,
  getAdminMenuAccess,
  updateAdminMenuAccess
};

export default AdminsApi;
