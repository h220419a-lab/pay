const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5155/api";

export async function api(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Make sure the C# backend is running.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload.message ?? "Request failed.";
    throw new Error(message);
  }

  return payload;
}
