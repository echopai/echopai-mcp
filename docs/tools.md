# EchoPai MCP Tool Reference

The remote MCP endpoint (`https://mcp.huishengpai.com/mcp`) dynamically exposes 40+ curated quantitative equity research tools. Below is the complete tool index grouped by capability domain.

> Note: Always verify stock codes with `lookup` first when you only have a company name or bare digits. Canonical code format uses exchange prefix + ticker (e.g. `SSE:600519`, `SZSE:000001`).

---

## 1. Research & Analyst Views (研报观点)
- `views`: Query sell-side analyst views and research report metadata. Supports `fields: "index"` for lightweight scanning and filtering by `report_only`.
- `report`: Retrieve full-text archived broker research reports by view/report ID, with byte-budgeted pagination (`next_offset`).
- `digest`: One-shot research bundle for a single security (combining analyst views, quote, valuation snapshot, sentiment, news, ownership, and margin summary).

## 2. News & Announcements (新闻公告)
- `news`: Real-time market news and catalysts feed with keyword and security filtering.
- `announcements_feed`: Stream of latest listed company announcements and filings.
- `announcements_search`: Full-text and semantic search across historical company announcements.
- `announcements_stock`: All announcements for a specific canonical security code.
- `announcements_detail`: Retrieve full text and structured metadata of a single announcement.

## 3. Financials & Valuation (财务数据)
- `financials_reports`: Periodic financial statements (income statement, balance sheet, cash flow).
- `financials_series`: Multi-period financial indicator time series for historical comparison.
- `financials_pit`: Point-in-time (PIT) financial snapshots avoiding look-ahead bias.
- `financials_quote_snapshot`: Valuation multiples (PE, PB, PS, market cap) aligned with latest quote.

## 4. Ownership & Lockups (股权事件)
- `ownership_show`: Major shareholders, institutional holdings, and shareholding changes.
- `ownership_lockups`: Upcoming restricted share lockup expirations and unlock ratios.

## 5. Market Quotes & Screening (行情数据与扫描)
- `market_status`: Current trading session (`pre_open`, `open`, `lunch`, `closed`), holiday calendar, and last trading day.
- `lookup`: Resolve company name, pinyin initials, or bare code into canonical codes.
- `search`: General search across securities and market entities.
- `quote`: Real-time quote snapshot (including call auction status during pre-market windows).
- `bars_batch`: Batch OHLCV intraday or daily bars for multiple securities.
- `chart`: Historical price and volume chart series for a security or index.
- `index_snapshot`: Real-time market index snapshots.
- `market_movers`: Top gainers, losers, and active movers.
- `scan`: Whole-market screening and server-side ranking (`price`, `pct_change`, `speed_3min`, `amount`, `main_net_in`, `total_mv`, `turnover_rate`, `margin_balance`, etc.).
- `hot`: Market attention and social heat rankings.

## 6. Limit-up Analytics (涨停连板)
- `limit_up_pool`: Daily limit-up pool with consecutive board counts, sealing time, and first-seal metrics.
- `limit_up_analysis`: Attribution and catalyst breakdown for limit-up stocks.
- `limit_up_history`: Historical limit-up performance and streak tracking.
- `limit_up_summary`: Market-wide limit-up promotion rates and board ladder statistics.

## 7. Market Sentiment (市场情绪)
- `sentiment`: Security-level social attention and sentiment metrics.
- `sentiment_overview`: Market-wide quantified sentiment cycle and temperature indicators.
- `sentiment_breadth`: Advance/decline counts and market breadth distribution.
- `sentiment_turnover`: Market-wide turnover and liquidity tracking.
- `sentiment_pct_distribution`: Intraday return distribution across all listed securities.

## 8. Concept Boards (概念板块)
- `concepts_list`: Directory of 300+ thematic concept boards.
- `concepts_show`: Constituent securities and metadata for a specific concept board.
- `concepts_snapshot`: Real-time performance, capital flows, and leading stocks across concepts.
- `concepts_news`: News and catalysts associated with a concept board.
- `concepts_views`: Analyst research views grouped by concept theme.
- `concepts_alerts`: Anomaly and breakout alerts across concept boards.
- `concepts_minute_bars`: Intraday minute bars for concept indices.
- `concepts_daily_bars`: Daily historical bars for concept indices.
