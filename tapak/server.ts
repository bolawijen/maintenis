import { serve } from "bun";
import { routes, initializeLogWriter } from "./routes";

// 4.25 hours max available in bun
globalThis.serverIdleTimeout = 255;

await initializeLogWriter();

serve({
  port: 8081,
  hostname: "0.0.0.0",
  idleTimeout: globalThis.serverIdleTimeout,
  // @ts-ignore
  routes,
});

console.log("Bun server listening on port 8081");