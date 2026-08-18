#!/usr/bin/env node
// Regenerates docs/screenshots/preview.png by rendering the live page
// locally. Run after any change to the page's visual output (content,
// styles, avatar) so the README preview stays accurate.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const PORT = 8123;
const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUTPUT = fileURLToPath(new URL("../docs/screenshots/preview.png", import.meta.url));

const server = spawn("python3", ["-m", "http.server", String(PORT)], {
  cwd: REPO_ROOT,
  stdio: "ignore",
});

try {
  await sleep(1000);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1300 } });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
  // Entrance animations are staggered via setTimeout after load; wait them out.
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUTPUT, fullPage: true });
  await browser.close();
} finally {
  server.kill();
}

console.log("Updated docs/screenshots/preview.png");
