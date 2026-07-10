import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const BASE = `${IP_ADD}/sss`;

const withToken = (token) => setupAxiosInterceptors(token);

const getBoard = async (params, token) =>
  withToken(token).get(`${BASE}/board`, { params }).then(handleResponse).catch(handleError);

const generateBoard = async (data, token) =>
  withToken(token).post(`${BASE}/board/generate`, data || {}).then(handleResponse).catch(handleError);

const listTasks = async (params, token) =>
  withToken(token).get(`${BASE}/tasks`, { params }).then(handleResponse).catch(handleError);

const getOverdueTasks = async (token) =>
  withToken(token).get(`${BASE}/tasks/overdue`).then(handleResponse).catch(handleError);

const updateTask = async (id, data, token) =>
  withToken(token).patch(`${BASE}/tasks/${id}`, data).then(handleResponse).catch(handleError);

const carryTask = async (id, data, token) =>
  withToken(token).post(`${BASE}/tasks/${id}/carry`, data || {}).then(handleResponse).catch(handleError);

const listUsers = async (params, token) =>
  withToken(token).get(`${BASE}/users`, { params }).then(handleResponse).catch(handleError);

const getUserFiche = async (id, token) =>
  withToken(token).get(`${BASE}/users/${id}`).then(handleResponse).catch(handleError);

const overrideStage = async (id, data, token) =>
  withToken(token).patch(`${BASE}/users/${id}/stage`, data).then(handleResponse).catch(handleError);

const setNba = async (id, data, token) =>
  withToken(token).patch(`${BASE}/users/${id}/nba`, data).then(handleResponse).catch(handleError);

const addNote = async (id, data, token) =>
  withToken(token).post(`${BASE}/users/${id}/notes`, data).then(handleResponse).catch(handleError);

const snoozeUser = async (id, data, token) =>
  withToken(token).post(`${BASE}/users/${id}/snooze`, data).then(handleResponse).catch(handleError);

const recomputeUser = async (id, token) =>
  withToken(token).post(`${BASE}/recompute/${id}`).then(handleResponse).catch(handleError);

const runBackfill = async (params, token) =>
  withToken(token).post(`${BASE}/backfill`, {}, { params }).then(handleResponse).catch(handleError);

const getConfig = async (token) =>
  withToken(token).get(`${BASE}/config`).then(handleResponse).catch(handleError);

const updateConfig = async (data, token) =>
  withToken(token).put(`${BASE}/config`, data).then(handleResponse).catch(handleError);

const getMetrics = async (token) =>
  withToken(token).get(`${BASE}/metrics`).then(handleResponse).catch(handleError);

const SssApi = {
  getBoard,
  generateBoard,
  listTasks,
  getOverdueTasks,
  updateTask,
  carryTask,
  listUsers,
  getUserFiche,
  overrideStage,
  setNba,
  addNote,
  snoozeUser,
  recomputeUser,
  runBackfill,
  getConfig,
  updateConfig,
  getMetrics
};

export default SssApi;
