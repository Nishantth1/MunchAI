import { createMockFoodProvider } from "./mockFoodProvider.js";
import { createSwiggyMcpProvider } from "./swiggyMcpProvider.js";

export function createFoodProvider(config) {
  if (config.dataProvider === "swiggy-mcp") {
    return createSwiggyMcpProvider(config.swiggyMcp);
  }

  return createMockFoodProvider();
}

