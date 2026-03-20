import { spawn } from "node:child_process";

export default function playSound(filePath) {
  if (process.platform === "darwin") {
    console.log("Playing doorbell with afplay...");
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
    console.log("Playing doorbell with mplayer...");
    const player = spawn("mplayer", ["-really-quiet", filePath], {
      detached: true,
      stdio: "ignore",
    });

    player.on("error", (error) => {
      console.error("Failed to play sound with mplayer:", error);
    });

    player.unref();
    return;
  }

  throw new Error(
    `Unsupported platform for audio playback: ${process.platform}`
  );
}
