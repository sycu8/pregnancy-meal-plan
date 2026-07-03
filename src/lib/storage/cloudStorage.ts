import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";
import { getBindings } from "@/lib/cloudflare/bindings";

export type CloudUserRecord = {
  id: string;
  email?: string;
  locale: "vi" | "en";
  premium: boolean;
};

export async function saveCloudProfile(userId: string, profile: PregnancyProfile): Promise<void> {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  await DB.prepare(
    `INSERT INTO profiles (user_id, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
  )
    .bind(userId, JSON.stringify(profile), new Date().toISOString())
    .run();
}

export async function loadCloudProfile(userId: string): Promise<PregnancyProfile | null> {
  const { DB } = await getBindings();
  if (!DB) return null;

  const row = await DB.prepare(`SELECT data_json FROM profiles WHERE user_id = ?`).bind(userId).first<{ data_json: string }>();
  if (!row?.data_json) return null;
  return JSON.parse(row.data_json) as PregnancyProfile;
}

export async function saveCloudMealPlan(userId: string, plan: MealPlan): Promise<void> {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  await DB.prepare(
    `INSERT INTO meal_plans (id, user_id, data_json, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json, created_at = excluded.created_at`
  )
    .bind(plan.id, userId, JSON.stringify(plan), plan.createdAt)
    .run();
}

export async function listCloudMealPlans(userId: string, limit = 50): Promise<MealPlan[]> {
  const { DB } = await getBindings();
  if (!DB) return [];

  const { results } = await DB.prepare(`SELECT data_json FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`)
    .bind(userId, limit)
    .all<{ data_json: string }>();

  return (results ?? []).map((row: { data_json: string }) => JSON.parse(row.data_json) as MealPlan);
}

export async function listCloudFavorites(userId: string): Promise<string[]> {
  const { DB } = await getBindings();
  if (!DB) return [];

  const { results } = await DB.prepare(`SELECT meal_slug FROM favorites WHERE user_id = ? ORDER BY meal_slug`)
    .bind(userId)
    .all<{ meal_slug: string }>();

  return (results ?? []).map((row) => row.meal_slug);
}

export async function addCloudFavorite(userId: string, mealSlug: string) {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  await DB.prepare(`INSERT OR IGNORE INTO favorites (user_id, meal_slug) VALUES (?, ?)`).bind(userId, mealSlug).run();
}

export async function removeCloudFavorite(userId: string, mealSlug: string) {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  await DB.prepare(`DELETE FROM favorites WHERE user_id = ? AND meal_slug = ?`).bind(userId, mealSlug).run();
}

export async function setUserPremium(userId: string, premium: boolean) {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");
  await DB.prepare(`UPDATE users SET premium = ? WHERE id = ?`).bind(premium ? 1 : 0, userId).run();
}

