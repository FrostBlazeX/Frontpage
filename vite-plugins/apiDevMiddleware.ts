import type { Plugin } from "vite";
import feedHandler, { type MinimalApiRequest, type MinimalApiResponse } from "../api/feed";
import validateFeedHandler from "../api/validateFeed";

type ApiHandler = (req: MinimalApiRequest, res: MinimalApiResponse) => Promise<void>;

// Mirrors the Vercel /api routes during `vite dev`, so local development doesn't
// require the Vercel CLI. Production deploys pick up api/*.ts natively.
export function apiDevMiddleware(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      const register = (path: string, handler: ApiHandler) => {
        server.middlewares.use(path, async (req, res) => {
          const url = new URL(req.url ?? "", "http://localhost");
          const query: Record<string, string> = {};
          url.searchParams.forEach((value, key) => {
            query[key] = value;
          });

          const minimalRes: MinimalApiResponse = {
            status(code: number) {
              res.statusCode = code;
              return minimalRes;
            },
            json(body: unknown) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(body));
            },
          };

          try {
            await handler({ query }, minimalRes);
          } catch (err) {
            minimalRes.status(500).json({
              ok: false,
              error: err instanceof Error ? err.message : "Unknown server error",
            });
          }
        });
      };

      register("/api/feed", feedHandler);
      register("/api/validateFeed", validateFeedHandler);
    },
  };
}
