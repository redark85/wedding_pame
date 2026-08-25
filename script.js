/* =========================================================
   María & Juan — Invitación de boda
   Configuración y lógica del sitio (JavaScript vanilla)
   =========================================================

   Para adaptar esta invitación a otra boda, modifica
   únicamente el objeto `wedding` a continuación.
   ========================================================= */

const wedding = {
  couple: "Pamela Almeida & Estéfano Cevallos",
  date: "12 de diciembre de 2026",
  weddingDate: "2026-12-12T11:30:00",

  ceremony: {
    name: "Hacienda Santa Isabel",
    address: "Aguamaña y Via Antigua, Quito",
    time: "11:30",
    mapsUrl: "https://maps.app.goo.gl/5cDXNtQb9MtbwrJB8?g_st=iw"
  },

  reception: {
    name: "Finca Los Olivos",
    address: "Camino de los Olivos s/n, Madrid",
    time: "18:00",
    mapsUrl: "https://maps.google.com/?q=Finca+Los+Olivos+Madrid"
  },

  dressCode: "Formal / Elegante",

  music: "assets/audio/song.mp3"
};

document.addEventListener("DOMContentLoaded", () => {
  applyWeddingConfig();
  initEnvelopeGate();
  initScrollHint();
  initScrollReveal();
  initOpenInvitation();
  initCountdown();
  initMusicToggle();
  initGallery();
  initRSVPForm();
});

/* ---------------------------------------------------------
   Indicador de "desliza": se oculta en cuanto el usuario
   empieza a hacer scroll
   --------------------------------------------------------- */
function initScrollHint() {
  const hint = document.getElementById("scrollHint");
  if (!hint) return;

  function onScroll() {
    if (window.scrollY > 30) {
      hint.classList.add("is-hidden");
      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------------------------------------------------------
   Sobre de bienvenida: bloquea el scroll hasta que el
   usuario pulsa el sello para "abrir" la invitación
   --------------------------------------------------------- */
function initEnvelopeGate() {
  const gate = document.getElementById("envelopeGate");
  const openBtn = document.getElementById("envelopeOpenBtn");
  const hintBtn = document.getElementById("envelopeHintBtn");

  if (!gate || !openBtn) return;

  document.documentElement.classList.add("scroll-locked");

  function openEnvelope() {
    gate.classList.add("is-open");
    tryPlayMusic();

    const unlock = () => {
      gate.hidden = true;
      document.documentElement.classList.remove("scroll-locked");
    };

    let unlocked = false;
    gate.addEventListener(
      "transitionend",
      () => {
        if (unlocked) return;
        unlocked = true;
        unlock();
      },
      { once: true }
    );

    // Respaldo por si prefers-reduced-motion desactiva la transición
    setTimeout(() => {
      if (unlocked) return;
      unlocked = true;
      unlock();
    }, 1000);
  }

  openBtn.addEventListener("click", openEnvelope);
  if (hintBtn) hintBtn.addEventListener("click", openEnvelope);
}

/* ---------------------------------------------------------
   Aplicar configuración al DOM
   --------------------------------------------------------- */
function applyWeddingConfig() {
  const ceremonyMapsBtn = document.getElementById("ceremonyMapsBtn");
  

  document.getElementById("ceremonyName").textContent = wedding.ceremony.name;
  document.getElementById("ceremonyAddress").textContent = wedding.ceremony.address;
  document.getElementById("ceremonyTime").textContent = `${wedding.ceremony.time} h`;
  if (ceremonyMapsBtn) {
    ceremonyMapsBtn.addEventListener("click", () => {
      window.open(wedding.ceremony.mapsUrl, "_blank", "noopener,noreferrer");
    });
  }

 

  const dressCodeEl = document.getElementById("dressCodeText");
  if (dressCodeEl) dressCodeEl.textContent = wedding.dressCode;
}

/* ---------------------------------------------------------
   Animaciones suaves al hacer scroll (fade/slide discretos)
   --------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Botón "Abrir invitación": scroll + intento de reproducir música
   --------------------------------------------------------- */
function initOpenInvitation() {
  const openBtn = document.getElementById("openInvitationBtn");
  const invitation = document.getElementById("invitation");

  if (!openBtn || !invitation) return;

  openBtn.addEventListener("click", () => {
    invitation.scrollIntoView({ behavior: "smooth", block: "start" });
    tryPlayMusic();
  });
}

/* ---------------------------------------------------------
   Cuenta regresiva
   --------------------------------------------------------- */
function initCountdown() {
  const target = new Date(wedding.weddingDate).getTime();
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  const timerEl = document.getElementById("countdownTimer");
  const messageEl = document.getElementById("countdownMessage");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(intervalId);
      if (timerEl) timerEl.hidden = true;
      if (messageEl) {
        messageEl.hidden = false;
        messageEl.textContent = "¡Hoy celebramos nuestra boda!";
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  update();
  const intervalId = setInterval(update, 1000);
}

/* ---------------------------------------------------------
   Reproductor de música discreto
   --------------------------------------------------------- */
let audioEl;
let musicToggleBtn;
let isPlaying = false;

function initMusicToggle() {
  audioEl = document.getElementById("bgMusic");
  musicToggleBtn = document.getElementById("musicToggle");

  if (!audioEl || !musicToggleBtn) return;

  musicToggleBtn.addEventListener("click", () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      tryPlayMusic();
    }
  });

  audioEl.addEventListener("pause", () => {
    isPlaying = false;
    updateMusicButton();
  });

  audioEl.addEventListener("playing", () => {
    isPlaying = true;
    updateMusicButton();
  });
}

function tryPlayMusic() {
  if (!audioEl) return;

  const playPromise = audioEl.play();

  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        isPlaying = true;
        updateMusicButton();
      })
      .catch(() => {
        // Autoplay bloqueado por el navegador; el usuario deberá
        // pulsar el botón flotante de música manualmente.
        isPlaying = false;
        updateMusicButton();
      });
  }
}

function pauseMusic() {
  if (!audioEl) return;
  audioEl.pause();
  isPlaying = false;
  updateMusicButton();
}

function updateMusicButton() {
  if (!musicToggleBtn) return;
  musicToggleBtn.setAttribute("aria-pressed", String(isPlaying));
  musicToggleBtn.setAttribute(
    "aria-label",
    isPlaying ? "Pausar música" : "Reproducir música"
  );
}

/* ---------------------------------------------------------
   Galería + Lightbox (vanilla)
   --------------------------------------------------------- */
function initGallery() {
  const galleryItems = document.querySelectorAll(".gallery__item");
  if (!galleryItems.length) return;

  let lightbox = document.querySelector(".lightbox");

  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="Cerrar imagen">&times;</button>
      <img src="" alt="" />
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox__close");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const full = item.getAttribute("data-full");
      const img = item.querySelector("img");
      openLightbox(full, img ? img.alt : "");
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}

/* ---------------------------------------------------------
   Formulario RSVP (solo frontend, sin envío a backend todavía)
   --------------------------------------------------------- */
function initRSVPForm() {
  const form = document.getElementById("rsvpForm");
  if (!form) return;

  const fullNameInput = document.getElementById("fullName");
  const fullNameError = document.getElementById("fullNameError");
  const attendanceInput = document.getElementById("attendance");
  const attendanceError = document.getElementById("attendanceError");
  const attendanceBtns = form.querySelectorAll(".attendance-btn");
  const guestsField = document.getElementById("guestsField");
  const guestCountEl = document.getElementById("guestCount");
  const guestMinusBtn = document.getElementById("guestMinus");
  const guestPlusBtn = document.getElementById("guestPlus");
  const dietaryInput = document.getElementById("dietary");
  const dietField = document.getElementById("dietField");
  const messageInput = document.getElementById("message");
  const successBox = document.getElementById("rsvpSuccess");
  const successTitle = document.getElementById("rsvpSuccessTitle");
  const successText = document.getElementById("rsvpSuccessText");
  const submitBtn = document.getElementById("rsvpSubmitBtn");

  let guestCount = 1;
  const MAX_GUESTS = 8;
  const MIN_GUESTS = 1;

  function setAttendance(value) {
    attendanceInput.value = value;
    attendanceBtns.forEach((btn) => {
      const isActive = btn.dataset.value === value;
      btn.setAttribute("aria-pressed", String(isActive));
    });

    const showExtras = value === "yes";
    guestsField.hidden = !showExtras;
    dietField.hidden = !showExtras;
  }

  attendanceBtns.forEach((btn) => {
    btn.addEventListener("click", () => setAttendance(btn.dataset.value));
  });

  // Estado inicial: campos de acompañantes ocultos hasta confirmar asistencia
  guestsField.hidden = true;
  dietField.hidden = true;

  function updateGuestCount(delta) {
    guestCount = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, guestCount + delta));
    guestCountEl.textContent = String(guestCount);
  }

  guestMinusBtn.addEventListener("click", () => updateGuestCount(-1));
  guestPlusBtn.addEventListener("click", () => updateGuestCount(1));

  function clearErrors() {
    fullNameError.textContent = "";
    attendanceError.textContent = "";
  }

  function validate() {
    clearErrors();
    let isValid = true;

    if (!fullNameInput.value.trim()) {
      fullNameError.textContent = "Por favor, indica tu nombre completo.";
      isValid = false;
    }

    if (!attendanceInput.value) {
      attendanceError.textContent = "Por favor, indícanos si podrás asistir.";
      isValid = false;
    }

    return isValid;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const data = {
      fullName: fullNameInput.value.trim(),
      attendance: attendanceInput.value,
      guestCount: attendanceInput.value === "yes" ? guestCount : 0,
      dietary: dietaryInput.value.trim(),
      message: messageInput.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      const response = await submitRSVP(data);

      if (response.success) {
        form.hidden = true;
        successBox.hidden = false;

        const firstName = data.fullName.split(" ")[0] || data.fullName;

        if (data.attendance === "yes") {
          successTitle.textContent = `¡Gracias, ${firstName}!`;
          successText.textContent =
            "Hemos recibido tu confirmación. Nos hace mucha ilusión compartir este día contigo.";
        } else {
          successTitle.textContent = `Gracias, ${firstName}`;
          successText.textContent =
            "Sentimos que no puedas acompañarnos, pero agradecemos mucho que nos lo hayas contado.";
        }

        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      attendanceError.textContent =
        "Ha ocurrido un error al enviar tu confirmación. Inténtalo de nuevo.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirmar";
    }
  });
}

/* ---------------------------------------------------------
   Punto de integración futura con backend.
   Por ahora simula una respuesta exitosa sin enviar datos
   a ningún servicio externo.

   TODO: conectar posteriormente con backend
   --------------------------------------------------------- */
async function submitRSVP(data) {
  // TODO: conectar posteriormente con backend
  // Ejemplo futuro:
  // const response = await fetch("/api/rsvp", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data)
  // });
  // return response.json();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, 600);
  });
}
