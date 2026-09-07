// Data file name (YAML, to allow comments)
const DATA_FILE = "data.yaml";
const LANG_STORAGE_KEY = "lang";
const SUPPORTED_LANGS = ["fr", "en"];

// UI strings (as opposed to content driven by data.yaml). Personal
// content (bio, project descriptions) is translated in data.yaml itself
// via {fr, en} fields — see resolveText().
const STRINGS = {
  fr: {
    titleSuffix: "Liens & Projets",
    sectionProjects: "Projets",
    sectionPinned: "Dépôts épinglés",
    footerSource: "Code source",
    loadError: "Erreur de chargement des données.",
    langToggleLabel: "EN",
    langToggleAria: "Passer le site en anglais",
  },
  en: {
    titleSuffix: "Links & Projects",
    sectionProjects: "Projects",
    sectionPinned: "Pinned repositories",
    footerSource: "Source code",
    loadError: "Failed to load data.",
    langToggleLabel: "FR",
    langToggleAria: "Switch site to French",
  },
};

function detectLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (SUPPORTED_LANGS.includes(stored)) return stored;
  const browserLang = (navigator.language || "fr").slice(0, 2);
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : "fr";
}

// A text field in data.yaml is either a plain string (e.g. the
// auto-synced pinned_repos descriptions, which stay in their original
// GitHub language) or a {fr, en} object for bilingual content
// (profile.bio, projects[].description).
function resolveText(value, lang) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value[lang] || value.fr || value.en || "";
  }
  return "";
}

let currentLang = detectLang();
let currentData = null;

async function loadData() {
  const res = await fetch(DATA_FILE);
  if (!res.ok) {
    throw new Error("Impossible de charger " + DATA_FILE);
  }
  return jsyaml.load(await res.text());
}

function applyStaticI18n() {
  const t = STRINGS[currentLang];
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  const toggle = document.getElementById("lang-toggle");
  if (toggle) {
    toggle.textContent = t.langToggleLabel;
    toggle.setAttribute("aria-label", t.langToggleAria);
  }
}

function renderProfile(data, lang) {
  const { name, bio, avatar, links } = data.profile;
  const t = STRINGS[lang];

  document.title = name + " – " + t.titleSuffix;

  const avatarEl = document.getElementById("avatar");
  avatarEl.src = avatar;
  avatarEl.alt = "Photo de " + name;

  document.getElementById("name").textContent = name;
  document.getElementById("bio").textContent = resolveText(bio, lang);

  const linksContainer = document.getElementById("links");
  linksContainer.innerHTML = "";

  (links || []).forEach(link => {
    const a = document.createElement("a");
    a.className = "link";
    a.href = link.url;
    if (link.url.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    a.textContent = link.label;
    linksContainer.appendChild(a);
  });
}

// `projects` is optional: an absent key, an empty one (`projects:`,
// which parses to `null`), or an empty list simply hides the
// corresponding section instead of breaking the page.
function renderProjectList(projects, containerId, lang) {
  const container = document.getElementById(containerId);
  const section = container.closest(".projects-section");
  const list = Array.isArray(projects) ? projects : [];

  if (section) {
    section.style.display = list.length === 0 ? "none" : "";
  }
  if (list.length === 0) return;

  container.innerHTML = "";

  list.forEach(project => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.className = "project-description";
    desc.textContent = resolveText(project.description, lang);

    const linksDiv = document.createElement("div");
    linksDiv.className = "project-links";

    (project.links || []).forEach(link => {
      const a = document.createElement("a");
      a.className = "project-link";
      a.href = link.url;
      if (link.url.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.textContent = link.label;
      linksDiv.appendChild(a);
    });

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(linksDiv);

    container.appendChild(card);
  });
}

function renderFooter(data) {
  const footerText = document.getElementById("footer-text");
  const currentYear = new Date().getFullYear();
  footerText.textContent = currentYear + " " + data.profile.name;
}

function createLangToggle() {
  if (document.getElementById("lang-toggle")) return;

  const button = document.createElement("button");
  button.id = "lang-toggle";
  button.type = "button";
  button.className = "lang-toggle";
  button.addEventListener("click", () => {
    setLang(currentLang === "fr" ? "en" : "fr");
  });

  document.querySelector(".page").prepend(button);
}

function triggerEntranceAnimations() {
  // Main sections
  document.querySelectorAll('.profile-section.fade-up, .projects-section.fade-up, .section-title.fade-up').forEach(el => {
    el.classList.add('visible');
  });

  // Profile card
  const profileCard = document.querySelector('.profile-section .profile-card.fade-up');
  if (profileCard) profileCard.classList.add('visible');

  // Name / bio
  document.querySelectorAll('#name.fade-up, #bio.fade-up').forEach(el => {
    el.classList.add('visible');
  });

  // Footer
  const footer = document.querySelector('.footer.fade-up');
  if (footer) footer.classList.add('visible');

  // Links (staggered)
  const links = document.querySelectorAll('.links .link');
  links.forEach((el, i) => {
    el.classList.add('fade-up');
    setTimeout(() => el.classList.add('visible'), 80 * i);
  });

  // Project cards (staggered)
  const projectCards = document.querySelectorAll('.projects-grid .project-card');
  projectCards.forEach((el, i) => {
    el.classList.add('fade-up');
    setTimeout(() => el.classList.add('visible'), 120 * i);
  });
}

function render() {
  applyStaticI18n();
  renderProfile(currentData, currentLang);
  renderProjectList(currentData.projects, "projects", currentLang);
  renderProjectList(currentData.pinned_repos, "pinned-repos", currentLang);
  renderFooter(currentData);
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  render();
}

async function init() {
  try {
    currentData = await loadData();
    createLangToggle();
    render();

    // Trigger animations after the DOM has painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerEntranceAnimations();
      });
    });
  } catch (err) {
    console.error(err);
    document.body.innerHTML =
      "<p style='text-align:center;padding:40px;'>" + STRINGS[currentLang].loadError + "</p>";
  }
}

init();
