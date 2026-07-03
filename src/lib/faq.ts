import type { Locale } from "@/lib/i18n";

export type FaqItem = { question: string; answer: string };

export const faqContent: Record<Locale, FaqItem[]> = {
  vi: [
    {
      question: "Ứng dụng có thay thế bác sĩ không?",
      answer:
        "Không. Bầu Ăn Gì? chỉ gợi ý thực đơn tham khảo. Hãy hỏi bác sĩ sản khoa hoặc chuyên gia dinh dưỡng trước khi thay đổi chế độ ăn."
    },
    {
      question: "Dữ liệu được lưu ở đâu?",
      answer:
        "Phiên bản miễn phí lưu hồ sơ và thực đơn trên thiết bị. Bạn có thể đăng ký email để đồng bộ tùy chọn lên Cloudflare D1."
    },
    {
      question: "Giới hạn miễn phí là gì?",
      answer: "3 lượt tạo thực đơn AI/ngày, 5 lượt đổi món/ngày, 20 thực đơn lưu. Rule-based vẫn dùng được khi hết lượt AI."
    },
    {
      question: "Có hỗ trợ sau sinh không?",
      answer: "Có chế độ sau sinh (0–24 tháng) trong form tạo thực đơn để gợi ý bữa ăn gia đình phù hợp hơn."
    },
    {
      question: "Làm sao xóa dữ liệu trên trình duyệt?",
      answer: "Vào trang Lịch sử để xóa từng thực đơn, hoặc xóa dữ liệu trang web trong cài đặt trình duyệt/ứng dụng."
    }
  ],
  en: [
    {
      question: "Does the app replace my doctor?",
      answer:
        "No. Bầu Ăn Gì? provides reference meal suggestions only. Ask your obstetrician or dietitian before changing your diet."
    },
    {
      question: "Where is my data stored?",
      answer:
        "The free tier stores data on your device. You can register an email to optionally sync to Cloudflare D1."
    },
    {
      question: "What are the free-tier limits?",
      answer: "3 AI meal plans per day, 5 meal swaps per day, 20 saved plans. Rule-based planning remains available."
    },
    {
      question: "Is postpartum supported?",
      answer: "Yes — choose postpartum mode (0–24 months) in the planner for family-friendly meal suggestions."
    },
    {
      question: "How do I delete local data?",
      answer: "Remove individual plans from History, or clear site data in your browser or app settings."
    }
  ]
};
