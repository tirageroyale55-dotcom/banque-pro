export async function api(path, method = "GET", body) {
  const token = localStorage.getItem("token");

  const res = await fetch("https://banque-pro.vercel.app/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur API");
  }

  return data;
}