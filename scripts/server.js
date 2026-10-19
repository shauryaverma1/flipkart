const http = require('http');
const fs = require('fs');
const path = require('path');

let DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url === '/' ? '/index.html' : req.url;
    // Strip query parameters
    reqUrl = reqUrl.split('?')[0];
    const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                if (!ext || ext === '.html') {
                    fs.readFile(path.join(ROOT_DIR, 'index.html'), (spaErr, indexContent) => {
                        if (!spaErr) {
                            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
                            res.end(indexContent, 'utf-8');
                            return;
                        }
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                        res.end('<h1>404 Not Found</h1>', 'utf-8');
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                }
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        }
    });
});

function startServer(port) {
    server.listen(port, () => {
        console.log(`\n======================================================`);
        console.log(`🚀 Flipkart Clone College Project is running!`);
        console.log(`🌐 Open in your browser: http://localhost:${port}`);
        console.log(`📦 Ready for presentation and evaluation!`);
        console.log(`======================================================\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️ Port ${port} is currently busy, automatically switching to port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

if (require.main === module) {
    startServer(DEFAULT_PORT);
}

module.exports = server;
