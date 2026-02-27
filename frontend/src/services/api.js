const API_URL = "/api"; 

export const api = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: data ? JSON.stringify(data) : undefined
  });

  const json = await res.json();

  if (!res.ok) throw json;

  return json;
};
