import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const getAllTodayUsers = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/system/users/today`).then(handleResponse).catch(handleError);
};
//{code : }

const UsersApi = {
  getAllTodayUsers
};

export default UsersApi;
