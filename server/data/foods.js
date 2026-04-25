const baseFoods = [
  {
    id: "f1",
    name: "Paneer Roll",
    category: "rolls",
    diet: "veg",
    protein: 19,
    calories: 520,
    avgPrice: 180,
    moodTags: ["lazy", "happy"],
    healthTags: ["high_protein"]
  },
  {
    id: "f2",
    name: "Veg Burrito",
    category: "wraps",
    diet: "veg",
    protein: 16,
    calories: 560,
    avgPrice: 190,
    moodTags: ["lazy", "happy"],
    healthTags: ["balanced"]
  },
  {
    id: "f3",
    name: "Paneer Fried Rice",
    category: "rice-bowls",
    diet: "veg",
    protein: 18,
    calories: 640,
    avgPrice: 200,
    moodTags: ["tired", "lazy"],
    healthTags: ["balanced"]
  },
  {
    id: "f4",
    name: "Chicken Shawarma",
    category: "wraps",
    diet: "non-veg",
    protein: 28,
    calories: 610,
    avgPrice: 210,
    moodTags: ["lazy", "happy"],
    healthTags: ["high_protein"]
  },
  {
    id: "f5",
    name: "Masala Dosa",
    category: "dosa-idli",
    diet: "veg",
    protein: 9,
    calories: 430,
    avgPrice: 130,
    moodTags: ["tired", "sick"],
    healthTags: ["light"]
  },
  {
    id: "f6",
    name: "Momos",
    category: "street-snacks",
    diet: "veg",
    protein: 8,
    calories: 390,
    avgPrice: 140,
    moodTags: ["lazy", "happy"],
    healthTags: ["light"]
  },
  {
    id: "f7",
    name: "Paneer Wrap",
    category: "wraps",
    diet: "veg",
    protein: 20,
    calories: 540,
    avgPrice: 195,
    moodTags: ["lazy", "gym"],
    healthTags: ["high_protein"]
  },
  {
    id: "f8",
    name: "Chicken Biryani",
    category: "biryani",
    diet: "non-veg",
    protein: 31,
    calories: 780,
    avgPrice: 260,
    moodTags: ["happy", "tired"],
    healthTags: ["indulgent"]
  },
  {
    id: "f9",
    name: "Veg Biryani",
    category: "biryani",
    diet: "veg",
    protein: 12,
    calories: 720,
    avgPrice: 220,
    moodTags: ["happy", "tired"],
    healthTags: ["indulgent"]
  },
  {
    id: "f10",
    name: "Grilled Chicken Bowl",
    category: "healthy-bowls",
    diet: "non-veg",
    protein: 36,
    calories: 510,
    avgPrice: 280,
    moodTags: ["gym", "balanced"],
    healthTags: ["high_protein", "balanced"]
  },
  {
    id: "f11",
    name: "Tofu Salad",
    category: "salads",
    diet: "veg",
    protein: 24,
    calories: 340,
    avgPrice: 240,
    moodTags: ["gym", "sick"],
    healthTags: ["high_protein", "low_calorie", "light"]
  },
  {
    id: "f12",
    name: "Dal Khichdi",
    category: "comfort",
    diet: "veg",
    protein: 13,
    calories: 380,
    avgPrice: 160,
    moodTags: ["sick", "tired"],
    healthTags: ["light"]
  },
  {
    id: "f13",
    name: "Rajma Rice",
    category: "comfort",
    diet: "veg",
    protein: 15,
    calories: 570,
    avgPrice: 170,
    moodTags: ["tired", "balanced"],
    healthTags: ["balanced"]
  },
  {
    id: "f14",
    name: "Egg Bhurji Roll",
    category: "rolls",
    diet: "non-veg",
    protein: 22,
    calories: 500,
    avgPrice: 170,
    moodTags: ["lazy", "gym"],
    healthTags: ["high_protein"]
  },
  {
    id: "f15",
    name: "Paneer Tikka",
    category: "grills",
    diet: "veg",
    protein: 27,
    calories: 420,
    avgPrice: 260,
    moodTags: ["gym", "happy"],
    healthTags: ["high_protein", "low_calorie"]
  },
  {
    id: "f16",
    name: "Grilled Fish",
    category: "grills",
    diet: "non-veg",
    protein: 34,
    calories: 390,
    avgPrice: 320,
    moodTags: ["gym", "balanced"],
    healthTags: ["high_protein", "low_calorie"]
  },
  {
    id: "f17",
    name: "Tomato Soup",
    category: "soups",
    diet: "veg",
    protein: 6,
    calories: 170,
    avgPrice: 120,
    moodTags: ["sick", "tired"],
    healthTags: ["light", "low_calorie"]
  },
  {
    id: "f18",
    name: "Chicken Soup",
    category: "soups",
    diet: "non-veg",
    protein: 19,
    calories: 220,
    avgPrice: 170,
    moodTags: ["sick", "gym"],
    healthTags: ["light", "high_protein"]
  },
  {
    id: "f19",
    name: "Aloo Paratha",
    category: "comfort",
    diet: "veg",
    protein: 10,
    calories: 530,
    avgPrice: 140,
    moodTags: ["tired", "lazy"],
    healthTags: ["indulgent"]
  },
  {
    id: "f20",
    name: "Idli Sambar",
    category: "dosa-idli",
    diet: "veg",
    protein: 8,
    calories: 290,
    avgPrice: 110,
    moodTags: ["sick", "tired"],
    healthTags: ["light", "low_calorie"]
  },
  {
    id: "f21",
    name: "Chicken Caesar Salad",
    category: "salads",
    diet: "non-veg",
    protein: 30,
    calories: 420,
    avgPrice: 290,
    moodTags: ["gym", "balanced"],
    healthTags: ["high_protein"]
  },
  {
    id: "f22",
    name: "Veg Hakka Noodles",
    category: "fast-food",
    diet: "veg",
    protein: 11,
    calories: 620,
    avgPrice: 180,
    moodTags: ["lazy", "happy"],
    healthTags: ["indulgent"]
  },
  {
    id: "f23",
    name: "Chicken Noodles",
    category: "fast-food",
    diet: "non-veg",
    protein: 23,
    calories: 690,
    avgPrice: 220,
    moodTags: ["lazy", "happy"],
    healthTags: ["indulgent"]
  },
  {
    id: "f24",
    name: "Chole Bhature",
    category: "street-snacks",
    diet: "veg",
    protein: 14,
    calories: 760,
    avgPrice: 180,
    moodTags: ["happy", "tired"],
    healthTags: ["indulgent"]
  },
  {
    id: "f25",
    name: "Pav Bhaji",
    category: "street-snacks",
    diet: "veg",
    protein: 9,
    calories: 610,
    avgPrice: 160,
    moodTags: ["happy", "lazy"],
    healthTags: ["balanced"]
  },
  {
    id: "f26",
    name: "Chicken Kebab Wrap",
    category: "wraps",
    diet: "non-veg",
    protein: 33,
    calories: 590,
    avgPrice: 250,
    moodTags: ["gym", "happy"],
    healthTags: ["high_protein"]
  },
  {
    id: "f27",
    name: "Quinoa Veg Bowl",
    category: "healthy-bowls",
    diet: "veg",
    protein: 17,
    calories: 420,
    avgPrice: 260,
    moodTags: ["gym", "balanced"],
    healthTags: ["low_calorie", "balanced"]
  },
  {
    id: "f28",
    name: "Curd Rice",
    category: "comfort",
    diet: "veg",
    protein: 8,
    calories: 330,
    avgPrice: 130,
    moodTags: ["sick", "tired"],
    healthTags: ["light"]
  },
  {
    id: "f29",
    name: "Veg Sandwich",
    category: "fast-food",
    diet: "veg",
    protein: 10,
    calories: 360,
    avgPrice: 150,
    moodTags: ["lazy", "balanced"],
    healthTags: ["light"]
  },
  {
    id: "f30",
    name: "Chicken Sandwich",
    category: "fast-food",
    diet: "non-veg",
    protein: 24,
    calories: 430,
    avgPrice: 190,
    moodTags: ["lazy", "gym"],
    healthTags: ["high_protein"]
  },
  {
    id: "f31",
    name: "Schezwan Paneer Bowl",
    category: "rice-bowls",
    diet: "veg",
    protein: 21,
    calories: 660,
    avgPrice: 240,
    moodTags: ["happy", "lazy"],
    healthTags: ["indulgent"]
  },
  {
    id: "f32",
    name: "Butter Chicken",
    category: "curries",
    diet: "non-veg",
    protein: 29,
    calories: 710,
    avgPrice: 310,
    moodTags: ["tired", "happy"],
    healthTags: ["indulgent"]
  },
  {
    id: "f33",
    name: "Palak Paneer",
    category: "curries",
    diet: "veg",
    protein: 23,
    calories: 480,
    avgPrice: 260,
    moodTags: ["tired", "balanced"],
    healthTags: ["high_protein", "balanced"]
  },
  {
    id: "f34",
    name: "Oats Upma",
    category: "healthy-bowls",
    diet: "veg",
    protein: 11,
    calories: 300,
    avgPrice: 140,
    moodTags: ["sick", "balanced"],
    healthTags: ["low_calorie", "light"]
  },
  {
    id: "f35",
    name: "Protein Smoothie Bowl",
    category: "healthy-bowls",
    diet: "veg",
    protein: 26,
    calories: 360,
    avgPrice: 280,
    moodTags: ["gym", "happy"],
    healthTags: ["high_protein", "low_calorie"]
  },
  {
    id: "f36",
    name: "Chocolate Brownie",
    category: "desserts",
    diet: "veg",
    protein: 5,
    calories: 420,
    avgPrice: 150,
    moodTags: ["happy"],
    healthTags: ["indulgent"]
  },
  {
    id: "f37",
    name: "Mutton Keema Roll",
    category: "rolls",
    diet: "non-veg",
    protein: 30,
    calories: 680,
    avgPrice: 290,
    moodTags: ["happy", "lazy"],
    healthTags: ["high_protein"]
  },
  {
    id: "f38",
    name: "Veg Sushi Bowl",
    category: "healthy-bowls",
    diet: "veg",
    protein: 14,
    calories: 350,
    avgPrice: 300,
    moodTags: ["balanced", "happy"],
    healthTags: ["low_calorie", "balanced"]
  },
  {
    id: "f39",
    name: "Chicken Sushi Bowl",
    category: "healthy-bowls",
    diet: "non-veg",
    protein: 29,
    calories: 430,
    avgPrice: 340,
    moodTags: ["gym", "balanced"],
    healthTags: ["high_protein", "low_calorie"]
  },
  {
    id: "f40",
    name: "Veg Thali",
    category: "comfort",
    diet: "veg",
    protein: 18,
    calories: 690,
    avgPrice: 240,
    moodTags: ["tired", "balanced"],
    healthTags: ["balanced"]
  }
];

const variantProfiles = [
  {
    id: "street",
    suffix: "Street Style",
    priceDelta: 15,
    calorieMultiplier: 1.08,
    proteinMultiplier: 1,
    addMoodTags: ["happy", "lazy"],
    addHealthTags: ["indulgent"]
  },
  {
    id: "homestyle",
    suffix: "Homestyle",
    priceDelta: 10,
    calorieMultiplier: 0.96,
    proteinMultiplier: 1.02,
    addMoodTags: ["tired", "balanced"],
    addHealthTags: ["balanced"]
  },
  {
    id: "lite",
    suffix: "Lite",
    priceDelta: 12,
    calorieMultiplier: 0.82,
    proteinMultiplier: 0.92,
    addMoodTags: ["sick", "balanced"],
    addHealthTags: ["light", "low_calorie"]
  },
  {
    id: "protein",
    suffix: "Protein Boost",
    priceDelta: 25,
    calorieMultiplier: 1.05,
    proteinMultiplier: 1.28,
    addMoodTags: ["gym"],
    addHealthTags: ["high_protein"]
  }
];

function dedupe(values) {
  return [...new Set(values)];
}

function buildVariant(baseFood, variant) {
  return {
    ...baseFood,
    id: `${baseFood.id}-${variant.id}`,
    name: `${baseFood.name} - ${variant.suffix}`,
    canonicalName: baseFood.name,
    avgPrice: Math.round(baseFood.avgPrice + variant.priceDelta),
    calories: Math.max(120, Math.round(baseFood.calories * variant.calorieMultiplier)),
    protein: Math.max(4, Math.round(baseFood.protein * variant.proteinMultiplier)),
    moodTags: dedupe([...baseFood.moodTags, ...variant.addMoodTags]),
    healthTags: dedupe([...baseFood.healthTags, ...variant.addHealthTags])
  };
}

export const foods = baseFoods.flatMap((baseFood) => {
  const signature = {
    ...baseFood,
    canonicalName: baseFood.name,
    variant: "signature"
  };
  const variants = variantProfiles.map((variant) => buildVariant(baseFood, variant));
  return [signature, ...variants];
});

export const totalFoodItems = foods.length;
