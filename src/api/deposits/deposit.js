import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAllDepositsByCountry = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);

  return axiosInstanceWithToken
    .get(`${IP_ADD}/system/deposits/country/?idCountry=${data?.idCountry}`)
    .then(handleResponse)
    .catch(handleError);
};

// req.body.idCountry

const validDeposit = async (userId, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/depot/valid/?id=${userId}`, data).then(handleResponse).catch(handleError);
};

const getAllDepositsByCode = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/depot/list/code`).then(handleResponse).catch(handleError);
};
//{code : }

const DepositsApi = {
  getAllDepositsByCountry,
  getAllDepositsByCode,
  validDeposit
};

export default DepositsApi;
