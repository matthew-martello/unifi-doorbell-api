import express from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sound from "node-aplay";

const app = express();
const port = 3003;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assets = path.join(__dirname, "assets");
const defaultSound = path.join(assets, "default.mp3");

function playSound(filePath) {
  if (process.platform === "darwin") {
    console.log("Playing doorbell...");
    const player = spawn("afplay", [filePath], {
      detached: true,
      stdio: "ignore",
    });

    player.on("error", (error) => {
      console.error("Failed to play sound with afplay:", error);
    });

    player.unref();
    return;
  }

  if (process.platform === "linux") {
    console.log("Playing doorbell...");
    new Sound(filePath).play();
    return;
  }

  throw new Error(
    `Unsupported platform for audio playback: ${process.platform}`
  );
}

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.post("/webhooks/unifi/doorbell", (req, res) => {
  try {
    playSound(defaultSound);

    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log("Doorbell listening on port", port);
});
