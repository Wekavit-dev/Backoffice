// import { instance } from '../utils/utils';
import { instanceAuth } from 'api/utils/utilsAuth';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';

// const IP_ADD = `http://192.168.40.75:8000/api/test`;

const signIn = async (data) => {
  return await instanceAuth.put(`${IP_ADD}/agent/signin`, data).then(handleResponse).catch(handleError);
};

const AuthentificationApi = {
  signIn
};

export default AuthentificationApi;
