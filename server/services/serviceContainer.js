import { createGeminiClient } from "../ai/geminiClient.js";
import { createFoodProvider } from "../providers/providerFactory.js";
import { getFoodFortune } from "./fortuneService.js";
import { getRecommendations } from "./recommendationService.js";
import { getTrendingFoods } from "./trendingService.js";

export function createServiceContainer(config) {
  const foodProvider = createFoodProvider(config);
  const geminiClient = createGeminiClient(config);
  const deps = { foodProvider, geminiClient };

  return {
    metadata: {
      provider: foodProvider.name,
      aiEnabled: geminiClient.enabled
    },
    recommendationService: {
      getRecommendations: (payload) => getRecommendations(payload, deps)
    },
    trendingService: {
      getTrendingFoods: (city) => getTrendingFoods(city, deps)
    },
    fortuneService: {
      getFoodFortune: (payload) => getFoodFortune(payload, deps)
    }
  };
}

