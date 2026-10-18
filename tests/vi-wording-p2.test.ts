import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { keywordLabel, buildBlogListKeywords } from "@/lib/blog/keywords";
import { titleForDocument } from "@/lib/blog/titles";
import { clampMetaDescription } from "@/lib/blog/synthesis/synthesizePost";
import { pregnancyProfileSchema } from "@/lib/nutrition/validation";
import { getPostBySlug } from "@/lib/blog/posts";

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
      expect(rejected.error.issues[0]?.message).toContain("Tuần thai cần từ 1 đến 42");
    }
  });

  it("uses the review wording on the named articles", () => {
    expect(post("pica-khi-mang-thai").content).toContain("bột (bột bắp, bột năng) ăn sống");
    expect(post("pica-khi-mang-thai").content).not.toContain("bột sắn");
    expect(post("ruou-va-thuoc-la-khi-mang-thai").content).toContain("1800 6606");
    expect(post("ruou-va-thuoc-la-khi-mang-thai").content).toContain("cần xác minh số hiện hành");
    expect(post("caffeine-khi-mang-thai").content).toContain("Một ly cà phê phin (robusta)");
    expect(post("theo-doi-duong-huyet-tieu-duong-thai-ky").content).toContain("khoảng 15 g đường");
    expect(post("thuc-pham-nen-tranh-khi-mang-thai").content).toContain("cá thu vua (king mackerel)");
    expect(post("iot-va-muoi-i-ot-khi-mang-thai").content).toContain("sự phát triển trí não của thai nhi");
    expect(post("tao-bon-khi-mang-thai").content).toContain("Đau bụng dữ dội, đi ngoài ra máu");
    expect(getPostBySlug("vitamin-a-trong-thai-ky", "vi")?.slug).toBe("vitamin-a-trong-thai-ky");
  });
});
