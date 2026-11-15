#!/usr/bin/env node

/**
 * EchoPai (回声投研) Official MCP Server
 *
 * Implements the Model Context Protocol over stdio using @modelcontextprotocol/sdk
 * and connects directly to EchoPai's Open Platform REST APIs.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { EchoPaiClient } from "./client.js";
import { registerTools } from "./tools.js";

const VERSION = "1.0.0";

function parseArgs(argv) {
  let apiKey = process.env.ECHOPAI_API_KEY || process.env.ECHOPAI_KEY || "";
  let baseUrl = process.env.ECHOPAI_BASE_URL || "";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === "--key" || arg === "-k") && argv[i + 1]) {
      apiKey = argv[++i];
    } else if ((arg === "--base-url" || arg === "-u") && argv[i + 1]) {
      baseUrl = argv[++i];
    } else if (arg === "--version" || arg === "-v") {
      process.stdout.write(`${VERSION}\n`);
      process.exit(0);
    } else if (arg === "--help" || arg === "-h") {
      process.stderr.write(
        [
          `echopai-mcp v${VERSION} — Official EchoPai MCP Server`,
          "",
          "Options:",
          "  -k, --key <token>       EchoPai API key (or set ECHOPAI_API_KEY)",
          "  -u, --base-url <url>    Override Open Platform API base URL",
          "  -v, --version           Print version",
          "  -h, --help              Show help",
          "",
          "Hosted zero-install endpoint: https://mcp.huishengpai.com/mcp",
          "",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return { apiKey, baseUrl };
}

async function main() {
  const { apiKey, baseUrl } = parseArgs(process.argv.slice(2));

  const server = new McpServer({
    name: "echopai",
    version: VERSION,
  });

  const client = new EchoPaiClient({ apiKey, baseUrl, version: VERSION });
  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  process.stderr.write(`[echopai-mcp] Fatal error: ${msg}\n`);
  process.exit(1);
});
