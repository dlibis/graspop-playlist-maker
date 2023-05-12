import axios from 'axios';
import { checkToken } from '@/middlewares/checkToken';

// type Props = {
//   userId?: string;
//   options?: Record<string, any>;
// };
const axiosReq = (sid: string, options = {}) => {
  const defaultOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const userId = sid?.split('.').at(0);
  // Create instance
  let instance = axios.create(defaultOptions);
  // Set the AUTH token for any request
  instance.interceptors.request.use(async (req) => {
    const token = await checkToken(userId);
    req.headers.Authorization = token ? `Bearer ${token}` : '';
    //console.log('Request:', JSON.stringify(req.headers, null, 2));
    return req;
  });

  return instance;
};

export default axiosReq;
