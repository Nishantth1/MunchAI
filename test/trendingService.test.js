import test from "node:test";
import assert from "node:assert/strict";
import { getTrendingFoods } from "../server/services/trendingService.js";

const provider = {
  async getTrendSignals() {
    return [
      { dish: "Dish A", recentOrders: 200, searchFrequency: 180, rating: 4.2 },
      { dish: "Dish B", recentOrders: 150, searchFrequency: 190, rating: 4.6 },
      { dish: "Dish C", recentOrders: 120, searchFrequency: 110, rating: 4.1 }
    ];
  },
  async getCatalog() {
    return [
      { name: "Dish A", canonicalName: "Dish A", avgPrice: 250 },
      { name: "Dish B", canonicalName: "Dish B", avgPrice: 220 },
      { name: "Dish C", canonicalName: "Dish C", avgPrice: 180 }
    ];
  },
  async getRestaurantsByDish({ dishes }) {
    return Object.fromEntries(dishes.map((dish) => [dish, [{ id: dish }]]));
  }
};

test("trending service ranks dishes by weighted trend score", async () => {
  const result = await getTrendingFoods("Bangalore", { foodProvider: provider });

  assert.equal(result.trending.length, 3);
  assert.equal(result.trending[0].dish, "Dish A");
  assert.ok(result.trending[0].trendingScore > result.trending[1].trendingScore);
  assert.equal(result.trending[0].availableAtRestaurants, 1);
});

