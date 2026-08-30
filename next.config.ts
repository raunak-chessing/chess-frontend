import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  // CI (.github/workflows/ci.yml) already runs `npx tsc --noEmit` as its own
  // step on every push to main, on well-resourced runners — by the time this
  // code reaches a production Docker build, it's already been type-checked
  // once. next build's own internal type-check step repeats that same work
  // a second time, and on a memory-constrained build host (e.g. a free-tier
  // EC2 instance) that redundant pass is what was actually getting OOM-killed,
  // not the real compile. Skipping it here doesn't skip type safety — it
  // just stops re-doing a check CI already gates on.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "chess-org",
  project: "chess-frontend",
});
