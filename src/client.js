/**
 * EchoPai Open Platform REST API Client
 *
 * Connects to https://api.huishengpai.com with automatic failover to
 * https://api.echopai.com when the primary endpoint is unreachable.
 */

export const PRIMARY_BASE_URL = "https://api.huishengpai.com";
export const FALLBACK_BASE_URL = "https://api.echopai.com";

export class EchoPaiClient {
  constructor({ apiKey = "", baseUrl = "", version = "1.0.0" } = {}) {
    this.apiKey = apiKey || process.env.ECHOPAI_API_KEY || process.env.ECHOPAI_KEY || "";
    this.customBaseUrl = baseUrl || process.env.ECHOPAI_BASE_URL || "";
    this.version = version;
  }

  getCandidateBaseUrls() {
    if (this.customBaseUrl) {
      return [this.customBaseUrl.replace(/\/+$/, "")];
    }
    return [PRIMARY_BASE_URL, FALLBACK_BASE_URL];
  }

  buildUrl(baseUrl, pathTemplate, pathParams = {}, queryParams = {}) {
    let resolvedPath = pathTemplate;
    for (const [key, value] of Object.entries(pathParams)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(String(value)));
    }

    const url = new URL(`${baseUrl}${resolvedPath}`);
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          url.searchParams.set(key, value.join(","));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async request(pathTemplate, { method = "GET", pathParams = {}, queryParams = {}, body } = {}) {
    if (!this.apiKey) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: {
                code: "missing_api_key",
                message:
                  "Missing ECHOPAI_API_KEY. Create an API key at https://echopai.com/go/app/agent or use the hosted OAuth endpoint https://mcp.huishengpai.com/mcp.",
              },
            }),
          },
        ],
      };
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": `echopai-mcp/${this.version}`,
      "X-Client": `echopai-mcp/${this.version}`,
      "X-Client-Channel": "mcp",
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const candidates = this.getCandidateBaseUrls();
    let lastNetworkError = null;

    for (const baseUrl of candidates) {
      const targetUrl = this.buildUrl(baseUrl, pathTemplate, pathParams, queryParams);
      try {
        const res = await fetch(targetUrl, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const text = await res.text();
        if (!res.ok) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: text || JSON.stringify({ error: { code: `http_${res.status}`, message: res.statusText } }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: text || "{}",
            },
          ],
        };
      } catch (err) {
        lastNetworkError = err;
      }
    }

    const message = lastNetworkError instanceof Error ? lastNetworkError.message : String(lastNetworkError);
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: {
              code: "network_error",
              message: `Failed to reach EchoPai API: ${message}`,
            },
          }),
        },
      ],
    };
  }
}
