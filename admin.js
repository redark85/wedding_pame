const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "pame&stefano2026";

const mockGuests = [
  { id: 1, fullName: "María Elena Vargas", attendance: "yes", dietary: "Vegetariana", submittedAt: "2026-08-28T18:34:00" },
  { id: 2, fullName: "Juan Carlos Pérez", attendance: "yes", dietary: "", submittedAt: "2026-08-28T19:12:00" },
  { id: 3, fullName: "Ana Lucía Gómez + acompañante", attendance: "yes", dietary: "Alergia a frutos secos", submittedAt: "2026-08-29T09:45:00" },
  { id: 4, fullName: "Roberto Andrade", attendance: "no", dietary: "", submittedAt: "2026-08-29T11:20:00" },
  { id: 5, fullName: "Daniela Salazar", attendance: "yes", dietary: "Sin gluten", submittedAt: "2026-08-29T14:05:00" },
  { id: 6, fullName: "Familia Morales (3 personas)", attendance: "yes", dietary: "Una persona vegetariana", submittedAt: "2026-08-30T08:10:00" },
  { id: 7, fullName: "Luis Fernando Díaz", attendance: "no", dietary: "", submittedAt: "2026-08-30T10:30:00" },
  { id: 8, fullName: "Carmen Jiménez", attendance: "yes", dietary: "", submittedAt: "2026-08-30T12:15:00" },
  { id: 9, fullName: "Pedro Antonio Suárez", attendance: "yes", dietary: "Diabético", submittedAt: "2026-08-30T16:50:00" },
  { id: 10, fullName: "Isabel Miranda", attendance: "yes", dietary: "", submittedAt: "2026-08-30T19:22:00" }
];

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("adminLogin");
  const dashboardSection = document.getElementById("adminDashboard");
  const loginForm = document.getElementById("adminLoginForm");
  const loginError = document.getElementById("adminLoginError");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  const searchInput = document.getElementById("adminSearch");
  const filterSelect = document.getElementById("adminFilter");
  const guestsBody = document.getElementById("adminGuestsBody");
  const summary = document.getElementById("adminSummary");
  const empty = document.getElementById("adminEmpty");

  function isLoggedIn() {
    return sessionStorage.getItem("adminLoggedIn") === "true";
  }

  function showDashboard() {
    if (loginSection) loginSection.hidden = true;
    if (dashboardSection) {
      dashboardSection.hidden = false;
      dashboardSection.style.display = "block";
    }

    renderGuests();
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    loginError.textContent = "";
    loginForm.reset();
  }

  function formatDate(isoString) {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function attendanceLabel(value) {
    return value === "yes" ? "Asistirá" : "No asistirá";
  }

  function updateSummary(guests) {
    const total = guests.length;
    const confirmed = guests.filter((g) => g.attendance === "yes").length;
    const declined = guests.filter((g) => g.attendance === "no").length;
    summary.innerHTML = `
      <div class="admin-stat"><strong>${total}</strong><span>Total</span></div>
      <div class="admin-stat admin-stat--confirmed"><strong>${confirmed}</strong><span>Confirman</span></div>
      <div class="admin-stat admin-stat--declined"><strong>${declined}</strong><span>No asisten</span></div>
    `;
  }

  function renderGuests() {
    if (!searchInput || !filterSelect || !guestsBody || !summary || !empty) {
      console.error("Faltan elementos del dashboard", { searchInput, filterSelect, guestsBody, summary, empty });
      return;
    }

    const query = (searchInput.value || "").toLowerCase().trim();
    const filter = filterSelect.value;

    const filtered = mockGuests.filter((guest) => {
      const matchesSearch = guest.fullName.toLowerCase().includes(query);
      const matchesFilter = filter === "all" || guest.attendance === filter;
      return matchesSearch && matchesFilter;
    });

    updateSummary(filtered);
    guestsBody.innerHTML = "";

    if (filtered.length === 0) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    filtered.forEach((guest) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Nombre">${guest.fullName}</td>
        <td data-label="Asistencia"><span class="admin-badge ${guest.attendance === "yes" ? "admin-badge--confirmed" : "admin-badge--declined"}">${attendanceLabel(guest.attendance)}</span></td>
        <td data-label="Restricciones">${guest.dietary || "—"}</td>
        <td data-label="Fecha">${formatDate(guest.submittedAt)}</td>
      `;
      guestsBody.appendChild(row);
    });
  }

  if (isLoggedIn()) {
    showDashboard();
  } else {
    showLogin();
  }

  function handleLogin(event) {
    if (event) event.preventDefault();

    const userEl = document.getElementById("adminUser");
    const passEl = document.getElementById("adminPassword");

    if (!userEl || !passEl) {
      console.error("No se encontraron los campos de login");
      return;
    }

    const user = userEl.value.trim();
    const password = passEl.value;

    if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminLoggedIn", "true");
      showDashboard();
    } else {
      loginError.textContent = "Usuario o contraseña incorrectos.";
    }
  }

  if (!loginForm) {
  } else {
    loginForm.addEventListener("submit", handleLogin);
  }

  const loginBtn = document.querySelector(".admin-submit");
  if (loginBtn) {
    loginBtn.addEventListener("click", (event) => {
      event.preventDefault();
      handleLogin(event);
    });
  }

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminLoggedIn");
    showLogin();
  });

  searchInput.addEventListener("input", renderGuests);
  filterSelect.addEventListener("change", renderGuests);
});
