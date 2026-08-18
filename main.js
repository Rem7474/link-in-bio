// Nom du fichier de données (JSON)
const DATA_FILE = "data.json";

async function loadData() {
  const res = await fetch(DATA_FILE);
  if (!res.ok) {
    throw new Error("Impossible de charger " + DATA_FILE);
  }
  return res.json();
}

function renderProfile(data) {
  const { name, bio, avatar, links } = data.profile;

  document.title = name + " – Liens & Projets";

  const avatarEl = document.getElementById("avatar");
  avatarEl.src = avatar;
  avatarEl.alt = "Photo de " + name;

  document.getElementById("name").textContent = name;
  document.getElementById("bio").textContent = bio;

  const linksContainer = document.getElementById("links");
  linksContainer.innerHTML = "";

  links.forEach(link => {
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

function renderProjectList(projects, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  projects.forEach(project => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.className = "project-description";
    desc.textContent = project.description;

    const linksDiv = document.createElement("div");
    linksDiv.className = "project-links";

    project.links.forEach(link => {
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

function triggerEntranceAnimations() {
  // Sections principales
  document.querySelectorAll('.profile-section.fade-up, .projects-section.fade-up, .section-title.fade-up').forEach(el => {
    el.classList.add('visible');
  });

  // Carte de profil
  const profileCard = document.querySelector('.profile-section .profile-card.fade-up');
  if (profileCard) profileCard.classList.add('visible');

  // Nom / bio
  document.querySelectorAll('#name.fade-up, #bio.fade-up').forEach(el => {
    el.classList.add('visible');
  });

  // Footer
  const footer = document.querySelector('.footer.fade-up');
  if (footer) footer.classList.add('visible');

  // Liens (en cascade)
  const links = document.querySelectorAll('.links .link');
  links.forEach((el, i) => {
    el.classList.add('fade-up');
    setTimeout(() => el.classList.add('visible'), 80 * i);
  });

  // Cartes projets (en cascade)
  const projectCards = document.querySelectorAll('.projects-grid .project-card');
  projectCards.forEach((el, i) => {
    el.classList.add('fade-up');
    setTimeout(() => el.classList.add('visible'), 120 * i);
  });
}

async function init() {
  try {
    const data = await loadData();
    renderProfile(data);
    renderProjectList(data.projects, "projects");
    renderProjectList(data.pinned_repos, "pinned-repos");
    renderFooter(data);

    // Déclenche les animations après que le DOM est peint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerEntranceAnimations();
      });
    });
  } catch (err) {
    console.error(err);
    document.body.innerHTML =
      "<p style='text-align:center;padding:40px;'>Erreur de chargement des données.</p>";
  }
}

init();
