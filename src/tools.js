import { z } from "zod";

const CANONICAL_CODE = z
  .string()
  .describe("Canonical security code with exchange prefix, e.g. SSE:600519, SZSE:000001, BSE:899050");

const DATE_STR = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .describe("Date in YYYY-MM-DD (Beijing Time / UTC+8)");

export function registerTools(server, client) {
  // ── 1. Account & Discovery ────────────────────────────────────────────────
  server.tool(
    "whoami",
    "Inspect the current API key's identity, scopes, rate limits, monthly quota, and available operations.",
    {},
    async () => client.request("/v1/auth/whoami"),
  );

  server.tool(
    "usage",
    "Check monthly credit usage and remaining balance for consumer API keys.",
    {},
    async () => client.request("/v1/usage"),
  );

  server.tool(
    "market_status",
    "Get current China equity trading session (pre_open, auction, open, break, closed), trading calendar, and last trading day.",
    {},
    async () => client.request("/v1/market/status"),
  );

  server.tool(
    "lookup",
    "Resolve a Chinese company name, bare ticker (600519), or pinyin initials (gzmt) to canonical codes (SSE:600519).",
    {
      text: z.string().min(1).max(50).describe("Company name, ticker, or pinyin initials"),
      limit: z.number().int().min(1).max(30).optional().describe("Max matches (default 10)"),
    },
    async ({ text, limit }) =>
      client.request("/v1/securities/search", { queryParams: { query: text, limit } }),
  );

  server.tool(
    "search",
    "Semantic search across securities, news, research views, and market entities.",
    {
      query: z.string().min(1).describe("Search query in Chinese or English"),
      limit: z.number().int().min(1).max(50).optional().describe("Max results"),
    },
    async (args) => client.request("/v1/search", { queryParams: args }),
  );

  // ── 2. Broker Research & Analyst Views ────────────────────────────────────
  server.tool(
    "views",
    "Query recent sell-side broker research views, ratings, and analyst attribution. Pass report_only=true to find views with archived full-text reports.",
    {
      code: CANONICAL_CODE.optional().describe("Filter by canonical security code"),
      analyst: z.string().optional().describe("Filter by analyst name"),
      institution: z.string().optional().describe("Filter by broker / research institute"),
      report_only: z.boolean().optional().describe("Only return views with archived full-text reports"),
      fields: z.enum(["index", "compact", "full"]).optional().describe("Response detail level"),
      limit: z.number().int().min(1).max(100).optional().describe("Max items to return"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async (args) => client.request("/v1/views/recent", { queryParams: args }),
  );

  server.tool(
    "views_get",
    "Fetch detailed metadata and summary for a single analyst view by ID.",
    {
      view_id: z.string().describe("Analyst view ID"),
    },
    async ({ view_id }) => client.request("/v1/views/{view_id}", { pathParams: { view_id } }),
  );

  server.tool(
    "report",
    "Retrieve full-text archived broker research report by view_id (when full_text_available=true).",
    {
      view_id: z.string().describe("View ID with full_text_available=true"),
      format: z.enum(["outline", "full", "quote"]).optional().describe("Report format (outline, full, or quote)"),
      offset: z.number().int().min(0).optional().describe("Character offset for long reports"),
      limit: z.number().int().min(100).optional().describe("Max characters to return"),
    },
    async ({ view_id, ...queryParams }) =>
      client.request("/v1/views/{view_id}/document", { pathParams: { view_id }, queryParams }),
  );

  server.tool(
    "digest",
    "One-shot research bundle for a single stock: analyst views, quote, valuation, sentiment, news, ownership, and margin.",
    {
      code: CANONICAL_CODE,
    },
    async ({ code }) => client.request("/v1/digest/{code}", { pathParams: { code } }),
  );

  // ── 3. News & Corporate Announcements ─────────────────────────────────────
  server.tool(
    "news",
    "Real-time financial news and market briefs stream. Filter by security code or keyword query.",
    {
      code: CANONICAL_CODE.optional().describe("Filter by security canonical code"),
      query: z.string().optional().describe("Free-text keyword query"),
      hours: z.number().int().min(1).max(168).optional().describe("Lookback hours (default 24)"),
      from: DATE_STR.optional().describe("Start date YYYY-MM-DD"),
      to: DATE_STR.optional().describe("End date YYYY-MM-DD"),
      limit: z.number().int().min(1).max(100).optional().describe("Max items per page"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
      fields: z.enum(["compact", "full"]).optional().describe("Response detail level"),
    },
    async (args) => {
      if (args.query && !args.code) {
        return client.request("/v1/news/search", { queryParams: args });
      }
      return client.request("/v1/news", { queryParams: args });
    },
  );

  server.tool(
    "news_get",
    "Fetch full content of a single news article by ID.",
    {
      news_id: z.string().describe("News item ID"),
    },
    async ({ news_id }) => client.request("/v1/news/{news_id}", { pathParams: { news_id } }),
  );

  server.tool(
    "announcements_feed",
    "Latest listed company announcements and regulatory filings stream.",
    {
      limit: z.number().int().min(1).max(100).optional().describe("Max items"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async (args) => client.request("/v1/announcements/feed", { queryParams: args }),
  );

  server.tool(
    "announcements_search",
    "Search historical and recent company announcements by keyword or category.",
    {
      query: z.string().min(1).describe("Search keywords"),
      code: CANONICAL_CODE.optional().describe("Optional canonical code filter"),
      from: DATE_STR.optional().describe("Start date YYYY-MM-DD"),
      to: DATE_STR.optional().describe("End date YYYY-MM-DD"),
      limit: z.number().int().min(1).max(100).optional().describe("Max items"),
    },
    async (args) => client.request("/v1/announcements/search", { queryParams: args }),
  );

  server.tool(
    "announcements_stock",
    "List announcements for a specific listed company.",
    {
      code: CANONICAL_CODE,
      limit: z.number().int().min(1).max(100).optional().describe("Max items"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async (args) => client.request("/v1/announcements/stock", { queryParams: args }),
  );

  server.tool(
    "announcements_detail",
    "Retrieve full text and structured metadata of a single announcement by ID.",
    {
      announcement_id: z.string().describe("Announcement ID"),
    },
    async ({ announcement_id }) =>
      client.request("/v1/announcements/{announcement_id}", { pathParams: { announcement_id } }),
  );

  // ── 4. Financials, Ownership & Calendar ───────────────────────────────────
  server.tool(
    "financials_reports",
    "Retrieve periodic financial statements (income statement, balance sheet, cash flow) for a stock.",
    {
      code: CANONICAL_CODE,
      limit: z.number().int().min(1).max(40).optional().describe("Number of reporting periods"),
    },
    async (args) => client.request("/v1/financials/reports", { queryParams: args }),
  );

  server.tool(
    "financials_series",
    "Multi-period financial indicator time series for historical comparison.",
    {
      code: CANONICAL_CODE,
      limit: z.number().int().min(1).max(40).optional().describe("Number of periods"),
    },
    async (args) => client.request("/v1/financials/series", { queryParams: args }),
  );

  server.tool(
    "financials_pit",
    "Point-in-time (PIT) financial snapshot avoiding look-ahead bias.",
    {
      code: CANONICAL_CODE,
      as_of: DATE_STR.optional().describe("Point-in-time reference date"),
    },
    async (args) => client.request("/v1/financials/pit", { queryParams: args }),
  );

  server.tool(
    "financials_quote_snapshot",
    "Valuation multiples (PE, PB, PS, market cap) aligned with latest market quote.",
    {
      code: CANONICAL_CODE,
    },
    async (args) => client.request("/v1/financials/quote-snapshot", { queryParams: args }),
  );

  server.tool(
    "ownership_show",
    "Major shareholders, institutional holdings, and equity ownership changes.",
    {
      code: CANONICAL_CODE,
    },
    async (args) => client.request("/v1/ownership-events", { queryParams: args }),
  );

  server.tool(
    "ownership_lockups",
    "Upcoming restricted share lockup expirations and unlock ratios.",
    {
      code: CANONICAL_CODE.optional().describe("Optional canonical code filter"),
      days: z.number().int().min(1).max(365).optional().describe("Lookahead window in days"),
    },
    async (args) => client.request("/v1/ownership-events/lockups", { queryParams: args }),
  );

  server.tool(
    "calendar_reports",
    "Scheduled earnings report release calendar.",
    {
      from: DATE_STR.optional().describe("Start date"),
      to: DATE_STR.optional().describe("End date"),
    },
    async (args) => client.request("/v1/report-calendar", { queryParams: args }),
  );

  server.tool(
    "calendar_upcoming",
    "Upcoming confirmed corporate and earnings calendar events.",
    {
      days: z.number().int().min(1).max(90).optional().describe("Lookahead days"),
    },
    async (args) => client.request("/v1/report-calendar/upcoming", { queryParams: args }),
  );

  server.tool(
    "events_upcoming",
    "Forward-looking market catalysts and corporate events extracted from filings and research.",
    {
      code: CANONICAL_CODE.optional().describe("Optional canonical code filter"),
      days: z.number().int().min(1).max(90).optional().describe("Lookahead days"),
    },
    async (args) => client.request("/v1/events/upcoming", { queryParams: args }),
  );

  server.tool(
    "earnings_recent",
    "Recent earnings previews and preliminary financial announcements.",
    {
      limit: z.number().int().min(1).max(100).optional().describe("Max items"),
    },
    async (args) => client.request("/v1/earnings-previews/recent", { queryParams: args }),
  );

  // ── 5. Quotes, Bars & Market Scan ─────────────────────────────────────────
  server.tool(
    "quote",
    "Real-time quote snapshots for 1–200 A-share securities (last price, volume, pct_change, call auction block, industry, concept, and capital flows).",
    {
      codes: z.array(CANONICAL_CODE).min(1).max(200).describe("Array of canonical codes"),
      include_l2: z.boolean().optional().describe("Include 5-level order book"),
    },
    async (args) => client.request("/v1/quote/realtime", { queryParams: args }),
  );

  server.tool(
    "bars_batch",
    "Batch OHLCV bars for multiple securities (daily or minute bars).",
    {
      codes: z.array(CANONICAL_CODE).min(1).max(100).describe("Array of canonical codes"),
      period: z.enum(["daily", "minute"]).optional().describe("Bar interval (default daily)"),
      limit: z.number().int().min(1).max(500).optional().describe("Bars per symbol"),
    },
    async ({ period = "daily", ...queryParams }) => {
      const path = period === "minute" ? "/v1/bars/minute-batch" : "/v1/bars/daily-batch";
      return client.request(path, { queryParams });
    },
  );

  server.tool(
    "chart",
    "Historical OHLCV chart series for a single security.",
    {
      code: CANONICAL_CODE,
      period: z.enum(["daily", "minute"]).optional().describe("Bar interval (default daily)"),
      from: DATE_STR.optional().describe("Start date YYYY-MM-DD"),
      to: DATE_STR.optional().describe("End date YYYY-MM-DD"),
      limit: z.number().int().min(1).max(1000).optional().describe("Max bars"),
    },
    async ({ period = "daily", ...queryParams }) => {
      const path = period === "minute" ? "/v1/bars/minute" : "/v1/bars/daily";
      return client.request(path, { queryParams });
    },
  );

  server.tool(
    "index_snapshot",
    "Real-time snapshots for major market indices.",
    {
      codes: z.array(CANONICAL_CODE).optional().describe("Optional index canonical codes"),
    },
    async (args) => client.request("/v1/index/snapshot", { queryParams: args }),
  );

  server.tool(
    "market_digest",
    "High-level market digest summarizing index performance, movers, and key headlines.",
    {},
    async () => client.request("/v1/market/digest"),
  );

  server.tool(
    "scan",
    "Whole-market equity scanner with server-side filtering and ranking (e.g. sort by pct_change, main_net_in, amount, turnover_rate, speed_3min).",
    {
      sort: z
        .string()
        .optional()
        .describe("Sort field: price, pct_change, speed_3min, amount, main_net_in, total_mv, turnover_rate"),
      order: z.enum(["asc", "desc"]).optional().describe("Sort direction (default desc)"),
      limit: z.number().int().min(1).max(200).optional().describe("Top N results"),
      concept_id: z.string().optional().describe("Filter by concept board ID"),
      margin_target: z.boolean().optional().describe("Filter by margin-eligible universe"),
    },
    async (args) => client.request("/v1/quote/scan", { queryParams: args }),
  );

  server.tool(
    "hot",
    "Hot stocks ranked by market attention and social heat.",
    {
      limit: z.number().int().min(1).max(100).optional().describe("Top N hot stocks"),
    },
    async (args) => client.request("/v1/stocks/hot", { queryParams: args }),
  );

  // ── 6. Limit-up & Dragon-Tiger Analytics ──────────────────────────────────
  server.tool(
    "limit_up_pool",
    "Daily limit-up stock pool with first/last seal times, consecutive board counts, seal amount, and break counts.",
    {
      trade_date: DATE_STR.optional().describe("Historical trading date YYYY-MM-DD (omit for latest)"),
    },
    async (args) => client.request("/v1/limit-up/pool", { queryParams: args }),
  );

  server.tool(
    "limit_up_analysis",
    "Catalyst and theme attribution breakdown for limit-up stocks.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/limit-up/analysis", { queryParams: args }),
  );

  server.tool(
    "limit_up_history",
    "Historical limit-up track record for a stock or trading date.",
    {
      code: CANONICAL_CODE.optional().describe("Canonical security code"),
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/limit-up/history", { queryParams: args }),
  );

  server.tool(
    "limit_up_summary",
    "Market-wide limit-up promotion rates, consecutive board ladder, and sealing statistics.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/limit-up/summary", { queryParams: args }),
  );

  server.tool(
    "dragon_tiger_daily",
    "Daily Dragon-Tiger List (龙虎榜) institutional & hot-money seat activity.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/dragon-tiger/daily", { queryParams: args }),
  );

  server.tool(
    "dragon_tiger_stock",
    "Dragon-Tiger List history and trading seat breakdown for a specific stock.",
    {
      code: CANONICAL_CODE,
    },
    async (args) => client.request("/v1/dragon-tiger/stock", { queryParams: args }),
  );

  // ── 7. Market Sentiment ───────────────────────────────────────────────────
  server.tool(
    "sentiment_overview",
    "Quantified market sentiment overview: limit-up/down counts, breadth, divergence index, and turnover forecast.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD (omit for live/latest)"),
    },
    async (args) => client.request("/v1/sentiment/overview", { queryParams: args }),
  );

  server.tool(
    "sentiment_breadth",
    "Advance/decline counts, moving-average breadth, and 52-week high/low ratios.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/sentiment/breadth", { queryParams: args }),
  );

  server.tool(
    "sentiment_turnover",
    "Market-wide intraday turnover tracking and full-day volume prediction.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/sentiment/turnover", { queryParams: args }),
  );

  server.tool(
    "sentiment_pct_distribution",
    "Market-wide return percentage distribution buckets across all listed stocks.",
    {
      trade_date: DATE_STR.optional().describe("Trading date YYYY-MM-DD"),
    },
    async (args) => client.request("/v1/sentiment/pct-distribution", { queryParams: args }),
  );

  // ── 8. Concept Boards ─────────────────────────────────────────────────────
  server.tool(
    "concepts_list",
    "List 300+ thematic concept and industry boards.",
    {
      kind: z.string().optional().describe("Optional concept kind filter"),
    },
    async (args) => client.request("/v1/concepts", { queryParams: args }),
  );

  server.tool(
    "concepts_snapshot",
    "Real-time snapshots for concept boards (change %, 3-min speed, capital flows, and leading stocks).",
    {
      codes: z.array(z.string()).optional().describe("Optional list of concept IDs"),
    },
    async (args) => client.request("/v1/concepts/snapshot", { queryParams: args }),
  );

  server.tool(
    "concepts_show",
    "Get constituent securities and metadata for a specific concept board.",
    {
      concept_id: z.string().describe("Concept board ID"),
    },
    async ({ concept_id }) =>
      client.request("/v1/concepts/{concept_id}", { pathParams: { concept_id } }),
  );

  server.tool(
    "concepts_news",
    "News and catalysts associated with a specific concept board.",
    {
      concept_id: z.string().describe("Concept board ID"),
      limit: z.number().int().min(1).max(100).optional().describe("Max items"),
    },
    async ({ concept_id, ...queryParams }) =>
      client.request("/v1/concepts/{concept_id}/news", { pathParams: { concept_id }, queryParams }),
  );

  server.tool(
    "concepts_views",
    "Broker research views grouped under a specific concept board.",
    {
      concept_id: z.string().describe("Concept board ID"),
      limit: z.number().int().min(1).max(100).optional().describe("Max items"),
    },
    async ({ concept_id, ...queryParams }) =>
      client.request("/v1/concepts/{concept_id}/views", { pathParams: { concept_id }, queryParams }),
  );

  server.tool(
    "concepts_alerts",
    "Real-time breakout and anomaly alerts across concept boards.",
    {
      limit: z.number().int().min(1).max(100).optional().describe("Max alerts"),
    },
    async (args) => client.request("/v1/concepts/alerts", { queryParams: args }),
  );

  server.tool(
    "concepts_daily_bars",
    "Daily historical OHLCV bars for a concept board index.",
    {
      concept_id: z.string().describe("Concept board ID"),
      limit: z.number().int().min(1).max(500).optional().describe("Max bars"),
    },
    async ({ concept_id, ...queryParams }) =>
      client.request("/v1/concepts/{concept_id}/daily-bars", { pathParams: { concept_id }, queryParams }),
  );

  server.tool(
    "concepts_minute_bars",
    "Intraday minute bars for a concept board index.",
    {
      concept_id: z.string().describe("Concept board ID"),
      limit: z.number().int().min(1).max(500).optional().describe("Max bars"),
    },
    async ({ concept_id, ...queryParams }) =>
      client.request("/v1/concepts/{concept_id}/minute-bars", { pathParams: { concept_id }, queryParams }),
  );
}
