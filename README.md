<div align="center">

# 🔗 link-in-bio

**Une page de liens perso, statique, sans framework.**

Nom, bio, liens de contact et projets — tout est piloté par un seul
fichier JSON. La liste des projets se met à jour toute seule à partir
des dépôts épinglés sur GitHub.

### 👉 [**rem7474.github.io/link-in-bio**](https://rem7474.github.io/link-in-bio/) 👈

</div>

<br>

<img src="docs/screenshots/preview.png" alt="Aperçu de la page link-in-bio" width="100%">

## Pourquoi ce projet ?

Un "link in bio" classique (Linktree et consorts) impose une plateforme
tierce, ses limites de personnalisation et souvent un abonnement. Ici,
c'est trois fichiers statiques (HTML/CSS/JS vanilla), hébergés
gratuitement sur GitHub Pages, sans build ni dépendance.

## Fonctionnalités

- 📝 **Contenu piloté par [`data.json`](data.json)** — profil, liens et
  projets sont des données, pas du HTML à modifier
- 🔄 **Projets auto-synchronisés** : un script interroge les dépôts
  épinglés du profil GitHub via l'API GraphQL et régénère la liste des
  projets (nom, description, lien du site + lien GitHub), via une
  GitHub Action planifiée chaque jour et déclenchable à la main
- 🌓 **Mode sombre** automatique (`prefers-color-scheme`)
- 🔍 **SEO / partage** : meta description, Open Graph, Twitter Card,
  `canonical`, favicon
- ♿ **Robuste sans JavaScript** : contenu du profil dupliqué en HTML
  statique (fallback `<noscript>`), attributs `width`/`height` sur
  l'avatar pour éviter le layout shift

## Personnaliser

Éditez [`data.json`](data.json) :

- `profile` : nom, bio, avatar, liens de contact — à modifier à la main
- `projects` : régénéré automatiquement, ne pas éditer directement (voir
  ci-dessous)

## Synchronisation des projets épinglés

```bash
PINNED_REPOS_TOKEN=ghp_xxx node scripts/sync-pinned-projects.mjs
```

Le token doit être un Personal Access Token classique avec le scope
`read:user` (l'API GraphQL `pinnedItems` n'est pas accessible avec le
`GITHUB_TOKEN` par défaut des Actions). En CI, il doit être renseigné
dans le secret de dépôt `PINNED_REPOS_TOKEN` pour que le workflow
[`sync-pinned-projects.yml`](.github/workflows/sync-pinned-projects.yml)
fonctionne.

## Lancer en local

Fichiers statiques, aucune dépendance :

```bash
python3 -m http.server 8000
# ou
npx serve
```

## Licence

MIT — voir [`LICENSE`](LICENSE).
