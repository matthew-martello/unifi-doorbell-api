import express from "express";
import playSound from "./playSound.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = 3003;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assets = path.join(__dirname, "assets");
const defaultSound = path.join(assets, "frodo.mp3");

/** Get the filepath of the `filename` provided.
 *
 * @param {string} filename
 * @returns The filepath of the provided `filename`. If no file is found, return the default sound filepath.
 */
function getSoundPath(filename) {
  if (typeof filename !== "string" || filename.length === 0) {
    return defaultSound;
  }

  if (path.basename(filename) !== filename) {
    return defaultSound;
  }

  const candidatePath = path.resolve(assets, filename);
  const relativePath = path.relative(assets, candidatePath);
  const isInsideAssets =
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath);

  if (!isInsideAssets || !fs.existsSync(candidatePath)) {
    return defaultSound;
  }

  if (!fs.statSync(candidatePath).isFile()) {
    return defaultSound;
  }

  return candidatePath;
}

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.post("/webhooks/unifi/doorbell", (req, res) => {
  try {
    const soundPath = getSoundPath(req.query.sound);

    playSound(soundPath);

    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log("Doorbell listening on port", port);
});
