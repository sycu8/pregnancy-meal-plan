"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "@/lib/referral";

export function ReferralCapture() {
  useEffect(() => {
    const run = () => {
      try {
        captureReferralFromUrl();
      } catch {
        // Ignore storage failures in private mode.
      }
    };

    const ric = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1));
    const cancelRic = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(run, { timeout: 1500 }) as number;
    return () => cancelRic(id);
  }, []);

  return null;
}
