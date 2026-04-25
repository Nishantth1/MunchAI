import fs from "node:fs";
import path from "node:path";

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseDotEnvFile(fileContent) {
  const parsed = {};
  const lines = fileContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1);
    parsed[key] = stripQuotes(rawValue);
  }

  return parsed;
}

function loadDotEnv(cwd = process.cwd()) {
  const filePath = path.join(cwd, ".env");
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return parseDotEnvFile(content);
  } catch {
    return {};
  }
}

export function getConfig(env = process.env) {
  const dotenv = loadDotEnv();
  const runtimeEnv = { ...dotenv, ...env };
  const dataProvider = runtimeEnv.DATA_PROVIDER || "mock";

  return {
    appName: "munch-ai",
    nodeEnv: runtimeEnv.NODE_ENV || "development",
    port: parseInteger(runtimeEnv.PORT, 3000),
    dataProvider,
    gemini: {
      apiKey: runtimeEnv.GEMINI_API_KEY || "",
      model: runtimeEnv.GEMINI_MODEL || "gemini-2.0-flash",
      baseUrl:
        runtimeEnv.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/models"
    },
    swiggyMcp: {
      baseUrl: runtimeEnv.SWIGGY_MCP_BASE_URL || "",
      apiKey: runtimeEnv.SWIGGY_MCP_API_KEY || "",
      catalogPath: runtimeEnv.SWIGGY_MCP_CATALOG_PATH || "/food/catalog",
      trendingPath: runtimeEnv.SWIGGY_MCP_TRENDING_PATH || "/food/trending",
      restaurantsPath:
        runtimeEnv.SWIGGY_MCP_RESTAURANTS_PATH || "/food/restaurants"
    }
  };
}
