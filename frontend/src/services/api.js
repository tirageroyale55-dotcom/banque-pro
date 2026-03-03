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

  // Toujours parser la réponse
  const data = await res.json().catch(() => ({}));

  // Si erreur HTTP, throw
  if (!res.ok) {
    // Si backend renvoie message, on l'utilise
    throw new Error(data.message || "Erreur API");
  }

  // Si data n’est pas un tableau, on renvoie un tableau vide
  return Array.isArray(data) ? data : data;
}