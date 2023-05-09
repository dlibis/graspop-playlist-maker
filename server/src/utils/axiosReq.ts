import axios from 'axios';
import redisClient from './redis';
import { checkToken } from '@/middlewares/checkToken';

const axiosReq = () => {
  const defaultOptions = {
    //baseURL: 'http://localhost:5000',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Create instance
  let instance = axios.create(defaultOptions);

  // Set the AUTH token for any request
  instance.interceptors.request.use(async (config) => {
    const token = await checkToken();
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    config.headers.test = 'I am only a header!';
    return config;
  });
  //   instance.interceptors.request.use((request) => {
  //     console.log('Request:', JSON.stringify(request.headers, null, 2));
  //     return request;
  //   });

  return instance;
};

export default axiosReq();
