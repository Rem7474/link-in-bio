#!/usr/bin/env node
// Regenerates favicon.png as a circular crop of avatar.jpg, matching the
// circular avatar shown on the page. CSS border-radius doesn't apply to
// favicons — browsers render the source image as-is — so the circle has
// to be baked into the file itself. Run after any change to avatar.jpg.

import sharp from "sharp";
import { fileURLToPath } from "node:url";

const SIZE = 512;
const AVATAR = fileURLToPath(new URL("../avatar.jpg", import.meta.url));
const OUTPUT = fileURLToPath(new URL("../favicon.png", import.meta.url));

const circleMask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#fff"/></svg>`
);

await sharp(AVATAR)
  .resize(SIZE, SIZE, { fit: "cover" })
  .composite([{ input: circleMask, blend: "dest-in" }])
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUTPUT);

console.log("Updated favicon.png");
