import corsAnywhere from 'cors-anywhere';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  accept: 'text/html',
};
// proxy server
const proxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  // requireHeaders: [], // Do not require any headers.
  removeHeaders: [], // Do not remove any headers.
  credentials: 'include',
  setHeaders: headers, // set the headers in the request
});

export default proxy;
