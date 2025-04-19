import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';
// /interest/add
const getAgentHistory = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  console.log(data);
  return axiosInstanceWithToken.get(`${IP_ADD}/history/?total=${data?.total}`).then(handleResponse).catch(handleError);
};

// req.body.idCountry

// const validDeposit = async (data) => {
//   console.log(data);
//   return instance.get(`${IP_ADD}/depot/valid/?id=${data?.id}`).then(handleResponse).catch(handleError);
// };
// req.body.idDepot && req.body.valid || !req.body.montan
// idUser: req.query.id.toString(),

// const getAllDepositsByCode = async () => {
//   return instance.get(`${IP_ADD}/depot/list/code`).then(handleResponse).catch(handleError);
// };
//{code : }

const HistoryApi = {
  getAgentHistory
  //   getAllDepositsByCode,
  //   validDeposit
};

export default HistoryApi;
