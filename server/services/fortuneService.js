import { getRecommendations } from "./recommendationService.js";

const fallbackReasons = {
  lazy: "Low energy day, high reward meal.",
  happy: "Your vibe calls for something fun and satisfying.",
  gym: "Recovery fuel wins tonight.",
  sick: "Comfort and gentle food will feel better today.",
  broke: "Big taste, tight budget, perfect combo.",
  tired: "This is your low-effort comfort reset.",
  balanced: "A smart and tasty middle path works best today."
};

function fallbackReasonForMood(mood) {
  return fallbackReasons[mood] || fallbackReasons.balanced;
}

export async function getFoodFortune(payload = {}, deps) {
  const request = {
    mood: payload.mood || "balanced",
    hungerLevel: payload.hungerLevel || 3,
    budget: payload.budget || 250,
    diet: payload.diet || "any",
    healthGoal: payload.healthGoal || "none",
    city: payload.city || "Bangalore"
  };

  const recommendationResult = await getRecommendations(request, deps);
  const topPick = recommendationResult.recommendations[0];

  if (!topPick) {
    return {
      title: "Food Prediction",
      message: "No clear signal right now. Try relaxing filters and retry."
    };
  }

  const mood = recommendationResult.input.mood;
  const generatedReason = await deps.geminiClient.generateFortuneReason({
    mood,
    city: recommendationResult.input.city,
    dish: topPick.canonicalDish,
    budget: recommendationResult.input.budget,
    diet: recommendationResult.input.diet,
    healthGoal: recommendationResult.input.healthGoal
  });

  const reason = generatedReason || fallbackReasonForMood(mood);
  const shareText = `Food Fortune: ${topPick.canonicalDish} (INR ${topPick.priceEstimate}) in ${recommendationResult.input.city}. ${reason}`;

  return {
    title: "Food Prediction",
    city: recommendationResult.input.city,
    mood,
    dish: topPick.canonicalDish,
    variant: topPick.dish,
    priceEstimate: topPick.priceEstimate,
    protein: topPick.protein,
    calories: topPick.calories,
    reason,
    shareText
  };
}

