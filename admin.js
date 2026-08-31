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

  let allGuests = [];

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

  async function updateAttendance(id, attendance, dietary = null) {
    const updateData = { attendance };
    if (dietary !== undefined) {
      updateData.dietary = dietary || null;
    }

    const { error } = await supabase
      .from("rsvp")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error actualizando asistencia:", error);
      alert("No se pudo actualizar el estado de asistencia.");
      return;
    }

    await loadGuests();
  }

  async function deleteGuest(id) {
    if (!confirm("¿Seguro que quieres eliminar esta confirmación?")) return;

    const { error } = await supabase
      .from("rsvp")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando invitado:", error);
      alert("No se pudo eliminar la confirmación.");
      return;
    }

    await loadGuests();
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
      const oppositeBtn = guest.attendance === "yes"
        ? `<button type="button" class="btn btn--small btn--danger" data-action="no" data-id="${guest.id}">No asistirá</button>`
        : `<button type="button" class="btn btn--small btn--success" data-action="yes" data-id="${guest.id}">Sí asistirá</button>`;

      const row = document.createElement("tr");
      row.dataset.id = guest.id;
      row.innerHTML = `
        <td data-label="Nombre">${guest.full_name}</td>
        <td data-label="Asistencia"><span class="admin-badge ${guest.attendance === "yes" ? "admin-badge--confirmed" : "admin-badge--declined"}">${attendanceLabel(guest.attendance)}</span></td>
        <td data-label="Restricciones">${guest.dietary || "—"}</td>
        <td data-label="Fecha">${formatDate(guest.submitted_at)}</td>
        <td data-label="Acciones">
          <div class="admin-actions">
            ${oppositeBtn}
            <button type="button" class="btn btn--small btn--outline" data-action="delete" data-id="${guest.id}">Eliminar</button>
          </div>
        </td>
      `;
      guestsBody.appendChild(row);
    });

    guestsBody.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        const target = event.currentTarget;
        const action = target.dataset.action;
        const id = target.dataset.id;

        target.disabled = true;
        try {
          if (action === "yes") {
            const guest = allGuests.find((g) => g.id === id);
            const currentDietary = guest ? guest.dietary : "";
            const dietary = prompt(
              "¿Tiene restricciones alimenticias? (déjalo vacío si no aplica)",
              currentDietary || ""
            );
            if (dietary === null) return; // Cancelar no hace nada
            await updateAttendance(id, "yes", dietary.trim() || null);
          } else if (action === "no") {
            await updateAttendance(id, "no");
          } else if (action === "delete") {
            await deleteGuest(id);
          }
        } finally {
          target.disabled = false;
        }
      });
    });
  }

  function applyFilters() {
    renderGuests(allGuests);
  }

  async function loadGuests() {
    if (!guestsBody) return;
    guestsBody.innerHTML = `<tr><td colspan="5" style="text-align:center">Cargando confirmaciones…</td></tr>`;

    const { data, error } = await supabase
      .from("rsvp")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error cargando invitados:", error);
      guestsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red">No se pudieron cargar los datos.</td></tr>`;
      return;
    }

    allGuests = data || [];
    renderGuests(allGuests);
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

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (filterSelect) filterSelect.addEventListener("change", applyFilters);

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      showDashboard();
    } else if (event === "SIGNED_OUT") {
      showLogin();
    }
  });

  checkSession();
});
