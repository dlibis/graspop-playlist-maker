import axios, { AxiosInstance } from 'axios';
import { checkToken } from '@/middlewares/checkToken';

const axiosReq = (sid: string, options = {}) => {
  const defaultOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (!sid) throw new Error('you need to re-login');
  const userId = sid?.split('.').at(0);
  // Create instance
  let instance = axios.create(defaultOptions);
  // Set the AUTH token for any request
  instance.interceptors.request.use(async (req) => {
    const token = await checkToken(userId);
    req.headers.Authorization = token ? `Bearer ${token}` : '';
    return req;
  });

  return instance;
};

export default axiosReq;
