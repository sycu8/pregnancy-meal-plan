/**
 * One-off accuracy + source URL fix for the six nutritionist-topic posts.
 * Run: npx tsx scripts/fix-new-blog-accuracy.ts
 */
import fs from "node:fs";
import path from "node:path";
import { estimateReadingTimeMinutes } from "../src/lib/blog/readingTime.ts";
import { pickAuthoritativeSources } from "../src/lib/blog/synthesis/contentStandards.ts";
import { clampMetaDescription } from "../src/lib/blog/synthesis/synthesizePost.ts";

const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");
const accessedAt = "2026-08-09";
const now = new Date().toISOString();

const BROKEN_URL_REPLACEMENTS: Record<string, string> = {
  "https://www.who.int/tools/elena/interventions/nutrition-pregnancy":
    "https://www.who.int/tools/elena/interventions/nutrition-counselling-pregnancy",
  "https://www.fda.gov/food/consumers/advice-about-eating-fish":
    "https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish"
};

type ViPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  reviewer?: string;
  sourceReferences: { title: string; url: string; publisher: string; accessedAt?: string }[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  faqs?: { question: string; answer: string }[];
  status: string;
};

type EnPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  author?: string;
  reviewer?: string;
  faqs?: { question: string; answer: string }[];
};

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function patchUrlsInText(text: string) {
  let next = text;
  for (const [from, to] of Object.entries(BROKEN_URL_REPLACEMENTS)) {
    next = next.split(from).join(to);
  }
  next = next.replace(/FDA: Advice about Eating Fish/g, "EPA/FDA: Advice about Eating Fish and Shellfish");
  next = next.replace(/WHO: Healthy diet during pregnancy/g, "WHO: Nutrition counselling during pregnancy");
  return next;
}

function cleanTags(tags: string[], preferred: string[]) {
  const banned = new Set(["gestational-diabetes-meals", "pregnancy-meal-planner"]);
  const merged = [...preferred, ...tags].map((t) => t.toLowerCase()).filter((t) => !banned.has(t));
  return [...new Set(merged)].slice(0, 6);
}

const sushiVi = {
  excerpt: "Sushi sống, salad, BBQ và phô mai: món nào mẹ bầu nên tránh, nấu chín kỹ hay chọn bản tiệt trùng — theo CDC, NHS và EPA/FDA.",
  content: `## Tổng quan

Sushi, salad, BBQ và khay phô mai là món quốc tế dễ gặp khi đi ăn ngoài. Ở góc tư vấn dinh dưỡng thai kỳ, ưu tiên là **an toàn thực phẩm trước**, rồi mới tới dinh dưỡng. Theo chủ đề hướng dẫn của CDC và NHS, mẹ bầu nên tránh đồ sống/tái và sữa chưa tiệt trùng; EPA/FDA hướng dẫn chọn cá ít thủy ngân khi ăn cá đã nấu chín.

## Sushi và sashimi: nên tránh dạng sống

- **Tránh sashimi và sushi cá sống/hải sản sống** trong thai kỳ. Rủi ro chính là nhiễm khuẩn/ký sinh (không chỉ thủy ngân).
- **Không nói “cá ít thủy ngân thì ăn sống được”** — thủy ngân và an toàn vi sinh là hai trục khác nhau.
- Lựa chọn thay thế thực tế: sushi **chay** (dưa leo, bơ, trứng chín), cơm nắm, hoặc **cá nấu chín** (cá hồi nướng, cá basa hấp) theo nhóm cá ít thủy ngân của EPA/FDA.
- Hạn chế cá thủy ngân cao (cá mập, cá kiếm, cá thu lớn…) kể cả khi đã nấu chín.

## Salad: giữ được nếu rửa sạch và kết hợp đủ chất

- Rửa kỹ rau lá, loại bỏ lá dập; ưu tiên salad tự làm hoặc quán vệ sinh rõ ràng.
- Kết hợp **đạm chín** (gà luộc, trứng chín kỹ, đậu phụ) + dầu thực vật + trái cây họ cam để tăng vitamin C và no lâu.
- Tránh salad có **thịt nguội/pate**, trứng lòng đào, hoặc sốt mayonnaise nghi ngờ bảo quản.

## BBQ: được khi nấu chín kỹ

- Thịt, hải sản và trứng trên vỉ phải **chín hoàn toàn** (không tái hồng tâm).
- Ưu tiên phần nạc, ăn kèm nhiều rau; hạn chế nước sốt rất mặn và thịt cháy đen nhiều.
- Không dùng chung thớt/đĩa sống–chín.

## Phô mai và khay cheese: chọn tiệt trùng

- Theo CDC/NHS: tránh phô mai mềm từ sữa **chưa tiệt trùng**; ưu tiên phô mai cứng hoặc sản phẩm ghi rõ pasteurized.
- Sữa chua/sữa tiệt trùng vẫn là lựa chọn canxi tiện lợi.

## Nên kết hợp / nên bỏ

| Nên giữ (chỉnh cách làm) | Nên bỏ hoặc đổi |
| --- | --- |
| Salad rửa sạch + đạm chín | Sushi/sashimi sống |
| BBQ chín kỹ + rau | Thịt/hải sản tái |
| Phô mai tiệt trùng | Phô mai mềm chưa tiệt trùng |
| Cá nấu chín, ít thủy ngân | Cá thủy ngân cao |

## Khi nào cần hỏi bác sĩ

Nôn ói kéo dài sau ăn ngoài, sốt, tiêu chảy nặng, đau bụng dữ dội hoặc chảy máu — đi khám sớm. Bài viết mang tính giáo dục, không thay thế chỉ định lâm sàng.

## Nguồn tham khảo

- CDC: People at Risk: Pregnant Women — Food Safety — https://www.cdc.gov/food-safety/people-at-risk/pregnant-women.html
- NHS: Foods to avoid in pregnancy — https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/
- EPA/FDA: Advice about Eating Fish and Shellfish — https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish
- ACOG: Nutrition During Pregnancy — https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy
`,
  faqs: [
    {
      question: "Mẹ bầu ăn sushi được không?",
      answer:
        "Nên tránh sushi/sashimi sống. Có thể chọn phiên bản chay hoặc cá đã nấu chín, ưu tiên nhóm cá ít thủy ngân theo EPA/FDA, và hỏi bác sĩ nếu có chỉ định đặc biệt."
    },
    {
      question: "Salad mang thai có an toàn không?",
      answer:
        "Thường ổn nếu rau được rửa sạch và kết hợp đạm chín; tránh thịt nguội, trứng lòng đào và đồ để lâu không rõ nguồn gốc."
    },
    {
      question: "Phô mai mềm mẹ bầu nên chọn thế nào?",
      answer:
        "Chọn sản phẩm từ sữa tiệt trùng; tránh phô mai mềm chưa tiệt trùng vì nguy cơ Listeria theo CDC/NHS."
    }
  ],
  tags: ["food-analysis", "food-safety", "international-food", "pregnancy"]
};

const sushiEn = {
  excerpt:
    "Sushi, salads, BBQ and cheese boards in pregnancy: what to avoid, cook thoroughly, or choose pasteurized — aligned with CDC, NHS and EPA/FDA themes.",
  content: `## Overview

Sushi, salads, BBQ, and cheese boards are common when eating out. From a pregnancy nutrition-consulting lens, **food safety comes first**, then nutrient balance. CDC and NHS guidance themes advise avoiding raw/undercooked animal foods and unpasteurized soft cheeses; EPA/FDA advice guides choosing lower-mercury fish when fish is cooked.

## Sushi and sashimi: avoid raw versions

- **Avoid raw fish sushi and sashimi** during pregnancy. The primary concern is infection risk (not only mercury).
- **Do not treat “low-mercury” as permission to eat fish raw** — mercury and microbial safety are separate issues.
- Practical swaps: **vegetable rolls**, cooked-egg options, or **fully cooked** lower-mercury fish (baked salmon, thoroughly cooked white fish).
- Continue to limit high-mercury species (shark, swordfish, king mackerel, tilefish) even when cooked.

## Salads: usually fine when washed and balanced

- Wash leafy greens well; prefer made-to-order salads.
- Build the plate with **cooked protein** (chicken, hard-cooked eggs, tofu), healthy fat, and vitamin C–rich produce.
- Skip salads topped with **cold deli meats**, runny eggs, or questionable mayonnaise.

## BBQ: fine when thoroughly cooked

- Cook meats and seafood until **no pink center**; do not share raw/cooked utensils.
- Pair with vegetables; go easy on very salty sauces and heavily charred bits.

## Cheese boards: choose pasteurized

- Prefer hard cheeses or products clearly labeled pasteurized; avoid soft unpasteurized cheeses (Listeria risk themes from CDC/NHS).
- Pasteurized yogurt remains a convenient calcium option.

## Keep / skip checklist

| Keep (with tweaks) | Skip or swap |
| --- | --- |
| Washed salad + cooked protein | Raw sushi/sashimi |
| Fully cooked BBQ + vegetables | Undercooked meat/seafood |
| Pasteurized cheese | Soft unpasteurized cheese |
| Cooked lower-mercury fish | High-mercury species |

## When to seek care

Persistent vomiting after eating out, fever, severe diarrhea, strong abdominal pain, or bleeding needs prompt medical care. This article is educational and not a clinical prescription.

## Sources

- CDC: People at Risk: Pregnant Women — Food Safety — https://www.cdc.gov/food-safety/people-at-risk/pregnant-women.html
- NHS: Foods to avoid in pregnancy — https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/
- EPA/FDA: Advice about Eating Fish and Shellfish — https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish
- ACOG: Nutrition During Pregnancy — https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy
`,
  faqs: [
    {
      question: "Can pregnant people eat sushi?",
      answer:
        "Avoid raw sushi and sashimi. Choose vegetable rolls or thoroughly cooked lower-mercury fish, and ask your clinician about personal restrictions."
    },
    {
      question: "Are salads safe in pregnancy?",
      answer:
        "Usually yes if produce is washed well and proteins are cooked; avoid cold deli meats and undercooked eggs."
    },
    {
      question: "What cheese is safer on a board?",
      answer:
        "Choose pasteurized cheeses; avoid soft unpasteurized cheeses because of Listeria risk guidance from CDC/NHS."
    }
  ]
};

const phoVi = {
  excerpt:
    "Phở, bún, cơm tấm, trứng và đồ ăn vặt: giữ món nóng chín kỹ, tránh tái/sống, kết hợp rau và trái cây — góc tư vấn dinh dưỡng thai kỳ.",
  content: `## Tổng quan

Ẩm thực Việt rất thân thuộc với mẹ bầu, nhưng “ăn được” phụ thuộc nhiều vào **cách chế biến và vệ sinh**, không chỉ tên món. Theo chủ đề CDC/NHS về an toàn thực phẩm: ưu tiên đồ **nấu chín kỹ**, trứng chín hoàn toàn, tránh thịt nguội/pate và hải sản sống.

## Phở: giữ khi nóng và chín kỹ

- Phở bò/gà **nước dùng sôi**, thịt chín kỹ là lựa chọn hợp lý: cung cấp nước, đạm và tinh bột.
- **Tránh tái** (thịt nhúng tái hồng). Đây mới là điểm cần chỉnh — không phải vì “thịt heo trong phở luôn chứa Listeria”.
- Thịt heo **đã nấu chín trong nước dùng nóng** khác với thịt nguội/deli lạnh (nhóm rủi ro Listeria thường được nhắc).
- Hạn chế thêm tiết sống, tái sống; rửa sạch rau thơm; bớt nước tương rất mặn nếu đang theo dõi huyết áp/phù.

## Bún và món nước tương tự

- Chọn bún thịt gà/bò/heo **chín**, nước dùng nóng.
- Hải sản trong bún phải chín kỹ; tránh tái/sống. Với cá, ưu tiên loài ít thủy ngân theo EPA/FDA.
- Ăn kèm nhiều rau; có thể thêm chanh/ớt (nếu chịu được) để dễ ăn hơn khi nghén.

## Cơm tấm và cơm phần

- Giữ được nếu thịt/sườn/bì được **nấu chín**, trứng ốp la chín lòng, đồ chua bảo quản sạch.
- Kết hợp thêm rau luộc/xào và trái cây sau bữa để tăng chất xơ, folate và vitamin C.
- Hạn chế phần cháy khét nhiều và nước mắm ngọt quá đậm nếu đang kiểm soát đường huyết theo chỉ định bác sĩ.

## Trứng ốp la / trứng trong bữa Việt

- Ăn trứng **chín kỹ** (không lòng đào). Trứng là nguồn đạm, choline tiện lợi.
- Kết hợp với rau xanh và trái cây họ cam giúp đa dạng vi chất.

## Đồ ăn vặt đường phố

- Rủi ro chính thường là **vệ sinh và bảo quản**, không chỉ “đường/béo”.
- Ưu tiên quán đông khách, đồ nóng vừa nấu; hạn chế đồ để lâu, nước đá nguồn không rõ, và nội tạng sống/tái.
- Bánh ngọt/nước ngọt: dùng vừa phải trong tổng năng lượng ngày.

## Nên kết hợp / nên bỏ

| Nên giữ | Nên chỉnh hoặc bỏ |
| --- | --- |
| Phở/bún nóng, thịt chín | Phở tái, tiết sống |
| Cơm tấm thịt chín + rau | Thịt tái, trứng lòng đào |
| Trứng chín kỹ | Trứng sống/lòng đào |
| Trái cây rửa sạch | Đồ nguội để lâu, pate lạnh |

## Khi nào cần gặp bác sĩ

Sốt, tiêu chảy nặng, đau bụng dữ dội, giảm cử động thai hoặc không giữ được nước sau nghén — cần khám. Nội dung mang tính tham khảo giáo dục.

## Nguồn tham khảo

- CDC: People at Risk: Pregnant Women — Food Safety — https://www.cdc.gov/food-safety/people-at-risk/pregnant-women.html
- NHS: Foods to avoid in pregnancy — https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/
- WHO: Nutrition counselling during pregnancy — https://www.who.int/tools/elena/interventions/nutrition-counselling-pregnancy
- EPA/FDA: Advice about Eating Fish and Shellfish — https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish
`,
  faqs: [
    {
      question: "Mẹ bầu ăn phở được không?",
      answer:
        "Được nếu nước dùng nóng và thịt chín kỹ. Nên tránh thịt tái hoặc đồ sống thêm vào tô."
    },
    {
      question: "Thịt heo trong phở/bún có phải tránh vì Listeria không?",
      answer:
        "Thịt heo đã nấu chín nóng khác với thịt nguội/deli lạnh. Điểm then chốt là nấu chín và ăn nóng, không phải cấm mọi món heo."
    },
    {
      question: "Trứng ốp la mẹ bầu ăn thế nào cho an toàn?",
      answer: "Chọn trứng chín hoàn toàn; tránh lòng đào hoặc trứng sống."
    }
  ],
  tags: ["food-analysis", "vietnamese-food", "food-safety", "pregnancy"]
};

const phoEn = {
  excerpt:
    "Phở, bún, cơm tấm, eggs and street snacks in pregnancy: keep hot fully cooked versions, skip rare/raw add-ins, and pair with produce.",
  content: `## Overview

Vietnamese everyday meals can fit pregnancy nutrition well when **preparation and hygiene** are right. CDC/NHS food-safety themes prioritize thoroughly cooked foods, fully cooked eggs, and avoiding cold deli meats, pâté, and raw seafood.

## Phở: keep when piping hot and fully cooked

- Hot beef/chicken phở with **fully cooked meat** can be a practical meal: fluid, protein, and carbohydrates.
- **Skip rare “tái” slices.** That is the key tweak — not a blanket claim that pork in hot soup is a Listeria risk like cold deli meat.
- Thoroughly cooked pork in boiling broth is different from refrigerated deli meats commonly discussed for Listeria risk.
- Wash herbs well; go easier on very salty sauces if your clinician is watching blood pressure or swelling.

## Bún and similar noodle soups

- Choose bowls with **cooked** chicken, beef, or pork and hot broth.
- Seafood must be fully cooked; prefer lower-mercury fish guidance themes from EPA/FDA when fish is used.
- Add plenty of vegetables; citrus on the side can help tolerance during nausea.

## Cơm tấm and rice plates

- Fine when grilled meats are cooked through and eggs are fully set.
- Add steamed/stir-fried vegetables and fruit for fiber, folate, and vitamin C.
- Moderating very sugary sauces may help if you are monitoring gestational diabetes under clinical guidance.

## Eggs in Vietnamese meals

- Use **fully cooked** eggs (no runny yolks). Eggs are a convenient protein and choline source.
- Pair with greens and citrus fruit for micronutrient variety.

## Street snacks

- Main risks are often **hygiene and holding time**, not only sugar/fat.
- Prefer busy stalls serving freshly cooked hot food; avoid long-held cold items and raw/undercooked organ meats.
- Sweets and sugary drinks: keep portions modest within the day’s overall pattern.

## Keep / skip checklist

| Keep | Tweak or skip |
| --- | --- |
| Hot phở/bún with cooked meat | Rare beef, raw blood pudding |
| Cơm tấm with cooked meat + vegetables | Undercooked meat, runny eggs |
| Fully cooked eggs | Raw or undercooked eggs |
| Washed fruit | Long-held cold leftovers, cold pâté |

## When to seek care

Fever, severe diarrhea, strong abdominal pain, reduced fetal movement, or inability to keep fluids down after nausea needs medical care. Educational reference only.

## Sources

- CDC: People at Risk: Pregnant Women — Food Safety — https://www.cdc.gov/food-safety/people-at-risk/pregnant-women.html
- NHS: Foods to avoid in pregnancy — https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/
- WHO: Nutrition counselling during pregnancy — https://www.who.int/tools/elena/interventions/nutrition-counselling-pregnancy
- EPA/FDA: Advice about Eating Fish and Shellfish — https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish
`,
  faqs: [
    {
      question: "Can pregnant people eat phở?",
      answer: "Yes when the broth is hot and the meat is thoroughly cooked. Skip rare beef add-ins."
    },
    {
      question: "Is pork in phở a Listeria problem?",
      answer:
        "Hot, thoroughly cooked pork in boiling broth is not the same risk pattern as cold deli meats. Cook thoroughly and serve hot."
    },
    {
      question: "How should eggs be cooked?",
      answer: "Cook eggs until yolks and whites are firm; avoid runny or raw eggs."
    }
  ]
};

const recipeVi = {
  excerpt:
    "Ba tô cơm kiểu Việt giàu sắt–folate trong khoảng 30 phút: khẩu phần đạm khoảng 100–120g, kết hợp vitamin C và lưu ý nấu chín kỹ.",
  content: `## Vì sao cần sắt và folate?

Sắt hỗ trợ tạo hồng cầu khi thể tích máu tăng trong thai kỳ; folate (và folic acid theo chỉ định) hỗ trợ phát triển ống thần kinh sớm và nhiều quá trình tạo máu. WHO có khuyến nghị bổ sung sắt–folic acid hàng ngày cho phụ nữ mang thai theo chương trình địa phương — viên uống chỉ dùng theo bác sĩ. Bài này tập trung **thực phẩm và công thức**, không kê liều.

Vitamin C từ cam, ớt chuông, cà chua hoặc chanh giúp hấp thu sắt non-heme từ thực vật tốt hơn. Thịt/cá/gia cầm cung cấp sắt heme dễ hấp thu hơn.

## Công thức 1: Tô gà luộc – rau muống – cam

**Khẩu phần 1 người**

- 150g cơm gạo lứt (hoặc gạo trắng nếu đang buồn nôn)
- 100–120g ức gà hoặc đùi gà bỏ da, **luộc/hấp chín kỹ**
- 1 chén rau muống hoặc rau cải luộc
- 1 quả cam nhỏ hoặc 1/2 ớt chuông đỏ
- 1–2 muỗng cà phê dầu ăn; gia vị nhẹ

**Cách làm nhanh:** Luộc gà đến chín hoàn toàn; luộc rau; dọn cùng cơm và ăn kèm cam/ớt chuông. Có thể xé gà trộn vài giọt chanh.

## Công thức 2: Tô cá hấp – bông cải – cà chua

**Khẩu phần 1 người**

- 150g cơm
- 100–120g cá ít thủy ngân (cá basa, cá hồi nuôi tùy nguồn), **hấp/nướng chín kỹ** — không dùng cá sống
- 1 chén bông cải xanh hoặc cải ngọt
- 1 quả cà chua hoặc vài lát ớt chuông
- Gia vị nhẹ, ít nước mắm

Theo chủ đề EPA/FDA: ưu tiên cá ít thủy ngân; tránh cá mập, cá kiếm… Hấp cá 12–15 phút tùy độ dày đến thịt tách dễ và không trong suốt.

## Công thức 3: Tô bò xào rau – chanh

**Khẩu phần 1 người**

- 150g cơm
- 100–120g thịt bò thăn thái mỏng, **xào chín kỹ** (không tái)
- 1 chén rau ngót/cải/bông cải
- Vài lát chanh hoặc quả kiwi nhỏ
- 1 tép tỏi băm, dầu vị nhẹ

Xào bò đến hết màu hồng; đảo rau vừa chín tới. Ăn kèm chanh/kiwi để hỗ trợ hấp thu sắt.

## Mẹo an toàn và hấp thu

1. Nấu chín thịt–cá–trứng hoàn toàn; tách thớt sống/chín.
2. Không uống trà/cà phê sát bữa chính giàu sắt (có thể làm giảm hấp thu).
3. Nếu đang thiếu máu hoặc tiểu đường thai kỳ, điều chỉnh khẩu phần tinh bột/đạm theo bác sĩ hoặc chuyên gia dinh dưỡng.
4. Bổ sung sắt/folate dạng viên chỉ khi được kê.

## Khi nào cần gặp bác sĩ

Mệt nhiều, chóng mặt, da xanh, phân đen không giải thích được, hoặc không dung nạp viên sắt — hãy khám để đánh giá thiếu máu và điều chỉnh chế độ.

## Nguồn tham khảo

- WHO: Daily iron and folic acid supplementation in pregnant women — https://www.who.int/tools/elena/interventions/daily-iron-pregnancy
- NIH ODS: Folate — https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/
- NHS: Have a healthy diet in pregnancy — https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/
- EPA/FDA: Advice about Eating Fish and Shellfish — https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish
`,
  faqs: [
    {
      question: "Vì sao cần kết hợp vitamin C với thực phẩm giàu sắt?",
      answer: "Vitamin C hỗ trợ hấp thu sắt non-heme từ thực vật; trái cây họ cam, ớt chuông hoặc cà chua là cặp đôi tiện lợi."
    },
    {
      question: "Khẩu phần thịt/cá bao nhiêu là hợp lý cho một tô?",
      answer: "Khoảng 100–120g phần ăn đã chín cho một bữa chính là thực tế hơn các mức quá nhỏ; vẫn điều chỉnh theo nhu cầu và chỉ định lâm sàng."
    },
    {
      question: "Có thể thay gà/cá/bò bằng đậu phụ không?",
      answer: "Được. Dùng đậu phụ hoặc trứng chín kỹ và vẫn ăn kèm nguồn vitamin C; hấp thu sắt thực vật thường thấp hơn sắt heme."
    }
  ],
  tags: ["recipes", "iron", "folate", "meal-plan", "pregnancy"]
};

const recipeEn = {
  excerpt:
    "Three Vietnamese-style iron-and-folate bowls in about 30 minutes: 100–120g cooked protein portions, vitamin C pairings, and thorough-cook food-safety notes.",
  content: `## Why iron and folate matter

Iron supports red-blood-cell production as blood volume rises in pregnancy; folate (and prescribed folic acid) supports early neural-tube development and blood formation. WHO guidance includes daily iron–folic acid supplementation programs for pregnant women — use supplements only as advised by a clinician. This article focuses on **food and recipes**, not dosing.

Vitamin C from orange, bell pepper, tomato, or lemon helps absorb non-heme iron from plants. Meat, fish, and poultry provide more readily absorbed heme iron.

## Recipe 1: Chicken, water spinach, and orange bowl

**1 serving**

- 150g cooked brown rice (or white rice if nausea is strong)
- 100–120g chicken breast or thigh, **fully cooked** by boiling/steaming
- 1 cup water spinach or bok choy, boiled
- 1 small orange or 1/2 red bell pepper
- 1–2 tsp oil; light seasoning

Cook chicken through; boil greens; plate with rice and eat the citrus/pepper alongside.

## Recipe 2: Steamed fish, broccoli, and tomato bowl

**1 serving**

- 150g cooked rice
- 100–120g lower-mercury fish, **steamed/baked until opaque and flakes easily** — never raw
- 1 cup broccoli or similar greens
- 1 tomato or bell-pepper strips
- Light seasoning

Follow EPA/FDA lower-mercury themes; avoid high-mercury species. Steam about 12–15 minutes depending on thickness.

## Recipe 3: Beef-and-greens stir-fry bowl with lemon

**1 serving**

- 150g cooked rice
- 100–120g lean beef strips, **stir-fried until no pink remains**
- 1 cup leafy greens
- Lemon wedges or a small kiwi
- Garlic and light seasoning

Cook beef thoroughly; finish greens tender-crisp; serve with lemon/kiwi for vitamin C.

## Safety and absorption tips

1. Cook meat, fish, and eggs thoroughly; keep raw/cooked boards separate.
2. Avoid tea/coffee right against an iron-focused main meal when possible.
3. If you have anemia or gestational diabetes, adjust portions with your clinician or dietitian.
4. Use iron/folate tablets only when prescribed.

## When to seek care

Marked fatigue, dizziness, pallor, unexplained black stools, or poor tolerance of iron tablets warrants medical review for anemia and diet adjustment.

## Sources

- WHO: Daily iron and folic acid supplementation in pregnant women — https://www.who.int/tools/elena/interventions/daily-iron-pregnancy
- NIH ODS: Folate — https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/
- NHS: Have a healthy diet in pregnancy — https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/
- EPA/FDA: Advice about Eating Fish and Shellfish — https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish
`,
  faqs: [
    {
      question: "Why pair vitamin C with iron-rich foods?",
      answer: "Vitamin C improves absorption of non-heme plant iron; citrus, peppers, or tomatoes are convenient pairings."
    },
    {
      question: "What protein portion should I use per bowl?",
      answer: "About 100–120g cooked protein per main meal is more realistic than tiny novelty amounts; personalize with your clinician."
    },
    {
      question: "Can I use tofu instead of meat or fish?",
      answer: "Yes. Use tofu or fully cooked eggs and still include a vitamin C source; plant iron is usually less readily absorbed than heme iron."
    }
  ]
};

const rewrites: Record<
  string,
  { vi: typeof sushiVi; en: typeof sushiEn; sourceStrategy: "food-safety" | "iron" }
> = {
  "pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards": {
    vi: sushiVi,
    en: sushiEn,
    sourceStrategy: "food-safety"
  },
  "common-vietnamese-dishes-in-pregnancy-what-to-keep-tweak-or-skip": {
    vi: phoVi,
    en: phoEn,
    sourceStrategy: "food-safety"
  },
  "pregnancy-recipes-iron-and-folate-bowls-you-can-cook-in-30-minutes": {
    vi: recipeVi,
    en: recipeEn,
    sourceStrategy: "iron"
  }
};

const allSlugs = [
  "common-vietnamese-dishes-in-pregnancy-what-to-keep-tweak-or-skip",
  "pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards",
  "vietnamese-foods-that-support-a-healthy-pregnancy-plate",
  "international-pantry-staples-for-pregnancy-nutrition",
  "pregnancy-recipes-iron-and-folate-bowls-you-can-cook-in-30-minutes",
  "delicious-weeknight-pregnancy-menus-5-cook-once-recipes"
];

function sourcesFor(slug: string, strategy: "food-safety" | "iron" | "default") {
  if (strategy === "food-safety") {
    return [
      {
        title: "People at Risk: Pregnant Women — Food Safety",
        url: "https://www.cdc.gov/food-safety/people-at-risk/pregnant-women.html",
        publisher: "CDC",
        accessedAt
      },
      {
        title: "Foods to avoid in pregnancy",
        url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/",
        publisher: "NHS",
        accessedAt
      },
      {
        title: "EPA-FDA Advice about Eating Fish and Shellfish",
        url: "https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish",
        publisher: "EPA/FDA",
        accessedAt
      },
      {
        title: "Nutrition counselling during pregnancy",
        url: "https://www.who.int/tools/elena/interventions/nutrition-counselling-pregnancy",
        publisher: "WHO",
        accessedAt
      }
    ];
  }
  if (strategy === "iron") {
    return [
      {
        title: "Daily iron and folic acid supplementation in pregnant women",
        url: "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy",
        publisher: "WHO",
        accessedAt
      },
      {
        title: "Folate — Fact Sheet for Health Professionals",
        url: "https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/",
        publisher: "NIH ODS",
        accessedAt
      },
      {
        title: "Have a healthy diet in pregnancy",
        url: "https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/",
        publisher: "NHS",
        accessedAt
      },
      {
        title: "EPA-FDA Advice about Eating Fish and Shellfish",
        url: "https://www.epa.gov/fish-tech/epa-fda-advice-about-eating-fish-and-shellfish",
        publisher: "EPA/FDA",
        accessedAt
      }
    ];
  }
  return pickAuthoritativeSources(slug, accessedAt, 4);
}

function main() {
  for (const slug of allSlugs) {
    const viPath = path.join(postsDir, `${slug}.json`);
    const enPath = path.join(enDir, `${slug}.json`);
    const vi = JSON.parse(fs.readFileSync(viPath, "utf8")) as ViPost;
    const en = JSON.parse(fs.readFileSync(enPath, "utf8")) as EnPost;
    const rewrite = rewrites[slug];

    if (rewrite) {
      vi.excerpt = rewrite.vi.excerpt;
      vi.content = rewrite.vi.content.trim() + "\n";
      vi.faqs = rewrite.vi.faqs;
      vi.tags = cleanTags(vi.tags, rewrite.vi.tags);
      vi.metaDescription = clampMetaDescription(rewrite.vi.excerpt, vi.title, "vi");
      vi.sourceReferences = sourcesFor(slug, rewrite.sourceStrategy);

      en.excerpt = rewrite.en.excerpt;
      en.content = rewrite.en.content.trim() + "\n";
      en.faqs = rewrite.en.faqs;
      en.metaDescription = clampMetaDescription(rewrite.en.excerpt, en.title, "en");
    } else {
      vi.content = patchUrlsInText(vi.content);
      en.content = patchUrlsInText(en.content);
      vi.tags = cleanTags(vi.tags, vi.tags);
      // Soften unsupported causal GDM claim if present.
      vi.content = vi.content.replace(
        /giảm nguy cơ tiểu đường thai kỳ/gi,
        "hỗ trợ kiểm soát đường huyết khi kết hợp chế độ ăn tổng thể theo chỉ định bác sĩ"
      );
      en.content = en.content.replace(
        /reducing the risk of gestational diabetes/gi,
        "supporting steadier energy when used within a clinician-guided overall meal pattern"
      );
      vi.sourceReferences = sourcesFor(slug, "default").map((s) => ({
        ...s,
        title: s.title.replace("Healthy diet during pregnancy", "Nutrition counselling during pregnancy"),
        url: BROKEN_URL_REPLACEMENTS[s.url] || s.url
      }));
    }

    vi.sourceReferences = vi.sourceReferences.map((s) => ({
      ...s,
      url: BROKEN_URL_REPLACEMENTS[s.url] || s.url,
      accessedAt
    }));
    vi.updatedAt = now;
    vi.readingTimeMinutes = estimateReadingTimeMinutes(vi.content);
    vi.reviewer = "Tư vấn dinh dưỡng Pregnancy Meal Planner (tham chiếu WHO/CDC/NHS/EPA-FDA/ACOG)";
    en.reviewer = "Pregnancy Meal Planner Nutrition Editorial (WHO/CDC/NHS/EPA-FDA/ACOG)";

    writeJson(viPath, vi);
    writeJson(enPath, en);
    console.log(`fixed ${slug}`);
  }
}

main();
