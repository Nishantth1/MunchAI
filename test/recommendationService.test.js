import test from "node:test";
import assert from "node:assert/strict";
import { getRecommendations } from "../server/services/recommendationService.js";

function createProvider() {
  return {
    async getCatalog() {
      return [
        {
          id: "1",
          name: "Protein Bowl",
          canonicalName: "Protein Bowl",
          category: "healthy-bowls",
          diet: "non-veg",
          protein: 34,
          calories: 520,
          avgPrice: 280,
          moodTags: ["gym"],
          healthTags: ["high_protein"]
        },
        {
          id: "2",
          name: "Veg Noodles",
          canonicalName: "Veg Noodles",
          category: "fast-food",
          diet: "veg",
          protein: 10,
          calories: 620,
          avgPrice: 180,
          moodTags: ["happy", "lazy"],
          healthTags: ["indulgent"]
        },
        {
          id: "3",
          name: "Chicken Wrap",
          canonicalName: "Chicken Wrap",
          category: "wraps",
          diet: "non-veg",
          protein: 28,
          calories: 560,
          avgPrice: 250,
          moodTags: ["gym", "lazy"],
          healthTags: ["high_protein", "balanced"]
        }
      ];
    },
    async getTrendSignals() {
      return [
        { dish: "Protein Bowl", recentOrders: 100, searchFrequency: 80, rating: 4.4 },
        { dish: "Chicken Wrap", recentOrders: 95, searchFrequency: 70, rating: 4.2 },
        { dish: "Veg Noodles", recentOrders: 75, searchFrequency: 90, rating: 4.0 }
      ];
    },
    async getRestaurantsByDish({ dishes }) {
      return Object.fromEntries(
        dishes.map((dish) => [
          dish,
          [
            {
              id: `r-${dish}`,
              name: `${dish} Hub`,
              rating: 4.5,
              city: "Bangalore",
              estimatedPrice: 250,
              orderUrl: "https://example.com"
            }
          ]
        ])
      );
    }
  };
}

test("recommendation service ranks best matching dishes first", async () => {
  const provider = createProvider();
  const result = await getRecommendations(
    {
      mood: "gym",
      budget: 300,
      diet: "non-veg",
      healthGoal: "high_protein",
      hungerLevel: 3,
      city: "Bangalore"
    },
    { foodProvider: provider }
  );

  assert.equal(result.recommendations.length, 3);
  assert.ok(
    ["Protein Bowl", "Chicken Wrap"].includes(result.recommendations[0].canonicalDish)
  );
  assert.equal(result.recommendations[0].diet, "non-veg");
  assert.ok(result.recommendations[0].protein >= 28);
  assert.ok(result.recommendations[0].totalScore >= result.recommendations[1].totalScore);
});
