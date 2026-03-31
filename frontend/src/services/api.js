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
    const message =
      data.message ||
      data.error ||
      data.msg ||
      "Erreur serveur";

    // ✅ IMPORTANT
    throw {
      status: res.status,
      message: message
    };
  }

  return data;
}