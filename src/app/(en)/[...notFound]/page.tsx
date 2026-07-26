import { notFound } from "next/navigation";

/** Catch unmatched English routes so `(en)/not-found.tsx` renders with a real 404 status. */
export default function EnglishCatchAllNotFound() {
  notFound();
}
