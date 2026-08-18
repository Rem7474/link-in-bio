#!/usr/bin/env node
// Validates data.yaml's *shape*, not just its YAML syntax. A file can be
// syntactically valid YAML and still break the page — e.g. `projects:`
// with nothing after it parses to `null`, or a link missing `url` — and
// that class of bug wouldn't fail `yaml.parse()`. This is what actually
// gates the "pages-check" CI job.

import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const DATA_FILE = new URL("../data.yaml", import.meta.url);

const errors = [];
const fail = (path, message) => errors.push(`${path}: ${message}`);
const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;

function validateLink(link, path) {
  if (typeof link !== "object" || link === null) {
    fail(path, "must be an object with label/url");
    return;
  }
  if (!isNonEmptyString(link.label)) fail(`${path}.label`, "must be a non-empty string");
  if (!isNonEmptyString(link.url)) fail(`${path}.url`, "must be a non-empty string");
}

// Lists are optional throughout: absent or explicitly empty (`key:` /
// `key: []`) just means "render nothing for this section" — only a
// present-but-malformed entry is an error.
function validateItemList(list, key) {
  if (list == null) return;
  if (!Array.isArray(list)) {
    fail(key, `must be a list if present (got ${typeof list})`);
    return;
  }
  list.forEach((item, i) => {
    const path = `${key}[${i}]`;
    if (typeof item !== "object" || item === null) {
      fail(path, "must be an object");
      return;
    }
    if (!isNonEmptyString(item.title)) fail(`${path}.title`, "must be a non-empty string");
    if (item.description != null && typeof item.description !== "string") {
      fail(`${path}.description`, "must be a string");
    }
    if (item.links == null || !Array.isArray(item.links)) {
      fail(`${path}.links`, "must be a list");
    } else {
      item.links.forEach((link, j) => validateLink(link, `${path}.links[${j}]`));
    }
  });
}

const raw = await readFile(DATA_FILE, "utf8");

let data;
try {
  data = parse(raw);
} catch (err) {
  console.error(`data.yaml is not valid YAML:\n  ${err.message}`);
  process.exit(1);
}

if (typeof data !== "object" || data === null) {
  fail("(root)", "must be an object with a profile key");
} else {
  const { profile } = data;
  if (typeof profile !== "object" || profile === null) {
    fail("profile", "is required and must be an object");
  } else {
    if (!isNonEmptyString(profile.name)) fail("profile.name", "must be a non-empty string");
    if (!isNonEmptyString(profile.bio)) fail("profile.bio", "must be a non-empty string");
    if (!isNonEmptyString(profile.avatar)) fail("profile.avatar", "must be a non-empty string");
    if (profile.links == null || !Array.isArray(profile.links)) {
      fail("profile.links", "must be a list");
    } else {
      profile.links.forEach((link, i) => validateLink(link, `profile.links[${i}]`));
    }
  }

  // Optional sections — see renderProjectList in main.js, which hides
  // the corresponding section when the list is absent or empty.
  validateItemList(data.projects, "projects");
  validateItemList(data.pinned_repos, "pinned_repos");
}

if (errors.length > 0) {
  console.error("data.yaml failed validation:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log("data.yaml is valid.");
