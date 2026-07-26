import { Be_Vietnam_Pro } from "next/font/google";

/**
 * Keep the weight set small so Next emits fewer woff2 files.
 * preload:false avoids turning every weight/subset into a render-blocking hint;
 * display:swap still paints text immediately with the fallback stack.
 */
export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-be-vietnam-pro",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: true
});
