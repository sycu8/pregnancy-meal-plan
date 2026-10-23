import { localizedPath, type Locale } from "@/lib/i18n";
import { ORANGE_CLOUD_PERSON_ID } from "@/lib/orangeCloud";
import { DEFAULT_SITE_URL } from "@/lib/site";

export type AeoStep = { name: string; text: string };
export type AeoQuestion = { question: string; answer: string };

export const howToContent: Record<Locale, { name: string; description: string; steps: AeoStep[] }> = {
  vi: {
    name: "Cách tạo thực đơn 7 ngày cho mẹ bầu",
    description:
      "Các bước tạo thực đơn tham khảo trên Pregnancy Meal Planner, từ lúc mở form đến khi lưu thực đơn trên thiết bị.",
    steps: [
      {
        name: "Mở trang tạo thực đơn",
        text: "Chọn tiếng Việt hoặc tiếng Anh, rồi vào trang tạo thực đơn."
      },
      {
        name: "Nhập thông tin bữa ăn",
        text: "Điền tuần thai, cân nặng, khẩu vị, ngân sách và những món bạn muốn bỏ qua."
      },
      {
        name: "Xem thực đơn 7 ngày",
        text: "Đọc các bữa gợi ý và danh sách đi chợ được gom theo nhóm thực phẩm."
      },
      {
        name: "Lưu trên thiết bị",
        text: "Giữ thực đơn trên trình duyệt này để mở lại sau. Đăng nhập chỉ khi bạn muốn đồng bộ thêm."
      }
    ]
  },
  en: {
    name: "How to create a 7-day pregnancy meal plan",
    description:
      "Steps to build a reference meal plan in Pregnancy Meal Planner, from opening the form to saving it on your device.",
    steps: [
      {
        name: "Open the planner",
        text: "Choose English or Vietnamese, then open the meal planner page."
      },
      {
        name: "Enter meal details",
        text: "Add your pregnancy week, weight, taste, budget, and foods you want to skip."
      },
      {
        name: "Review the 7-day plan",
        text: "Read the suggested meals and the shopping list grouped by food type."
      },
      {
        name: "Save it on this device",
        text: "Keep the plan in this browser so you can reopen it. Sign in only if you want optional sync."
      }
    ]
  }
};

export const shortFaq: Record<Locale, AeoQuestion[]> = {
  vi: [
    {
      question: "Tạo thực đơn có cần tài khoản không?",
      answer:
        "Không cần. Bạn mở trang tạo thực đơn, nhập tuần thai, cân nặng và khẩu vị, rồi xem thực đơn 7 ngày ngay trên trình duyệt."
    },
    {
      question: "Trang có bản tiếng Việt và tiếng Anh không?",
      answer: "Có. Tiếng Anh dùng địa chỉ gốc. Tiếng Việt nằm ở đường dẫn /vi, ví dụ trang tạo thực đơn là /vi/planner."
    },
    {
      question: "Thực đơn đã lưu nằm ở đâu?",
      answer:
        "Bản miễn phí giữ hồ sơ và thực đơn trên thiết bị bạn đang dùng. Khi bạn đăng nhập và bật đồng bộ, bản sao mới được lưu thêm trên máy chủ."
    }
  ],
  en: [
    {
      question: "Do I need an account to create a meal plan?",
      answer:
        "No. Open the planner, enter your pregnancy week, weight, and taste, and review a 7-day plan in the browser."
    },
    {
      question: "Is the site available in Vietnamese and English?",
      answer: "Yes. English uses the root URLs. Vietnamese lives under /vi, so the planner is at /vi/planner."
    },
    {
      question: "Where are saved meal plans kept?",
      answer:
        "The free version keeps your profile and plans on the device you are using. A server copy is stored only after you sign in and turn sync on."
    }
  ]
};

function pageUrl(locale: Locale) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return `${siteUrl}${localizedPath(locale, "/")}`;
}

export function howToStructuredData(locale: Locale) {
  const copy = howToContent[locale];
  const url = pageUrl(locale);

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: copy.name,
    description: copy.description,
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    totalTime: "PT5M",
    url,
    author: { "@id": ORANGE_CLOUD_PERSON_ID },
    step: copy.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${url}#howto-step-${index + 1}`
    }))
  };
}

export function shortFaqStructuredData(locale: Locale) {
  const url = pageUrl(locale);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    author: { "@id": ORANGE_CLOUD_PERSON_ID },
    mainEntity: shortFaq[locale].map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
