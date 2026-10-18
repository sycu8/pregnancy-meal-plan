import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import pho from "../content/blog/posts/pho-tai-va-do-song-an-toan-me-bau.json";
import menu from "../content/blog/posts/thuc-don-mau-tuan-cho-me-bau-tam-ca-nguyet-2.json";
import sushi from "../content/blog/posts/pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards-d69f3b.json";
import drugs from "../content/blog/posts/thuoc-nao-se-gay-say-thai-vi.json";
import heat from "../content/blog/posts/mang-thai-mua-he-nong.json";
import minister from "../content/blog/posts/message-from-the-minister-of-mental-health-and-addictions-and-associate-minister.json";

describe("P1 Vietnamese wording", () => {
  it("renders star bullets as real lists", () => {
    const html = renderBlogMarkdown("* Sushi cá sống\n* Phô mai cứng");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).not.toContain("* Sushi");
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
      expect(raw, name).not.toContain("内部");
      expect(raw, name).not.toContain("tổng hợp dựa trên tiêu đề và mô tả công khai từ nguồn");
      expect(raw, name).not.toMatch(/1800|1900/);
      expect(raw, name).not.toContain("cần xác minh số hiện hành");
    }
  });
});
