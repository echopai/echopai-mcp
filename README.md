# EchoPai MCP Server · 回声投研

[English](./README.md) · [简体中文](./README.zh-CN.md)

[![MCP Compatible](https://img.shields.io/badge/MCP-stdio%20%26%20Remote%20HTTP-blue?style=flat-square)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/Tools-50%20Real--time%20Tools-d4a85a?style=flat-square)](#tool-directory-50-tools)
[![Zero Install](https://img.shields.io/badge/Setup-Local%20stdio%20%26%20Remote-brightgreen?style=flat-square)](#quick-start-20-seconds)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](./LICENSE)

**Turn any AI into an event-driven equity research analyst.**  
Equip Claude, Cursor, VS Code, Gemini CLI, or any MCP-compatible agent with **50 real-time China equity (A-share) & quantitative research tools** — full-text broker reports, individual analyst attribution, corporate filings, quantified sentiment cycles, and limit-up analytics, with traceable citations on every answer.

This repository provides a complete **Node.js MCP Server** built on `@modelcontextprotocol/sdk` and `zod` ([`src/index.js`](./src/index.js), [`src/tools.js`](./src/tools.js), [`src/client.js`](./src/client.js)) wrapping EchoPai's Open Platform REST APIs, alongside a hosted **Streamable HTTP** endpoint (`https://mcp.huishengpai.com/mcp`) for zero-install OAuth setup.

---

### Official Portal Matrix

| Resource | Global (EN) | China Mainland (中文 · 回声投研) |
| :--- | :--- | :--- |
| **Official Website** | <https://echopai.com> | <https://www.huishengpai.com> |
| **Web Research Terminal** | <https://app.echopai.com> | <https://huishengpai.com/go/app> |
| **API Keys & OAuth Account** | <https://echopai.com/go/app/agent> | <https://huishengpai.com/go/app/agent> |
| **Remote MCP Endpoint** | `https://mcp.huishengpai.com/mcp` | `https://mcp.huishengpai.com/mcp` |
| **Automated AI Setup Prompt** | <https://echopai.com/agent-setup/prompt.md> | <https://www.huishengpai.com/agent-setup/prompt.md> |

---

## Why EchoPai MCP?

Most open-source stock MCP servers only wrap basic price quotes or K-line endpoints. **EchoPai** connects your AI to institutional-grade event-driven research infrastructure:

| Capability | Basic Price / Free Scripts | **EchoPai MCP (回声投研)** |
| :--- | :--- | :--- |
| **Broker Research** | None or unindexed PDFs | **Full-text broker reports** (`report`) + **analyst-level attribution** weighted by historical accuracy (`views`) |
| **Market Events & Filings** | Delayed news headlines | Real-time announcements (`announcements_*`), **forward-looking event calendar**, and share lockup schedules (`ownership_lockups`) |
| **Market Microstructure** | Raw OHLCV only | **Limit-up pool & attribution** (`limit_up_*`), quantified **sentiment cycles** (`sentiment_*`), and **300+ concept boards** (`concepts_*`) |
| **Deployment & Auth** | Local Python/Node setup & fragile cookies | **Zero-install remote Streamable HTTP** with **Browser OAuth 2.0** or API Key; tools stay updated server-side |

---

## What It Looks Like in Action

Once connected, simply ask complex research questions in natural language. Your AI chains multiple EchoPai tools automatically and cites every claim:

<details>
<summary><b>Example 1: Morning Broker Research Synthesis ("Read all compute research notes from this morning and summarize")</b></summary>

> **AI automatically calls:** `views` → `report` → `digest` → `search`
>
> * **Consensus (3 top institutes aligned):** Domestic training chip shipments revised up (40% → 55% YoY); 1.6T optical module ramp pulled forward to Q4.
> * **Divergence:** One sell-side team flags cautious CapEx guidance and yield/delivery cadence differences in Q2.
> * **Analyst Weighting:** Automatically surfaces each analyst's 90-day track record and directional hit rate so you know whose call carries more weight.

</details>

<details>
<summary><b>Example 2: Intraday Surge Attribution ("Why is Cambricon surging today?")</b></summary>

> **AI automatically calls:** `quote` → `news` → `views` → `announcements` → `sentiment`
>
> * **Market Microstructure:** +9.98% on 12.8B CNY turnover (8.2% turnover rate, 98th percentile over 60 days; volume z-score +3.1; main net inflow +1.1B CNY).
> * **Catalyst:** Equity incentive draft announced last night (grant price ~66% of market, covering 85% of staff, 2026–2028 revenue & profit targets).
> * **Broker Follow-up:** 3 morning notes raised earnings forecasts / target prices.
> * **Risk Check:** Verified zero reduction announcements within 30 days, zero lockup expirations within 45 days, and no regulatory inquiry letters.

</details>

---

## Quick Start (20 Seconds)

Remote Endpoint (Streamable HTTP):
```text
https://mcp.huishengpai.com/mcp
```

Supports both **Zero-Key Browser OAuth 2.0** and **Bearer API Key (`eps_live_...`)**.

### Claude Code

**Option 1: Browser OAuth (no API key needed)**
```bash
claude mcp add --transport http echopai https://mcp.huishengpai.com/mcp
```
Select `echopai` in `/mcp` to complete browser authorization.

**Option 2: API Key**
```bash
claude mcp add --transport http echopai https://mcp.huishengpai.com/mcp --header "Authorization: Bearer <YOUR_KEY>"
```

### Cursor

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "echopai": {
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_KEY>"
      }
    }
  }
}
```

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "echopai": {
      "type": "http",
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_KEY>"
      }
    }
  }
}
```

### Claude Desktop / claude.ai / WorkBuddy

Open **Settings → Connectors**, add `https://mcp.huishengpai.com/mcp`, and click **Authorize** via browser login.

### Gemini CLI

```bash
gemini mcp add --transport http --header "Authorization: Bearer <YOUR_KEY>" echopai https://mcp.huishengpai.com/mcp
```

See [Client Configuration Guide](./docs/clients.md) for project-shared configs, environment variable tips, and headless CI/Cron usage.

---

## Tool Directory (50 Tools)

All 50 tools are explicitly registered with `zod` input schemas in [`src/tools.js`](./src/tools.js) and call EchoPai's Open Platform `/v1` REST APIs via [`src/client.js`](./src/client.js) (with automatic failover between `api.huishengpai.com` and `api.echopai.com`).

| Category | Tools |
| :--- | :--- |
| **Account & Market Meta** (`×4`) | `whoami`, `usage`, `market_status`, `trading_days` |
| **Research & Views** (`×3`) | `views`, `report`, `digest` |
| **News, Announcements & Events** (`×7`) | `news`, `announcements_feed`, `announcements_search`, `announcements_stock`, `announcements_detail`, `events_upcoming`, `events_timeline` |
| **Financials & Earnings** (`×6`) | `financials_reports`, `financials_series`, `financials_pit`, `financials_quote_snapshot`, `earnings_show`, `earnings_recent` |
| **Ownership & Lockups** (`×2`) | `ownership_show`, `ownership_lockups` |
| **Market Quotes, Technicals & Scan** (`×12`) | `quote`, `bars_batch`, `chart`, `index_snapshot`, `market_movers`, `scan`, `hot`, `search`, `lookup`, `technicals`, `fundflow`, `dragon_tiger_daily` |
| **Limit-up Analytics** (`×4`) | `limit_up_pool`, `limit_up_analysis`, `limit_up_history`, `limit_up_summary` |
| **Market Sentiment** (`×4`) | `sentiment_overview`, `sentiment_breadth`, `sentiment_turnover`, `sentiment_pct_distribution` |
| **Concept Boards** (`×8`) | `concepts_list`, `concepts_show`, `concepts_snapshot`, `concepts_news`, `concepts_views`, `concepts_alerts`, `concepts_minute_bars`, `concepts_daily_bars` |

For detailed descriptions and usage rules, see [Tool Reference](./docs/tools.md).

---

## Local stdio MCP Server & CLI

Run this repository directly as a standalone local `stdio` MCP server powered by `@modelcontextprotocol/sdk` and `zod` ([`src/index.js`](./src/index.js), requires Node.js ≥ 20):

```json
{
  "mcpServers": {
    "echopai": {
      "command": "npx",
      "args": ["-y", "@echopai/mcp"],
      "env": {
        "ECHOPAI_API_KEY": "eps_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

Or run directly from a local clone:
```bash
node src/index.js --key eps_live_YOUR_KEY_HERE
```

For shell pipelines (`echopai ... | jq`) or cron jobs, you can also install the full `echopai` CLI package from npm:

```bash
npm install -g echopai
echopai --version
```

---

## Automated AI Setup

Paste either official setup prompt URL directly to your AI assistant and let it configure everything automatically:

- Global: <https://echopai.com/agent-setup/prompt.md>
- China Mainland: <https://www.huishengpai.com/agent-setup/prompt.md>

---

## About EchoPai & Disclaimer

Founded in 2022 with a distributed team across New York, Singapore, and Asia-Pacific, **EchoPai (回声投研)** builds event-driven quantitative research infrastructure based on the thesis that *the market is the echo of events*.

- **Global Website**: <https://echopai.com>
- **China Website**: <https://www.huishengpai.com>
- **Web Terminal**: <https://app.echopai.com>

> **Disclaimer**: EchoPai is a financial data and research information tool—not a registered investment advisor or broker-dealer. Nothing provided by the MCP server, API, or documentation constitutes investment advice or solicitation to buy or sell any securities.

## License

[MIT](./LICENSE) © 2026 EchoPai LLC
