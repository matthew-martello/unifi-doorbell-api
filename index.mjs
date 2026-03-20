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
const defaultSound = path.join(assets, "default.mp3");

// Shared in-memory playback state used to suppress overlapping doorbell runs.
const playbackState = { isPlaying: false };

// Number of seconds to wait before playing the second ring.
const REPEAT_SECONDS = 1;

/** Get the asset path for a requested filename.
 *
 * Only plain filenames inside the local `assets` directory are accepted. Any
 * missing, invalid, or non-file path falls back to the default sound.
 *
 * @param {string} filename Requested audio filename from the query string.
 * @returns {string} Absolute path to the requested asset, or the default sound.
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

/** Pause execution for the requested number of milliseconds.
 *
 * @param {number} ms Number of milliseconds to wait.
 * @returns {Promise<void>} Resolves after the delay elapses.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Play the requested sound twice while holding the shared playback lock.
 *
 * The delay between rings is controlled by `REPEAT_SECONDS`. The shared state
 * remains locked for the full sequence so duplicate webhook calls can be
 * ignored until playback has fully finished.
 *
 * @param {string} soundPath Absolute path to the audio file to play.
 * @param {{ isPlaying: boolean }} state Mutable shared playback state.
 * @returns {Promise<void>} Resolves when both playback attempts have finished.
 */
async function playDoorbellSequence(soundPath, state) {
  try {
    state.isPlaying = true;
    await playSound(soundPath, state);
    state.isPlaying = true;
    await sleep(REPEAT_SECONDS * 1000);
    await playSound(soundPath, state);
  } finally {
    state.isPlaying = false;
  }
}

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

/** Trigger the doorbell playback sequence.
 *
 * Plays the selected sound twice with a delay specified by `REPEAT_SECONDS`.
 * If `sound` is omitted or invalid, the default asset is used instead.
 *
 * While a sequence is already running, the endpoint returns early with
 * `"already playing"` so repeated webhook calls do not overlap.
 */
app.post("/webhooks/unifi/doorbell", (req, res) => {
  try {
    if (playbackState.isPlaying) {
      res.status(200).send("already playing");
      return;
    }

    const soundPath = getSoundPath(req.query.sound);

    void playDoorbellSequence(soundPath, playbackState).catch((err) => {
      console.error(err);
    });

    res.status(200).send("ok");
  } catch (err) {
    playbackState.isPlaying = false;
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log("Doorbell listening on port", port);
});
