const http = require("http");
const fs = require("fs");
const path = require("path");

// Load .env if present
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

let PORT = parseInt(process.env.PORT, 10) || 3000;
const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=UTF-8",
};

let chatHandler;
try {
  chatHandler = require("./api/chat.js");
} catch (e) {
  console.warn("Could not load ./api/chat.js:", e.message);
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // Handle API route
  if (pathname === "/api/chat") {
    let bodyData = "";
    req.on("data", (chunk) => {
      bodyData += chunk;
    });
    req.on("end", async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (err) {
        req.body = {};
      }

      const vercelRes = {
        setHeader(name, value) {
          res.setHeader(name, value);
          return this;
        },
        status(code) {
          res.statusCode = code;
          return this;
        },
        json(data) {
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
          res.end(JSON.stringify(data));
        },
      };

      if (typeof chatHandler === "function") {
        try {
          await chatHandler(req, vercelRes);
        } catch (err) {
          console.error("Handler error:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=UTF-8");
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
        }
      } else {
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json; charset=UTF-8");
        res.end(JSON.stringify({ error: "Chatbot handler unavailable" }));
      }
    });
    return;
  }

  // Handle static files
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(__dirname, safePath === "/" || safePath === "\\" ? "index.html" : safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=UTF-8");
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(portToTry) {
  server.removeAllListeners("error");
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${portToTry} is in use, trying ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error("Server error:", err);
    }
  });

  server.listen(portToTry, () => {
    console.log(`\n========================================`);
    console.log(`  Portfolio running at: http://localhost:${portToTry}`);
    console.log(`========================================\n`);
  });
}

startServer(PORT);
