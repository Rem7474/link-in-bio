<div align="center">

# 🔗 link-in-bio

**A personal, static, framework-free link page.**

Name, bio, contact links, and projects are all driven by a single
YAML file. GitHub pinned repositories update automatically. The site
itself has a FR/EN language switch.

### 👉 [**remcorp.fr**](https://remcorp.fr) 👈

🇫🇷 Version française : [README.fr.md](README.fr.md)

</div>

<br>

<img src="docs/screenshots/preview.png" alt="Preview of the link-in-bio page" width="100%">

## Why this project?

A typical "link in bio" tool (Linktree and friends) locks you into a
third-party platform, its customization limits, and often a
subscription. Here, it's static files (vanilla HTML/CSS/JS), hosted for
free on GitHub Pages, with no build step.

## Features

- 📝 **Content driven by [`data.yaml`](data.yaml)** — profile, links, and
  projects, not HTML to edit (parsed client-side by
  [`vendor/js-yaml.min.js`](vendor/js-yaml.min.js), the site's only
  dependency)
- 🌐 **Built-in i18n** — a FR/EN switch translates the interface (section
  titles, footer, error messages) and the bilingual content in
  `data.yaml` (`profile.bio`, `projects[].description`, defined as
  `{fr, en}` objects); the language choice is remembered
  (`localStorage`) and defaults to the browser's language
- ✍️ **Hand-curated featured projects** (`projects`) — for the handful of
  achievements you want to show first, with a custom title and links
- 🔄 **Auto-synced pinned repositories** (`pinned_repos`): a script
  queries the GitHub profile's pinned repositories via the GraphQL API
  and regenerates this list (name, description, site link + GitHub
  link), via a GitHub Action scheduled daily and triggerable by hand
- 🌓 **Automatic dark mode** (`prefers-color-scheme`)
- 🔵 **Circular favicon** (`favicon.png`) — auto-generated from
  `avatar.jpg` so the browser tab icon matches the circular avatar shown
  on the page (CSS `border-radius` doesn't apply to favicons)
- 🔍 **SEO / sharing**: meta description, Open Graph, Twitter Card,
  `canonical`, favicon
- ♿ **Robust without JavaScript**: profile content duplicated as static
  HTML (`<noscript>` fallback), `width`/`height` attributes on the
  avatar to avoid layout shift

## Customize

Edit [`data.yaml`](data.yaml):

- `profile`: name, bio, avatar, contact links — edit by hand. `bio`
  accepts either a plain string or a `{fr, en}` object for bilingual
  rendering
- `projects`: your featured projects — edit by hand, freely.
  `description` accepts the same plain string or `{fr, en}` shape as
  `profile.bio`
- `pinned_repos`: auto-regenerated from GitHub pinned repositories, do
  not edit directly (see below). Its `description` stays a plain string,
  in whatever language the GitHub repo description is written in — the
  language switch doesn't translate it

## Syncing pinned projects

```bash
PINNED_REPOS_TOKEN=ghp_xxx npm run sync-pinned
```

The token must be a classic Personal Access Token with the `read:user`
scope (the GraphQL `pinnedItems` API isn't reachable with Actions'
default `GITHUB_TOKEN`). In CI, it must be set in the repository secret
`PINNED_REPOS_TOKEN` for the
[`sync-pinned-projects.yml`](.github/workflows/sync-pinned-projects.yml)
workflow to work.

The script only edits the `pinned_repos` key (via the
[`yaml`](https://www.npmjs.com/package/yaml) package's Document API).

## Development scripts

Install pinned dependencies once:

```bash
npm ci
```

Then:

```bash
npm run validate     # validate data.yaml's shape (also gates CI)
npm run sync-pinned  # regenerate pinned_repos (needs PINNED_REPOS_TOKEN)
npm run screenshot   # refresh docs/screenshots/preview.png via Playwright
npm run favicon      # regenerate favicon.png from avatar.jpg
```

## Running locally

Static files:

```bash
python3 -m http.server 8000
# or
npx serve
```

## License

MIT — see [`LICENSE`](LICENSE).
