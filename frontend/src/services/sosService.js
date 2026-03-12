import { API_URL, getHeaders } from './config';

export const triggerSOS = async (lng, lat) => {
  const res = await fetch(`${API_URL}/sos/trigger`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ lng, lat }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const cancelSOS = async (sosId) => {
  const res = await fetch(`${API_URL}/sos/cancel/${sosId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
export const resolveSOS = async (sosId) => {
  const res = await fetch(`${API_URL}/sos/resolve/${sosId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
