import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { keywordLabel, buildBlogListKeywords } from "@/lib/blog/keywords";
import { titleForDocument } from "@/lib/blog/titles";
import { clampMetaDescription } from "@/lib/blog/synthesis/synthesizePost";
import { PAST_DUE_WEEK_HINT, pregnancyProfileSchema } from "@/lib/nutrition/validation";
import { getPostBySlug } from "@/lib/blog/posts";
import { localizeIngredient } from "@/lib/nutrition/mealLocales";
import { localizeMealPlanForLocale } from "@/lib/nutrition/localizeMealPlan";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";

function post(slug: string) {
  return JSON.parse(fs.readFileSync(`content/blog/posts/${slug}.json`, "utf8")) as {
    title: string;
    content: string;
    metaTitle: string;
    metaDescription: string;
  };
}

describe("P2/P3 Vietnamese wording", () => {
  it("labels Vietnamese keyword chips with diacritics", () => {
    expect(keywordLabel("an-toan-thuc-pham", "vi")).toBe("an toàn thực phẩm");
    expect(keywordLabel("me-bau", "vi")).toBe("mẹ bầu");
    expect(keywordLabel("sat", "vi")).toBe("sắt");
    expect(keywordLabel("ca", "vi")).toBe("cá");
    expect(keywordLabel("say-nang", "vi")).toBe("say nắng");
    expect(keywordLabel("tieu-duong-thai-ky", "vi")).toBe("tiểu đường thai kỳ");
    expect(buildBlogListKeywords("vi").some((item) => item === "prenatal nutrition")).toBe(false);
    expect(buildBlogListKeywords("en")).toContain("prenatal nutrition");
  });

  it("cuts document titles on a word boundary before the brand suffix", () => {
    expect(titleForDocument("Checklist dinh dưỡng 3 tháng đầu: folate, sắt và thực phẩm an toàn | P")).not.toMatch(
      /\|\s*P$/
    );
    expect(titleForDocument("Social | Pregnancy Meal Planner")).toBe("Social");
    expect(titleForDocument("Thực đơn mẫu cho tuần bận rộn | Pregnancy M")).not.toMatch(/Pregnancy M$/);
    const titled = titleForDocument("Checklist dinh dưỡng 3 tháng đầu: folate, sắt và thực phẩm an toàn | P");
    expect(`${titled} | Pregnancy Meal Planner`.length).toBeLessThanOrEqual(70);
  });

  it("pads short meta descriptions with a complete sentence", () => {
    const text = clampMetaDescription("Ngắn.", "Sắt", "vi");
    expect(text.length).toBeGreaterThanOrEqual(100);
    expect(text.length).toBeLessThanOrEqual(155);
    expect(text).not.toContain("tham khảo giáo");
    expect(text).toContain("không thay thế tư vấn của bác sĩ");
  });

  it("accepts gestational weeks 41 and 42", () => {
    const base = {
      pregnancyType: "singleton" as const,
      heightCm: 160,
      prePregnancyWeightKg: 55,
      currentWeightKg: 65,
      activityLevel: "light" as const,
      healthConditions: ["none"] as const,
      cuisinePreferences: ["vietnamese_rice"] as const,
      budget: "medium" as const,
      cookingTime: "around_30" as const,
      goals: ["balanced"] as const
    };
    expect(pregnancyProfileSchema.safeParse({ ...base, pregnancyWeek: 42 }).success).toBe(true);
    const rejected = pregnancyProfileSchema.safeParse({ ...base, pregnancyWeek: 43 });
    expect(rejected.success).toBe(false);
    if (!rejected.success) {
      expect(rejected.error.issues[0]?.message).toBe("Tuần thai cần từ 1 đến 42.");
    }
    expect(PAST_DUE_WEEK_HINT).toBe("Đã quá ngày dự sinh, hãy liên hệ bác sĩ để được theo dõi.");
  });

  it("uses the review wording on the named articles", () => {
    expect(post("pica-khi-mang-thai").content).toContain("bột (bột bắp, bột năng) ăn sống");
    expect(post("pica-khi-mang-thai").content).not.toContain("bột sắn");
    expect(post("ruou-va-thuoc-la-khi-mang-thai").content).toContain(
      "Hỏi bác sĩ hoặc cơ sở y tế về chương trình cai thuốc lá."
    );
    expect(post("ruou-va-thuoc-la-khi-mang-thai").content).not.toContain("1800 6606");
    expect(post("ruou-va-thuoc-la-khi-mang-thai").content).not.toContain("cần xác minh số hiện hành");
    expect(post("caffeine-khi-mang-thai").metaDescription).toBe(
      "Uống cà phê, trà khi mang thai: giới hạn caffeine tham khảo theo NHS, ACOG. Trà, trà sữa, nước tăng lực và chocolate cũng chứa caffeine."
    );
    expect(post("caffeine-khi-mang-thai").content).toContain("Một ly cà phê phin (robusta)");
    expect(post("theo-doi-duong-huyet-tieu-duong-thai-ky").content).toContain("khoảng 15 g đường");
    expect(post("thuc-pham-nen-tranh-khi-mang-thai").content).toContain("cá thu vua (king mackerel)");
    expect(post("iot-va-muoi-i-ot-khi-mang-thai").content).toContain("sự phát triển trí não của thai nhi");
    expect(post("tao-bon-khi-mang-thai").content).toContain("Đau bụng dữ dội, đi ngoài ra máu");
    expect(getPostBySlug("vitamin-a-trong-thai-ky", "vi")?.slug).toBe("vitamin-a-trong-thai-ky");
    expect(post("tieu-duong-thai-ky-an-uong-the-nao").metaDescription).toContain(
      "không thay thế tư vấn của bác sĩ"
    );
    expect(post("tieu-duong-thai-ky-an-uong-the-nao").metaDescription).not.toContain("không thay thế bác sĩ.");
    const planner = fs.readFileSync("src/components/planner/PlannerForm.tsx", "utf8");
    expect(planner).toContain(
      "Chế độ tiểu đường thai kỳ nghiêm ngặt: chỉ món có chỉ số đường huyết (GI) thấp"
    );
    expect(planner).not.toContain("nghiêm ngặt (chỉ món có chỉ số đường huyết (GI) thấp)");
    const drafts = fs.readFileSync("src/lib/marketing/drafts.ts", "utf8");
    expect(drafts).toContain("không thay thế tư vấn của bác sĩ");
    expect(drafts).not.toContain("không thay thế bác sĩ.");
  });

  it("localizes a saved plan that still uses the old pasteurized meal id", () => {
    const plan = ruleBasedMealPlanner(
      {
        pregnancyType: "singleton",
        heightCm: 160,
        prePregnancyWeightKg: 55,
        currentWeightKg: 65,
        activityLevel: "light",
        healthConditions: ["none"],
        cuisinePreferences: ["vietnamese_rice"],
        budget: "medium",
        cookingTime: "around_30",
        goals: ["balanced"],
        pregnancyWeek: 24
      },
      "vi"
    );
    const day = plan.days[0];
    const saved = {
      ...plan,
      days: [
        {
          ...day,
          breakfast: { ...day.breakfast, mealId: "Yến mạch sữa tươi tiệt trùng", name: "Yến mạch sữa tươi tiệt trùng" },
          morningSnack: { ...day.morningSnack, mealId: "Sữa tươi tiệt trùng", name: "Sữa tươi tiệt trùng" },
          lunch: {
            ...day.lunch,
            mealId: "Bánh mì nguyên cám phô mai tiệt trùng",
            name: "Bánh mì nguyên cám phô mai tiệt trùng"
          },
          afternoonSnack: {
            ...day.afternoonSnack,
            mealId: "Sinh tố bơ sữa tiệt trùng không đường",
            name: "Sinh tố bơ sữa tiệt trùng không đường"
          }
        },
        ...plan.days.slice(1)
      ],
      shoppingList: {
        ...plan.shoppingList,
        dairy: ["sữa tươi tiệt trùng", "sữa chua tiệt trùng", "phô mai tiệt trùng"]
      }
    };

    const localized = localizeMealPlanForLocale(saved, "en");
    expect(localized.days[0].breakfast.name).toBe("Oats with pasteurized milk");
    expect(localized.days[0].breakfast.mealId).toBe("Yến mạch sữa tươi đã thanh trùng");
    expect(localized.days[0].morningSnack.name).toBe("Pasteurized milk");
    expect(localized.days[0].lunch.name).toBe("Whole-grain bread with pasteurized cheese");
    expect(localized.days[0].afternoonSnack.name).toBe("Unsweetened avocado milk smoothie");
    expect(localizeIngredient("sữa tươi tiệt trùng", "en")).toBe("pasteurized or UHT milk");
    expect(localizeIngredient("sữa chua tiệt trùng", "en")).toBe("yogurt made from pasteurized milk");
    expect(localizeIngredient("phô mai tiệt trùng", "en")).toBe("cheese made from pasteurized milk");
    expect(localizeIngredient("sữa tươi tiệt trùng", "vi")).toBe("sữa tươi đã thanh trùng hoặc tiệt trùng");
  });
});
