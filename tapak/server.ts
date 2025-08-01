import { serve } from "bun";
import { routes, initializeLogWriter } from "./routes";

// 4.25 hours max available in bun
globalThis.serverIdleTimeout = 255;

await initializeLogWriter();

const server = serve({
  hostname: "0.0.0.0",
  idleTimeout: globalThis.serverIdleTimeout,
  // @ts-ignore
  routes,
});

console.log(`Tapak server started on ${server.url}`);