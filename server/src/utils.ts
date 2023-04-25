import axios from "axios";

export const encodeBase64 = (client_id: string, client_secret: string) => {
  const data = `${client_id}:${client_secret}`;
  return Buffer.from(data).toString("base64");
};

export const axiosRequest = async (
  endpoint,
  access_token,
  headers = {},
  params = {}
) => {
  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${access_token}`, ...headers },
      params: params,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
