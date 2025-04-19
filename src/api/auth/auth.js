// import { instance } from '../utils/utils';
import { instanceAuth } from 'api/utils/utilsAuth';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

// const IP_ADD = `http://192.168.40.75:8000/api/test`;

const signIn = async (data) => {
  return await instanceAuth.post(`${IP_ADD}/admin/signin`, data).then(handleResponse).catch(handleError);
};

const VerifyCode = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return await axiosInstanceWithToken.post(`${IP_ADD}/admin/verifyCode`, data).then(handleResponse).catch(handleError);
};

const AuthentificationApi = {
  signIn,
  VerifyCode
};

export default AuthentificationApi;
