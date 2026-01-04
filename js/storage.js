const CART_STORAGE_KEY = "gamehub-cart-v1";
const LAST_ORDER_STORAGE_KEY = "gamehub-last-order-v1";

// localStorage.getItem returns a string (if key exists), null (if key doesn't exist)
function readJson(key, fallbackValue) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallbackValue;

  try {
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  const raw = JSON.stringify(value);
  localStorage.setItem(key, raw);
}

// Expecting array - If not, fall back to []
export function getCart() {
  const cart = readJson(CART_STORAGE_KEY, []);
  return Array.isArray(cart) ? cart : [];
}

// Validation: the cart must be an array.
export function setCart(nextCart) {
  if (!Array.isArray(nextCart)) {
    throw new Error("Cart must be an array.");
  }

  writeJson(CART_STORAGE_KEY, nextCart);
}

// Store the fields needed for checkout UI.
function toCartItem(product, quantity) {
  const id = product?.id;
  if (!id) throw new Error("Cannot add to cart: product is missing id.");

  const title = product?.title || "Untitled";

  // Store the price at the time the item is added.
  // If the API price changes later, existing cart items keep the saved price.
  const unitPrice = Number(product?.discountedPrice ?? product?.price ?? 0);

  const image = {
    url: product?.image?.url || "",
    alt: product?.image?.alt || title,
  };

  return {
    id,
    title,
    unitPrice,
    quantity,
    image,
  };
}

// Cart: If item exists, increment it's quantity, otherwise add a new cart item
export function addToCart(product, quantity = 1) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be a number greater than 0.");
  }

  const cart = getCart();
  const productId = product?.id;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += qty;
    setCart(cart);
    return;
  }

  const nextItem = toCartItem(product, qty);
  const nextCart = [...cart, nextItem];
  setCart(nextCart);
}

// Remove item
export function removeFromCart(productId) {
  const cart = getCart();
  const nextCart = cart.filter((item) => item.id !== productId);
  setCart(nextCart);
}

export function clearCart() {
  setCart([]);
}

// Validation
export function setLastOrder(order) {
  if (!order || typeof order !== "object") {
    throw new Error("Last order must be an object.");
  }

  writeJson(LAST_ORDER_STORAGE_KEY, order);
}

export function getLastOrder() {
  const order = readJson(LAST_ORDER_STORAGE_KEY, null);
  if (!order || typeof order !== "object") return null;
  return order;
}

// Clearing by removing the key
export function clearLastOrder() {
  localStorage.removeItem(LAST_ORDER_STORAGE_KEY);
}

export function getCartTotal(cart) {
  const items = Array.isArray(cart) ? cart : getCart();

  return items.reduce((sum, item) => {
    const unitPrice = Number(item?.unitPrice ?? 0);
    const quantity = Number(item?.quantity ?? 0);
    return sum + unitPrice * quantity;
  }, 0);
}
