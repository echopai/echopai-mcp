#!/usr/bin/env node

/**
 * EchoPai (回声投研) — 极薄本地 stdio ↔ 远程 Streamable HTTP MCP 桥接壳
 * 零外部依赖，仅需 Node.js >= 20。
 *
 * 用法：
 *   ECHOPAI_API_KEY=eps_live_... npx -y @echopai/mcp
 *   node src/index.js --key eps_live_...
 */

import readline from "node:readline";

const DEFAULT_ENDPOINT = "https://mcp.huishengpai.com/mcp";
const VERSION = "1.0.0";

function parseArgs(argv) {
  let endpoint = process.env.ECHOPAI_MCP_URL || DEFAULT_ENDPOINT;
  let apiKey = process.env.ECHOPAI_API_KEY || process.env.ECHOPAI_KEY || "";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === "--url" || arg === "-u") && argv[i + 1]) {
      endpoint = argv[++i];
    } else if ((arg === "--key" || arg === "-k") && argv[i + 1]) {
      apiKey = argv[++i];
    } else if (arg === "--version" || arg === "-v") {
      process.stdout.write(`${VERSION}\n`);
      process.exit(0);
    } else if (arg === "--help" || arg === "-h") {
      process.stderr.write(
        [
          `echopai-mcp v${VERSION} — EchoPai Remote MCP stdio bridge`,
          "",
          "Options:",
          "  -k, --key <token>   EchoPai API key (or set ECHOPAI_API_KEY / ECHOPAI_KEY)",
          `  -u, --url <url>     Remote MCP endpoint (default: ${DEFAULT_ENDPOINT})`,
          "  -v, --version       Print version",
          "  -h, --help          Show help",
          "",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return { endpoint, apiKey };
}

function writeJsonRpc(payload) {
  const line = typeof payload === "string" ? payload : JSON.stringify(payload);
  process.stdout.write(`${line}\n`);
}

function writeJsonRpcError(id, code, message) {
  if (id === undefined || id === null) return;
  writeJsonRpc({
    jsonrpc: "2.0",
    id,
    error: { code, message },
  });
}

async function consumeSseStream(bodyStream) {
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines = [];

  const flushEvent = () => {
    if (dataLines.length === 0) return;
    const raw = dataLines.join("\n").trim();
    dataLines = [];
    if (!raw || raw === "[DONE]") return;
    try {
      const parsed = JSON.parse(raw);
      writeJsonRpc(parsed);
    } catch {
      process.stderr.write(`[echopai-mcp] Ignored non-JSON SSE event: ${raw.slice(0, 120)}\n`);
    }
  };

  for await (const chunk of bodyStream) {
    buffer += decoder.decode(chunk, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).replace(/\r$/, "");
      buffer = buffer.slice(idx + 1);
      if (line === "") {
        flushEvent();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
  }

  if (buffer.trim().startsWith("data:")) {
    dataLines.push(buffer.trim().slice(5).trimStart());
  }
  flushEvent();
}

function main() {
  const { endpoint, apiKey } = parseArgs(process.argv.slice(2));
  let sessionId = "";

  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      process.stderr.write(`[echopai-mcp] Invalid JSON from stdin\n`);
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "User-Agent": `echopai-mcp/${VERSION}`,
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(msg),
      });

      const returnedSessionId = res.headers.get("mcp-session-id");
      if (returnedSessionId) {
        sessionId = returnedSessionId;
      }

      if (res.status === 202 || res.status === 204) {
        return;
      }

      if (!res.ok) {
        const errText = (await res.text().catch(() => "")).slice(0, 300);
        const hint =
          res.status === 401
            ? "Unauthorized: please provide a valid ECHOPAI_API_KEY (https://huishengpai.com/go/app/agent)."
            : `Upstream HTTP ${res.status}: ${errText || res.statusText}`;
        process.stderr.write(`[echopai-mcp] ${hint}\n`);
        writeJsonRpcError(msg.id, -32001, hint);
        return;
      }

      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("text/event-stream") && res.body) {
        await consumeSseStream(res.body);
      } else {
        const text = await res.text();
        if (text.trim()) {
          const parsed = JSON.parse(text);
          writeJsonRpc(parsed);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[echopai-mcp] Request failed: ${errMsg}\n`);
      writeJsonRpcError(msg.id, -32002, `Bridge request failed: ${errMsg}`);
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

main();
