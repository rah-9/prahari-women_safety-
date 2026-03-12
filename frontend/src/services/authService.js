import { API_URL, getHeaders } from './config';

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const register = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
