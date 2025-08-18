// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /country/bemnru / add;
// /country/number/delete
// /interest/add
const getCountries = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/country/list`).then(handleResponse).catch(handleError);
};

const createCountry = async (data, token) => {
  console.log('country111', data);
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD}/country/add`, data).then(handleResponse).catch(handleError);
};

const deleteCounrty = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.delete(`${IP_ADD}/country/delete/?id=${data.id}`).then(handleResponse).catch(handleError);
};

const UpdateCountry = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/country/update/?id=${id}`, data).then(handleResponse).catch(handleError);
};

const addOneNumber = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD}/country/number/add`, data).then(handleResponse).catch(handleError);
};
// req.body.id && req.body.number;

const DeleteNumber = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .delete(`${IP_ADD}/country/number/delete/?id=${data?.id}&&numberIndex=${data?.numberIndex}`)
    .then(handleResponse)
    .catch(handleError);
};
// req.body.id && req.body.numberIndex;

const CountryApi = {
  getCountries,
  createCountry,
  deleteCounrty,
  UpdateCountry,
  addOneNumber,
  DeleteNumber
};
export default CountryApi;
