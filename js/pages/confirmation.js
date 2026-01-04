import { clearCart, getLastOrder } from "../storage.js";

const confirmationContainer = document.querySelector("#confirmation");
const confirmationSummaryContainer =
  document.querySelector(".checkout-summary");

function formatMoney(amount) {
  const number = Number(amount ?? 0);
  return `$${number.toFixed(2)}`;
}

// Reuse card styles (same as checkout)
function createOrderItemCard(item) {
  const card = document.createElement("article");
  card.className = "games-card";

  const img = document.createElement("img");
  img.src = item?.image?.url || "";
  img.alt = item?.image?.alt || item?.title || "Order item";

  const info = document.createElement("div");
  info.className = "games-info";

  const title = document.createElement("h3");
  title.textContent = item?.title || "Untitled";

  const unitPrice = Number(item?.unitPrice ?? 0);
  const quantity = Number(item?.quantity ?? 0);
  const lineTotal = unitPrice * quantity;

  const meta = document.createElement("p");
  meta.textContent = `Qty: ${quantity} • Price: ${formatMoney(
    unitPrice
  )} • Total: ${formatMoney(lineTotal)}`;

  info.appendChild(title);
  info.appendChild(meta);

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

function clearConfirmationSummary(container) {
  if (!container) return;

  // Remove all children except h1
  while (container.children.length > 1) {
    container.removeChild(container.lastElementChild);
  }
}

function renderOrderSummary(summaryContainer, gridContainer, order) {
  clearConfirmationSummary(summaryContainer);
  if (gridContainer) gridContainer.innerHTML = "";

  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No order details found.";
    if (summaryContainer) summaryContainer.appendChild(p);
    return;
  }

  const heading = document.createElement("h2");
  heading.textContent = "Order summary";

  const total = document.createElement("p");
  total.textContent = `Total paid: ${formatMoney(order.total)}`;

  const grid = document.createElement("div");
  grid.className = "games-grid";

  for (const item of order.items) {
    grid.appendChild(createOrderItemCard(item));
  }

  if (summaryContainer) {
    summaryContainer.appendChild(heading);
    summaryContainer.appendChild(total);
  }

  if (gridContainer) {
    gridContainer.appendChild(grid);
  }
}

// Display order summary and clear cart. Show error if storage fails.
function initConfirmationPage() {
  try {
    const lastOrder = getLastOrder();
    renderOrderSummary(
      confirmationSummaryContainer,
      confirmationContainer,
      lastOrder
    );
    clearCart();
  } catch (error) {
    if (confirmationContainer) {
      confirmationContainer.innerHTML = "";
      const p = document.createElement("p");
      p.className = "error";
      p.textContent =
        error instanceof Error
          ? error.message
          : "Could not load order details.";
      confirmationContainer.appendChild(p);
    }
    clearConfirmationSummary(confirmationSummaryContainer);
  }
}

initConfirmationPage();
