import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add

const filterSavingsForInvestment = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);

  return axiosInstanceWithToken
    .get(`${IP_ADD}/system/savings/filtering/investment`, {
      params: data // Pass the 'data' object directly as 'params' for the GET request
    })
    .then(handleResponse)
    .catch(handleError);
};

const getCountries = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/country/list`).then(handleResponse).catch(handleError);
};

const getCurriences = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/devise/list`).then(handleResponse).catch(handleError);
};

const getSavingTypes = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/type/list`).then(handleResponse).catch(handleError);
};
// idUser: req.query.id.toString(),

const locekdSavesApi = {
  getCountries,
  filterSavingsForInvestment,
  getCurriences,
  getSavingTypes
};

export default locekdSavesApi;
