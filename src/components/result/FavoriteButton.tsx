"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { getFavoriteMealSlugs, mealNameToSlug, toggleFavoriteMeal } from "@/lib/storage/favorites";
import { authHeaders } from "@/lib/storage/authSession";
import { useState } from "react";

export function FavoriteButton({ mealName }: { mealName: string }) {
  const slug = mealNameToSlug(mealName);
  const [active, setActive] = useState(() => getFavoriteMealSlugs().includes(slug));

  async function toggle() {
    const next = toggleFavoriteMeal(slug);
    const isActive = next.includes(slug);
    setActive(isActive);

    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ mealSlug: slug, action: isActive ? "add" : "remove" })
      });
    } catch {
      // local favorite still works offline
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={toggle} aria-pressed={active}>
      <Heart className={`h-4 w-4 ${active ? "fill-accent text-accent" : ""}`} />
    </Button>
  );
}
