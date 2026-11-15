# Client Configuration Guide

All modern MCP hosts connect directly to the same remote Streamable HTTP endpoint:

```text
https://mcp.huishengpai.com/mcp
```

---

## 1. Claude Code

### Browser OAuth (No API Key)
```bash
claude mcp add --transport http echopai https://mcp.huishengpai.com/mcp
```
Run `/mcp` in Claude Code, select `echopai`, and complete authorization in your browser.

### Static API Key
```bash
claude mcp add --transport http echopai https://mcp.huishengpai.com/mcp --header "Authorization: Bearer eps_live_xxx"
```

### Project-shared `.mcp.json`
```json
{
  "mcpServers": {
    "echopai": {
      "type": "http",
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer ${ECHOPAI_KEY}"
      }
    }
  }
}
```

---

## 2. Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "echopai": {
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer eps_live_xxx"
      }
    }
  }
}
```

> **Tip**: When Cursor is launched from the desktop GUI, it often does not inherit shell environment variables (`${env:ECHOPAI_KEY}`). Put the literal key in your personal `~/.cursor/mcp.json`, or use `${env:ECHOPAI_KEY}` only when launching Cursor from a terminal session.

---

## 3. VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "echopai": {
      "type": "http",
      "url": "https://mcp.huishengpai.com/mcp",
      "headers": {
        "Authorization": "Bearer eps_live_xxx"
      }
    }
  }
}
```

---

## 4. Gemini CLI

```bash
gemini mcp add --transport http --header "Authorization: Bearer eps_live_xxx" echopai https://mcp.huishengpai.com/mcp
```

---

## 5. Claude Desktop / claude.ai / WorkBuddy

1. Open **Settings → Connectors** (or **Custom Connectors**).
2. Add a custom remote connector with URL: `https://mcp.huishengpai.com/mcp`.
3. Click **Connect / Authorize** and sign in via the browser OAuth page. No API key required.

---

## 6. Headless / CI / Cron Environments

In environments without a browser, always pass the `Authorization: Bearer <KEY>` header directly.
You can get or manage your keys at <https://echopai.com/go/app/agent>.

---

## Arcade.dev (Remote MCP Server & MCP Gateway)

You can connect EchoPai to **Arcade.dev** as a Remote MCP Server and expose it through an Arcade MCP Gateway:

1. In the **Arcade Dashboard**, go to **Servers** → **Add Remote MCP Server**.
2. Fill in the connection details:
   - **Name**: `echopai-mcp`
   - **Endpoint / URL**: `https://mcp.huishengpai.com/mcp`
   - **Logo URL**: `https://echopai.com/logo-512.png`
3. **Authentication**:
   - **OAuth 2.0 (Recommended)**: EchoPai supports standard MCP OAuth discovery (`/.well-known/oauth-authorization-server`) with PKCE (`S256`) and dynamic client registration.
   - **API Key / Static Header**: Pass `Authorization: Bearer <YOUR_KEY>` for headless or shared service connections.
4. Go to **MCP Gateways** → **Create MCP Gateway**, select `echopai-mcp` tools, and connect your clients to the generated Arcade Gateway URL.
