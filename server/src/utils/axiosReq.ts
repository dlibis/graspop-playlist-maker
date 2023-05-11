import axios from 'axios';
import redisClient from './redis';
import { checkToken } from '@/middlewares/checkToken';

const axiosReq = () => {
  const defaultOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Create instance
  let instance = axios.create(defaultOptions);

  // Set the AUTH token for any request
  instance.interceptors.request.use(async (req) => {
    const token = await checkToken();
    req.headers.Authorization = token ? `Bearer ${token}` : '';
    console.log('Request:', JSON.stringify(req.headers, null, 2));
    return req;
  });

  return instance;
};

export default axiosReq();
