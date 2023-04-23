export const encodeBase64 = (client_id: string, client_secret: string) => {
  const data = `${client_id}:${client_secret}`;
  return Buffer.from(data).toString("base64");
};
