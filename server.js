const { createServer } = require('http');

// Start Next.js
const next = require('next');
const app = next({ dev: false, hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();

// Self-ping keep-alive
function keepAlive() {
  const req = createServer !== undefined && require('http').get('http://127.0.0.1:3000/', (res) => { res.resume(); });
  if (req && req.on) req.on('error', () => {});
}

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(3000, '0.0.0.0', () => {
    console.log('> Ready on http://0.0.0.0:3000');
    setInterval(keepAlive, 3000);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
