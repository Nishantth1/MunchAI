import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../server/app.js";

test("api endpoints respond with expected contract", async (t) => {
  const services = {
    metadata: { provider: "mock", aiEnabled: false },
    recommendationService: {
      async getRecommendations() {
        return { input: { mood: "happy" }, recommendations: [{ rank: 1, dish: "Dish X" }] };
      }
    },
    trendingService: {
      async getTrendingFoods() {
        return { city: "Bangalore", trending: [{ rank: 1, dish: "Dish Y" }] };
      }
    },
    fortuneService: {
      async getFoodFortune() {
        return { title: "Food Prediction", dish: "Dish Z" };
      }
    }
  };

  const { server } = createServer({
    config: { appName: "test-app", port: 0 },
    services
  });

  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => {
    server.close();
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const healthPayload = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(healthPayload.service, "test-app");

  const recommendResponse = await fetch(`${baseUrl}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood: "happy" })
  });
  const recommendPayload = await recommendResponse.json();
  assert.equal(recommendResponse.status, 200);
  assert.equal(recommendPayload.recommendations[0].dish, "Dish X");

  const trendingResponse = await fetch(`${baseUrl}/api/trending?city=Bangalore`);
  const trendingPayload = await trendingResponse.json();
  assert.equal(trendingResponse.status, 200);
  assert.equal(trendingPayload.trending[0].dish, "Dish Y");

  const fortuneResponse = await fetch(`${baseUrl}/api/fortune`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const fortunePayload = await fortuneResponse.json();
  assert.equal(fortuneResponse.status, 200);
  assert.equal(fortunePayload.dish, "Dish Z");
});

