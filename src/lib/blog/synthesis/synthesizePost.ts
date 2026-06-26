import type { BlogCategorySlug } from "@/types/blog";

export type SynthesisInput = {
  title: string;
  snippet: string;
  sourceName: string;
  url: string;
};

export type SynthesisOutput = {
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategorySlug;
  tags: string[];
};

export function synthesizePost(input: SynthesisInput): SynthesisOutput {
  const category = guessCategory(input.title, input.snippet);
  const tags = guessTags(input.title, input.snippet);

  const excerpt =
    input.snippet.trim().slice(0, 220) ||
    `Tổng hợp tham khảo về ${input.title.toLowerCase()} cho mẹ bầu và gia đình, dựa trên chủ đề từ ${input.sourceName}.`;

  const content = [
    `## Tóm tắt`,
    ``,
    excerpt,
    ``,
    `## Gợi ý thực hành`,
    ``,
    `- Ưu tiên thực phẩm nấu chín kỹ, rửa sạch rau củ và bảo quản đúng cách.`,
    `- Chia nhỏ bữa ăn nếu nghén hoặc khó ăn no; uống đủ nước trong ngày.`,
    `- Theo dõi phản ứng cơ thể và hỏi bác sĩ sản khoa trước khi thay đổi lớn về dinh dưỡng hoặc thuốc bổ.`,
    ``,
    `## Khi nào cần gặp bác sĩ`,
    ``,
    `Nếu có chảy máu, sốt cao, đau bụng dữ dội, giảm cử động thai hoặc triệu chứng bất thường kéo dài, hãy đến cơ sở y tế ngay.`,
    ``,
    `> Nội dung được tổng hợp tham khảo từ tiêu đề/chủ đề nguồn [${input.sourceName}](${input.url}), không sao chép nguyên văn bài gốc.`
  ].join("\n");

  return {
    title: input.title.trim(),
    excerpt,
    content,
    category,
    tags
  };
}

function guessCategory(title: string, snippet: string): BlogCategorySlug {
  const text = `${title} ${snippet}`.toLowerCase();
  if (/(sau sinh|hậu sản|postpartum|cho con bú)/i.test(text)) return "sau-sinh";
  if (/(trẻ|sơ sinh|ăn dặm|baby|infant)/i.test(text)) return "cham-con-0-24-thang";
  if (/(thực đơn|menu|đường huyết|tiểu đường)/i.test(text)) return "thuc-don-ba-bau";
  if (/(vitamin|folate|sắt|canxi|dinh dưỡng|omega)/i.test(text)) return "dinh-duong-ba-bau";
  return "truoc-sinh";
}

function guessTags(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase();
  const tags = new Set<string>();
  if (/nghén|nghen|nausea/i.test(text)) tags.add("nghen");
  if (/tiểu đường|tieu duong|gdm/i.test(text)) tags.add("tieu-duong");
  if (/thiếu máu|thieu mau|anemia/i.test(text)) tags.add("thieu-mau");
  if (/táo bón|tao bon|constipation/i.test(text)) tags.add("tao-bon");
  if (tags.size === 0) tags.add("me-bau");
  return [...tags].slice(0, 5);
}
