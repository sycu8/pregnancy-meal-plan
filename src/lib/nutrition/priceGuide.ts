import type { ShoppingList } from "@/types/mealPlan";

export type PriceGuideEntry = {
  match: string[];
  unit: "kg" | "item";
  priceVnd: number;
  source: "Kingfoodmart" | "WinMart" | "GO!/BigC/Tops";
};

export const groceryPriceGuideUpdatedAt = "2026-05-11";

export const groceryPriceSources = ["Kingfoodmart", "WinMart", "GO!/BigC/Tops"] as const;

export const groceryPriceNote =
  "Chi phí chỉ là ước tính tham khảo theo giá online/khuyến mãi công khai, có thể thay đổi theo khu vực, mùa vụ, khối lượng đóng gói và thời điểm đặt hàng.";

const priceGuide: PriceGuideEntry[] = [
  { match: ["thịt bò", "bò"], unit: "kg", priceVnd: 258000, source: "Kingfoodmart" },
  { match: ["tôm"], unit: "kg", priceVnd: 369000, source: "Kingfoodmart" },
  { match: ["cá hồi"], unit: "kg", priceVnd: 520000, source: "Kingfoodmart" },
  { match: ["cá thu", "cá lóc", "cá diêu hồng", "cá basa", "cá"], unit: "kg", priceVnd: 140000, source: "Kingfoodmart" },
  { match: ["ức gà", "gà"], unit: "kg", priceVnd: 130000, source: "Kingfoodmart" },
  { match: ["thịt heo", "heo", "giò sống"], unit: "kg", priceVnd: 119000, source: "Kingfoodmart" },
  { match: ["trứng"], unit: "item", priceVnd: 3500, source: "Kingfoodmart" },
  { match: ["đậu hũ"], unit: "kg", priceVnd: 33000, source: "WinMart" },
  { match: ["đậu lăng", "đậu đỏ", "đậu xanh", "đậu nành"], unit: "kg", priceVnd: 80000, source: "GO!/BigC/Tops" },
  { match: ["sữa chua"], unit: "item", priceVnd: 7000, source: "WinMart" },
  { match: ["sữa tươi", "sữa"], unit: "item", priceVnd: 12000, source: "WinMart" },
  { match: ["phô mai"], unit: "item", priceVnd: 9000, source: "GO!/BigC/Tops" },
  { match: ["gạo lứt", "gạo", "cơm"], unit: "kg", priceVnd: 28000, source: "GO!/BigC/Tops" },
  { match: ["yến mạch"], unit: "kg", priceVnd: 90000, source: "GO!/BigC/Tops" },
  { match: ["bánh mì", "bún", "miến", "nui", "bánh phở", "bánh đa", "bột gạo", "gạo nếp"], unit: "kg", priceVnd: 35000, source: "GO!/BigC/Tops" },
  { match: ["khoai lang", "khoai tây", "bắp"], unit: "kg", priceVnd: 32000, source: "Kingfoodmart" },
  { match: ["bông cải", "rau", "cải", "rau dền", "cải bó xôi", "mướp", "bí", "cà rốt", "cà chua", "nấm", "dưa leo", "xà lách", "giá", "đậu bắp"], unit: "kg", priceVnd: 55000, source: "Kingfoodmart" },
  { match: ["chuối", "cam", "ổi", "bơ", "táo", "thanh long", "trái cây", "thơm"], unit: "kg", priceVnd: 65000, source: "Kingfoodmart" },
  { match: ["hạt óc chó", "hạnh nhân"], unit: "kg", priceVnd: 360000, source: "GO!/BigC/Tops" },
  { match: ["vừng", "bơ đậu phộng", "hạt sen"], unit: "kg", priceVnd: 140000, source: "GO!/BigC/Tops" }
];

export function estimateIngredientCostVnd(ingredient: string, portionGram: number): number {
  const entry = findPriceEntry(ingredient);
  if (!entry) return Math.round((portionGram / 1000) * 50000);
  if (entry.unit === "item") return entry.priceVnd;
  return Math.round((portionGram / 1000) * entry.priceVnd);
}

export function estimateShoppingListCostVnd(shoppingList: ShoppingList): number {
  const groups: (keyof ShoppingList)[] = ["proteins", "vegetables", "fruits", "dairy", "grains", "others"];
  return roundToNearest500(
    groups.reduce((total, group) => total + shoppingList[group].reduce((sum, item) => sum + estimateIngredientCostVnd(item, defaultShoppingPortionGram(group)), 0), 0)
  );
}

function findPriceEntry(ingredient: string) {
  const text = ingredient.toLowerCase();
  return priceGuide.find((entry) => entry.match.some((keyword) => text.includes(keyword)));
}

function defaultShoppingPortionGram(group: keyof ShoppingList) {
  if (group === "proteins") return 300;
  if (group === "vegetables") return 350;
  if (group === "fruits") return 400;
  if (group === "dairy") return 250;
  if (group === "grains") return 350;
  return 80;
}

export function roundToNearest500(value: number) {
  return Math.max(1000, Math.round(value / 500) * 500);
}
