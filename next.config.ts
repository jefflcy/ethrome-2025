import { createCivicAuthPlugin } from "@civic/auth/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "43efdf89-d724-45f6-a5f4-93841ff6b3de"
});

export default withCivicAuth(nextConfig)