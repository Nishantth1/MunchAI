# MunchAI

AI-powered food decision assistant built for fast, contextual meal recommendations.

MunchAI helps users answer one question quickly: **"What should I eat right now?"**  
Instead of browsing dozens of listings, users tap mood + budget + dietary constraints and get ranked suggestions with nearby ordering options.

## Why This Product

Food ordering has high choice overload:
- Too many listings
- Too much filtering friction
- Low confidence in what to pick fast

MunchAI reduces decision fatigue by combining:
- Intent signals (mood, hunger, budget, diet, health goal)
- Real-time trend signals
- Nearby provider/restaurant availability

## Builders Club Fit

This app is designed specifically to leverage Swiggy MCP:
- `Swiggy Food`: menus, prices, restaurant availability, order links
- `Swiggy Instamart`: quick snack/ingredient alternatives
- `Swiggy Dineout`: dine-in options for mood-based recommendations

Current code is **MCP-ready via provider abstraction**:
- `DATA_PROVIDER=mock` for local dev and tests
- `DATA_PROVIDER=swiggy-mcp` for production integration

No provider-specific logic is hardwired into recommendation logic. Swiggy MCP can be plugged in via env configuration.

## Core Features

1. **Decide My Meal**
- Tap-first mood UX
- Weighted recommendation model:
  - `score = mood*4 + budget*3 + diet*5 + health*3 + hunger*2`
- Ranked top picks with nearby ordering options

2. **Trending Near You**
- Trend score model:
  - `trending_score = recent_orders*0.6 + search_frequency*0.3 + rating*0.1` (normalized)
- City-specific ranking

3. **AI Food Fortune (Viral Hook)**
- Shareable daily pick card
- Gemini-backed copy generation when API key is available

## Architecture

```text
Frontend (mobile-first web)
  -> HTTP API (Node.js)
    -> Service Layer
      -> Food Provider (mock or swiggy-mcp)
      -> Gemini Client (optional, env-key based)
```

### Backend Modules

- `server/app.js`: server + routing factory
- `server/config/env.js`: configuration surface
- `server/providers/providerFactory.js`: provider selection
- `server/providers/mockFoodProvider.js`: local provider for dev/test
- `server/providers/swiggyMcpProvider.js`: Swiggy MCP adapter
- `server/services/recommendationService.js`: ranking engine
- `server/services/trendingService.js`: trend ranking
- `server/services/fortuneService.js`: fortune flow + AI copy
- `server/ai/geminiClient.js`: Gemini integration

## Environment Setup

Copy `.env.example` to `.env` and fill values.

```bash
cp .env.example .env
```

Required for AI:
- `GEMINI_API_KEY`

Required for Swiggy MCP mode:
- `DATA_PROVIDER=swiggy-mcp`
- `SWIGGY_MCP_BASE_URL`
- `SWIGGY_MCP_API_KEY`

## Run

```bash
npm start
```

Open `http://localhost:3000`

## Test

```bash
npm test
```

Test coverage includes:
- Recommendation ranking behavior
- Trending score ranking behavior
- API route contract checks

## API Endpoints

- `GET /api/health`
- `POST /api/recommend`
- `GET /api/trending?city=<city>`
- `POST /api/fortune`

## Example Request

`POST /api/recommend`

```json
{
  "mood": "lazy",
  "hungerLevel": 3,
  "budget": 220,
  "diet": "veg",
  "healthGoal": "balanced",
  "city": "Bangalore"
}
```

## Growth Plan (Reviewer View)

### Phase 1: Builders Club Integration
- Switch provider from `mock` to `swiggy-mcp`
- Validate ranking quality with real menu + trend feeds
- Add robust retries and observability

### Phase 2: Personalization
- User preference memory
- Time-of-day and repeat-order context
- Confidence scoring + explanation quality improvements

### Phase 3: Growth Loops
- Shareable Food Fortune cards
- Weekly food personality summary
- Referral incentives tied to recommendation shares

### Phase 4: Monetization
- Affiliate conversion optimization
- Sponsored ranking slots with clear labeling
- Premium nutrition and planning layer

## Notes for Reviewers

- This project is intentionally built with provider abstraction to avoid lock-in and to accelerate MCP adoption.
- The recommendation engine remains deterministic and testable, while AI is used as an optional enhancement layer.
- The codebase is designed for fast iteration as Swiggy MCP scopes and schemas evolve during onboarding.
- Detailed MCP rollout plan: `docs/mcp-integration-plan.md`
