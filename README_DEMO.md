# Demo server — local and ngrok setup

This project includes a tiny demo WebSocket relay server (`demo-server/`) used for multi-device presentations (Patient / Caregiver / Family). The server accepts simple action broadcasts and is intentionally minimal for demo purposes.

Below are quick steps to run it locally and expose it via ngrok so remote devices can connect.

## Run locally

1. Open a terminal and install dependencies:

```bash
cd demo-server
npm install
```

2. Start the server (default port 8081):

```bash
npm start
```

3. Verify it's running:

```bash
curl http://localhost:8081/health
# should return OK
```

4. In the web app, set the demo realtime URL before the app loads or use the in-app DemoLogin (top-right small widget):

```html
<script>
  window.__DEMO_REALTIME_URL = 'ws://YOUR_LAPTOP_IP:8081';
</script>
```

Or in the browser console for each device:

```js
window.__DEMO_REALTIME_URL = 'ws://YOUR_LAPTOP_IP:8081';
```

Make sure your firewall allows incoming connections to port 8081.

## Expose via ngrok (recommended when devices are not on the same LAN)

1. Install and authenticate ngrok (one-time):

```bash
# download from https://ngrok.com and then
ngrok authtoken YOUR_AUTH_TOKEN
```

2. Start the demo server locally (see "Run locally").

3. Start an ngrok HTTP tunnel for port 8081:

```bash
ngrok http 8081
```

4. ngrok will print a public URL, e.g. `https://abcd-1234.ngrok.io`. Use the `wss://` prefix when setting the demo URL in the app:

```js
window.__DEMO_REALTIME_URL = 'wss://abcd-1234.ngrok.io';
```

5. Use the app's DemoLogin or open the app on the devices and set the demo URL in each device to the ngrok URL.

## Notes and troubleshooting
- The demo server is intentionally insecure and accepts any username/password. Use only for demos on trusted devices.
- If a device fails to connect, check browser console/network tab and ensure no corporate firewall blocks WebSocket traffic.
- If you see mixed-content errors when using https pages, ensure you use `wss://` with ngrok's `https://` forwarding URL.

## Files
- `demo-server/server.js` — minimal Node + ws/Express relay
- `demo-server/README.md` — quick reference included in the demo-server folder

If you'd like, I can add a small helper script to automatically print the ngrok URL into the app (via a tiny HTTP endpoint) to make connecting devices easier during demos.