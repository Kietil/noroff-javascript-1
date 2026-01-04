const BASE_URL = "https://v2.api.noroff.dev";
const GAMEHUB_URL = `${BASE_URL}/gamehub`;

// Fetch, parse JSON, throw error
async function requestJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error("Network error: Could not reach the API. Try again.");
  }

  // If parsing fails, treat as 'unexpected server response'.
  let payload;
  try {
    payload = await response.json();
  } catch (parseError) {
    throw new Error("Server returned invalid JSON.");
  }

  if (!response.ok) {
    const apiMessage = payload?.errors?.[0]?.message;
    throw new Error(apiMessage || "API error: Request failed.");
  }

  return payload;
}

// Fetch all products.
export async function fetchProducts() {
  const payload = await requestJson(GAMEHUB_URL);

  if (!payload || !Array.isArray(payload.data)) {
    throw new Error("Unexpected API format: expected an array.");
  }

  return payload.data;
}

// Fetch a single product by id.
export async function fetchProduct(id) {
  if (!id) {
    throw new Error("Missing product id in URL.");
  }

  const payload = await requestJson(`${GAMEHUB_URL}/${encodeURIComponent(id)}`);

  if (!payload || !payload.data) {
    throw new Error("Unexpected API format: expected an object.");
  }

  return payload.data;
}
