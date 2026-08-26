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
  const slides = document.querySelectorAll(".gallery__slide");
  if (!slides.length) return;

  const slidesContainer = document.getElementById("gallerySlides");
  const dotsContainer = document.getElementById("galleryDots");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  let currentIndex = 0;
  const total = slides.length;

  // Crear dots
  if (dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery__dot";
      dot.setAttribute("aria-label", `Ir a la foto ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? dotsContainer.querySelectorAll(".gallery__dot") : [];
  let autoTimer;
  const AUTO_INTERVAL = 6000;

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo((currentIndex + 1) % total), AUTO_INTERVAL);
  }

  function update() {
    if (slidesContainer) {
      slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === currentIndex));
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === total - 1;
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(total - 1, index));
    update();
    startAuto();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  // Lightbox
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
    if (closeBtn) closeBtn.focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  slides.forEach((item) => {
    item.addEventListener("click", () => {
      const full = item.getAttribute("data-full");
      const img = item.querySelector("img");
      openLightbox(full, img ? img.alt : "");
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    } else if (!lightbox.classList.contains("is-open")) {
      if (event.key === "ArrowLeft") goTo(currentIndex - 1);
      if (event.key === "ArrowRight") goTo(currentIndex + 1);
    }
  });

  // Swipe en móvil
  let startX = 0;
  const track = document.querySelector(".gallery__track");

  if (track) {
    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
    }, { passive: true });
  }

  goTo(0);
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
  const lactoseInput = document.getElementById("lactoseIntolerant");
  const lactoseError = document.getElementById("lactoseError");
  const lactoseBtns = form.querySelectorAll(".lactose-btn");
  const lactoseField = document.getElementById("lactoseField");
  const dietaryInput = document.getElementById("dietary");
  const dietField = document.getElementById("dietField");
  const successBox = document.getElementById("rsvpSuccess");
  const successTitle = document.getElementById("rsvpSuccessTitle");
  const successText = document.getElementById("rsvpSuccessText");
  const submitBtn = document.getElementById("rsvpSubmitBtn");

  function setLactoseIntolerance(value) {
    lactoseInput.value = value;
    lactoseBtns.forEach((btn) => {
      const isActive = btn.dataset.value === value;
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  function setAttendance(value) {
    attendanceInput.value = value;
    attendanceBtns.forEach((btn) => {
      const isActive = btn.dataset.value === value;
      btn.setAttribute("aria-pressed", String(isActive));
    });

    const showExtras = value === "yes";
    lactoseField.hidden = !showExtras;
    dietField.hidden = !showExtras;
    if (!showExtras) setLactoseIntolerance("");
  }

  attendanceBtns.forEach((btn) => {
    btn.addEventListener("click", () => setAttendance(btn.dataset.value));
  });

  lactoseBtns.forEach((btn) => {
    btn.addEventListener("click", () => setLactoseIntolerance(btn.dataset.value));
  });

  // Estado inicial: campos adicionales ocultos hasta confirmar asistencia
  lactoseField.hidden = true;
  dietField.hidden = true;

  function clearErrors() {
    fullNameError.textContent = "";
    attendanceError.textContent = "";
    lactoseError.textContent = "";
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

    if (attendanceInput.value === "yes" && !lactoseInput.value) {
      lactoseError.textContent = "Por favor, indícanos si eres intolerante a la lactosa.";
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
      lactoseIntolerant: attendanceInput.value === "yes" ? lactoseInput.value : null,
      dietary: dietaryInput.value.trim()
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
