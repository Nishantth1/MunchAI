function ensureSlashPrefix(pathname) {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDishRecord(item) {
  const moodTags = item.moodTags || item.mood_tags || [];
  const healthTags = item.healthTags || item.health_tags || [];

  return {
    id: String(item.id || item.itemId || item.name),
    name: item.name,
    canonicalName: item.canonicalName || item.canonical_name || item.name,
    category: item.category || "general",
    diet: item.diet || "any",
    protein: toNumber(item.protein, 0),
    calories: toNumber(item.calories, 0),
    avgPrice: toNumber(item.avgPrice || item.price || item.estimatedPrice, 0),
    moodTags: Array.isArray(moodTags) ? moodTags : [],
    healthTags: Array.isArray(healthTags) ? healthTags : []
  };
}

function normalizeTrendRecord(item) {
  return {
    dish: item.dish || item.name,
    recentOrders: toNumber(item.recentOrders || item.recent_orders, 0),
    searchFrequency: toNumber(item.searchFrequency || item.search_frequency, 0),
    rating: toNumber(item.rating, 0)
  };
}

function normalizeRestaurantRecord(item) {
  return {
    id: String(item.id || item.restaurantId || item.name),
    name: item.name,
    city: item.city,
    rating: toNumber(item.rating, 0),
    estimatedPrice: toNumber(item.estimatedPrice || item.price, 0),
    distanceKm: toNumber(item.distanceKm || item.distance_km, 0),
    orderUrl: item.orderUrl || item.order_url || ""
  };
}

function unwrapArray(payload, candidateKeys) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of candidateKeys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }
  return [];
}

export function createSwiggyMcpProvider(config) {
  const baseUrl = config.baseUrl;
  const apiKey = config.apiKey;
  const catalogPath = ensureSlashPrefix(config.catalogPath);
  const trendingPath = ensureSlashPrefix(config.trendingPath);
  const restaurantsPath = ensureSlashPrefix(config.restaurantsPath);

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Swiggy MCP provider requires SWIGGY_MCP_BASE_URL and SWIGGY_MCP_API_KEY"
    );
  }

  async function requestJson(pathname, { method = "GET", query, body } = {}) {
    const url = new URL(pathname, baseUrl);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Swiggy MCP request failed (${response.status}) for ${pathname}`);
    }

    return response.json();
  }

  return {
    name: "swiggy-mcp",

    async getCatalog({ city }) {
      const payload = await requestJson(catalogPath, { query: { city } });
      const records = unwrapArray(payload, ["items", "data", "meals", "catalog"]);
      return records.map(normalizeDishRecord).filter((item) => item.name);
    },

    async getTrendSignals({ city }) {
      const payload = await requestJson(trendingPath, { query: { city } });
      const records = unwrapArray(payload, ["items", "data", "trending"]);
      return records.map(normalizeTrendRecord).filter((item) => item.dish);
    },

    async getRestaurantsByDish({ city, dishes }) {
      const payload = await requestJson(restaurantsPath, {
        method: "POST",
        body: { city, dishes }
      });

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        // Preferred format: { "Dish Name": [ ...restaurants ] }
        const directMapEntries = Object.entries(payload).filter(([, value]) =>
          Array.isArray(value)
        );
        if (directMapEntries.length > 0) {
          return Object.fromEntries(
            directMapEntries.map(([dishName, values]) => [
              dishName,
              values.map(normalizeRestaurantRecord)
            ])
          );
        }
      }

      // Fallback format: array with dish field on each row.
      const rows = unwrapArray(payload, ["items", "data", "restaurants"]);
      const grouped = Object.fromEntries(dishes.map((dish) => [dish, []]));
      rows.forEach((row) => {
        const dish = row.dish || row.dishName || row.name;
        if (!dish || !grouped[dish]) {
          return;
        }
        grouped[dish].push(normalizeRestaurantRecord(row));
      });
      return grouped;
    }
  };
}

