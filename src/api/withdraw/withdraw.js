import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add

const getWithdrawsByCountry = async (data, token) => {
  console.log(data);
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${IP_ADD}/system/withdraws/country/?idCountry=${data?.idCountry}`)
    .then(handleResponse)
    .catch(handleError);
};

const validWithdraw = async (userId, data, token) => {
  console.log('=======', data, userId);
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/withdraw/valid/?id=${userId}`, data).then(handleResponse).catch(handleError);
};
// idUser: req.query.id.toString(),

const WithdrawApi = {
  validWithdraw,
  getWithdrawsByCountry
};

export default WithdrawApi;
