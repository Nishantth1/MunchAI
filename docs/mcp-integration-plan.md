# Swiggy MCP Integration Plan

## Goal

Move MunchAI from mock provider to production-grade Swiggy MCP data while keeping recommendation quality stable and response latency under 5 seconds.

## Scope by MCP Server

### 1. Swiggy Food (Primary)

Use for:
- Restaurant + menu discovery
- Real-time pricing
- Dish availability and ordering links
- Trend signals per city/locality

Maps to provider methods:
- `getCatalog({ city })`
- `getTrendSignals({ city })`
- `getRestaurantsByDish({ city, dishes })`

### 2. Swiggy Instamart (Secondary)

Use for:
- Alternative quick options when no matching food outlets are nearby
- Ingredient-level meal alternatives for budget and health filters

Planned extension:
- `getQuickAlternatives({ city, preferences })`

### 3. Swiggy Dineout (Secondary)

Use for:
- Mood-based dine-in suggestions
- Social/celebration use cases (happy/group mood)

Planned extension:
- `getDineoutOptions({ city, mood, budget })`

## Implementation Phases

## Phase A: Swiggy Food Connectivity

1. Configure env:
- `DATA_PROVIDER=swiggy-mcp`
- `SWIGGY_MCP_BASE_URL`
- `SWIGGY_MCP_API_KEY`

2. Validate endpoint contracts:
- Catalog response shape
- Trending response shape
- Restaurants-by-dish response shape

3. Add response adapters in `server/providers/swiggyMcpProvider.js` for final schema.

4. Add integration tests with mocked Swiggy payload fixtures.

## Phase B: Ranking Calibration

1. Compare recommendation quality with mock vs real data.
2. Tune scoring weights if needed by city.
3. Add fallback handling for sparse catalog scenarios.

## Phase C: Growth Loops

1. Enable daily AI fortune reminders.
2. Add social share payload tracking.
3. Add CTR metrics for order link engagement.

## Operational Checklist

- P95 recommendation latency < 5s
- Endpoint timeout handling with graceful fallback
- Structured logs for provider/API errors
- Feature flag to switch between providers instantly

## Success Metrics

- Recommendation acceptance rate
- Session-to-order-click conversion
- D7 retention improvement after daily fortune/notification
- Share rate from fortune card

