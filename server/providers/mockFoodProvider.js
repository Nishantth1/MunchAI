import { foods } from "../data/foods.js";
import { restaurants } from "../data/restaurants.js";
import { trendingSignalsByCity } from "../data/trending.js";

function titleCase(text) {
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeDishName(name) {
  return String(name).split(" - ")[0].trim().toLowerCase();
}

function createDistanceEstimate(restaurantId, dishName) {
  const sum = `${restaurantId}${dishName}`
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const distance = 0.8 + (sum % 22) / 10;
  return Number(distance.toFixed(1));
}

function buildSearchUrl(dishName, city) {
  return `https://www.swiggy.com/search?query=${encodeURIComponent(`${dishName} ${city}`)}`;
}

export function createMockFoodProvider() {
  return {
    name: "mock",
    async getCatalog({ city }) {
      const normalizedCity = titleCase(city || "Bangalore");
      const cityRestaurants = restaurants.filter(
        (restaurant) =>
          restaurant.city.toLowerCase() === normalizedCity.toLowerCase()
      );

      if (cityRestaurants.length === 0) {
        return foods;
      }

      const cityDishSet = new Set(
        cityRestaurants.flatMap((restaurant) =>
          restaurant.menu.map((item) => normalizeDishName(item.dish))
        )
      );

      const filtered = foods.filter((food) =>
        cityDishSet.has(normalizeDishName(food.canonicalName || food.name))
      );

      return filtered.length >= 8 ? filtered : foods;
    },

    async getTrendSignals({ city }) {
      const normalizedCity = titleCase(city || "Bangalore");
      return (
        trendingSignalsByCity[normalizedCity] || trendingSignalsByCity.Bangalore
      );
    },

    async getRestaurantsByDish({ city, dishes }) {
      const normalizedCity = titleCase(city || "Bangalore");
      const cityRestaurants = restaurants.filter(
        (restaurant) =>
          restaurant.city.toLowerCase() === normalizedCity.toLowerCase()
      );
      const candidates = cityRestaurants.length > 0 ? cityRestaurants : restaurants;

      return Object.fromEntries(
        dishes.map((dish) => {
          const normalizedDish = normalizeDishName(dish);
          const matches = candidates
            .map((restaurant) => {
              const menuMatch = restaurant.menu.find(
                (menuItem) => normalizeDishName(menuItem.dish) === normalizedDish
              );
              if (!menuMatch) {
                return null;
              }

              return {
                id: restaurant.id,
                name: restaurant.name,
                city: restaurant.city,
                rating: restaurant.rating,
                estimatedPrice: menuMatch.price,
                distanceKm: createDistanceEstimate(restaurant.id, dish),
                orderUrl: buildSearchUrl(dish, normalizedCity)
              };
            })
            .filter(Boolean)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

          return [dish, matches];
        })
      );
    }
  };
}

