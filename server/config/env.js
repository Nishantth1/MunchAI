function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getConfig(env = process.env) {
  const dataProvider = env.DATA_PROVIDER || "mock";

  return {
    appName: "munch-ai",
    nodeEnv: env.NODE_ENV || "development",
    port: parseInteger(env.PORT, 3000),
    dataProvider,
    gemini: {
      apiKey: env.GEMINI_API_KEY || "",
      model: env.GEMINI_MODEL || "gemini-2.0-flash",
      baseUrl:
        env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/models"
    },
    swiggyMcp: {
      baseUrl: env.SWIGGY_MCP_BASE_URL || "",
      apiKey: env.SWIGGY_MCP_API_KEY || "",
      catalogPath: env.SWIGGY_MCP_CATALOG_PATH || "/food/catalog",
      trendingPath: env.SWIGGY_MCP_TRENDING_PATH || "/food/trending",
      restaurantsPath: env.SWIGGY_MCP_RESTAURANTS_PATH || "/food/restaurants"
    }
  };
}

