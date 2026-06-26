"use client";

import Script from "next/script";

const beaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export function CloudflareAnalytics() {
  if (!beaconToken) return null;

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${beaconToken}"}`}
      strategy="afterInteractive"
    />
  );
}
