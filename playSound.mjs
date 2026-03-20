import { spawn } from "node:child_process";

console.log("Starting app...");

/**
 * Play a sound file with the platform-specific CLI player and keep the shared
 * playback state in sync with the spawned process lifecycle.
 *
 * @param {string} filePath Absolute path to the audio file to play.
 * @param {{ isPlaying: boolean }} state Mutable shared playback state used by
 * the webhook handler to suppress overlapping triggers.
 * @returns {Promise<void>} Resolves when the player exits successfully and
 * rejects if the platform is unsupported, the player fails to start, or it
 * exits with a non-zero status.
 */
export default function playSound(filePath, state) {
  return new Promise((resolve, reject) => {
    let command;
    let args;

    if (process.platform === "darwin") {
      console.log("Playing doorbell with afplay...");
      command = "afplay";
      args = [filePath];
    } else if (process.platform === "linux") {
      console.log("Playing doorbell with mplayer...");
      command = "mplayer";
      args = ["-really-quiet", filePath];
    } else {
      reject(
        new Error(
          `Unsupported platform for audio playback: ${process.platform}`,
        ),
      );
      return;
    }

    state.isPlaying = true;

    const player = spawn(command, args, {
      stdio: "ignore",
    });

    player.on("error", (error) => {
      state.isPlaying = false;
      console.error(`Failed to play sound with ${command}:`, error);
      reject(error);
    });

    player.on("close", (code) => {
      state.isPlaying = false;

      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
}
