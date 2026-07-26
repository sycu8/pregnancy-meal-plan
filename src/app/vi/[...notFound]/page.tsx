import { notFound } from "next/navigation";

/** Catch unmatched Vietnamese routes so `vi/not-found.tsx` renders with a real 404 status. */
export default function VietnameseCatchAllNotFound() {
  notFound();
}
