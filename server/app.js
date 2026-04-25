import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { getConfig } from "./config/env.js";
import { createServiceContainer } from "./services/serviceContainer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultPublicDir = path.join(__dirname, "..", "public");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(text);
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", (error) => reject(error));
  });
}

async function serveStatic(publicDir, pathname, response) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.normalize(path.join(publicDir, cleanPath));

  if (!resolvedPath.startsWith(publicDir)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(resolvedPath);
    const extension = path.extname(resolvedPath).toLowerCase();
    const contentType = contentTypes[extension] || "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(response, 404, "Not found");
      return;
    }
    sendText(response, 500, "Internal server error");
  }
}

export function createServer(options = {}) {
  const config = options.config || getConfig();
  const services = options.services || createServiceContainer(config);
  const publicDir = options.publicDir || defaultPublicDir;

  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const { pathname, searchParams } = requestUrl;

    if (pathname === "/api/health" && request.method === "GET") {
      sendJson(response, 200, {
        status: "ok",
        service: config.appName,
        provider: services.metadata.provider,
        aiEnabled: services.metadata.aiEnabled,
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (pathname === "/api/recommend" && request.method === "POST") {
      try {
        const body = await parseBody(request);
        const result = await services.recommendationService.getRecommendations(body);
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          error: error.message || "Unable to generate recommendations"
        });
      }
      return;
    }

    if (pathname === "/api/trending" && request.method === "GET") {
      try {
        const city = searchParams.get("city");
        const result = await services.trendingService.getTrendingFoods(city);
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          error: error.message || "Unable to fetch trending foods"
        });
      }
      return;
    }

    if (pathname === "/api/fortune" && request.method === "POST") {
      try {
        const body = await parseBody(request);
        const result = await services.fortuneService.getFoodFortune(body);
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          error: error.message || "Unable to generate food fortune"
        });
      }
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "API route not found" });
      return;
    }

    await serveStatic(publicDir, pathname, response);
  });

  return { server, config, services };
}

