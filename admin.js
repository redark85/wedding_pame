import { supabase } from "./supabase-client.js";

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

  function showDashboard() {
    if (loginSection) loginSection.hidden = true;
    if (dashboardSection) {
      dashboardSection.hidden = false;
      dashboardSection.style.display = "block";
    }
    loadGuests();
  }

  function showLogin(message = "") {
    if (loginSection) loginSection.hidden = false;
    if (dashboardSection) dashboardSection.hidden = true;
    if (loginError) loginError.textContent = message;
    if (loginForm) loginForm.reset();
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
    if (!summary) return;
    const total = guests.length;
    const confirmed = guests.filter((g) => g.attendance === "yes").length;
    const declined = guests.filter((g) => g.attendance === "no").length;
    summary.innerHTML = `
      <div class="admin-stat"><strong>${total}</strong><span>Total</span></div>
      <div class="admin-stat admin-stat--confirmed"><strong>${confirmed}</strong><span>Confirman</span></div>
      <div class="admin-stat admin-stat--declined"><strong>${declined}</strong><span>No asisten</span></div>
    `;
  }

  function renderGuests(guests) {
    if (!searchInput || !filterSelect || !guestsBody || !summary || !empty) {
      console.error("Faltan elementos del dashboard", { searchInput, filterSelect, guestsBody, summary, empty });
      return;
    }

    const query = (searchInput.value || "").toLowerCase().trim();
    const filter = filterSelect.value;

    const filtered = guests.filter((guest) => {
      const matchesSearch = (guest.full_name || "").toLowerCase().includes(query);
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
        <td data-label="Nombre">${guest.full_name}</td>
        <td data-label="Asistencia"><span class="admin-badge ${guest.attendance === "yes" ? "admin-badge--confirmed" : "admin-badge--declined"}">${attendanceLabel(guest.attendance)}</span></td>
        <td data-label="Restricciones">${guest.dietary || "—"}</td>
        <td data-label="Fecha">${formatDate(guest.submitted_at)}</td>
      `;
      guestsBody.appendChild(row);
    });
  }

  async function loadGuests() {
    if (!guestsBody) return;
    guestsBody.innerHTML = `<tr><td colspan="4" style="text-align:center">Cargando confirmaciones…</td></tr>`;

    const { data, error } = await supabase
      .from("rsvp")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error cargando invitados:", error);
      guestsBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red">No se pudieron cargar los datos.</td></tr>`;
      return;
    }

    renderGuests(data || []);
  }

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  async function handleLogin(event) {
    if (event) event.preventDefault();

    const emailEl = document.getElementById("adminEmail");
    const passEl = document.getElementById("adminPassword");

    if (!emailEl || !passEl) {
      console.error("No se encontraron los campos de login");
      return;
    }

    const email = emailEl.value.trim();
    const password = passEl.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (loginError) loginError.textContent = "Usuario o contraseña incorrectos.";
      console.error("Error de autenticación:", error);
      return;
    }

    showDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const loginBtn = document.querySelector(".admin-submit");
  if (loginBtn) {
    loginBtn.addEventListener("click", (event) => {
      event.preventDefault();
      handleLogin(event);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      showLogin();
    });
  }

  if (searchInput) searchInput.addEventListener("input", () => loadGuests());
  if (filterSelect) filterSelect.addEventListener("change", () => loadGuests());

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      showDashboard();
    } else if (event === "SIGNED_OUT") {
      showLogin();
    }
  });

  checkSession();
});
