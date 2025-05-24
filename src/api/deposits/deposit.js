import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const getAllTodayDeposits = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/deposits/today`).then(handleResponse).catch(handleError);
};
//{code : }

const DepositsApi = {
  getAllTodayDeposits
};

export default DepositsApi;
