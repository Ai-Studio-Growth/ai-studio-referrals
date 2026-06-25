// Passenger / Node host entrypoint (Hostinger "Setup Node.js App" startup file).
//
// Hostinger's Node hosting runs the app under Phusion Passenger and assigns a
// port via process.env.PORT. This boots Next.js in production and lets Next's
// request handler serve everything (pages, API routes, middleware).
//
// Build first (`npm run build`), then set this file as the application startup
// file in hPanel. Locally you can still use `npm run dev` / `npm start`.

const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOST || '0.0.0.0';

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`▶ Ai Studio Referrals ready on http://${hostname}:${port}`);
  });
});
