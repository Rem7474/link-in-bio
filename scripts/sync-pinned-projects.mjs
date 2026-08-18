#!/usr/bin/env node
// Regenerates the "pinned_repos" array in data.json from the GitHub-pinned
// repositories on the profile below. The "projects" array is separate and
// hand-curated — this script never touches it. Pinned status is only
// exposed via the GraphQL API, and that query needs a token with
// `read:user` — the Actions-issued GITHUB_TOKEN doesn't carry that scope,
// so a PAT is required (see PINNED_REPOS_TOKEN below).

import { readFile, writeFile } from "node:fs/promises";

const GITHUB_LOGIN = "Rem7474";
const DATA_FILE = new URL("../data.json", import.meta.url);

const token = process.env.PINNED_REPOS_TOKEN;
if (!token) {
  console.error("PINNED_REPOS_TOKEN environment variable is required.");
  process.exit(1);
}

const query = `
  query ($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
          }
        }
      }
    }
  }
`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "link-in-bio-sync-script",
  },
  body: JSON.stringify({ query, variables: { login: GITHUB_LOGIN } }),
});

if (!res.ok) {
  throw new Error(`GitHub API request failed: ${res.status} ${await res.text()}`);
}

const { data, errors } = await res.json();
if (errors) {
  throw new Error(`GitHub API returned errors: ${JSON.stringify(errors)}`);
}

const pinned = data.user.pinnedItems.nodes;

const pinnedRepos = pinned.map((repo) => {
  const links = [];
  if (repo.homepageUrl) {
    links.push({ label: "Site", url: repo.homepageUrl });
  }
  links.push({ label: "GitHub", url: repo.url });

  return {
    title: repo.name,
    description: repo.description || "",
    links,
  };
});

const current = JSON.parse(await readFile(DATA_FILE, "utf8"));
current.pinned_repos = pinnedRepos;

await writeFile(DATA_FILE, JSON.stringify(current, null, 2) + "\n", "utf8");
console.log(`Synced ${pinnedRepos.length} pinned repo(s) into data.json.`);
