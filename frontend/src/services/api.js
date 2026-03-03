export async function api(path, method = "GET", body) {
  const token = localStorage.getItem("token");

  const res = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data;

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // 🔥 on récupère TOUS les formats possibles
    const message =
      data.message ||
      data.error ||
      data.msg ||
      "Erreur serveur";

    throw new Error(message);
  }

  return data;
}