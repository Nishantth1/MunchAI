const citySelect = document.getElementById("city");
const moodButtons = Array.from(document.querySelectorAll(".mood-button[data-mood]"));
const surpriseButton = document.getElementById("surprise-button");
const budgetInput = document.getElementById("budget");
const budgetOutput = document.getElementById("budget-output");
const hungerInput = document.getElementById("hungerLevel");
const hungerOutput = document.getElementById("hunger-output");
const dietChips = Array.from(document.querySelectorAll("#diet-chips .chip"));
const healthChips = Array.from(document.querySelectorAll("#health-chips .chip"));
const resultsContainer = document.getElementById("recommendation-results");
const resultsMeta = document.getElementById("results-meta");
const recommendationStatus = document.getElementById("recommendation-status");
const trendingResults = document.getElementById("trending-results");
const refreshTrendingButton = document.getElementById("refresh-trending");
const fortuneButton = document.getElementById("fortune-button");
const fortuneResult = document.getElementById("fortune-result");

const moodOptions = ["lazy", "happy", "gym", "sick", "broke"];

const state = {
  mood: "lazy",
  hungerLevel: 3,
  budget: 250,
  diet: "any",
  healthGoal: "none",
  city: "Bangalore"
};

let recommendDebounce = null;

function escapeHtml(unsafe) {
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMood(mood) {
  return mood.charAt(0).toUpperCase() + mood.slice(1);
}

function setStatus(message) {
  recommendationStatus.textContent = message;
}

function setActiveChip(chips, value) {
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.value === value);
  });
}

function setActiveMoodButton(mood) {
  moodButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mood === mood);
  });
}

function buildPayload() {
  return {
    mood: state.mood,
    hungerLevel: state.hungerLevel,
    budget: state.budget,
    diet: state.diet,
    healthGoal: state.healthGoal,
    city: state.city
  };
}

async function fetchRecommendations(payload) {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Unable to fetch recommendations");
  }
  return response.json();
}

async function fetchTrending(city) {
  const response = await fetch(`/api/trending?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Unable to fetch trending foods");
  }
  return response.json();
}

async function fetchFoodFortune(payload) {
  const response = await fetch("/api/fortune", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Unable to generate food fortune");
  }
  return response.json();
}

function renderRecommendations(data) {
  if (!data.recommendations?.length) {
    resultsContainer.innerHTML =
      '<p class="empty-state">No strong matches. Try increasing budget or relaxing filters.</p>';
    resultsMeta.textContent = "";
    return;
  }

  resultsMeta.textContent = `${data.input.city} | ${formatMood(data.input.mood)} mood`;

  const cardsHtml = data.recommendations
    .map((item) => {
      const restaurants = item.nearbyRestaurants?.length
        ? `<ul class="restaurant-list">
            ${item.nearbyRestaurants
              .map(
                (restaurant) =>
                  `<li>
                    ${escapeHtml(restaurant.name)} (${restaurant.rating.toFixed(1)}★)
                    <a target="_blank" rel="noreferrer" href="${escapeHtml(
                      restaurant.googleMapsSearchUrl
                    )}">Map</a>
                  </li>`
              )
              .join("")}
          </ul>`
        : "<p class='micro'>No direct menu match yet. Use map search from the dish card.</p>";

      return `<article class="result-card">
          <div class="result-title">
            <h3>${item.rank}. ${escapeHtml(item.canonicalDish)}</h3>
            <p>INR ${item.priceEstimate}</p>
          </div>
          <p class="micro">${escapeHtml(item.reason)}</p>
          <p class="micro">${item.protein}g protein • ${item.calories} kcal • score ${item.totalScore}</p>
          <p class="micro strong">Nearby options</p>
          ${restaurants}
        </article>`;
    })
    .join("");

  resultsContainer.innerHTML = cardsHtml;
}

function renderTrending(data) {
  if (!data.trending?.length) {
    trendingResults.innerHTML = '<li class="trending-item">No trends found for this city.</li>';
    return;
  }

  trendingResults.innerHTML = data.trending
    .map(
      (item) => `<li class="trending-item">
        <div class="trend-top">
          <strong>${item.rank}. ${escapeHtml(item.dish)}</strong>
          <span>${item.trendingScore}</span>
        </div>
        <p>${item.reason}</p>
        <p class="micro">
          Orders: ${item.recentOrders} • Searches: ${item.searchFrequency} • Rating: ${item.rating.toFixed(
        1
      )}★
        </p>
      </li>`
    )
    .join("");
}

function renderFortune(result) {
  if (!result?.dish) {
    fortuneResult.innerHTML =
      '<p class="empty-state">No fortune signal right now. Try again in a moment.</p>';
    return;
  }

  fortuneResult.innerHTML = `<p class="fortune-heading">Food Prediction</p>
    <h3>${escapeHtml(result.dish)}</h3>
    <p class="micro">INR ${result.priceEstimate} • ${result.protein}g protein</p>
    <p>${escapeHtml(result.reason)}</p>
    <button id="share-fortune" class="primary-inline" type="button">Share Result</button>`;

  const shareButton = document.getElementById("share-fortune");
  shareButton.addEventListener("click", async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Food Fortune",
          text: result.shareText
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.shareText);
        shareButton.textContent = "Copied";
      } else {
        shareButton.textContent = "Share unsupported";
      }
    } catch {
      shareButton.textContent = "Share cancelled";
    }
  });
}

async function refreshRecommendations(sourceLabel) {
  setStatus(`Updating picks (${sourceLabel})...`);
  resultsContainer.innerHTML = '<p class="empty-state">Finding best matches...</p>';

  try {
    const data = await fetchRecommendations(buildPayload());
    renderRecommendations(data);
    setStatus("Picks ready.");
  } catch (error) {
    resultsContainer.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
    setStatus("Unable to update picks.");
  }
}

async function refreshTrending() {
  trendingResults.innerHTML = '<li class="trending-item">Loading trends...</li>';
  try {
    const data = await fetchTrending(state.city);
    renderTrending(data);
  } catch (error) {
    trendingResults.innerHTML = `<li class="trending-item">${escapeHtml(
      error.message
    )}</li>`;
  }
}

function queueRecommendationRefresh(sourceLabel) {
  clearTimeout(recommendDebounce);
  recommendDebounce = setTimeout(() => {
    refreshRecommendations(sourceLabel);
  }, 220);
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    setActiveMoodButton(state.mood);
    refreshRecommendations(`mood: ${state.mood}`);
  });
});

surpriseButton.addEventListener("click", () => {
  const randomMood = moodOptions[Math.floor(Math.random() * moodOptions.length)];
  state.mood = randomMood;
  state.budget = 140 + Math.floor(Math.random() * 250);
  state.hungerLevel = 2 + Math.floor(Math.random() * 4);

  budgetInput.value = String(state.budget);
  hungerInput.value = String(state.hungerLevel);
  budgetOutput.textContent = `INR ${state.budget}`;
  hungerOutput.textContent = `${state.hungerLevel}/5`;
  setActiveMoodButton(state.mood);
  refreshRecommendations("surprise");
});

citySelect.addEventListener("change", () => {
  state.city = citySelect.value;
  queueRecommendationRefresh("city");
  refreshTrending();
});

budgetInput.addEventListener("input", () => {
  state.budget = Number(budgetInput.value);
  budgetOutput.textContent = `INR ${state.budget}`;
  queueRecommendationRefresh("budget");
});

hungerInput.addEventListener("input", () => {
  state.hungerLevel = Number(hungerInput.value);
  hungerOutput.textContent = `${state.hungerLevel}/5`;
  queueRecommendationRefresh("hunger");
});

dietChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    state.diet = chip.dataset.value;
    setActiveChip(dietChips, state.diet);
    refreshRecommendations("diet");
  });
});

healthChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    state.healthGoal = chip.dataset.value;
    setActiveChip(healthChips, state.healthGoal);
    refreshRecommendations("health");
  });
});

refreshTrendingButton.addEventListener("click", () => {
  refreshTrending();
});

fortuneButton.addEventListener("click", async () => {
  fortuneResult.innerHTML = "<p>Reading your food fortune...</p>";
  try {
    const result = await fetchFoodFortune(buildPayload());
    renderFortune(result);
  } catch (error) {
    fortuneResult.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
});

async function initialize() {
  budgetOutput.textContent = `INR ${state.budget}`;
  hungerOutput.textContent = `${state.hungerLevel}/5`;
  setActiveMoodButton(state.mood);
  setActiveChip(dietChips, state.diet);
  setActiveChip(healthChips, state.healthGoal);
  await Promise.all([refreshRecommendations("initial"), refreshTrending()]);
}

initialize();

