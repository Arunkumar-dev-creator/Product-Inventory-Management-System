/* =====================================================
   AUTHENTICATION USING LOCAL STORAGE
===================================================== */

const USERS_KEY = "inventory_users";
const SESSION_KEY = "inventory_session";

/* ---------- Helpers ---------- */
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
const saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

/* ---------- Register ---------- */
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    let users = getUsers();

    if (users.find((u) => u.email === email)) {
      alert("User already exists");
      return;
    }

    users.push({ id: Date.now(), name, email, password });
    saveUsers(users);

    alert("Account created! Please login");
    window.location.href = "index.html"; // go to login
  });
}

/* ---------- Login ---------- */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const user = getUsers().find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) return alert("Invalid credentials");

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.location.href = "dashboard.html"; // go to dashboard
  });
}

/* ---------- Protect Dashboard ---------- */
if (window.location.pathname.includes("dashboard.html")) {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) {
    window.location.href = "index.html"; // if not logged in
  }
}

/* ---------- Logout ---------- */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}
