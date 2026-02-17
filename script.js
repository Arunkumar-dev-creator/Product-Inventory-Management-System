/* =====================================================
   LOCAL STORAGE CONFIG
===================================================== */

const LS_KEY = "products_db_v1";

const form = document.getElementById("product-form");
const idInput = document.getElementById("product-id");
const nameInput = document.getElementById("product-name");
const categoryInput = document.getElementById("product-category");
const priceInput = document.getElementById("product-price");
const qtyInput = document.getElementById("product-qty");
const saveBtn = document.getElementById("save-btn");

const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const tableBody = document.querySelector("#product-table tbody");
const emptyMsg = document.getElementById("empty-msg");

const totalCountEl = document.getElementById("total-count");
const totalValueEl = document.getElementById("total-value");

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const clearAllBtn = document.getElementById("clear-all");

let products = [];

/* ---------- STORAGE ---------- */
function loadProducts() {
  try {
    products = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    products = [];
  }
}

function saveProducts() {
  localStorage.setItem(LS_KEY, JSON.stringify(products));
}

/* ---------- HELPERS ---------- */
const generateId = () =>
  "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const formatMoney = (n) =>
  Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const generateSKU = (name = "") => {
  const base =
    name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "PRD";
  return base + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
};

/* ---------- RENDER ---------- */
function renderProducts() {
  let list = [...products];
  const q = searchInput.value.toLowerCase().trim();

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }

  const sortMap = {
    created_asc: (a, b) => a.createdAt - b.createdAt,
    created_desc: (a, b) => b.createdAt - a.createdAt,
    name_asc: (a, b) => a.name.localeCompare(b.name),
    name_desc: (a, b) => b.name.localeCompare(a.name),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    qty_asc: (a, b) => a.qty - b.qty,
    qty_desc: (a, b) => b.qty - a.qty,
  };

  if (sortMap[sortSelect.value]) list.sort(sortMap[sortSelect.value]);

  tableBody.innerHTML = "";
  emptyMsg.style.display = list.length ? "none" : "block";

  list.forEach((p, i) => {
    const value = p.price * p.qty;
    const tr = document.createElement("tr");
    if (p.qty <= 5) tr.classList.add("lowstock");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><b>${p.name}</b><br><small>${p.sku}</small></td>
      <td>${p.category}</td>
      <td>₹ ${formatMoney(p.price)}</td>
      <td>${p.qty}</td>
      <td>₹ ${formatMoney(value)}</td>
      <td>
        <button class="edit" data-id="${p.id}">Edit</button>
        <button class="delete" data-id="${p.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  totalCountEl.textContent = products.length;
  totalValueEl.textContent = formatMoney(
    products.reduce((sum, p) => sum + p.price * p.qty, 0)
  );
}

/* ---------- CRUD ---------- */
function addProduct(p) {
  products.push(p);
  saveProducts();
  renderProducts();
}

function updateProduct(id, data) {
  products = products.map((p) => (p.id === id ? { ...p, ...data } : p));
  saveProducts();
  renderProducts();
}

function removeProduct(id) {
  if (!confirm("Delete this product?")) return;
  products = products.filter((p) => p.id !== id);
  saveProducts();
  renderProducts();
}

/* ---------- FORM ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const price = Number(priceInput.value);
  const qty = Number(qtyInput.value);

  if (!name) return alert("Product name required");

  if (idInput.value) {
    updateProduct(idInput.value, { name, category, price, qty });
  } else {
    addProduct({
      id: generateId(),
      name,
      category,
      price,
      qty,
      sku: generateSKU(name),
      createdAt: Date.now(),
    });
  }

  form.reset();
  idInput.value = "";
  saveBtn.textContent = "Add Product";
});

/* ---------- TABLE ACTIONS ---------- */
tableBody.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  const p = products.find((x) => x.id === id);

  if (e.target.classList.contains("edit") && p) {
    idInput.value = p.id;
    nameInput.value = p.name;
    categoryInput.value = p.category;
    priceInput.value = p.price;
    qtyInput.value = p.qty;
    saveBtn.textContent = "Update Product";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (e.target.classList.contains("delete")) removeProduct(id);
});

/* ---------- SEARCH + SORT ---------- */
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

/* ---------- EXPORT JSON ---------- */
exportBtn.addEventListener("click", () => {
  if (!products.length) return alert("No products to export");

  const blob = new Blob([JSON.stringify(products, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  a.click();
  URL.revokeObjectURL(url);
});

/* ---------- IMPORT JSON ---------- */
importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error();

      products = data;
      saveProducts();
      renderProducts();
      alert("Import successful");
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
});

/* ---------- CLEAR ALL ---------- */
clearAllBtn.addEventListener("click", () => {
  if (!confirm("Delete all products?")) return;
  products = [];
  saveProducts();
  renderProducts();
});

/* ---------- INIT ---------- */
loadProducts();
renderProducts();
