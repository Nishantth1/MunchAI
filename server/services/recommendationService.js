const moodAliases = {
  stressed: "tired",
  exhausted: "tired",
  workout: "gym",
  fitness: "gym",
  unwell: "sick",
  low: "tired",
  broke: "broke"
};

const moodCategoryMap = {
  lazy: ["rolls", "wraps", "fast-food", "street-snacks"],
  tired: ["comfort", "curries", "rice-bowls", "dosa-idli"],
  gym: ["healthy-bowls", "grills", "salads", "wraps"],
  sick: ["soups", "comfort", "dosa-idli", "healthy-bowls"],
  happy: ["biryani", "street-snacks", "desserts", "wraps"],
  balanced: ["rice-bowls", "healthy-bowls", "wraps", "curries"],
  broke: ["street-snacks", "dosa-idli", "fast-food", "comfort"]
};

const healthAliases = {
  "high protein": "high_protein",
  protein: "high_protein",
  "low calorie": "low_calorie",
  lowcal: "low_calorie",
  light: "light",
  healthy: "balanced"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(text) {
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeDiet(dietInput) {
  const diet = String(dietInput || "any").toLowerCase().trim();
  if (diet === "veg" || diet === "vegetarian") {
    return "veg";
  }
  if (diet === "non-veg" || diet === "non veg" || diet === "nonvegetarian") {
    return "non-veg";
  }
  return "any";
}

function normalizeMood(moodInput) {
  const rawMood = String(moodInput || "balanced").toLowerCase().trim();
  return moodAliases[rawMood] || rawMood || "balanced";
}

function normalizeHealthGoal(goalInput) {
  const rawGoal = String(goalInput || "none").toLowerCase().trim();
  return healthAliases[rawGoal] || rawGoal || "none";
}

function normalizeCity(cityInput) {
  const city = String(cityInput || "Bangalore").trim();
  return city ? titleCase(city) : "Bangalore";
}

function normalizeHungerLevel(levelInput) {
  const level = Number(levelInput);
  if (!Number.isFinite(level)) {
    return 3;
  }
  return clamp(Math.round(level), 1, 5);
}

function normalizeBudget(budgetInput) {
  const budget = Number(budgetInput);
  if (!Number.isFinite(budget) || budget <= 0) {
    return 250;
  }
  return Math.round(budget);
}

function normalizeDishName(name) {
  return String(name).split(" - ")[0].trim().toLowerCase();
}

function moodMatchScore(food, mood) {
  const preferredCategories = moodCategoryMap[mood] || moodCategoryMap.balanced;
  const foodMoodTags = Array.isArray(food.moodTags) ? food.moodTags : [];
  if (foodMoodTags.includes(mood)) {
    return 1;
  }
  if (preferredCategories.includes(food.category)) {
    return 0.85;
  }
  return 0.35;
}

function budgetMatchScore(food, budget, mood) {
  if (food.avgPrice <= budget) {
    return 1;
  }

  const overspend = (food.avgPrice - budget) / Math.max(80, budget);
  let score = 1 - overspend;
  if (mood === "broke") {
    score -= 0.2;
  }
  return clamp(score, 0, 1);
}

function dietMatchScore(food, diet) {
  if (diet === "any") {
    return 1;
  }
  return food.diet === diet ? 1 : 0;
}

function healthGoalMatchScore(food, healthGoal) {
  const foodHealthTags = Array.isArray(food.healthTags) ? food.healthTags : [];

  if (!healthGoal || healthGoal === "none") {
    return 0.7;
  }
  if (foodHealthTags.includes(healthGoal)) {
    return 1;
  }
  if (healthGoal === "high_protein") {
    return food.protein >= 24 ? 0.9 : 0.2;
  }
  if (healthGoal === "low_calorie") {
    return food.calories <= 420 ? 0.9 : 0.2;
  }
  if (healthGoal === "light") {
    return food.calories <= 380 ? 0.9 : 0.2;
  }
  if (healthGoal === "balanced") {
    return food.calories <= 620 ? 0.85 : 0.4;
  }
  return 0.4;
}

function hungerLevelMatchScore(food, hungerLevel) {
  const targetCalories = [300, 420, 560, 700, 840][hungerLevel - 1];
  const difference = Math.abs(food.calories - targetCalories);
  return clamp(1 - difference / Math.max(220, targetCalories), 0, 1);
}

function buildPopularityMap(trendSignals) {
  if (!Array.isArray(trendSignals) || trendSignals.length === 0) {
    return new Map();
  }

  const maxOrders = Math.max(...trendSignals.map((item) => item.recentOrders || 0), 1);
  const maxSearch = Math.max(
    ...trendSignals.map((item) => item.searchFrequency || 0),
    1
  );

  return new Map(
    trendSignals.map((item) => {
      const score =
        0.6 * ((item.recentOrders || 0) / maxOrders) +
        0.3 * ((item.searchFrequency || 0) / maxSearch) +
        0.1 * ((item.rating || 0) / 5);
      return [normalizeDishName(item.dish), Number(score.toFixed(3))];
    })
  );
}

function buildReason(input, score) {
  const reasons = [];
  if (score.moodMatch >= 0.85) {
    reasons.push(`matches your ${input.mood} mood`);
  }
  if (score.budgetMatch >= 0.9) {
    reasons.push("fits your budget");
  }
  if (input.healthGoal !== "none" && score.healthGoalMatch >= 0.85) {
    reasons.push(`supports ${input.healthGoal.replace("_", " ")}`);
  }
  if (score.hungerMatch >= 0.75) {
    reasons.push("portion suits your hunger");
  }
  if (reasons.length === 0) {
    reasons.push("balanced fit for your constraints");
  }
  return reasons.join(", ");
}

function budgetPreFilter(foodList, budget, mood) {
  if (mood === "broke") {
    const brokeMatches = foodList.filter((food) => food.avgPrice <= budget);
    if (brokeMatches.length >= 3) {
      return brokeMatches;
    }
  }

  const primaryMatches = foodList.filter((food) => food.avgPrice <= budget * 1.2);
  if (primaryMatches.length >= 3) {
    return primaryMatches;
  }
  return foodList;
}

function dietPreFilter(foodList, diet) {
  if (diet === "any") {
    return foodList;
  }
  const strictMatches = foodList.filter((food) => food.diet === diet);
  if (strictMatches.length >= 3) {
    return strictMatches;
  }
  return foodList;
}

function scoreFood(food, input, popularityMap) {
  const moodMatch = moodMatchScore(food, input.mood);
  const budgetMatch = budgetMatchScore(food, input.budget, input.mood);
  const dietMatch = dietMatchScore(food, input.diet);
  const healthGoalMatch = healthGoalMatchScore(food, input.healthGoal);
  const hungerMatch = hungerLevelMatchScore(food, input.hungerLevel);
  const localPopularity =
    popularityMap.get(normalizeDishName(food.canonicalName || food.name)) || 0.35;

  // score = mood*4 + budget*3 + diet*5 + health*3 + hunger*2
  const weightedScore =
    moodMatch * 4 +
    budgetMatch * 3 +
    dietMatch * 5 +
    healthGoalMatch * 3 +
    hungerMatch * 2;

  const totalScore = weightedScore + localPopularity * 0.5;

  return {
    totalScore: Number(totalScore.toFixed(3)),
    weightedScore: Number(weightedScore.toFixed(3)),
    moodMatch,
    budgetMatch,
    dietMatch,
    healthGoalMatch,
    hungerMatch,
    localPopularity
  };
}

export async function getRecommendations(payload, { foodProvider }) {
  const normalizedInput = {
    mood: normalizeMood(payload.mood),
    hungerLevel: normalizeHungerLevel(payload.hungerLevel),
    budget: normalizeBudget(payload.budget),
    diet: normalizeDiet(payload.diet),
    healthGoal: normalizeHealthGoal(payload.healthGoal),
    city: normalizeCity(payload.city)
  };

  const [catalog, trendSignals] = await Promise.all([
    foodProvider.getCatalog({ city: normalizedInput.city }),
    foodProvider.getTrendSignals({ city: normalizedInput.city })
  ]);

  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  const popularityMap = buildPopularityMap(Array.isArray(trendSignals) ? trendSignals : []);

  const dietCandidates = dietPreFilter(safeCatalog, normalizedInput.diet);
  const candidates = budgetPreFilter(
    dietCandidates,
    normalizedInput.budget,
    normalizedInput.mood
  );

  const ranked = candidates
    .map((food) => ({ food, score: scoreFood(food, normalizedInput, popularityMap) }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .slice(0, 3);

  const topDishNames = ranked.map(({ food }) => food.canonicalName || food.name);
  const restaurantsByDish = await foodProvider.getRestaurantsByDish({
    city: normalizedInput.city,
    dishes: topDishNames
  });

  const recommendations = ranked.map(({ food, score }, index) => {
    const canonicalDish = food.canonicalName || food.name;
    return {
      rank: index + 1,
      dish: food.name,
      canonicalDish,
      category: food.category,
      diet: food.diet,
      priceEstimate: food.avgPrice,
      calories: food.calories,
      protein: food.protein,
      totalScore: score.totalScore,
      weightedScore: score.weightedScore,
      scoreBreakdown: {
        moodMatch: Number(score.moodMatch.toFixed(2)),
        budgetMatch: Number(score.budgetMatch.toFixed(2)),
        dietMatch: Number(score.dietMatch.toFixed(2)),
        healthGoalMatch: Number(score.healthGoalMatch.toFixed(2)),
        hungerLevelMatch: Number(score.hungerMatch.toFixed(2)),
        localPopularity: Number(score.localPopularity.toFixed(2))
      },
      reason: buildReason(normalizedInput, score),
      nearbyRestaurants: (restaurantsByDish?.[canonicalDish] || []).map(
        (restaurant) => ({
          ...restaurant,
          googleMapsSearchUrl:
            restaurant.googleMapsSearchUrl || restaurant.orderUrl || ""
        })
      )
    };
  });

  return {
    input: normalizedInput,
    recommendations
  };
}
