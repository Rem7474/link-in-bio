<div align="center">

# 🔗 link-in-bio

**Une page de liens perso, statique, sans framework.**

Nom, bio, liens de contact et projets — tout est piloté par un seul
fichier YAML. Mise à jour automatique des dépôts épinglés GitHub. Le
site propose aussi un switch de langue FR/EN.

### 👉 [**remcorp.fr**](https://remcorp.fr) 👈

🇬🇧 English version: [README.md](README.md)

</div>

<br>

<img src="docs/screenshots/preview.png" alt="Aperçu de la page link-in-bio" width="100%">

## Pourquoi ce projet ?

Un "link in bio" classique (Linktree et consorts) impose une plateforme
tierce, ses limites de personnalisation et souvent un abonnement. Ici,
c'est des fichiers statiques (HTML/CSS/JS vanilla), hébergés gratuitement
sur GitHub Pages, sans build.

## Fonctionnalités

- 📝 **Contenu piloté par [`data.yaml`](data.yaml)** — profil, liens et
  projets, pas du HTML à modifier (parsé côté client par
  [`vendor/js-yaml.min.js`](vendor/js-yaml.min.js), la seule dépendance
  du site)
- 🌐 **i18n intégrée** — un switch FR/EN traduit l'interface (titres de
  sections, footer, messages d'erreur) et le contenu bilingue de
  `data.yaml` (`profile.bio`, `projects[].description`, définis comme
  des objets `{fr, en}`) ; le choix de langue est mémorisé
  (`localStorage`) et se base par défaut sur la langue du navigateur
- ✍️ **Projets mis en avant, édités à la main** (`projects`) — pour les
  quelques réalisations que vous voulez montrer en premier, avec un
  titre et des liens sur mesure
- 🔄 **Dépôts épinglés, auto-synchronisés** (`pinned_repos`) : un script
  interroge les dépôts épinglés du profil GitHub via l'API GraphQL et
  régénère cette liste (nom, description, lien du site + lien GitHub),
  via une GitHub Action planifiée chaque jour et déclenchable à la main
- 🌓 **Mode sombre** automatique (`prefers-color-scheme`)
- 🔵 **Favicon circulaire** (`favicon.png`) — généré automatiquement à
  partir d'`avatar.jpg` pour que l'icône d'onglet corresponde à l'avatar
  circulaire affiché sur la page (le `border-radius` CSS ne s'applique
  pas aux favicons)
- 🔍 **SEO / partage** : meta description, Open Graph, Twitter Card,
  `canonical`, favicon
- ♿ **Robuste sans JavaScript** : contenu du profil dupliqué en HTML
  statique (fallback `<noscript>`), attributs `width`/`height` sur
  l'avatar pour éviter le layout shift

## Personnaliser

Éditez [`data.yaml`](data.yaml) :

- `profile` : nom, bio, avatar, liens de contact — à modifier à la main.
  `bio` accepte soit une chaîne simple, soit un objet `{fr, en}` pour un
  rendu bilingue
- `projects` : vos projets mis en avant — à modifier à la main,
  librement. `description` accepte la même forme (chaîne simple ou
  `{fr, en}`) que `profile.bio`
- `pinned_repos` : régénéré automatiquement à partir des dépôts épinglés
  GitHub, ne pas éditer directement (voir ci-dessous). Sa `description`
  reste une chaîne simple, dans la langue d'origine de la description du
  dépôt GitHub — le switch de langue ne la traduit pas

## Synchronisation des projets épinglés

```bash
PINNED_REPOS_TOKEN=ghp_xxx npm run sync-pinned
```

Le token doit être un Personal Access Token classique avec le scope
`read:user` (l'API GraphQL `pinnedItems` n'est pas accessible avec le
`GITHUB_TOKEN` par défaut des Actions). En CI, il doit être renseigné
dans le secret de dépôt `PINNED_REPOS_TOKEN` pour que le workflow
[`sync-pinned-projects.yml`](.github/workflows/sync-pinned-projects.yml)
fonctionne.

Le script édite uniquement la clé `pinned_repos` (via l'API Document du
paquet [`yaml`](https://www.npmjs.com/package/yaml)).

## Scripts de développement

Installer les dépendances figées une fois :

```bash
npm ci
```

Puis :

```bash
npm run validate     # valide la structure de data.yaml (utilisé en CI)
npm run sync-pinned  # régénère pinned_repos (nécessite PINNED_REPOS_TOKEN)
npm run screenshot   # rafraîchit docs/screenshots/preview.png via Playwright
npm run favicon      # régénère favicon.png à partir d'avatar.jpg
```

## Lancer en local

Fichiers statiques :

```bash
python3 -m http.server 8000
# ou
npx serve
```

## Licence

MIT — voir [`LICENSE`](LICENSE).
