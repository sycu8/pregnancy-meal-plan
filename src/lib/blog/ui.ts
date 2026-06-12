import type { BlogLocale } from "@/types/blog";
import { localizedPath, type Locale } from "@/lib/i18n";

export function blogBasePath(locale: BlogLocale): string {
  return localizedPath(locale, "/blog");
}

export const blogUi = {
  vi: {
    listTitle: "Kiến thức mẹ bầu & chăm con 0–24 tháng",
    listIntro:
      "Bài viết tổng hợp về dinh dưỡng thai kỳ, thực đơn, chuẩn bị sinh và chăm con nhỏ — tham khảo WHO, CDC, NHS, ACOG và nguồn y khoa uy tín. Nội dung viết lại, có trích dẫn nguồn ở cuối mỗi bài.",
    plannerCta: "Tạo thực đơn 7 ngày miễn phí →",
    emptyList: "Chưa có bài viết được xuất bản.",
    emptyCategory: "Chưa có bài trong chuyên mục này.",
    allPosts: "Tất cả",
    allPostsLink: "← Tất cả bài viết",
    related: "Bài liên quan",
    searchLabel: "Tìm kiếm bài viết",
    searchPlaceholder: "Tìm theo tiêu đề, mô tả, nội dung, từ khóa…",
    searchButton: "Tìm kiếm",
    clearFilters: "Xóa bộ lọc",
    popularKeywords: "Từ khóa phổ biến",
    keywordsAria: "Từ khóa",
    noResults: "Không có bài phù hợp. Thử từ khóa khác hoặc xóa bộ lọc.",
    resultsFound: (count: number, q?: string, tag?: string) => {
      if (count === 0) return null;
      let msg = `Tìm thấy ${count} bài`;
      if (q) msg += ` cho “${q}”`;
      if (tag) msg += ` với từ khóa “${tag}”`;
      return msg;
    },
    paginationSummary: (page: number, totalPages: number, total: number) =>
      `Trang ${page} / ${totalPages} · ${total} bài`,
    prevPage: "Trang trước",
    nextPage: "Trang sau",
    pageLabel: (n: number) => `Trang ${n}`,
    minRead: (n: number) => `${n} phút đọc`,
    updated: (date: string) => `Cập nhật ${date}`,
    medicalNote: "Lưu ý y tế",
    references: "Nguồn tham khảo",
    accessed: (d: string) => `Truy cập ${d}`,
    referencesPrefix: "Tham chiếu",
    postListAria: "Danh sách bài viết",
    breadcrumbBlog: "Blog",
    home: "Trang chủ"
  },
  en: {
    listTitle: "Pregnancy & baby care (0–24 months)",
    listIntro:
      "Articles on prenatal nutrition, meal plans, birth preparation and caring for young children — synthesized from WHO, CDC, NHS, ACOG and other trusted sources, with references at the end of each post.",
    plannerCta: "Create a free 7-day meal plan →",
    emptyList: "No published articles yet.",
    emptyCategory: "No articles in this category yet.",
    allPosts: "All",
    allPostsLink: "← All articles",
    related: "Related articles",
    searchLabel: "Search articles",
    searchPlaceholder: "Search title, summary, body, keywords…",
    searchButton: "Search",
    clearFilters: "Clear filters",
    popularKeywords: "Popular keywords",
    keywordsAria: "Keywords",
    resultsFound: (count: number, q?: string, tag?: string) => {
      if (count === 0) return null;
      let msg = `Found ${count} article${count === 1 ? "" : "s"}`;
      if (q) msg += ` for “${q}”`;
      if (tag) msg += ` tagged “${tag}”`;
      return msg;
    },
    noResults: "No matching articles. Try another keyword or clear filters.",
    paginationSummary: (page: number, totalPages: number, total: number) =>
      `Page ${page} of ${totalPages} · ${total} articles`,
    prevPage: "Previous page",
    nextPage: "Next page",
    pageLabel: (n: number) => `Page ${n}`,
    minRead: (n: number) => `${n} min read`,
    updated: (date: string) => `Updated ${date}`,
    medicalNote: "Medical disclaimer",
    references: "References",
    accessed: (d: string) => `Accessed ${d}`,
    referencesPrefix: "References",
    postListAria: "Article list",
    breadcrumbBlog: "Blog",
    home: "Home"
  }
} as const satisfies Record<BlogLocale, Record<string, unknown>>;

export function getBlogUi(locale: BlogLocale) {
  return blogUi[locale];
}

export function toBlogLocale(locale: Locale): BlogLocale {
  return locale === "en" ? "en" : "vi";
}
