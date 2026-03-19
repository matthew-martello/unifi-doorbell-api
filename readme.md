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

Triggers playback of `assets/default.mp3` on the local machine.

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
- On Linux, audio playback uses `node-aplay` and requires the `aplay` binary to be installed.
