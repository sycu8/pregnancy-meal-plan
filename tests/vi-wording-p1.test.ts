import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import { synthesizePost } from "@/lib/blog/synthesis/synthesizePost";
import pho from "../content/blog/posts/pho-tai-va-do-song-an-toan-me-bau.json";
import menu from "../content/blog/posts/thuc-don-mau-tuan-cho-me-bau-tam-ca-nguyet-2.json";
import sushi from "../content/blog/posts/pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards-d69f3b.json";
import drugs from "../content/blog/posts/thuoc-nao-se-gay-say-thai-vi.json";
import heat from "../content/blog/posts/mang-thai-mua-he-nong.json";
import minister from "../content/blog/posts/message-from-the-minister-of-mental-health-and-addictions-and-associate-minister.json";

describe("P1 Vietnamese wording", () => {
  it("renders star, dash, and plus bullets as real lists", () => {
    const html = renderBlogMarkdown("* Sushi cá sống\n- Phô mai cứng\n+ Ngũ cốc\n+  Rau xanh");
    expect(html).toContain("<ul");
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html).toContain("Ngũ cốc");
    expect(html).toContain("Rau xanh");
    expect(html).not.toContain("* Sushi");
    expect(html).not.toContain("+ Ngũ");
    expect(html).not.toContain("+  Rau");
  });

  it("keeps bold lines out of bullet lists", () => {
    const html = renderBlogMarkdown("**Cần cấp cứu ngay (gọi 115):** ra máu nhiều.");
    expect(html).toContain("<p");
    expect(html).toContain("<strong>Cần cấp cứu ngay (gọi 115):</strong>");
    expect(html).not.toContain("<li");
    expect(html).not.toContain("<ul");
  });

  it("does not leave raw star or plus list markers in Vietnamese paragraphs", () => {
    const dir = path.join(process.cwd(), "content/blog/posts");
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const post = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as { content?: string };
      const html = renderBlogMarkdown(post.content ?? "");
      expect(html, name).not.toMatch(/<p\b[^>]*>\s*[*+] /);
    }
  });

  it("adds the Vietnamese topic-source note on the template path", () => {
    const result = synthesizePost({
      title: "Iron-rich meals",
      titleVi: "Món giàu sắt",
      snippet: "Meal ideas.",
      snippetVi: "Gợi ý món.",
      sourceName: "WHO",
      url: "https://www.who.int/example-note"
    });
    expect(result.content).toContain(
      "> Nội dung tổng hợp tham khảo chủ đề từ [WHO](https://www.who.int/example-note), không sao chép nguyên văn."
    );
    expect(result.content).not.toContain("tổng hợp dựa trên tiêu đề và mô tả công khai từ nguồn");
  });

  it("uses the reviewed phở, menu, sushi, drug, and heat wording", () => {
    expect(pho.content).toContain("tránh đồ sống/tái trong suốt thai kỳ");
    expect(pho.content).toContain("gọi phở chín, nạm, gầu hoặc bò viên");
    expect(pho.content).toContain("đến khi thịt chín đều, không còn màu hồng");
    expect(pho.content).not.toContain("chuyển màu nâu hoàn toàn");
    expect(pho.content).not.toContain("chọn quán uy tín");
    expect(menu.content).toContain("Phở bò chín (nạm/gầu)");
    expect(menu.content).not.toContain("Phở bò tái");
    expect(sushi.content).toContain(
      "Tránh: sushi/sashimi cá sống (kể cả cá đã cấp đông), hải sản sống, thịt tái, phô mai mềm vỏ trắng/phô mai xanh chưa nấu nóng, sữa chưa thanh trùng."
    );
    expect(sushi.content).toContain("Bữa tối: cơm + cá/thịt nấu chín + rau + phô mai cứng (nếu thích).");
    expect(drugs.title).toBe("Mẹ bầu cần thận trọng với những loại thuốc nào?");
    expect(drugs.content).toContain(
      "Không tự ý dùng bất kỳ thuốc, thuốc nam hay thực phẩm chức năng nào khi mang thai; hỏi bác sĩ hoặc dược sĩ trước."
    );
    expect(drugs.tags).toEqual(["thuốc khi mang thai", "sảy thai"]);
    expect(heat.content).toContain("Dùng điều hòa hoặc quạt nếu có.");
    expect(heat.content).toContain("Gọi 115 ngay");
    expect(heat.metaDescription).toBe(
      "Mẹo chống nóng mùa hè cho mẹ bầu theo CDC, NHS: uống đủ nước, ăn nhẹ và nhận biết dấu hiệu cần cấp cứu."
    );
    expect(minister.status).toBe("draft");
    expect(minister.content).toContain(
      "Mất con là một nỗi đau rất lớn, và mọi cảm xúc của bạn lúc này đều chính đáng. Nếu cần chia sẻ, hãy nói với bác sĩ, người thân hoặc tìm nhóm hỗ trợ."
    );
    expect(minister.content).not.toContain("Mất thai là nỗi đau rất lớn.");
  });

  it("removes leaked CJK and the Vinmec pipeline note from Vietnamese posts", () => {
    const dir = path.join(process.cwd(), "content/blog/posts");
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      expect(raw, name).not.toMatch(/[\u4e00-\u9fff]/);
      expect(raw, name).not.toContain("nhiệt độ nội bộ");
      expect(raw, name).not.toContain("chưa tiệt trùng");
      expect(raw, name).not.toContain("chưa được tiệt trùng");
      expect(raw, name).not.toContain("đã được tiệt trùng hoặc nấu chín kỹ");
      expect(raw, name).not.toContain("tổng hợp dựa trên tiêu đề và mô tả công khai từ nguồn");
      expect(raw, name).not.toMatch(/1800|1900/);
      expect(raw, name).not.toContain("cần xác minh số hiện hành");
    }
  });

  it("uses thanh trùng on the label-check cook-thoroughly lines", () => {
    const files = [
      "foods-to-limit-or-cook-thoroughly-during-pregnancy-5d230f.json",
      "foods-to-limit-or-cook-thoroughly-during-pregnancy-7053df.json",
      "foods-to-limit-or-cook-thoroughly-during-pregnancy-97f4ee.json",
      "foods-to-limit-or-cook-thoroughly-during-pregnancy-f7c92a.json"
    ];
    const dir = path.join(process.cwd(), "content/blog/posts");
    for (const name of files) {
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      expect(raw, name).toContain("đã được thanh trùng hoặc nấu chín kỹ");
    }
    const milk = fs.readFileSync(
      path.join(dir, "pho-mem-va-sua-chua-tiet-trung-khi-mang-thai.json"),
      "utf8"
    );
    expect(milk).toContain("sữa tiệt trùng");
  });

  it("keeps the historical topic-source blockquote on the posts that had it", () => {
    const dir = path.join(process.cwd(), "content/blog/posts");
    const marker = /> Nội dung tổng hợp tham khảo chủ đề từ \[[^\]]+\]\([^)]+\), không sao chép nguyên văn\./g;
    let count = 0;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const found = raw.match(marker);
      if (found) count += found.length;
    }
    expect(count).toBe(204);
  });
});
