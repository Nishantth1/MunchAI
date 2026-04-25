const citySelect = document.getElementById("city");
const moodButtons = Array.from(document.querySelectorAll(".mood-button[data-mood]"));
const surpriseButton = document.getElementById("surprise-button");
const budgetInput = document.getElementById("budget");
const budgetOutput = document.getElementById("budget-output");
const hungerInput = document.getElementById("hungerLevel");
const hungerOutput = document.getElementById("hunger-output");
const dietChips = Array.from(document.querySelectorAll("#diet-chips .chip"));
const healthChips = Array.from(document.querySelectorAll("#health-chips .chip"));
const ecosystemTabs = Array.from(document.querySelectorAll("#ecosystem-tabs .eco-tab"));
const ecosystemCopy = document.getElementById("ecosystem-copy");
const refreshAllButton = document.getElementById("refresh-all");
const recommendationStatus = document.getElementById("recommendation-status");
const resultsMeta = document.getElementById("results-meta");
const recommendationResults = document.getElementById("recommendation-results");
const dailyPickSummary = document.getElementById("daily-pick-summary");
const acceptPickButton = document.getElementById("accept-pick");
const acceptFeedback = document.getElementById("accept-feedback");
const runtimeBadge = document.getElementById("runtime-badge");
const refreshTrendingButton = document.getElementById("refresh-trending");
const trendingResults = document.getElementById("trending-results");
const fortuneButton = document.getElementById("fortune-button");
const fortuneResult = document.getElementById("fortune-result");
const weeklyReport = document.getElementById("weekly-report");

const moodOptions = ["lazy", "happy", "gym", "sick", "broke"];
const analyticsStorageKey = "munchai.analytics.v1";

const state = {
  city: "Bangalore",
  mood: "lazy",
  budget: 250,
  hungerLevel: 3,
  diet: "any",
  healthGoal: "none",
  channel: "food",
  latestRecommendations: [],
  latestTopPick: null
};

let debounceHandle = null;

function escapeHtml(value) {
  return String(value)
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

function setActiveMood(mood) {
  moodButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mood === mood);
  });
}

function setActiveChannel(channel) {
  ecosystemTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.channel === channel);
  });
}

function channelCopy(channel) {
  if (channel === "food") {
    return "Food channel selected. Recommendation cards open direct dish/order pathways.";
  }
  if (channel === "instamart") {
    return "Instamart selected. Great for quick cravings and ready-to-cook alternatives.";
  }
  return "Dineout selected. Great for nearby dine-in and social meal plans.";
}

function scoreLabelMap() {
  return [
    ["moodMatch", "Mood"],
    ["budgetMatch", "Budget"],
    ["dietMatch", "Diet"],
    ["healthGoalMatch", "Health"],
    ["hungerLevelMatch", "Hunger"],
    ["localPopularity", "Trend"]
  ];
}

function getAnalytics() {
  try {
    const raw = localStorage.getItem(analyticsStorageKey);
    const parsed = raw ? JSON.parse(raw) : { events: [] };
    if (!Array.isArray(parsed.events)) {
      return { events: [] };
    }
    return parsed;
  } catch {
    return { events: [] };
  }
}

function saveAnalytics(analytics) {
  localStorage.setItem(analyticsStorageKey, JSON.stringify(analytics));
}

function addAnalyticsEvent(event) {
  const analytics = getAnalytics();
  analytics.events.push({
    ...event,
    timestamp: Date.now()
  });
  const recentEvents = analytics.events.slice(-500);
  saveAnalytics({ events: recentEvents });
}

function startOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function buildWeeklySummary() {
  const analytics = getAnalytics();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const events = analytics.events.filter((event) => event.timestamp >= cutoff);
  const recommendationEvents = events.filter((event) => event.type === "recommendation");
  const acceptedEvents = events.filter((event) => event.type === "accepted");
  const under5s = recommendationEvents.filter(
    (event) => Number(event.decisionMs) < 5000
  ).length;

  const dishCounts = {};
  acceptedEvents.forEach((event) => {
    const key = event.dish || "Unknown";
    dishCounts[key] = (dishCounts[key] || 0) + 1;
  });
  const topDish = Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0] || [
    "No picks yet",
    0
  ];

  const avgDecisionMs =
    recommendationEvents.length > 0
      ? Math.round(
          recommendationEvents.reduce((acc, event) => acc + Number(event.decisionMs || 0), 0) /
            recommendationEvents.length
        )
      : 0;

  const dailyEventMap = new Map();
  events.forEach((event) => {
    dailyEventMap.set(startOfDay(event.timestamp), true);
  });

  let streak = 0;
  for (let index = 0; index < 7; index += 1) {
    const day = startOfDay(Date.now() - index * 24 * 60 * 60 * 1000);
    if (dailyEventMap.has(day)) {
      streak += 1;
    } else {
      break;
    }
  }

  const roastLine =
    topDish[1] >= 4
      ? `You selected ${topDish[0]} ${topDish[1]} times this week. Consistency level: elite.`
      : topDish[1] >= 2
        ? `${topDish[0]} is leading your week with ${topDish[1]} picks.`
        : "Use mood-based picks a few more times to unlock stronger personalization.";

  return {
    totalDecisions: recommendationEvents.length,
    acceptedCount: acceptedEvents.length,
    under5s,
    avgDecisionMs,
    streak,
    topDish: topDish[0],
    roastLine
  };
}

function renderWeeklyReport() {
  const summary = buildWeeklySummary();
  weeklyReport.innerHTML = `
    <div class="report-grid">
      <div class="report-metric">
        <p class="report-label">Decisions</p>
        <p class="report-value">${summary.totalDecisions}</p>
      </div>
      <div class="report-metric">
        <p class="report-label">Under 5s</p>
        <p class="report-value">${summary.under5s}</p>
      </div>
      <div class="report-metric">
        <p class="report-label">Streak</p>
        <p class="report-value">${summary.streak} day</p>
      </div>
    </div>
    <p class="report-line">Avg decision time: ${summary.avgDecisionMs} ms</p>
    <p class="report-line">Top dish: ${escapeHtml(summary.topDish)}</p>
    <p class="report-line">${escapeHtml(summary.roastLine)}</p>
  `;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return response.json();
}

async function fetchHealth() {
  return fetchJson("/api/health");
}

async function fetchRecommendations(payload) {
  return fetchJson("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function fetchTrending(city) {
  return fetchJson(`/api/trending?city=${encodeURIComponent(city)}`);
}

async function fetchFortune(payload) {
  return fetchJson("/api/fortune", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

function buildPayload() {
  return {
    mood: state.mood,
    city: state.city,
    budget: state.budget,
    hungerLevel: state.hungerLevel,
    diet: state.diet,
    healthGoal: state.healthGoal
  };
}

function buildChannelUrls(dishName, city, restaurants) {
  const foodUrl = restaurants?.[0]?.orderUrl || restaurants?.[0]?.googleMapsSearchUrl || "";
  const instamartUrl = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(dishName)}`;
  const dineoutUrl = `https://www.swiggy.com/dineout/search?query=${encodeURIComponent(`${dishName} ${city}`)}`;
  return {
    food: foodUrl || `https://www.swiggy.com/search?query=${encodeURIComponent(`${dishName} ${city}`)}`,
    instamart: instamartUrl,
    dineout: dineoutUrl
  };
}

function updateDailyPick(topPick) {
  state.latestTopPick = topPick || null;

  if (!topPick) {
    dailyPickSummary.textContent = "No meal pick available. Try a different mood.";
    acceptPickButton.disabled = true;
    acceptPickButton.textContent = "Accept and Open";
    return;
  }

  const channelNames = {
    food: "Food",
    instamart: "Instamart",
    dineout: "Dineout"
  };
  dailyPickSummary.textContent = `${topPick.canonicalDish} at INR ${topPick.priceEstimate} for ${formatMood(state.mood)} mood in ${state.city}.`;
  acceptPickButton.disabled = false;
  acceptPickButton.textContent = `Accept in ${channelNames[state.channel]}`;
}

function renderRecommendations(response) {
  if (!response.recommendations || response.recommendations.length === 0) {
    recommendationResults.innerHTML =
      '<p class="muted">No strong matches found. Increase budget or relax filters.</p>';
    resultsMeta.textContent = "";
    updateDailyPick(null);
    return;
  }

  state.latestRecommendations = response.recommendations;
  resultsMeta.textContent = `${response.input.city} | ${formatMood(response.input.mood)} mood`;
  updateDailyPick(response.recommendations[0]);

  recommendationResults.innerHTML = response.recommendations
    .map((item) => {
      const scoreRows = scoreLabelMap()
        .map(([field, label]) => {
          const value = Number(item.scoreBreakdown?.[field] || 0);
          const percent = Math.round(value * 100);
          return `
            <div class="score-row">
              <span>${label}</span>
              <div class="bar"><div class="bar-fill" style="width:${percent}%"></div></div>
              <span>${percent}</span>
            </div>
          `;
        })
        .join("");

      const restaurantChips =
        item.nearbyRestaurants && item.nearbyRestaurants.length > 0
          ? item.nearbyRestaurants
              .slice(0, 3)
              .map((restaurant) => {
                const rating = Number(restaurant.rating || 0).toFixed(1);
                const distance =
                  restaurant.distanceKm !== undefined
                    ? ` | ${restaurant.distanceKm} km`
                    : "";
                return `<span class="restaurant-chip">${escapeHtml(
                  restaurant.name
                )} | rating ${rating}${distance}</span>`;
              })
              .join("")
          : '<span class="restaurant-chip">No direct restaurant match yet</span>';

      const urls = buildChannelUrls(
        item.canonicalDish,
        response.input.city,
        item.nearbyRestaurants || []
      );

      const channelPrimaryUrl = urls[state.channel] || urls.food;

      return `
        <article class="recommendation-card">
          <div class="card-top">
            <p class="dish-name">${item.rank}. ${escapeHtml(item.canonicalDish)}</p>
            <p class="dish-price">INR ${item.priceEstimate}</p>
          </div>
          <p class="muted tiny">${escapeHtml(item.reason)}</p>
          <div class="metrics">
            <span class="metric">${item.protein}g protein</span>
            <span class="metric">${item.calories} kcal</span>
            <span class="metric">score ${item.totalScore}</span>
          </div>
          <div class="score-grid">${scoreRows}</div>
          <div class="restaurant-chips">${restaurantChips}</div>
          <div class="actions-row">
            <a class="action-link ${state.channel === "food" ? "primary" : ""}" target="_blank" rel="noreferrer" href="${escapeHtml(
              urls.food
            )}">Food</a>
            <a class="action-link ${state.channel === "instamart" ? "primary" : ""}" target="_blank" rel="noreferrer" href="${escapeHtml(
              urls.instamart
            )}">Instamart</a>
            <a class="action-link ${state.channel === "dineout" ? "primary" : ""}" target="_blank" rel="noreferrer" href="${escapeHtml(
              urls.dineout
            )}">Dineout</a>
          </div>
          <div class="actions-row">
            <a class="action-link primary" target="_blank" rel="noreferrer" href="${escapeHtml(
              channelPrimaryUrl
            )}">Open in Selected Channel</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function buildTrendBars(item) {
  const orders = Math.min(100, Math.round((Number(item.recentOrders || 0) / 240) * 100));
  const searches = Math.min(
    100,
    Math.round((Number(item.searchFrequency || 0) / 220) * 100)
  );
  const rating = Math.min(100, Math.round((Number(item.rating || 0) / 5) * 100));

  return `
    <div class="trend-breakdown">
      <div class="score-row">
        <span>Orders</span>
        <div class="bar"><div class="bar-fill" style="width:${orders}%"></div></div>
        <span>${orders}</span>
      </div>
      <div class="score-row">
        <span>Searches</span>
        <div class="bar"><div class="bar-fill" style="width:${searches}%"></div></div>
        <span>${searches}</span>
      </div>
      <div class="score-row">
        <span>Rating</span>
        <div class="bar"><div class="bar-fill" style="width:${rating}%"></div></div>
        <span>${rating}</span>
      </div>
    </div>
  `;
}

function renderTrending(response) {
  if (!response.trending || response.trending.length === 0) {
    trendingResults.innerHTML = '<li class="muted">No trends available for this city.</li>';
    return;
  }

  trendingResults.innerHTML = response.trending
    .map((item) => {
      return `
        <li class="trend-item">
          <div class="trend-header">
            <p><strong>${item.rank}. ${escapeHtml(item.dish)}</strong></p>
            <p class="trend-score">score ${item.trendingScore}</p>
          </div>
          <p class="tiny muted">${escapeHtml(item.reason)}</p>
          ${buildTrendBars(item)}
        </li>
      `;
    })
    .join("");
}

function renderFortune(result) {
  if (!result || !result.dish) {
    fortuneResult.innerHTML =
      '<p class="muted">No fortune available. Please try again in a moment.</p>';
    return;
  }

  fortuneResult.innerHTML = `
    <p class="fortune-title">Food Prediction</p>
    <p class="fortune-dish">${escapeHtml(result.dish)}</p>
    <p class="tiny muted">INR ${result.priceEstimate} | ${result.protein}g protein</p>
    <p class="tiny">${escapeHtml(result.reason)}</p>
    <button id="share-fortune" class="btn-primary" type="button">Share Result</button>
  `;

  const shareButton = document.getElementById("share-fortune");
  shareButton.addEventListener("click", async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MunchAI Food Fortune",
          text: result.shareText
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.shareText);
        shareButton.textContent = "Copied";
      } else {
        shareButton.textContent = "Unavailable";
      }
    } catch {
      shareButton.textContent = "Cancelled";
    }
  });
}

async function refreshRecommendations(trigger) {
  const startedAt = performance.now();
  setStatus(`Updating recommendations (${trigger})`);
  recommendationResults.innerHTML = '<p class="muted">Computing top picks.</p>';

  try {
    const response = await fetchRecommendations(buildPayload());
    renderRecommendations(response);
    const elapsed = Math.round(performance.now() - startedAt);
    setStatus(`Updated in ${elapsed} ms`);

    addAnalyticsEvent({
      type: "recommendation",
      city: state.city,
      mood: state.mood,
      decisionMs: elapsed,
      dish: response.recommendations?.[0]?.canonicalDish || ""
    });
    renderWeeklyReport();
  } catch (error) {
    setStatus("Failed to update recommendations");
    recommendationResults.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

async function refreshTrending() {
  trendingResults.innerHTML = '<li class="muted">Loading trends.</li>';
  try {
    const response = await fetchTrending(state.city);
    renderTrending(response);
  } catch (error) {
    trendingResults.innerHTML = `<li class="muted">${escapeHtml(error.message)}</li>`;
  }
}

function queueRecommendationRefresh(trigger) {
  clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => {
    refreshRecommendations(trigger);
  }, 220);
}

function selectedTopPickUrl() {
  const topPick = state.latestTopPick;
  if (!topPick) {
    return "";
  }
  const urls = buildChannelUrls(
    topPick.canonicalDish,
    state.city,
    topPick.nearbyRestaurants || []
  );
  return urls[state.channel] || urls.food;
}

async function refreshFortune() {
  fortuneResult.innerHTML = '<p class="muted">Generating food fortune.</p>';
  try {
    const result = await fetchFortune(buildPayload());
    renderFortune(result);
  } catch (error) {
    fortuneResult.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

async function refreshHealthBadge() {
  try {
    const health = await fetchHealth();
    const aiState = health.aiEnabled ? "AI on" : "AI fallback";
    runtimeBadge.textContent = `${health.provider} | ${aiState}`;
  } catch {
    runtimeBadge.textContent = "offline";
  }
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    setActiveMood(state.mood);
    refreshRecommendations(`mood:${state.mood}`);
  });
});

surpriseButton.addEventListener("click", () => {
  const randomMood = moodOptions[Math.floor(Math.random() * moodOptions.length)];
  state.mood = randomMood;
  state.budget = 120 + Math.floor(Math.random() * 360);
  state.hungerLevel = 1 + Math.floor(Math.random() * 5);
  budgetInput.value = String(state.budget);
  hungerInput.value = String(state.hungerLevel);
  budgetOutput.textContent = `INR ${state.budget}`;
  hungerOutput.textContent = `${state.hungerLevel}/5`;
  setActiveMood(state.mood);
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

ecosystemTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.channel = tab.dataset.channel;
    setActiveChannel(state.channel);
    ecosystemCopy.textContent = channelCopy(state.channel);
    updateDailyPick(state.latestTopPick);
    if (state.latestRecommendations.length > 0) {
      renderRecommendations({
        input: buildPayload(),
        recommendations: state.latestRecommendations
      });
    }
  });
});

acceptPickButton.addEventListener("click", () => {
  const topPick = state.latestTopPick;
  if (!topPick) {
    return;
  }

  const url = selectedTopPickUrl();
  if (!url) {
    acceptFeedback.textContent = "No valid order URL available for this pick.";
    return;
  }

  addAnalyticsEvent({
    type: "accepted",
    city: state.city,
    mood: state.mood,
    dish: topPick.canonicalDish,
    channel: state.channel
  });
  renderWeeklyReport();
  acceptFeedback.textContent = `Opening ${topPick.canonicalDish} in ${state.channel}.`;
  window.open(url, "_blank", "noopener,noreferrer");
});

refreshTrendingButton.addEventListener("click", () => {
  refreshTrending();
});

fortuneButton.addEventListener("click", () => {
  refreshFortune();
});

refreshAllButton.addEventListener("click", async () => {
  await Promise.all([refreshRecommendations("manual"), refreshTrending(), refreshHealthBadge()]);
});

async function initialize() {
  budgetOutput.textContent = `INR ${state.budget}`;
  hungerOutput.textContent = `${state.hungerLevel}/5`;
  setActiveMood(state.mood);
  setActiveChip(dietChips, state.diet);
  setActiveChip(healthChips, state.healthGoal);
  setActiveChannel(state.channel);
  ecosystemCopy.textContent = channelCopy(state.channel);
  renderWeeklyReport();

  await Promise.all([refreshHealthBadge(), refreshRecommendations("initial"), refreshTrending()]);
}

initialize();

