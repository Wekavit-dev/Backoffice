import axios from 'axios';

export const instanceAuth = axios.create({
  withCredentials: false,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    // 'content-type': 'multipart/form-data'
  }
});
