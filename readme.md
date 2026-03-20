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

Triggers playback on the local machine.

Optional query parameter:

- `sound`: filename inside `assets/`, including extension, for example `?sound=chime.mp3`

If the requested file does not exist, or the filename resolves outside `assets/`, the app falls back to `assets/default.mp3`.

Response on success:

```text
ok
```

Response on failure:

```text
Internal server error
```

## Notes

- On macOS, audio playback uses `afplay`.
- On Linux, audio playback uses `mplayer`.
