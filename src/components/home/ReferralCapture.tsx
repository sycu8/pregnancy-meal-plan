"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "@/lib/referral";

export function ReferralCapture() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  return null;
}
