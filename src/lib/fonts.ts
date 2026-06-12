import { Be_Vietnam_Pro } from "next/font/google";

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"]
});
