import type { ShoppingList } from "@/types/mealPlan";
import {
  getCountryPricing,
  roundCountryCost,
  type CurrencyCode,
  type ResidenceCountryCode
} from "./countries";

export type PriceGuideEntry = {
  /** Bilingual keywords so Vietnamese meal ingredients and English labels both match */
  match: string[];
  unit: "kg" | "item";
  /** Price in the country's local currency */
  price: number;
};

type CountryPriceGuide = {
  country: ResidenceCountryCode;
  fallbackPerKg: number;
  entries: PriceGuideEntry[];
};

/** Vietnam guide — keep existing public supermarket pricing approach. */
const vietnamGuide: CountryPriceGuide = {
  country: "VN",
  fallbackPerKg: 50000,
  entries: [
    { match: ["thịt bò", "bò", "beef"], unit: "kg", price: 258000 },
    { match: ["tôm", "shrimp", "prawn"], unit: "kg", price: 369000 },
    { match: ["cá hồi", "salmon"], unit: "kg", price: 520000 },
    { match: ["cá thu", "cá lóc", "cá diêu hồng", "cá basa", "cá", "fish", "mackerel", "basa"], unit: "kg", price: 140000 },
    { match: ["ức gà", "gà", "chicken"], unit: "kg", price: 130000 },
    { match: ["thịt heo", "heo", "giò sống", "pork"], unit: "kg", price: 119000 },
    { match: ["trứng", "egg", "eggs"], unit: "item", price: 3500 },
    { match: ["đậu hũ", "tofu"], unit: "kg", price: 33000 },
    { match: ["đậu lăng", "đậu đỏ", "đậu xanh", "đậu nành", "lentil", "soybean", "mung bean", "red bean"], unit: "kg", price: 80000 },
    { match: ["sữa chua", "yogurt", "yoghurt"], unit: "item", price: 7000 },
    { match: ["sữa tươi", "sữa", "milk"], unit: "item", price: 12000 },
    { match: ["phô mai", "cheese"], unit: "item", price: 9000 },
    { match: ["gạo lứt", "gạo", "cơm", "rice", "brown rice"], unit: "kg", price: 28000 },
    { match: ["yến mạch", "oat", "oats"], unit: "kg", price: 90000 },
    { match: ["bánh mì", "bún", "miến", "nui", "bánh phở", "bánh đa", "bột gạo", "gạo nếp", "bread", "noodle", "pasta", "rice paper"], unit: "kg", price: 35000 },
    { match: ["khoai lang", "khoai tây", "bắp", "sweet potato", "potato", "corn"], unit: "kg", price: 32000 },
    { match: ["bông cải", "rau", "cải", "rau dền", "cải bó xôi", "mướp", "bí", "cà rốt", "cà chua", "nấm", "dưa leo", "xà lách", "giá", "đậu bắp", "vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "cucumber", "lettuce", "zucchini", "pumpkin"], unit: "kg", price: 55000 },
    { match: ["chuối", "cam", "ổi", "bơ", "táo", "thanh long", "trái cây", "thơm", "banana", "orange", "guava", "avocado", "apple", "dragon fruit", "fruit", "pineapple"], unit: "kg", price: 65000 },
    { match: ["hạt óc chó", "hạnh nhân", "walnut", "almond"], unit: "kg", price: 360000 },
    { match: ["vừng", "bơ đậu phộng", "hạt sen", "sesame", "peanut butter", "lotus seed"], unit: "kg", price: 140000 }
  ]
};

/**
 * Abroad guides use approximate public supermarket / convenience-store mid prices.
 * Values are intentionally coarse reference ranges, not live scrapes.
 */
const abroadGuides: CountryPriceGuide[] = [
  {
    country: "US",
    fallbackPerKg: 6,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 15 },
      { match: ["shrimp", "prawn", "tôm"], unit: "kg", price: 18 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 22 },
      { match: ["fish", "mackerel", "basa", "cá"], unit: "kg", price: 12 },
      { match: ["chicken", "gà", "ức gà"], unit: "kg", price: 8 },
      { match: ["pork", "thịt heo", "heo", "giò sống"], unit: "kg", price: 7 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.35 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 5 },
      { match: ["lentil", "soybean", "mung bean", "red bean", "đậu"], unit: "kg", price: 4 },
      { match: ["yogurt", "yoghurt", "sữa chua"], unit: "item", price: 1.2 },
      { match: ["milk", "sữa tươi", "sữa"], unit: "item", price: 1.5 },
      { match: ["cheese", "phô mai"], unit: "item", price: 1.8 },
      { match: ["rice", "brown rice", "gạo", "cơm"], unit: "kg", price: 3 },
      { match: ["oat", "oats", "yến mạch"], unit: "kg", price: 4 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 4 },
      { match: ["sweet potato", "potato", "corn", "khoai", "bắp"], unit: "kg", price: 2.5 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "cucumber", "lettuce", "rau", "cải", "cà"], unit: "kg", price: 4 },
      { match: ["banana", "orange", "apple", "avocado", "fruit", "chuối", "cam", "táo", "bơ", "trái cây"], unit: "kg", price: 3.5 },
      { match: ["walnut", "almond", "hạt óc chó", "hạnh nhân"], unit: "kg", price: 18 },
      { match: ["sesame", "peanut butter", "vừng", "bơ đậu phộng"], unit: "kg", price: 8 }
    ]
  },
  {
    country: "JP",
    fallbackPerKg: 800,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 2800 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 2500 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 3200 },
      { match: ["fish", "cá"], unit: "kg", price: 1600 },
      { match: ["chicken", "gà"], unit: "kg", price: 1100 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 1300 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 30 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 500 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 700 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 120 },
      { match: ["milk", "sữa"], unit: "item", price: 180 },
      { match: ["cheese", "phô mai"], unit: "item", price: 200 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 500 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 900 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 600 },
      { match: ["potato", "sweet potato", "khoai", "bắp", "corn"], unit: "kg", price: 350 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 700 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 600 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 2800 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 1400 }
    ]
  },
  {
    country: "KR",
    fallbackPerKg: 8000,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 32000 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 28000 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 35000 },
      { match: ["fish", "cá"], unit: "kg", price: 18000 },
      { match: ["chicken", "gà"], unit: "kg", price: 12000 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 14000 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 350 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 5000 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 7000 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 1500 },
      { match: ["milk", "sữa"], unit: "item", price: 2200 },
      { match: ["cheese", "phô mai"], unit: "item", price: 2500 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 4500 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 8000 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 6000 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 3500 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 7000 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 6000 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 28000 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 14000 }
    ]
  },
  {
    country: "SG",
    fallbackPerKg: 8,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 28 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 24 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 32 },
      { match: ["fish", "cá"], unit: "kg", price: 16 },
      { match: ["chicken", "gà"], unit: "kg", price: 10 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 12 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.45 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 5 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 6 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 1.8 },
      { match: ["milk", "sữa"], unit: "item", price: 2.2 },
      { match: ["cheese", "phô mai"], unit: "item", price: 2.5 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 3.5 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 6 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 5 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 3 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 6 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 5 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 28 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 12 }
    ]
  },
  {
    country: "AU",
    fallbackPerKg: 8,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 22 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 28 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 32 },
      { match: ["fish", "cá"], unit: "kg", price: 18 },
      { match: ["chicken", "gà"], unit: "kg", price: 11 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 13 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.55 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 7 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 5 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 1.8 },
      { match: ["milk", "sữa"], unit: "item", price: 2 },
      { match: ["cheese", "phô mai"], unit: "item", price: 2.5 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 3.5 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 4.5 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 5 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 3 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 6 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 5 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 28 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 12 }
    ]
  },
  {
    country: "GB",
    fallbackPerKg: 5,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 12 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 14 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 16 },
      { match: ["fish", "cá"], unit: "kg", price: 10 },
      { match: ["chicken", "gà"], unit: "kg", price: 6.5 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 6 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.3 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 4 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 3 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 0.9 },
      { match: ["milk", "sữa"], unit: "item", price: 1.1 },
      { match: ["cheese", "phô mai"], unit: "item", price: 1.4 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 2.2 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 2.8 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 2.5 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 1.6 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 3 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 2.5 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 14 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 6 }
    ]
  },
  {
    country: "CA",
    fallbackPerKg: 7,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 18 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 20 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 24 },
      { match: ["fish", "cá"], unit: "kg", price: 14 },
      { match: ["chicken", "gà"], unit: "kg", price: 10 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 9 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.4 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 6 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 4 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 1.4 },
      { match: ["milk", "sữa"], unit: "item", price: 1.8 },
      { match: ["cheese", "phô mai"], unit: "item", price: 2 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 3.5 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 4 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 4 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 2.5 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 5 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 4 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 22 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 9 }
    ]
  },
  {
    country: "DE",
    fallbackPerKg: 5,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 14 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 16 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 18 },
      { match: ["fish", "cá"], unit: "kg", price: 11 },
      { match: ["chicken", "gà"], unit: "kg", price: 7 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 6.5 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.3 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 4.5 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 3 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 0.9 },
      { match: ["milk", "sữa"], unit: "item", price: 1.1 },
      { match: ["cheese", "phô mai"], unit: "item", price: 1.5 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 2.5 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 2.8 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 2.8 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 1.5 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 3.2 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 2.8 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 16 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 7 }
    ]
  },
  {
    country: "FR",
    fallbackPerKg: 5.5,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 16 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 18 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 20 },
      { match: ["fish", "cá"], unit: "kg", price: 12 },
      { match: ["chicken", "gà"], unit: "kg", price: 8 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 7 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.35 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 5 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 3.5 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 1 },
      { match: ["milk", "sữa"], unit: "item", price: 1.2 },
      { match: ["cheese", "phô mai"], unit: "item", price: 1.6 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 2.8 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 3 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 3 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 1.8 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 3.5 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 3 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 18 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 8 }
    ]
  },
  {
    country: "TH",
    fallbackPerKg: 80,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 350 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 320 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 450 },
      { match: ["fish", "cá"], unit: "kg", price: 180 },
      { match: ["chicken", "gà"], unit: "kg", price: 120 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 140 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 5 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 50 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 70 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 25 },
      { match: ["milk", "sữa"], unit: "item", price: 35 },
      { match: ["cheese", "phô mai"], unit: "item", price: 40 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 40 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 120 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 60 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 40 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 70 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 60 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 450 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 180 }
    ]
  },
  {
    country: "MY",
    fallbackPerKg: 12,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 45 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 40 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 55 },
      { match: ["fish", "cá"], unit: "kg", price: 22 },
      { match: ["chicken", "gà"], unit: "kg", price: 14 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 18 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 0.6 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 8 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 10 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 3 },
      { match: ["milk", "sữa"], unit: "item", price: 4 },
      { match: ["cheese", "phô mai"], unit: "item", price: 5 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 5 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 12 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 8 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 5 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 8 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 7 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 50 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 20 }
    ]
  },
  {
    country: "TW",
    fallbackPerKg: 120,
    entries: [
      { match: ["beef", "thịt bò", "bò"], unit: "kg", price: 450 },
      { match: ["shrimp", "tôm"], unit: "kg", price: 420 },
      { match: ["salmon", "cá hồi"], unit: "kg", price: 520 },
      { match: ["fish", "cá"], unit: "kg", price: 250 },
      { match: ["chicken", "gà"], unit: "kg", price: 160 },
      { match: ["pork", "heo", "thịt heo"], unit: "kg", price: 180 },
      { match: ["egg", "eggs", "trứng"], unit: "item", price: 8 },
      { match: ["tofu", "đậu hũ"], unit: "kg", price: 70 },
      { match: ["lentil", "soybean", "đậu"], unit: "kg", price: 90 },
      { match: ["yogurt", "sữa chua"], unit: "item", price: 35 },
      { match: ["milk", "sữa"], unit: "item", price: 45 },
      { match: ["cheese", "phô mai"], unit: "item", price: 50 },
      { match: ["rice", "gạo", "cơm"], unit: "kg", price: 60 },
      { match: ["oat", "yến mạch"], unit: "kg", price: 140 },
      { match: ["bread", "noodle", "pasta", "bánh mì", "bún", "nui"], unit: "kg", price: 80 },
      { match: ["potato", "sweet potato", "khoai", "corn", "bắp"], unit: "kg", price: 50 },
      { match: ["vegetable", "broccoli", "spinach", "carrot", "tomato", "mushroom", "rau", "cải"], unit: "kg", price: 90 },
      { match: ["banana", "orange", "apple", "fruit", "chuối", "cam", "táo", "trái cây"], unit: "kg", price: 80 },
      { match: ["walnut", "almond", "hạt"], unit: "kg", price: 520 },
      { match: ["sesame", "peanut butter", "vừng"], unit: "kg", price: 220 }
    ]
  }
];

const guidesByCountry = new Map<ResidenceCountryCode, CountryPriceGuide>([
  [vietnamGuide.country, vietnamGuide],
  ...abroadGuides.map((guide) => [guide.country, guide] as const)
]);

/** @deprecated Prefer getCountryPricing(country).updatedAt */
export const groceryPriceGuideUpdatedAt = vietnamGuide.country === "VN" ? "2026-05-11" : "2026-07-01";
/** @deprecated Prefer getCountryPricing(country).sources */
export const groceryPriceSources = ["Kingfoodmart", "WinMart", "GO!/BigC/Tops"] as const;
/** @deprecated Prefer getCountryPricing(country).note */
export const groceryPriceNote =
  "Chi phí chỉ là ước tính tham khảo theo giá online/khuyến mãi công khai, có thể thay đổi theo khu vực, mùa vụ, khối lượng đóng gói và thời điểm đặt hàng.";

export function estimateIngredientCost(
  ingredient: string,
  portionGram: number,
  countryCode: ResidenceCountryCode = "VN"
): number {
  const guide = guidesByCountry.get(countryCode) ?? vietnamGuide;
  const currency = getCountryPricing(countryCode).currency;
  const entry = findPriceEntry(ingredient, guide);
  if (!entry) {
    const raw = (portionGram / 1000) * guide.fallbackPerKg;
    return roundCountryCost(raw, currency);
  }
  if (entry.unit === "item") return roundCountryCost(entry.price, currency);
  return roundCountryCost((portionGram / 1000) * entry.price, currency);
}

/** Vietnam-compatible helper used by existing meal database baselines. */
export function estimateIngredientCostVnd(ingredient: string, portionGram: number): number {
  return estimateIngredientCost(ingredient, portionGram, "VN");
}

export function estimateShoppingListCost(
  shoppingList: ShoppingList,
  countryCode: ResidenceCountryCode = "VN"
): number {
  const currency = getCountryPricing(countryCode).currency;
  const groups: (keyof ShoppingList)[] = ["proteins", "vegetables", "fruits", "dairy", "grains", "others"];
  const total = groups.reduce(
    (sum, group) =>
      sum +
      shoppingList[group].reduce(
        (groupSum, item) => groupSum + estimateIngredientCost(item, defaultShoppingPortionGram(group), countryCode),
        0
      ),
    0
  );
  return roundCountryCost(total, currency);
}

export function estimateShoppingListCostVnd(shoppingList: ShoppingList): number {
  return estimateShoppingListCost(shoppingList, "VN");
}

export function estimateMealCostForCountry(
  ingredients: string[],
  portionGram: number,
  countryCode: ResidenceCountryCode
): number {
  if (ingredients.length === 0) return 0;
  const currency = getCountryPricing(countryCode).currency;
  const ingredientPortion = Math.max(45, Math.round(portionGram / ingredients.length));
  const total = ingredients.reduce(
    (sum, ingredient) => sum + estimateIngredientCost(ingredient, ingredientPortion, countryCode),
    0
  );
  return roundCountryCost(total, currency);
}

function findPriceEntry(ingredient: string, guide: CountryPriceGuide) {
  const text = ingredient.toLowerCase();
  return guide.entries.find((entry) => entry.match.some((keyword) => text.includes(keyword.toLowerCase())));
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
  return roundCountryCost(value, "VND" satisfies CurrencyCode);
}
