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

  await DB.prepare(`INSERT INTO meal_plans (id, user_id, data_json, created_at) VALUES (?, ?, ?, ?)`)
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
