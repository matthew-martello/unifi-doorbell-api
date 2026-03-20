# unifi-doorbell-api

Small Node.js service that exposes a webhook endpoint for a UniFi doorbell event and plays a local sound when triggered.

## Run

```bash
npm install
npm run start
```

The app starts on `http://localhost:3003`.

## Endpoints

### `GET /health`

Simple health check endpoint.

Response:

```text
ok
```

### `POST /webhooks/unifi/doorbell`

Triggers doorbell playback on the local machine.

The endpoint plays the selected sound twice, with a 1 second delay between rings. This can changed using the `REPEAT_SECONDS` variable.

Optional query parameter:

- `sound`: filename inside `assets/`, including extension, for example `?sound=chime.mp3`

If the requested file does not exist, or the filename resolves outside `assets/`, the app falls back to `assets/default.mp3`.

- `count`: sets the number of times to play the sound file. The can be used independently, for example `?count=1` or in conjunction with the `sound` parameter, like so `?sound=chime.mp3&count=3`

If the value is not included teh file will be played twice.

Response when playback is started:

```text
ok
```

Response when a previous playback sequence is still running:

```text
already playing
```

Response on failure:

```text
Internal server error
```

## Notes

- On macOS, audio playback uses `afplay`.
- On Linux, audio playback uses `mplayer`.
