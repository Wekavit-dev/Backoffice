import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const getAddsOn = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/addson/list/?total=${data?.total}`).then(handleResponse).catch(handleError);
};

const ChargeAddsOn = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/system/addson/charge`, data).then(handleResponse).catch(handleError);
};

const getTodayAddsOn = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/addson/today/`).then(handleResponse).catch(handleError);
};

const AddsOnApi = {
  getAddsOn,
  ChargeAddsOn,
  getTodayAddsOn
};
export default AddsOnApi;
