#!/usr/bin/env node
// Regenerates the "pinned_repos" key in data.yaml from the GitHub-pinned
// repositories on the profile below. The "projects" key is separate and
// hand-curated — this script never touches it. Uses the `yaml` package's
// Document API to set only the pinned_repos node rather than
// re-serializing the whole file, so comments elsewhere in data.yaml
// survive. Pinned status is only exposed via the GraphQL API, and that
// query needs a token with `read:user` — the Actions-issued GITHUB_TOKEN
// doesn't carry that scope, so a PAT is required (see PINNED_REPOS_TOKEN
// below).

import { readFile, writeFile } from "node:fs/promises";
import { parseDocument } from "yaml";

const GITHUB_LOGIN = "Rem7474";
const DATA_FILE = new URL("../data.yaml", import.meta.url);

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

const doc = parseDocument(await readFile(DATA_FILE, "utf8"));
doc.set("pinned_repos", pinnedRepos);

await writeFile(DATA_FILE, doc.toString(), "utf8");
console.log(`Synced ${pinnedRepos.length} pinned repo(s) into data.yaml.`);
