# 回声投研 EchoPai MCP Server

[English](./README.md) · [简体中文](./README.zh-CN.md)

[![MCP Compatible](https://img.shields.io/badge/MCP-stdio%20%26%20Remote%20HTTP-blue?style=flat-square)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/Tools-50%20个实时投研工具-d4a85a?style=flat-square)](#工具目录50-个实时投研工具)
[![Zero Install](https://img.shields.io/badge/接入方式-本地%20stdio%20%26%20远程%20HTTP-brightgreen?style=flat-square)](#快速接入20-秒完成)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](./LICENSE)

**让你的 AI，长出机构级投研能力。**  
把 **50 个实时投研工具**装进 Claude、Cursor、VS Code、Gemini CLI、WorkBuddy 等任意支持 MCP 的 AI：卖方研报全文、分析师历史归因、上市公司公告与前瞻事件、涨停复盘与全市场情绪周期——**每个结论都能回溯到一次真实的数据调用**。

本仓库既包含基于 `@modelcontextprotocol/sdk` 与 `zod` 构建的**完整本地 Node.js MCP Server 实现**（[`src/index.js`](./src/index.js)、[`src/tools.js`](./src/tools.js)、[`src/client.js`](./src/client.js)，直连 EchoPai 开放平台 REST API），也提供本机零安装的**远程托管 Streamable HTTP 端点**（`https://mcp.huishengpai.com/mcp`）。

---

### 官方站点矩阵

| 入口 | 官网（Global） | 中国站（回声投研） |
| :--- | :--- | :--- |
| **官方主站** | <https://echopai.com> | <https://www.huishengpai.com> |
| **Web 投研终端** | <https://app.echopai.com> | <https://huishengpai.com/go/app> |
| **API 密钥与账户页** | <https://echopai.com/go/app/agent> | <https://huishengpai.com/go/app/agent> |
| **远程 MCP 端点** | `https://mcp.huishengpai.com/mcp` | `https://mcp.huishengpai.com/mcp` |
| **AI 自动接入指引** | <https://echopai.com/agent-setup/prompt.md> | <https://www.huishengpai.com/agent-setup/prompt.md> |

---

## 为什么选择回声投研 MCP？

市面上的开源股票脚本大多只能查基础 K 线和报价；**回声投研（EchoPai）** 直接把生产级投研基础设施接进你的 AI：

| 维度 | 普通免费行情脚本 / 通用联网 | **回声投研 EchoPai MCP** |
| :--- | :--- | :--- |
| **券商研报与归因** | 无研报库，或仅靠模糊网页摘要 | **研报全文检索**（`report`）+ **精确到具体分析师的观点流**与历史命中率参考（`views`） |
| **公告与前瞻事件** | 零散新闻、缺乏结构化上下文 | 公告全文检索（`announcements_*`）、**前瞻事件日历**、股东与解禁排期（`ownership_lockups`） |
| **盘面微观结构** | 仅有滞后价格与成交量 | **涨停复盘与催化归因**（`limit_up_*`）、量化**情绪周期**（`sentiment_*`）、**300+ 概念板块**（`concepts_*`） |
| **接入与维护成本** | 本地配环境、维护易失效爬虫 | **本机零安装远程 Streamable HTTP**，支持浏览器 OAuth 免密钥授权，工具随服务端自动更新 |

---

## 接入之后能干什么？（真实对话示例）

接入后无需记忆任何命令，直接用自然语言提问，AI 会自主串联多个工具并给出带出处的投研结论：

<details>
<summary><b>示例 1：盘前研报速读（“把今晨的算力研报都读了，给我结论”）</b></summary>

> **AI 自动调用工具链：** `views` → `report` → `digest` → `search`
>
> * **一、共识在哪**：汇总头部研究所最新方向——国产训练卡出货预期上修，光模块 1.6T 放量前移，需求端由“预期”切向“订单”。
> * **二、分歧在哪**：提取卖方报告对海外资本开支指引、良率与交付节奏的不同口径。
> * **三、按历史命中率加权**：自动对比近 90 天相关分析师的方向命中率，告诉你谁的观点权重更高。

</details>

<details>
<summary><b>示例 2：个股异动深度归因（“某龙头股今天为什么突然大涨？”）</b></summary>

> **AI 自动调用工具链：** `quote` → `news` → `views` → `announcements` → `sentiment`
>
> * **行情与资金**：实时涨幅、成交额/换手率、量能 z 分数、主力资金净流入与社区讨论热度倍增。
> * **直接催化**：昨夜落地的股权激励/重大公告拆解 + 今晨多家券商跟进点评摘要。
> * **风险核查**：自动核验未来 30 天内有无减持计划、45 天内有无大额解禁、近期有无监管问询函。

</details>

---

## 快速接入（20 秒完成）

唯一正式远程端点（Streamable HTTP）：
```text
https://mcp.huishengpai.com/mcp
```

支持 **浏览器 OAuth 2.0 零密钥授权** 与 **Bearer API Key（`eps_live_...`）** 两种方式。

### 1. Claude Code

**方式 A：零密钥浏览器授权（推荐）**
```bash
claude mcp add --transport http echopai https://mcp.huishengpai.com/mcp
```
添加后在 `/mcp` 面板选中 `echopai`，按提示完成浏览器授权即可。

**方式 B：静态密钥**
```bash
claude mcp add --transport http echopai https://mcp.huishengpai.com/mcp --header "Authorization: Bearer <你的密钥>"
```

### 2. Cursor

写入 `~/.cursor/mcp.json`（或项目级 `.cursor/mcp.json`）：
```json
{
  "mcpServers": {
    "echopai": {
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer <你的密钥>"
      }
    }
  }
}
```

### 3. VS Code（GitHub Copilot）

写入项目目录 `.vscode/mcp.json`：
```json
{
  "servers": {
    "echopai": {
      "type": "http",
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer <你的密钥>"
      }
    }
  }
}
```

### 4. Claude Desktop / claude.ai / WorkBuddy

在客户端「连接器 / Connectors」设置中添加自定义连接器，URL 填入：
`https://mcp.huishengpai.com/mcp`，点击授权通过浏览器登录即可，全程无需手动配置密钥。

### 5. Gemini CLI

```bash
gemini mcp add --transport http --header "Authorization: Bearer <你的密钥>" echopai https://mcp.huishengpai.com/mcp
```

更多宿主配置、环境变量注意事项及无浏览器环境（CI / Cron）方案，请参见 [客户端接入指南](./docs/clients.md)。

---

## 工具目录（50 个实时投研工具）

以下 50 个工具均在 [`src/tools.js`](./src/tools.js) 中通过 `@modelcontextprotocol/sdk` 与 `zod` 显式注册，并通过 [`src/client.js`](./src/client.js) 调用 EchoPai 开放平台 `/v1` REST API（自动在 `api.huishengpai.com` 与 `api.echopai.com` 之间容灾切换）：

| 分类 | 工具列表 |
| :--- | :--- |
| **账户与市场状态**（`×4`） | `whoami`、`usage`、`market_status`、`trading_days` |
| **研报观点**（`×3`） | `views`、`report`、`digest` |
| **新闻、公告与事件**（`×7`） | `news`、`announcements_feed`、`announcements_search`、`announcements_stock`、`announcements_detail`、`events_upcoming`、`events_timeline` |
| **财务与业绩**（`×6`） | `financials_reports`、`financials_series`、`financials_pit`、`financials_quote_snapshot`、`earnings_show`、`earnings_recent` |
| **股权事件**（`×2`） | `ownership_show`、`ownership_lockups` |
| **行情、指标与龙虎榜**（`×12`） | `quote`、`bars_batch`、`chart`、`index_snapshot`、`market_movers`、`scan`、`hot`、`search`、`lookup`、`technicals`、`fundflow`、`dragon_tiger_daily` |
| **涨停连板**（`×4`） | `limit_up_pool`、`limit_up_analysis`、`limit_up_history`、`limit_up_summary` |
| **市场情绪**（`×4`） | `sentiment_overview`、`sentiment_breadth`、`sentiment_turnover`、`sentiment_pct_distribution` |
| **概念板块**（`×8`） | `concepts_list`、`concepts_show`、`concepts_snapshot`、`concepts_news`、`concepts_views`、`concepts_alerts`、`concepts_minute_bars`、`concepts_daily_bars` |

完整工具说明请参见 [工具能力目录](./docs/tools.md)。

---

## 本地 stdio MCP Server 与命令行（CLI）

如果你使用本地 `stdio` 模式运行（或用于 MCP 目录平台验证与本地 Agent 集成），本仓库提供了基于 `@modelcontextprotocol/sdk` 与 `zod` 的完整本地 MCP Server（[`src/index.js`](./src/index.js)，需 Node.js ≥ 20）：

```json
{
  "mcpServers": {
    "echopai": {
      "command": "npx",
      "args": ["-y", "@echopai/mcp"],
      "env": {
        "ECHOPAI_API_KEY": "eps_live_你的密钥"
      }
    }
  }
}
```

或克隆本仓库后直接运行：
```bash
node src/index.js --key eps_live_你的密钥
```

如果你还需要在 Shell 管道（`echopai ... | jq`）或定时任务中调用，可安装完整的官方 npm 包 `echopai`：

```bash
npm install -g echopai
echopai --version
```

---

## 一条 Prompt 让 AI 自动接好

把官方接入指引地址直接发给你的 AI 助手，它会自动完成配置、技能安装与验证：

- 国际站指引：<https://echopai.com/agent-setup/prompt.md>
- 国内站指引：<https://www.huishengpai.com/agent-setup/prompt.md>

---

## 关于回声投研 & 免责声明

**回声投研（EchoPai）** 成立于 2022 年，团队分布于纽约、新加坡及亚太多地，致力于构建把市场事件翻译成决策所需的数据、模型与基础设施。

- **官网**：<https://echopai.com>
- **中国站**：<https://www.huishengpai.com>
- **Web 投研终端**：<https://app.echopai.com>

> **免责声明**：回声投研（EchoPai）提供的数据、研报检索与工具服务仅供研究与信息参考，不构成任何形式的投资建议或证券买卖推荐。市场有风险，投资需谨慎。

## 开源协议

[MIT](./LICENSE) © 2026 EchoPai LLC
