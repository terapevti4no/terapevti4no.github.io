import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

// Match static hosting, including real directory entries and a custom 404.
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const path = resolve(root, '.' + decodeURIComponent(url.pathname));
  if (path !== root && !path.startsWith(root + '/')) { response.writeHead(403).end(); return; }
  try {
    let file = path;
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        response.writeHead(301, { Location: url.pathname + '/' + url.search }).end();
        return;
      }
      file += '/index.html';
    }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html' }).end(await readFile(root + '/404.html'));
  }
}).listen(4173, '127.0.0.1');
