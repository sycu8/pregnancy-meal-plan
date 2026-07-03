import { describe, expect, it, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/shared-plans/route";

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
}

describe("shared-plans API", () => {
  it("returns 400 when id is missing", async () => {
    const response = await GET(new Request("http://localhost/api/shared-plans"));
    expect(response.status).toBe(400);
  });

  it("rejects invalid POST body", async () => {
    const response = await POST(
      new Request("http://localhost/api/shared-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "bad" })
      })
    );
    expect(response.status).toBe(400);
  });
});

describe("mergeMealPlanHistory", () => {
  beforeEach(async () => {
    const storage = createMemoryStorage();
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: storage },
      configurable: true
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true
    });
    const { mergeMealPlanHistory, getMealPlanHistory, clearHistory } = await import("@/lib/storage/localStorage");
    clearHistory();
    (globalThis as { mergeMealPlanHistory?: typeof mergeMealPlanHistory }).mergeMealPlanHistory = mergeMealPlanHistory;
    (globalThis as { getMealPlanHistory?: typeof getMealPlanHistory }).getMealPlanHistory = getMealPlanHistory;
  });

  it("merges cloud and local plans by newest createdAt", async () => {
    const { mergeMealPlanHistory, getMealPlanHistory } = await import("@/lib/storage/localStorage");
    const plan = {
      id: "a",
      createdAt: "2026-01-01T00:00:00.000Z",
      profileSnapshot: {
        pregnancyWeek: 20,
        pregnancyType: "singleton" as const,
        heightCm: 160,
        prePregnancyWeightKg: 52,
        currentWeightKg: 57,
        activityLevel: "light" as const,
        healthConditions: ["none" as const],
        cuisinePreferences: ["vietnamese_rice" as const],
        budget: "medium" as const,
        cookingTime: "around_30" as const,
        goals: ["balanced" as const]
      },
      days: [{ day: 1 }],
      shoppingList: { proteins: [], vegetables: [], fruits: [], dairy: [], grains: [], others: [] },
      shoppingBatches: [],
      summary: {
        message: "test",
        disclaimer: "test",
        bmi: 20,
        bmiCategory: "normal" as const,
        weightGainKg: 5,
        weightGainStatus: "normal" as const
      },
      safetyWarnings: [],
      specialNotes: []
    } as unknown as import("@/types/mealPlan").MealPlan;

    mergeMealPlanHistory([plan]);
    mergeMealPlanHistory([{ ...plan, createdAt: "2026-02-01T00:00:00.000Z" }]);

    const history = getMealPlanHistory();
    expect(history).toHaveLength(1);
    expect(history[0]?.createdAt).toBe("2026-02-01T00:00:00.000Z");
  });
});
