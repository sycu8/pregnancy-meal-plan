import { BRAND_NAME, type Locale } from "@/lib/i18n";
import { DEFAULT_SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  contactNote: string;
};

/** Keep in sync when legal copy changes. */
export const LEGAL_LAST_UPDATED = "2026-07-26";
export const LEGAL_OPERATOR = "Lê Sỹ Cường";

const privacyEn: LegalDocument = {
  title: "Privacy policy",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `This Privacy Policy explains how ${BRAND_NAME} (“we”, “us”) collects, uses, and shares information when you use ${DEFAULT_SITE_URL} and related apps (the “Service”).`,
  contactNote: `Privacy requests: ${SUPPORT_EMAIL}. Operator: ${LEGAL_OPERATOR}.`,
  sections: [
    {
      heading: "1. Who we are",
      paragraphs: [
        `${BRAND_NAME} (also known as “Bầu Ăn Gì?”) is operated by ${LEGAL_OPERATOR}. Contact: ${SUPPORT_EMAIL}. Website: ${DEFAULT_SITE_URL}.`
      ]
    },
    {
      heading: "2. Information we collect",
      paragraphs: [
        "What we collect depends on how you use the Service:"
      ],
      bullets: [
        "Profile and preference data you enter for meal planning (for example gestational week or postpartum stage, weight, height, cuisine preferences, budget, cooking time, allergies, disliked foods, and selected health concerns).",
        "Generated meal plans and history you choose to keep.",
        "Account data if you register (email address, locale preference, premium status, and session tokens).",
        "Optional cloud-sync data if you sign in and opt in (profile JSON, meal plans, and favorites linked to your account).",
        "Billing-related status if you purchase Premium (we receive confirmation from Stripe that a payment succeeded; we do not store full card numbers on our servers).",
        "Technical and security signals such as Turnstile challenge results when enabled, and standard request logs needed to operate the Service.",
        "Optional analytics signals from Cloudflare Web Analytics when that beacon is enabled, and Google Analytics (GA4) when the site measurement tag is enabled (aggregated traffic metrics)."
      ]
    },
    {
      heading: "3. How we store free-tier data",
      paragraphs: [
        "By default, the free web experience stores your profile and meal plans in your browser’s localStorage on your device. We do not sell personal data.",
        "You can clear this data at any time by clearing site data in your browser or removing saved plans in the app."
      ]
    },
    {
      heading: "4. Accounts and optional cloud sync",
      paragraphs: [
        "If you create an account, we store account records in Cloudflare D1 (for example email, locale, and premium flag) and authenticate sessions with bearer tokens.",
        "Cloud sync only happens after you sign in and opt in. When sync is enabled, we store only fields needed for meal planning and your saved plans/favorites, linked to your account."
      ]
    },
    {
      heading: "5. Meal-plan generation and AI",
      paragraphs: [
        "When you generate a meal plan, the Service sends the profile fields you submit to our meal-plan API. Generation may use rule-based logic and/or AI providers (such as Cloudflare Workers AI or an AI gateway) to produce a reference plan.",
        "Do not submit information you do not want processed for this purpose. Generated plans are educational references, not medical advice."
      ]
    },
    {
      heading: "6. Payments (Premium)",
      paragraphs: [
        "Premium checkout is handled by Stripe Payment Links. Stripe processes payment details under Stripe’s privacy policy. We use payment confirmation to unlock Premium features on your account."
      ]
    },
    {
      heading: "7. Cookies and similar technologies",
      paragraphs: [
        "We do not use first-party cookies for account login. Authentication for the web app uses tokens managed by the Service.",
        "Cloudflare and related infrastructure may set cookies or similar technologies for security, bot protection (including Turnstile when enabled), performance, and optional Web Analytics. Google Analytics (GA4) may also set cookies or similar identifiers for aggregated traffic measurement when enabled. Your browser settings control many of these technologies."
      ]
    },
    {
      heading: "8. How we use information",
      paragraphs: [
        "We use information to:"
      ],
      bullets: [
        "Generate and display meal plans and shopping lists.",
        "Provide account, sync, history, and Premium features you request.",
        "Operate, secure, and improve the Service.",
        "Respond to support requests and legal obligations."
      ]
    },
    {
      heading: "9. Sharing",
      paragraphs: [
        "We do not sell personal data. We share information only with service providers that help us run the Service (for example Cloudflare hosting/database/AI infrastructure, Google Analytics for traffic measurement, and Stripe for payments), when required by law, or to protect the Service and users.",
        "Social publishing tools and internal marketing automation (if used by us) operate under our operator credentials and are not part of end-user data collection."
      ]
    },
    {
      heading: "10. Retention",
      paragraphs: [
        "Local browser data remains until you clear it. Account and synced cloud data are retained while your account is active or as needed to provide the Service, comply with law, or resolve disputes. You may request deletion by emailing support."
      ]
    },
    {
      heading: "11. Your choices",
      paragraphs: [
        "You can use the free planner without creating an account. You can decline cloud sync, clear local data, close your account by contacting support, and request access/correction/deletion of account data where applicable."
      ]
    },
    {
      heading: "12. Children",
      paragraphs: [
        "The Service is intended for adults planning pregnancy or postpartum nutrition. It is not directed to children under 13 (or the equivalent minimum age in your jurisdiction)."
      ]
    },
    {
      heading: "13. International processing",
      paragraphs: [
        "The Service is hosted on Cloudflare’s global network. Your information may be processed in countries where Cloudflare or our subprocessors operate."
      ]
    },
    {
      heading: "14. Changes",
      paragraphs: [
        "We may update this Privacy Policy from time to time. The “Last updated” date at the top of the page will change when we do. Continued use of the Service after an update means you accept the revised policy."
      ]
    }
  ]
};

const privacyVi: LegalDocument = {
  title: "Chính sách quyền riêng tư",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `Chính sách này giải thích cách ${BRAND_NAME} (“chúng tôi”) thu thập, sử dụng và chia sẻ thông tin khi bạn dùng ${DEFAULT_SITE_URL} và các ứng dụng liên quan (gọi chung là “Dịch vụ”).`,
  contactNote: `Yêu cầu về quyền riêng tư: ${SUPPORT_EMAIL}. Đơn vị vận hành: ${LEGAL_OPERATOR}.`,
  sections: [
    {
      heading: "1. Chúng tôi là ai",
      paragraphs: [
        `${BRAND_NAME} (còn gọi là “Bầu Ăn Gì?”) do ${LEGAL_OPERATOR} vận hành. Liên hệ: ${SUPPORT_EMAIL}. Website: ${DEFAULT_SITE_URL}.`
      ]
    },
    {
      heading: "2. Thông tin chúng tôi thu thập",
      paragraphs: ["Thông tin thu thập phụ thuộc vào cách bạn dùng Dịch vụ:"],
      bullets: [
        "Hồ sơ và tùy chọn bạn nhập để lên thực đơn (ví dụ tuần thai hoặc giai đoạn sau sinh, cân nặng, chiều cao, khẩu vị, ngân sách, thời gian nấu, dị ứng, món không thích và các vấn đề sức khỏe được chọn).",
        "Thực đơn đã tạo và lịch sử bạn chọn lưu.",
        "Dữ liệu tài khoản nếu bạn đăng ký (email, ngôn ngữ, trạng thái Premium và token phiên đăng nhập).",
        "Dữ liệu đồng bộ đám mây tùy chọn nếu bạn đăng nhập và bật đồng bộ (hồ sơ, thực đơn và mục yêu thích gắn với tài khoản).",
        "Trạng thái thanh toán nếu bạn mua Premium (chúng tôi nhận xác nhận thanh toán thành công từ Stripe; không lưu số thẻ đầy đủ trên máy chủ của chúng tôi).",
        "Tín hiệu kỹ thuật/bảo mật như kết quả Turnstile (khi bật) và nhật ký yêu cầu cần thiết để vận hành.",
        "Phân tích tùy chọn từ Cloudflare Web Analytics khi beacon được bật, và Google Analytics (GA4) khi thẻ đo lường trang được bật (chỉ số lưu lượng tổng hợp)."
      ]
    },
    {
      heading: "3. Lưu trữ bản miễn phí",
      paragraphs: [
        "Mặc định, bản web miễn phí lưu hồ sơ và thực đơn trong localStorage trên trình duyệt của bạn. Chúng tôi không bán dữ liệu cá nhân.",
        "Bạn có thể xóa dữ liệu này bất cứ lúc nào bằng cách xóa dữ liệu trang trong trình duyệt hoặc xóa thực đơn đã lưu trong ứng dụng."
      ]
    },
    {
      heading: "4. Tài khoản và đồng bộ đám mây tùy chọn",
      paragraphs: [
        "Nếu bạn tạo tài khoản, chúng tôi lưu hồ sơ tài khoản trên Cloudflare D1 (ví dụ email, ngôn ngữ, cờ Premium) và xác thực phiên bằng bearer token.",
        "Đồng bộ đám mây chỉ diễn ra sau khi bạn đăng nhập và chủ động bật (opt-in). Khi bật, chỉ các trường cần cho thực đơn cùng thực đơn/mục yêu thích được lưu theo tài khoản."
      ]
    },
    {
      heading: "5. Tạo thực đơn và AI",
      paragraphs: [
        "Khi bạn tạo thực đơn, Dịch vụ gửi các trường hồ sơ bạn gửi tới API tạo thực đơn. Hệ thống có thể dùng logic theo quy tắc và/hoặc nhà cung cấp AI (ví dụ Cloudflare Workers AI hoặc AI gateway) để tạo thực đơn tham khảo.",
        "Đừng gửi thông tin bạn không muốn được xử lý cho mục đích này. Thực đơn chỉ mang tính tham khảo giáo dục, không phải tư vấn y khoa."
      ]
    },
    {
      heading: "6. Thanh toán (Premium)",
      paragraphs: [
        "Thanh toán Premium được xử lý qua Stripe Payment Links theo chính sách quyền riêng tư của Stripe. Chúng tôi dùng xác nhận thanh toán để mở khóa tính năng Premium trên tài khoản của bạn."
      ]
    },
    {
      heading: "7. Cookie và công nghệ tương tự",
      paragraphs: [
        "Chúng tôi không dùng cookie phía first-party để đăng nhập tài khoản. Xác thực web dùng token do Dịch vụ quản lý.",
        "Cloudflare và hạ tầng liên quan có thể đặt cookie hoặc công nghệ tương tự cho bảo mật, chống bot (gồm Turnstile khi bật), hiệu năng và Web Analytics tùy chọn. Google Analytics (GA4) cũng có thể đặt cookie hoặc định danh tương tự để đo lưu lượng tổng hợp khi được bật. Trình duyệt của bạn kiểm soát nhiều công nghệ trong số này."
      ]
    },
    {
      heading: "8. Cách chúng tôi sử dụng thông tin",
      paragraphs: ["Chúng tôi dùng thông tin để:"],
      bullets: [
        "Tạo và hiển thị thực đơn cùng danh sách đi chợ.",
        "Cung cấp tài khoản, đồng bộ, lịch sử và Premium theo yêu cầu của bạn.",
        "Vận hành, bảo mật và cải thiện Dịch vụ.",
        "Phản hồi hỗ trợ và tuân thủ nghĩa vụ pháp lý."
      ]
    },
    {
      heading: "9. Chia sẻ",
      paragraphs: [
        "Chúng tôi không bán dữ liệu cá nhân. Chúng tôi chỉ chia sẻ với nhà cung cấp giúp vận hành Dịch vụ (ví dụ Cloudflare, Google Analytics để đo lưu lượng, và Stripe), khi pháp luật yêu cầu, hoặc để bảo vệ Dịch vụ và người dùng.",
        "Công cụ đăng bài mạng xã hội / tự động hóa marketing nội bộ (nếu chúng tôi dùng) chạy bằng thông tin đăng nhập của đơn vị vận hành và không phải phần thu thập dữ liệu người dùng cuối."
      ]
    },
    {
      heading: "10. Thời gian lưu giữ",
      paragraphs: [
        "Dữ liệu trên trình duyệt được giữ đến khi bạn xóa. Dữ liệu tài khoản và đồng bộ đám mây được giữ khi tài khoản còn hoạt động hoặc khi cần để cung cấp Dịch vụ, tuân thủ pháp luật hay giải quyết tranh chấp. Bạn có thể yêu cầu xóa bằng email hỗ trợ."
      ]
    },
    {
      heading: "11. Lựa chọn của bạn",
      paragraphs: [
        "Bạn có thể dùng bản miễn phí mà không tạo tài khoản. Bạn có thể từ chối đồng bộ đám mây, xóa dữ liệu cục bộ, yêu cầu đóng tài khoản và yêu cầu truy cập/sửa/xóa dữ liệu tài khoản khi phù hợp."
      ]
    },
    {
      heading: "12. Trẻ em",
      paragraphs: [
        "Dịch vụ dành cho người lớn đang lập kế hoạch dinh dưỡng thai kỳ hoặc sau sinh. Không hướng đến trẻ em dưới 13 tuổi (hoặc độ tuổi tối thiểu tương đương tại nơi bạn sinh sống)."
      ]
    },
    {
      heading: "13. Xử lý quốc tế",
      paragraphs: [
        "Dịch vụ được lưu trữ trên mạng toàn cầu của Cloudflare. Thông tin của bạn có thể được xử lý tại các quốc gia nơi Cloudflare hoặc nhà thầu phụ của chúng tôi hoạt động."
      ]
    },
    {
      heading: "14. Thay đổi",
      paragraphs: [
        "Chúng tôi có thể cập nhật Chính sách quyền riêng tư theo thời gian. Ngày “Cập nhật lần cuối” trên trang sẽ thay đổi khi có bản mới. Việc tiếp tục dùng Dịch vụ sau khi cập nhật đồng nghĩa bạn chấp nhận chính sách đã sửa."
      ]
    }
  ]
};

const termsEn: LegalDocument = {
  title: "Terms of service",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `These Terms of Service (“Terms”) govern your use of ${BRAND_NAME} at ${DEFAULT_SITE_URL} and related apps (the “Service”). By using the Service, you agree to these Terms.`,
  contactNote: `Questions about these Terms: ${SUPPORT_EMAIL}. Operator: ${LEGAL_OPERATOR}.`,
  sections: [
    {
      heading: "1. Operator",
      paragraphs: [
        `The Service is operated by ${LEGAL_OPERATOR}. Brand names used in the Service include ${BRAND_NAME} and “Bầu Ăn Gì?”.`
      ]
    },
    {
      heading: "2. Not medical advice",
      paragraphs: [
        "The Service provides educational meal-planning information and reference meal plans only. It is not medical advice, diagnosis, or treatment, and it does not create a doctor–patient relationship.",
        "Always consult a qualified healthcare professional about pregnancy, postpartum, breastfeeding, allergies, gestational diabetes, hypertension, anemia, or any diet changes. If you have an emergency, seek emergency care immediately."
      ]
    },
    {
      heading: "3. Eligibility",
      paragraphs: [
        "You must be old enough to form a binding contract in your jurisdiction and able to use a nutrition planning tool responsibly. The Service is intended for adults."
      ]
    },
    {
      heading: "4. Accounts and security",
      paragraphs: [
        "You are responsible for the accuracy of information you submit and for keeping account credentials and session tokens confidential. Notify us promptly at support if you suspect unauthorized access."
      ]
    },
    {
      heading: "5. Acceptable use",
      paragraphs: [
        "You agree not to:"
      ],
      bullets: [
        "Misuse the Service, attempt to disrupt it, or probe systems without authorization.",
        "Use the Service to provide clinical care or to claim that outputs are personalized medical prescriptions.",
        "Scrape, overload, or automate access in ways that harm the Service or violate these Terms.",
        "Upload unlawful, infringing, or abusive content."
      ]
    },
    {
      heading: "6. Free and Premium features",
      paragraphs: [
        "Free features may store data locally in your browser. Optional account and sync features may store data in our cloud infrastructure as described in the Privacy Policy.",
        "Premium features may be offered for a fee. Checkout is processed by Stripe. Premium access is granted after successful payment confirmation. Unless required by law, fees are handled under Stripe’s terms and any stated offer terms at checkout."
      ]
    },
    {
      heading: "7. AI and generated content",
      paragraphs: [
        "Meal plans and related text may be generated using automated systems, including AI. Outputs can be incomplete, unsuitable, or inaccurate for your situation. You are responsible for reviewing outputs before relying on them."
      ]
    },
    {
      heading: "8. Intellectual property",
      paragraphs: [
        `The Service, including branding, site design, software, and original content, is owned by ${LEGAL_OPERATOR} or its licensors. You may use the Service for personal, non-commercial meal planning. You may not copy, resell, or redistribute the Service or its content except as allowed by law or with written permission.`
      ]
    },
    {
      heading: "9. Third-party services",
      paragraphs: [
        "The Service may rely on third parties such as Cloudflare (hosting, database, security, AI infrastructure) and Stripe (payments). Their terms and privacy policies apply to their processing."
      ]
    },
    {
      heading: "10. Disclaimers",
      paragraphs: [
        'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT MEAL PLANS ARE MEDICALLY APPROPRIATE FOR YOU.'
      ]
    },
    {
      heading: "11. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, or health outcomes arising from your use of the Service. Our total liability for any claim relating to the Service will not exceed the greater of (a) the amount you paid us for Premium in the 12 months before the claim or (b) USD 50."
      ]
    },
    {
      heading: "12. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold us harmless from claims arising out of your misuse of the Service, your submitted content, or your violation of these Terms, to the extent permitted by law."
      ]
    },
    {
      heading: "13. Suspension and termination",
      paragraphs: [
        "We may suspend or terminate access if you violate these Terms, misuse the Service, or create risk to users or infrastructure. You may stop using the Service at any time and may request account deletion via support."
      ]
    },
    {
      heading: "14. Changes to the Service or Terms",
      paragraphs: [
        "We may change or discontinue features, and we may update these Terms. The “Last updated” date will change when Terms are revised. Continued use after changes means you accept the updated Terms."
      ]
    },
    {
      heading: "15. Governing law",
      paragraphs: [
        "These Terms are governed by the laws of Vietnam, without regard to conflict-of-law rules, unless mandatory consumer protections in your country require otherwise. Courts in Vietnam will have jurisdiction, subject to those mandatory protections."
      ]
    },
    {
      heading: "16. Contact",
      paragraphs: [
        `For questions about these Terms, email ${SUPPORT_EMAIL}. Also see our Privacy Policy at ${DEFAULT_SITE_URL}/privacy.`
      ]
    }
  ]
};

const termsVi: LegalDocument = {
  title: "Điều khoản sử dụng",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `Các Điều khoản sử dụng (“Điều khoản”) điều chỉnh việc bạn dùng ${BRAND_NAME} tại ${DEFAULT_SITE_URL} và các ứng dụng liên quan (“Dịch vụ”). Khi dùng Dịch vụ, bạn đồng ý với các Điều khoản này.`,
  contactNote: `Câu hỏi về Điều khoản: ${SUPPORT_EMAIL}. Đơn vị vận hành: ${LEGAL_OPERATOR}.`,
  sections: [
    {
      heading: "1. Đơn vị vận hành",
      paragraphs: [
        `Dịch vụ do ${LEGAL_OPERATOR} vận hành. Tên thương hiệu gồm ${BRAND_NAME} và “Bầu Ăn Gì?”.`
      ]
    },
    {
      heading: "2. Không phải tư vấn y khoa",
      paragraphs: [
        "Dịch vụ chỉ cung cấp thông tin giáo dục về lập thực đơn và thực đơn tham khảo. Không phải tư vấn, chẩn đoán hay điều trị y khoa, và không tạo quan hệ bác sĩ–bệnh nhân.",
        "Hãy luôn tham vấn nhân viên y tế có chuyên môn về thai kỳ, sau sinh, cho con bú, dị ứng, tiểu đường thai kỳ, tăng huyết áp, thiếu máu hoặc mọi thay đổi chế độ ăn. Nếu cấp cứu, hãy tìm trợ giúp y tế ngay."
      ]
    },
    {
      heading: "3. Điều kiện sử dụng",
      paragraphs: [
        "Bạn phải đủ tuổi để giao kết hợp đồng tại nơi bạn sinh sống và có thể dùng công cụ lập kế hoạch dinh dưỡng một cách có trách nhiệm. Dịch vụ dành cho người lớn."
      ]
    },
    {
      heading: "4. Tài khoản và bảo mật",
      paragraphs: [
        "Bạn chịu trách nhiệm về tính chính xác của thông tin gửi lên và việc giữ bí mật thông tin đăng nhập / token phiên. Hãy báo cho chúng tôi sớm nếu nghi ngờ truy cập trái phép."
      ]
    },
    {
      heading: "5. Sử dụng hợp lệ",
      paragraphs: ["Bạn đồng ý không:"],
      bullets: [
        "Lạm dụng Dịch vụ, gây gián đoạn, hoặc dò quét hệ thống trái phép.",
        "Dùng Dịch vụ để cung cấp chăm sóc lâm sàng hoặc tuyên bố kết quả là chỉ định y khoa cá nhân hóa.",
        "Thu thập dữ liệu (scrape), tạo tải quá mức, hoặc tự động hóa truy cập theo cách gây hại cho Dịch vụ hoặc vi phạm Điều khoản.",
        "Tải lên nội dung bất hợp pháp, xâm phạm quyền, hoặc mang tính lạm dụng."
      ]
    },
    {
      heading: "6. Tính năng miễn phí và Premium",
      paragraphs: [
        "Tính năng miễn phí có thể lưu dữ liệu cục bộ trên trình duyệt. Tài khoản và đồng bộ tùy chọn có thể lưu trên hạ tầng đám mây như mô tả trong Chính sách quyền riêng tư.",
        "Tính năng Premium có thể thu phí. Thanh toán được xử lý bởi Stripe. Quyền Premium được cấp sau khi xác nhận thanh toán thành công. Trừ khi pháp luật bắt buộc, phí tuân theo điều khoản của Stripe và điều kiện ưu đãi (nếu có) tại trang thanh toán."
      ]
    },
    {
      heading: "7. AI và nội dung được tạo",
      paragraphs: [
        "Thực đơn và nội dung liên quan có thể được tạo bằng hệ thống tự động, gồm AI. Kết quả có thể chưa đầy đủ, không phù hợp hoặc không chính xác với tình trạng của bạn. Bạn có trách nhiệm xem xét trước khi áp dụng."
      ]
    },
    {
      heading: "8. Sở hữu trí tuệ",
      paragraphs: [
        `Dịch vụ, gồm thương hiệu, thiết kế, phần mềm và nội dung gốc, thuộc về ${LEGAL_OPERATOR} hoặc bên cấp phép. Bạn được dùng Dịch vụ cho mục đích lập thực đơn cá nhân, phi thương mại. Bạn không được sao chép, bán lại hoặc phân phối lại Dịch vụ/nội dung trừ khi pháp luật cho phép hoặc có sự đồng ý bằng văn bản.`
      ]
    },
    {
      heading: "9. Dịch vụ bên thứ ba",
      paragraphs: [
        "Dịch vụ có thể dựa vào bên thứ ba như Cloudflare (lưu trữ, cơ sở dữ liệu, bảo mật, hạ tầng AI) và Stripe (thanh toán). Điều khoản và chính sách quyền riêng tư của họ áp dụng cho phần xử lý của họ."
      ]
    },
    {
      heading: "10. Tuyên bố miễn trừ",
      paragraphs: [
        "DỊCH VỤ ĐƯỢC CUNG CẤP “NGUYÊN TRẠNG” VÀ “NHƯ HIỆN CÓ”. TRONG PHẠM VI PHÁP LUẬT CHO PHÉP, CHÚNG TÔI TỪ CHỐI CÁC BẢO ĐẢM VỀ KHẢ NĂNG THƯƠNG MẠI, PHÙ HỢP MỤC ĐÍCH CỤ THỂ VÀ KHÔNG XÂM PHẠM. CHÚNG TÔI KHÔNG CAM ĐOAN THỰC ĐƠN PHÙ HỢP Y KHOA VỚI BẠN."
      ]
    },
    {
      heading: "11. Giới hạn trách nhiệm",
      paragraphs: [
        "Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả hoặc trừng phạt, hay mất dữ liệu, lợi nhuận hoặc kết quả sức khỏe phát sinh từ việc dùng Dịch vụ. Tổng trách nhiệm của chúng tôi cho mọi khiếu nại liên quan Dịch vụ không vượt quá số lớn hơn giữa (a) số tiền bạn đã trả cho Premium trong 12 tháng trước khiếu nại hoặc (b) 50 USD."
      ]
    },
    {
      heading: "12. Bồi hoàn",
      paragraphs: [
        "Bạn đồng ý bồi hoàn và giữ chúng tôi khỏi các khiếu nại phát sinh từ việc bạn lạm dụng Dịch vụ, nội dung bạn gửi, hoặc vi phạm Điều khoản, trong phạm vi pháp luật cho phép."
      ]
    },
    {
      heading: "13. Tạm ngưng và chấm dứt",
      paragraphs: [
        "Chúng tôi có thể tạm ngưng hoặc chấm dứt truy cập nếu bạn vi phạm Điều khoản, lạm dụng Dịch vụ, hoặc gây rủi ro cho người dùng/hạ tầng. Bạn có thể ngừng dùng Dịch vụ bất cứ lúc nào và yêu cầu xóa tài khoản qua hỗ trợ."
      ]
    },
    {
      heading: "14. Thay đổi Dịch vụ hoặc Điều khoản",
      paragraphs: [
        "Chúng tôi có thể thay đổi hoặc ngừng tính năng, và có thể cập nhật Điều khoản. Ngày “Cập nhật lần cuối” sẽ thay đổi khi Điều khoản được sửa. Tiếp tục sử dụng sau thay đổi đồng nghĩa bạn chấp nhận Điều khoản mới."
      ]
    },
    {
      heading: "15. Luật áp dụng",
      paragraphs: [
        "Các Điều khoản này được điều chỉnh bởi pháp luật Việt Nam, không xét xung đột pháp luật, trừ khi quyền bảo vệ người tiêu dùng bắt buộc tại quốc gia của bạn quy định khác. Tòa án Việt Nam có thẩm quyền, với điều kiện các quyền bắt buộc đó vẫn được tôn trọng."
      ]
    },
    {
      heading: "16. Liên hệ",
      paragraphs: [
        `Mọi câu hỏi về Điều khoản, hãy email ${SUPPORT_EMAIL}. Xem thêm Chính sách quyền riêng tư tại ${DEFAULT_SITE_URL}/vi/privacy.`
      ]
    }
  ]
};

export function getPrivacyPolicy(locale: Locale): LegalDocument {
  return locale === "vi" ? privacyVi : privacyEn;
}

export function getTermsOfService(locale: Locale): LegalDocument {
  return locale === "vi" ? termsVi : termsEn;
}
