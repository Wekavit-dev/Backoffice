// import { instance } from '../utils/utils';
import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAgents = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/agent/list`).then(handleResponse).catch(handleError);
};

const createAgent = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD}/agent/add`, data).then(handleResponse).catch(handleError);
};

const deleteAgent = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.delete(`${IP_ADD}/agent/delete/?id=${data.id}`).then(handleResponse).catch(handleError);
};

const UpdateAgent = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/agent/update/?id=${id}`, data).then(handleResponse).catch(handleError);
};

const ValidAgent = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD}/agent/valid/?id=${id}`, data).then(handleResponse).catch(handleError);
};

const getAgentByEmail = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD}/agent/email/?email=${data.email}`).then(handleResponse).catch(handleError);
};

const AgentApi = {
  getAgents,
  createAgent,
  deleteAgent,
  UpdateAgent,
  ValidAgent,
  getAgentByEmail
};

export default AgentApi;
