function titleCase(text) {
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function scoreTrends(signals) {
  const maxOrders = Math.max(...signals.map((item) => item.recentOrders || 0), 1);
  const maxSearch = Math.max(...signals.map((item) => item.searchFrequency || 0), 1);

  return signals
    .map((item) => {
      const ordersNormalized = ((item.recentOrders || 0) / maxOrders) * 100;
      const searchNormalized = ((item.searchFrequency || 0) / maxSearch) * 100;
      const ratingNormalized = ((item.rating || 0) / 5) * 100;
      const trendingScore =
        ordersNormalized * 0.6 + searchNormalized * 0.3 + ratingNormalized * 0.1;

      return {
        ...item,
        trendingScore: Number(trendingScore.toFixed(2))
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore);
}

function buildTrendReason(signal) {
  if ((signal.recentOrders || 0) >= 170) {
    return "High repeat orders in the last hour";
  }
  if ((signal.searchFrequency || 0) >= 145) {
    return "Strong active searches in your city";
  }
  if ((signal.rating || 0) >= 4.4) {
    return "Excellent ratings with stable demand";
  }
  return "Consistent city demand and positive ratings";
}

export async function getTrendingFoods(cityInput, { foodProvider }) {
  const city = cityInput ? titleCase(cityInput) : "Bangalore";
  const [signals, catalog] = await Promise.all([
    foodProvider.getTrendSignals({ city }),
    foodProvider.getCatalog({ city })
  ]);

  const safeSignals = Array.isArray(signals) ? signals : [];
  const ranked = scoreTrends(safeSignals).slice(0, 5);
  const priceMap = new Map(
    (Array.isArray(catalog) ? catalog : []).map((item) => [
      (item.canonicalName || item.name).toLowerCase(),
      item.avgPrice
    ])
  );

  const dishNames = ranked.map((item) => item.dish);
  const restaurantsByDish = await foodProvider.getRestaurantsByDish({
    city,
    dishes: dishNames
  });

  return {
    city,
    trending: ranked.map((signal, index) => ({
      rank: index + 1,
      dish: signal.dish,
      recentOrders: signal.recentOrders || 0,
      searchFrequency: signal.searchFrequency || 0,
      rating: signal.rating || 0,
      trendingScore: signal.trendingScore,
      reason: buildTrendReason(signal),
      estimatedPrice: priceMap.get(signal.dish.toLowerCase()) ?? null,
      availableAtRestaurants: (restaurantsByDish?.[signal.dish] || []).length
    }))
  };
}

