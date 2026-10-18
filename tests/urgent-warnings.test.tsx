import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UrgentWarningBanner } from "@/components/result/UrgentWarningBanner";
import { emergencyNow, seekCareSoon } from "@/lib/blog/emergencyCopy";
import { synthesizePost } from "@/lib/blog/synthesis/synthesizePost";
import {
  URGENT_NOTE_ACTION,
  URGENT_NOTE_BANNER,
  detectUrgentWarnings
} from "@/lib/nutrition/safetyRules";
import type { PregnancyProfile } from "@/types/pregnancy";
import ectopic from "../content/blog/posts/thai-ngoai-tu-cung-va-cach-phong-ngua-vi.json";
import miscarriage from "../content/blog/posts/dau-hieu-say-thai-can-lam-gi.json";

const baseProfile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["none"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

function warningsFor(doctorNote: string, locale: "vi" | "en" = "vi") {
  return detectUrgentWarnings({ ...baseProfile, doctorNote }, locale);
}

describe("urgent doctor-note banner", () => {
  it("renders the blocking banner in Vietnamese", () => {
    const html = renderToStaticMarkup(
      createElement(UrgentWarningBanner, { locale: "vi", messages: [URGENT_NOTE_BANNER.vi] })
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-testid="urgent-warning-banner"');
    expect(html).not.toContain("<ul");
    expect(html).not.toContain("<li");
    expect(html).toContain(`<strong>${URGENT_NOTE_ACTION.vi}</strong>`);
    expect(html).toContain("Đừng chờ đến lịch khám.");
    expect(html).toContain(
      "Phù hoặc sưng đột ngột ở mặt hay tay là dấu hiệu cần cấp cứu."
    );
  });

  it("renders the blocking banner in English", () => {
    const html = renderToStaticMarkup(
      createElement(UrgentWarningBanner, { locale: "en", messages: [URGENT_NOTE_BANNER.en] })
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain(`<strong>${URGENT_NOTE_ACTION.en}</strong>`);
    expect(html).toContain("Do not wait for a scheduled appointment.");
    expect(html).toContain(
      "Sudden swelling of the face or hands needs emergency care."
    );
  });
});

describe("urgent doctor-note keyword matching", () => {
  it("matches accented, unaccented, uppercase, and NFD input", () => {
    expect(warningsFor("Hôm nay thai máy giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ra mau am dao")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chay mau")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dau bung du doi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("nhin mo")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("RA MÁU")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("THAI MAY GIAM")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ra máu".normalize("NFD"))).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("nhìn mờ".normalize("NFD"))).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bác sĩ dặn ăn thêm đạm")).toEqual([]);
    expect(warningsFor("ra mau", "en")).toEqual([URGENT_NOTE_BANNER.en]);
  });

  it("does not fire on lookalike everyday words", () => {
    expect(warningsFor("uống một xíu sữa")).toEqual([]);
    expect(warningsFor("bị ngạt mũi")).toEqual([]);
    expect(warningsFor("đầu ngực bị nứt")).toEqual([]);
    expect(warningsFor("nước tiểu ra màu vàng")).toEqual([]);
    expect(warningsFor("thơm ngát")).toEqual([]);
    expect(warningsFor("ngắt rau")).toEqual([]);
    expect(warningsFor("ra nước tiểu")).toEqual([]);
  });

  it("still fires on unaccented token runs and the longer fluid phrases", () => {
    expect(warningsFor("người xiu xiu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ra nước âm đạo")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chảy nước âm đạo")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ra nuoc am dao")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chay nuoc am dao")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("fires when only some tokens in the phrase are unaccented", () => {
    expect(warningsFor("chảy nuoc am dao")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ra nuoc âm đạo")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("bị ra mau nhiều")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("matches reduced fetal movement paraphrases in accented and unaccented notes", () => {
    expect(warningsFor("em bé đạp yếu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động của thai giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy thai máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai may yeu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("em be it dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("mất cử động thai")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("bé bú ít")).toEqual([]);
    expect(warningsFor("đạp xe ít hơn")).toEqual([]);
    expect(warningsFor("máy lạnh giảm")).toEqual([]);
    expect(warningsFor("con không bú, máy hút sữa")).toEqual([]);
    expect(warningsFor("mẹ không ngủ vì thai máy")).toEqual([]);
  });

  it("treats a đ without a tone or vowel mark as unaccented", () => {
    expect(warningsFor("thai đap it")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("con it đap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("uống một xíu sữa")).toEqual([]);
  });

  it("allows one extra word inside an unaccented abdominal-pain phrase", () => {
    expect(warningsFor("dau bung rat du doi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dau bung hom nay du doi")).toEqual([]);
    expect(warningsFor("dau bung du doi")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("does not read unaccented dau plus accented ngực as chest pain", () => {
    expect(warningsFor("dau ngực bị nứt")).toEqual([]);
    expect(warningsFor("đầu ngực bị nứt")).toEqual([]);
    expect(warningsFor("đau ngực")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dau nguc")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("matches sudden face or hand swelling in accented and unaccented notes", () => {
    expect(warningsFor("phù mặt")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phu mat")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("PHÙ MẶT")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phù mặt".normalize("NFD"))).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("mặt sưng phù đột ngột")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("mat sung phu dot ngot")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("tay sưng to")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("tay sung to")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phù đột ngột")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phu dot ngot")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sưng mí mắt")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sung mi mat")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("bàn tay bị sưng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ban tay bi sung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phù tay chân")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phu tay chan")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("tay sung to", "en")).toEqual([URGENT_NOTE_BANNER.en]);
  });

  it("does not treat leg or ankle swelling alone as a red flag", () => {
    expect(warningsFor("phù chân")).toEqual([]);
    expect(warningsFor("phu chan")).toEqual([]);
    expect(warningsFor("phù chân nhiều")).toEqual([]);
    expect(warningsFor("phu chan nhieu")).toEqual([]);
    expect(warningsFor("sưng mắt cá")).toEqual([]);
    expect(warningsFor("sung mat ca")).toEqual([]);
    expect(warningsFor("sưng mắt cá chân")).toEqual([]);
    expect(warningsFor("sung mat ca chan")).toEqual([]);
    expect(warningsFor("mắt cá sưng")).toEqual([]);
    expect(warningsFor("mat ca sung")).toEqual([]);
    expect(warningsFor("phù mắt cá")).toEqual([]);
    expect(warningsFor("phu mat ca")).toEqual([]);
    expect(warningsFor("phù chân đột ngột")).toEqual([]);
    expect(warningsFor("phu chan dot ngot")).toEqual([]);
    expect(warningsFor("phù nhiều")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phù rất nhiều")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phu rat nhieu")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("links a fetal subject to a movement verb across several words", () => {
    expect(warningsFor("Con của mẹ hôm nay đạp rất ít so với hôm qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("con cua me hom nay dap rat it so voi hom qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Em bé của mẹ hôm nay cử động rất yếu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp xe ít hơn")).toEqual([]);
    expect(warningsFor("con không bú, máy hút sữa")).toEqual([]);
  });

  it("flags quiet-fetus wording that never names a kick", () => {
    expect(warningsFor("Sáng nay thấy ít cử động hơn so với tuần trước")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("tu hom qua thay it cu dong hon")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bụng im hơn mọi khi khi nằm nghỉ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("bung im hon moi khi tu sang")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Cả ngày không thấy gì dù đã uống nước ngọt")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ca ngay khong thay gi du da uong nuoc ngot")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Trong bụng yên ắng lạ suốt buổi chiều")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("trong bung yen ang la suot buoi chieu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Tối qua không thấy đói nên ăn nhẹ")).toEqual([]);
    expect(warningsFor("Bật im lặng nghe nhạc ru cho dễ ngủ")).toEqual([]);
  });

  it("reads teen-code negators as không for fetal movement", () => {
    expect(warningsFor("Bé ko đạp từ sáng đến giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Thai k may suốt buổi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Con hok dap gì cả")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Em bé hông máy từ sáng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé hem đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Con kg may")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Thai khg dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé hk máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé kh đạp gì cả")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé khỏe và đạp đều")).toEqual([]);
    expect(warningsFor("Uống vitamin k, bé đạp đều")).toEqual([]);
  });

  it("reads a leading telex dd as đ", () => {
    expect(warningsFor("Thai ddap it từ sáng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé ddap yếu hơn mọi ngày")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Hôm nay ddau nguc khi hít vào")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Đi ddap xe ít hơn mọi ngày")).toEqual([]);
    expect(warningsFor("Cần address lại phần ăn trưa")).toEqual([]);
  });

  it("stays silent when movement is described as normal or not reduced", () => {
    expect(warningsFor("Bé vẫn đạp bình thường, không thấy giảm")).toEqual([]);
    expect(warningsFor("thai may van binh thuong, khong giam")).toEqual([]);
    expect(warningsFor("Cử động vẫn đều, không thấy giảm")).toEqual([]);
    expect(warningsFor("Bé bú ít nhưng đạp bình thường")).toEqual([]);
    expect(warningsFor("Bé đạp ít hơn bình thường")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("keeps a negated red flag off the 115 banner", () => {
    expect(warningsFor("không ra nước")).toEqual([]);
    expect(warningsFor("không ra nước âm đạo")).toEqual([]);
    expect(warningsFor("không đau ngực")).toEqual([]);
    expect(warningsFor("chưa chảy máu")).toEqual([]);
    expect(warningsFor("hết đau rồi")).toEqual([]);
    expect(warningsFor("hết đau ngực rồi")).toEqual([]);
    expect(warningsFor("ko sốt cao từ trưa")).toEqual([]);
    expect(warningsFor("k nhìn mờ khi đứng dậy")).toEqual([]);
    expect(warningsFor("kh đau bụng dữ dội")).toEqual([]);
    expect(warningsFor("hok hoa mắt lúc sáng")).toEqual([]);
    expect(warningsFor("hông bị xuất huyết")).toEqual([]);
    expect(warningsFor("hong nhin mo")).toEqual([]);
    expect(warningsFor("hem co giật")).toEqual([]);
    expect(warningsFor("kg ra máu sau siêu âm")).toEqual([]);
    expect(warningsFor("khg đau đầu dữ dội")).toEqual([]);
    expect(warningsFor("hk phù mặt")).toEqual([]);
    expect(warningsFor("chưa sưng tay")).toEqual([]);
    expect(warningsFor("không khó thở")).toEqual([]);
    expect(warningsFor("hồng chảy máu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ra dịch hồng")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("still alerts when a negator marks inability or less movement", () => {
    expect(warningsFor("ít đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy con đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thở được")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ko máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hết sức đau ngực")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không hết đau ngực")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Hôm qua không sao. Sáng nay đau ngực")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khó thở khi nằm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sưng mí mắt")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("stays silent on a kick-count question that does not report a decrease", () => {
    expect(warningsFor("Bao nhiêu lần đạp là bình thường?")).toEqual([]);
    expect(warningsFor("Bé đạp có bình thường không?")).toEqual([]);
    expect(warningsFor("Mỗi ngày bao nhieu lan may la binh thuong?")).toEqual([]);
    expect(warningsFor("Bé đạp ít hơn, bao nhiêu là nguy hiểm?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Be dap it hon, bao nhieu lan la nguy hiem?")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("does not treat đáp as a kick", () => {
    expect(warningsFor("Đáp án đúng cả bài")).toEqual([]);
    expect(warningsFor("Con đáp lại tin nhắn của chồng")).toEqual([]);
    expect(warningsFor("Con đáp ít lời khi mẹ gọi")).toEqual([]);
    expect(warningsFor("Uống ít mấy hôm nay")).toEqual([]);
    expect(warningsFor("Bé đạp ít từ sáng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Be dap it tu sang")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Thai đap it hôm nay")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("NEG-01 never negators and a second symptom", () => {
  it("suppresses chưa/chẳng bao giờ, never, and a symptom joined by hay/hoặc/or", () => {
    expect(warningsFor("chưa bao giờ ra máu")).toEqual([]);
    expect(warningsFor("Suốt thai kỳ mình chưa bao giờ bị hoa mắt")).toEqual([]);
    expect(warningsFor("chẳng bao giờ đau ngực")).toEqual([]);
    expect(warningsFor("chang bao gio nhin mo")).toEqual([]);
    expect(warningsFor("never ra máu")).toEqual([]);
    expect(warningsFor("never had đau ngực")).toEqual([]);
    expect(warningsFor("never bled")).toEqual([]);
    expect(warningsFor("không ra máu hay đau ngực")).toEqual([]);
    expect(warningsFor("không đau bụng hoặc chảy máu")).toEqual([]);
    expect(warningsFor("ko sốt cao or nhìn mờ")).toEqual([]);
    expect(warningsFor("không ra dịch nâu hay co giật")).toEqual([]);
    expect(warningsFor("ra máu hay đau ngực")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("scopes a face or hand clause separately from a negated leg clause", () => {
    expect(warningsFor("không phù chân, phù mặt")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không sưng mắt cá, bàn tay phù")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("phù chân, không phù mặt")).toEqual([]);
    expect(warningsFor("không phù mặt, phù chân")).toEqual([]);
    expect(warningsFor("không phù chân hay phù mặt")).toEqual([]);
    expect(warningsFor("phù mặt, phù chân")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("FM-01 movement absence with chưa", () => {
  it("alerts when chưa marks missing movement, including perception and inability", () => {
    expect(warningsFor("chưa thấy bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa cảm nhận được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa cảm thấy thai máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("bé chưa đạp được")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Sáng nay chưa cảm nhận được bé máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Em bé chưa đạp được từ tối qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chua cam thay thai may")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa bao giờ thấy bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa thấy giảm")).toEqual([]);
    expect(warningsFor("chưa bao giờ thai máy giảm")).toEqual([]);
    expect(warningsFor("chưa bao giờ ra máu")).toEqual([]);
  });
});

describe("NEG-OVER-01 comma ends negation", () => {
  it("does not let a negator silence the next red flag after a comma", () => {
    expect(warningsFor("không đau đầu, ra máu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hết đau rồi, chảy máu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa đau ngực, thai máy giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không hoa mắt; ra huyết")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Hết nhức đầu rồi. Sáng nay chảy máu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đau ngực")).toEqual([]);
    expect(warningsFor("không, ra máu")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("FA-01 questions and negator bridges", () => {
  it("fires when a question names the symptom and stays silent when a negator splits thai máy giảm", () => {
    expect(warningsFor("Thai máy giảm có bình thường không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Có phải đau ngực không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("co phai dau nguc khong?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không phải thai máy giảm, chỉ hỏi cho biết")).toEqual([]);
    expect(warningsFor("thai máy không giảm, chỉ hỏi thăm")).toEqual([]);
    expect(warningsFor("thai không máy giảm")).toEqual([]);
    expect(warningsFor("thai máy không phải giảm")).toEqual([]);
    expect(warningsFor("không phải thai máy, giảm cân được không?")).toEqual([]);
    expect(warningsFor("thai máy giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Đau ngực từ sáng. Có phải cần đi khám không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Đau ngực từ sáng, có phải cần nghỉ không?")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("PMP40-R5-Q-01 question clauses that name a red flag", () => {
  it("keeps a symptom question and drops a count question with no symptom", () => {
    expect(warningsFor("Bạn có ra máu không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Có thai máy giảm không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Có đau ngực không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé có đạp ít không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Có ra máu hay đau ngực không?")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bao nhiêu lần là bình thường?")).toEqual([]);
    expect(warningsFor("Có phải cần đi khám không?")).toEqual([]);
    expect(warningsFor("Không ra máu hay đau ngực không?")).toEqual([]);
  });
});

describe("NEG-01 held-out never and hay là", () => {
  it("suppresses chưa từng and a second symptom after hay là or hoặc là", () => {
    expect(warningsFor("chưa từng ra máu")).toEqual([]);
    expect(warningsFor("chưa từng bao giờ đau ngực")).toEqual([]);
    expect(warningsFor("từng bị ra máu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không ra máu hay là đau ngực")).toEqual([]);
    expect(warningsFor("không hoa mắt hoặc là chảy máu")).toEqual([]);
    expect(warningsFor("không phù chân hay là sưng tay")).toEqual([]);
    expect(warningsFor("không phù chân, hay phù mặt")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("FM-01 held-out absence with perception", () => {
  it("alerts when chưa or a teen negator reaches the movement verb through perception words", () => {
    expect(warningsFor("chưa hề thấy bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không còn thấy con đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa bao giờ cảm nhận được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa cảm nhận được sự cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không hề thấy máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa nhìn thấy em bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("INAB-01 breathing inability", () => {
  it("alerts for nổi and teen-code dc, and still negates khó thở", () => {
    expect(warningsFor("không thở nổi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Nằm ngửa là không thở nổi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ko thở dc")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("k thở đc lúc nằm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khó thở")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khó thở khi leo cầu thang")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thở được")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không khó thở")).toEqual([]);
  });
});

describe("PMP40-R6-FM-01 perception and count inability", () => {
  it("alerts when a negator plus a perception word reaches reduced movement", () => {
    expect(warningsFor("không cảm giác bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ko cam giac thai may")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không nhận ra con đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chua nhan ra cu dong")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm nhận được sự cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm thấy thai máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hok cam giac may")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa cảm giác được đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không còn cảm giác máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Bé ko cảm giác đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm giác giảm cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm giác thai máy giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cannot feel the kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy giảm")).toEqual([]);
    expect(warningsFor("không giảm cử động")).toEqual([]);
  });

  it("alerts when the note cannot count kicks", () => {
    expect(warningsFor("không đếm được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ko đếm dc đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm nổi thai máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thể nào đếm được số lần đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hông đếm được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm nổi số cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("can't count kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cannot count the kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("can not count kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Can't count the baby's kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cant count movements")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đau ngực, không cảm giác bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm được calo")).toEqual([]);
    expect(warningsFor("can't count calories")).toEqual([]);
    expect(warningsFor("can't kick the ball")).toEqual([]);
    expect(warningsFor("not the kicks")).toEqual([]);
    expect(warningsFor("đêm qua không ngủ")).toEqual([]);
  });

  it("keeps a perception word from swallowing a negated red flag", () => {
    expect(warningsFor("không cảm thấy đau ngực")).toEqual([]);
    expect(warningsFor("không cảm giác đau ngực")).toEqual([]);
    expect(warningsFor("không nhận ra đau ngực")).toEqual([]);
    expect(warningsFor("không cảm nhận được ra máu")).toEqual([]);
    expect(warningsFor("không cảm thấy khó thở")).toEqual([]);
    expect(warningsFor("không cảm thấy phù mặt")).toEqual([]);
    expect(warningsFor("không nhận ra đau ngực hay là ra máu")).toEqual([]);
    expect(warningsFor("không cảm giác hoa mắt")).toEqual([]);
    expect(warningsFor("cảm thấy đau ngực")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm thấy thở được")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đau ngực")).toEqual([]);
    expect(warningsFor("chưa từng ra máu")).toEqual([]);
    expect(warningsFor("không ra máu hay là đau ngực")).toEqual([]);
  });
});

describe("PMP40-R7-FM-01 filler window for reduced movement", () => {
  it("alerts when a classifier or English filler sits between the negator and movement", () => {
    expect(warningsFor("không đếm được cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong dem duoc cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm nổi cú máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ko đếm dc cú máy")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ko dem dc cu may")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Chưa hề đếm được cú máy nào")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chua he dem duoc cu may nao")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm được số cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("haven't felt any kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Haven't felt any kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("havent felt any movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("I did not feel any kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("haven't felt a single kick")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("don't feel any more kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("I can't feel the baby moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm giác bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("PMP40-R7-FA-02 calm negated decrease", () => {
  it("stays silent when a negator applies to the decrease and movement continues", () => {
    expect(warningsFor("không giảm, bé vẫn đạp")).toEqual([]);
    expect(warningsFor("khong giam, be van dap")).toEqual([]);
    expect(warningsFor("Không giảm. Bé vẫn đạp.")).toEqual([]);
    expect(warningsFor("không ít đi, bé vẫn đạp")).toEqual([]);
    expect(warningsFor("khong it di, be van dap")).toEqual([]);
    expect(warningsFor("không ít đi, cử động bình thường")).toEqual([]);
    expect(warningsFor("khong it di, cu dong binh thuong")).toEqual([]);
    expect(warningsFor("không ít đi bé vẫn máy bình thường")).toEqual([]);
    expect(warningsFor("không thấy giảm, bé vẫn đạp")).toEqual([]);
    expect(warningsFor("không thấy giảm cử động bình thường")).toEqual([]);
    expect(warningsFor("no decrease, baby still moving")).toEqual([]);
    expect(warningsFor("No decrease, baby still moving")).toEqual([]);
    expect(warningsFor("not less, baby still moving")).toEqual([]);
    expect(warningsFor("no decrease baby still moving")).toEqual([]);
    expect(warningsFor("not less, movement is normal")).toEqual([]);
  });

  it("still alerts for a real decrease beside a calm-looking phrase", () => {
    expect(warningsFor("thai máy giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai may giam")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("it dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong thay dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai máy giảm, bé vẫn đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai may giam, be van dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai máy giảm dù bé vẫn đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hôm nay ít đạp, không giảm hôm qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hom nay it dap, khong giam hom qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không giảm hôm qua, hôm nay không thấy đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm giác bé đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm giác giảm cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("PMP40-R8-FM-01 quantity between perception and kick", () => {
  it("alerts when a count sits between the perception verb and the kick", () => {
    expect(warningsFor("thấy ít cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thay it cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thấy 1-2 cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thay 1-2 cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thấy vài cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thay vai cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thấy mấy cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thay may cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chỉ thấy 1-2 cái đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cảm thấy vài lần đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cam thay vai lan dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa thấy vài cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chua thay vai cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    // M03's exact hold-out sentence was not in the repo. Same class: negator, perception, and a count.
    expect(warningsFor("Mẹ chưa thấy bé đạp được 2 cú")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("me chua thay be dap duoc 2 cu")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thấy máy")).toEqual([]);
    expect(warningsFor("Uống ít mấy hôm nay")).toEqual([]);
    expect(warningsFor("đáp án")).toEqual([]);
    expect(warningsFor("đạp xe")).toEqual([]);
  });
});

describe("PMP40-R8-FM-01 stop verb without perception", () => {
  it("alerts when a movement noun is followed by ngừng, dừng, or hết", () => {
    expect(warningsFor("cử động ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong ngung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động dừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong dung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động hết")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong het")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ngừng cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dừng cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động không ngừng")).toEqual([]);
    expect(warningsFor("cử động đúng")).toEqual([]);
    expect(warningsFor("đạp hết sức")).toEqual([]);
    expect(warningsFor("máy hết nước")).toEqual([]);
    expect(warningsFor("đạp xe")).toEqual([]);
    expect(warningsFor("máy hút sữa")).toEqual([]);
  });
});

describe("PMP40-R8-FM-01 English negator without perception", () => {
  it("alerts when English negates movement and no perception verb is present", () => {
    expect(warningsFor("baby not moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Baby not moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("the baby is not moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("no movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("No movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("stopped kicking")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Stopped kicking")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("fewer kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("Fewer kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("kicking stopped")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("not the kicks")).toEqual([]);
    expect(warningsFor("do not move the chair")).toEqual([]);
    expect(warningsFor("baby is moving")).toEqual([]);
  });
});

describe("PMP40-R8-FA-02 calm cue across the whole note", () => {
  it("stays silent when a calm cue and a negated decrease are in different clauses", () => {
    expect(warningsFor("không thấy cử động giảm, bé vẫn đạp")).toEqual([]);
    expect(warningsFor("khong thay cu dong giam, be van dap")).toEqual([]);
    expect(warningsFor("không thấy cử động giảm, cử động vẫn bình thường")).toEqual([]);
    expect(warningsFor("khong thay cu dong giam, cu dong van binh thuong")).toEqual([]);
    expect(warningsFor("không thấy giảm đạp, bé vẫn cử động")).toEqual([]);
    expect(warningsFor("khong thay giam dap, be van cu dong")).toEqual([]);
    expect(warningsFor("không giảm, bé vẫn đạp")).toEqual([]);
    expect(warningsFor("no decrease, baby still moving")).toEqual([]);
    expect(warningsFor("not fewer kicks, still moving")).toEqual([]);
    expect(warningsFor("kicking normally, no decrease")).toEqual([]);
  });

  it("still alerts when the decrease is not negated, or the absence is real", () => {
    expect(warningsFor("thai máy giảm, bé vẫn đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai may giam, be van dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít đạp, bình thường")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("it dap, binh thuong")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy đạp, nhưng bình thường")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong thay dap, nhung binh thuong")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("baby not moving, kicking normally")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("fewer kicks, but still moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không cảm giác thai máy giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai không máy giảm")).toEqual([]);
    expect(warningsFor("thai máy không phải giảm")).toEqual([]);
  });
});

describe("PMP40-R6-FM-01 token-class window in either order", () => {
  it("alerts when quantity, stop, or decrease sits on either side of the movement noun", () => {
    // The delta9 sentences for GQ1, GQ2, GQ6, GQ7, GE2, GE3, GE5, M03, FC3, and FK3
    // were not in the workspace. These cover that class.
    expect(warningsFor("ngừng cử động từ sáng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ngung cu dong tu sang")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động đã ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong da ngung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp rất ít so với hôm qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dap rat it so voi hom qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("movement has decreased")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("kicks are fewer")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("fewer than usual")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("kicks stopped")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("stopped movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sáu cử động trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sau cu dong trong 2 gio")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp sáu lần")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("năm cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("nam cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động không ngừng")).toEqual([]);
    expect(warningsFor("đạp hết sức")).toEqual([]);
    expect(warningsFor("máy hết nước")).toEqual([]);
    expect(warningsFor("ăn ít hơn mọi khi")).toEqual([]);
    expect(warningsFor("ba đạp đều")).toEqual([]);
  });
});

describe("PMP40-R9-FA-03 and PMP42-FA-01 kick-count ruling", () => {
  it("alerts only for a low count or fewer-than-usual, in Vietnamese and English", () => {
    // GQ10, GQ11, GS10, GE9, ENW1, ENW2, ENW3, ENW4, and ENW5 were not in the report file.
    expect(warningsFor("fewer than 10 kicks in 2 hours")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít hơn 10 cử động trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("it hon 10 cu dong trong 2 gio")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("fewer than usual")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít hơn mọi khi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("it hon moi khi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("only 6 kicks in 2 hours")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("8 cử động trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thấy ít cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("15 kicks in 2 hours")).toEqual([]);
    expect(warningsFor("20 cú đạp")).toEqual([]);
    expect(warningsFor("20 cu dap")).toEqual([]);
    expect(warningsFor("đạp 30 lần")).toEqual([]);
    expect(warningsFor("dap 30 lan")).toEqual([]);
    expect(warningsFor("mười lăm cú đạp")).toEqual([]);
    expect(warningsFor("hai mươi cú đạp")).toEqual([]);
    expect(warningsFor("thấy 15 cú đạp")).toEqual([]);
    expect(warningsFor("thay 15 cu dap")).toEqual([]);
    expect(warningsFor("I felt 20 kicks")).toEqual([]);
    expect(warningsFor("ten kicks in 2 hours")).toEqual([]);
  });

  it("stays silent on a how-to-count question and still alerts when movement is reduced", () => {
    expect(warningsFor("đếm cú đạp như thế nào")).toEqual([]);
    expect(warningsFor("dem cu dap nhu the nao")).toEqual([]);
    expect(warningsFor("Đếm cú đạp như thế nào?")).toEqual([]);
    expect(warningsFor("how do I count kicks")).toEqual([]);
    expect(warningsFor("How do I count kicks?")).toEqual([]);
    expect(warningsFor("how to count kicks")).toEqual([]);
    expect(warningsFor("cách đếm cử động")).toEqual([]);
    expect(warningsFor("không thấy đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("baby not moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("no movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("stopped kicking")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("haven't felt any kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không đếm được cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("how do I count kicks? baby not moving")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("PMP40-R6-FA-02 whole-note calm cue", () => {
  it("stays silent when a calm cue and a negated decrease are separated by a comma", () => {
    // FWO1 and FWO2 were not in the report file. The calm cue may have a bridge word.
    expect(warningsFor("không giảm, bé vẫn còn đạp")).toEqual([]);
    expect(warningsFor("khong giam, be van con dap")).toEqual([]);
    expect(warningsFor("không thấy cử động giảm, bé vẫn đang đạp")).toEqual([]);
    expect(warningsFor("khong thay cu dong giam, be van dang dap")).toEqual([]);
    expect(warningsFor("không thấy giảm, vẫn thấy bé đạp")).toEqual([]);
    expect(warningsFor("no decrease, baby still moving")).toEqual([]);
    expect(warningsFor("kicking normally, no decrease")).toEqual([]);
    expect(warningsFor("vẫn cử động, không giảm")).toEqual([]);
    expect(warningsFor("not fewer kicks, still moving")).toEqual([]);
  });

  it("still alerts when the decrease is real, even if a calm cue follows a comma", () => {
    expect(warningsFor("thai máy giảm, bé vẫn còn đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai may giam, be van con dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít đạp, bình thường")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít hơn mọi khi, bé vẫn đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy đạp, nhưng bình thường")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("baby not moving, kicking normally")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("fewer kicks, but still moving")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thai không máy giảm")).toEqual([]);
    expect(warningsFor("thai máy không phải giảm")).toEqual([]);
  });
});

describe("PMP40-R10-FA-04 accented number words", () => {
  it("stays silent when an everyday word only folds to 4, 5, or 6", () => {
    expect(warningsFor("Bé đạp từ sáng đến giờ")).toEqual([]);
    expect(warningsFor("be dap tu sang den gio")).toEqual([]);
    expect(warningsFor("Bé đạp làm mẹ vui")).toEqual([]);
    expect(warningsFor("dap lam me vui")).toEqual([]);
    expect(warningsFor("đạp sau bữa")).toEqual([]);
    expect(warningsFor("dap sau bua")).toEqual([]);
    expect(warningsFor("bé nằm đạp")).toEqual([]);
    expect(warningsFor("be nam dap")).toEqual([]);
    expect(warningsFor("đạp lắm")).toEqual([]);
    expect(warningsFor("bọn đạp đều")).toEqual([]);
    expect(warningsFor("bon dap deu")).toEqual([]);
    expect(warningsFor("đạp tư thế nghiêng")).toEqual([]);
  });

  it("still reads an accented number, and an unaccented number with a classifier or a time window", () => {
    expect(warningsFor("sáu cử động trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sau cu dong trong 2 gio")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("năm cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("nam cu dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp sáu lần")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("PMP40-R10 single kick and burst counts", () => {
  it("does not treat one kick or a burst as a low count", () => {
    expect(warningsFor("một cú đạp")).toEqual([]);
    expect(warningsFor("mot cu dap")).toEqual([]);
    expect(warningsFor("bé đạp một cái")).toEqual([]);
    expect(warningsFor("one kick")).toEqual([]);
    expect(warningsFor("felt one kick")).toEqual([]);
    expect(warningsFor("thấy 1 cú đạp")).toEqual([]);
    expect(warningsFor("đạp một tràng")).toEqual([]);
    expect(warningsFor("dap mot trang")).toEqual([]);
    expect(warningsFor("a burst of kicks")).toEqual([]);
    expect(warningsFor("kicked 4 times in a burst")).toEqual([]);
    expect(warningsFor("it is moving")).toEqual([]);
    expect(warningsFor("it was kicking")).toEqual([]);
  });

  it("still alerts for fewer than usual or under 10 movements in 2 hours", () => {
    expect(warningsFor("một cử động trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("mot cu dong trong 2 gio")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("1 kick in 2 hours")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ít hơn mọi khi, chỉ đạp một cái")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("fewer than usual, one kick")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("only 6 kicks in 2 hours")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("PMP40-R10-FM-01 reduced movement without a number", () => {
  it("alerts on a weaker or less-than-before concept, accented and unaccented", () => {
    expect(warningsFor("ít hơn mọi khi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("it hon moi khi")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("yếu hơn")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("yeu hon")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động yếu hơn hôm qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong yeu hon hom qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy đạp nhiều như trước")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong thay dap nhieu nhu truoc")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp không nhiều như trước")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("may khong nhieu nhu truoc")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("weaker than before")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("kicks are weaker")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("not kicking as much as before")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("yêu hơn")).toEqual([]);
  });

  it("alerts when a stop follows a denied decrease in the same clause", () => {
    expect(warningsFor("không phải ít đi mà là ngừng hẳn")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong phai it di ma la ngung han")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("not less but it stopped")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("alerts on English past-tense absence, no plus fetal movement, stop after but, and no longer", () => {
    expect(warningsFor("I haven't felt the baby move")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("didn't feel any kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("I did not feel the kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("no baby movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("no fetal movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("it was kicking but now it stopped")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("the baby was moving but then stopped")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("kicking but now stopped")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("baby no longer moves")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("baby no longer kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("the baby no longer kicks at night")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("alerts when the count has not reached 10 yet", () => {
    expect(warningsFor("chưa được 10 lần trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chua duoc 10 lan trong 2 gio")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa tới 10 cú trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chua toi 10 cu trong 2 gio")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("not even 10 yet")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("not even ten yet")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("has not reached 10 kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa được 10 tuần")).toEqual([]);
  });
});

describe("PMP40-R10-FA-03 vague quantity, hết, and the mother as subject", () => {
  it("stays silent when a vague quantity sits with an active baby", () => {
    expect(warningsFor("đạp vài cái rồi lại đạp tiếp")).toEqual([]);
    expect(warningsFor("dap vai cai roi lai dap tiep")).toEqual([]);
    expect(warningsFor("a few kicks, very active")).toEqual([]);
    expect(warningsFor("few kicks and very active")).toEqual([]);
    expect(warningsFor("thấy vài cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("a few kicks")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("reads hết cả as the whole session and hết or không còn plus a verb as a stop", () => {
    expect(warningsFor("đạp hết cả buổi")).toEqual([]);
    expect(warningsFor("dap het ca buoi")).toEqual([]);
    expect(warningsFor("đạp hết buổi")).toEqual([]);
    expect(warningsFor("hết đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("het dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không còn đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong con dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không còn cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động hết")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("stays silent when movement never stops, and when the mother is the one who cannot move", () => {
    expect(warningsFor("never stops")).toEqual([]);
    expect(warningsFor("never stops kicking")).toEqual([]);
    expect(warningsFor("baby never stops kicking")).toEqual([]);
    expect(warningsFor("đạp suốt không ngừng")).toEqual([]);
    expect(warningsFor("dap suot khong ngung")).toEqual([]);
    expect(warningsFor("mẹ không cử động được")).toEqual([]);
    expect(warningsFor("me khong cu dong duoc")).toEqual([]);
    expect(warningsFor("tôi không cử động được")).toEqual([]);
    expect(warningsFor("I can't move much")).toEqual([]);
    expect(warningsFor("I cannot move much")).toEqual([]);
    expect(warningsFor("không cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("baby not moving and I can't move much")).toEqual([URGENT_NOTE_BANNER.vi]);
  });
});

describe("shared emergency copy", () => {
  it("puts the standard 115 lines in the article template", () => {
    const result = synthesizePost({
      title: "Iron-rich meals",
      titleVi: "Món giàu sắt",
      snippet: "Iron.",
      snippetVi: "Sắt.",
      sourceName: "Editorial",
      url: "https://pregnancymeal.tips/blog/topics#iron"
    });
    expect(result.content).toContain(emergencyNow.vi);
    expect(result.content).toContain(seekCareSoon.vi);
    expect(result.content).not.toContain("Khi nào cần đi khám sớm");
    expect(result.faqs?.some((faq) => faq.answer.includes("gọi 115"))).toBe(true);
    expect(result.en.content).toContain(emergencyNow.en);
    expect(result.en.content).toContain("call 115");
  });

  it("rewrites the ectopic and miscarriage emergency sections", () => {
    expect(ectopic.title).toBe("Thai ngoài tử cung: dấu hiệu nhận biết và khi nào cần cấp cứu");
    expect(ectopic.content.startsWith("## Tóm tắt\n\n**Gọi 115 hoặc đến ngay khoa cấp cứu**")).toBe(true);
    expect(ectopic.content).toContain("Gọi 115 hoặc đến ngay khoa cấp cứu");
    expect(ectopic.content).toContain(
      "Đừng chờ xem triệu chứng có tự hết không. Nếu đã được chẩn đoán thai ngoài tử cung, hãy tái khám đúng hẹn theo chỉ định của bác sĩ."
    );
    expect(ectopic.content).not.toContain("Ưu tiên ăn đủ chất");
    expect(ectopic.content).not.toContain("28 tuần");
    expect(ectopic.content).not.toContain("an toàn tại nhà");
    expect(ectopic.content).not.toContain("Khi nào cần đi khám sớm");

    expect(miscarriage.content).toContain(
      "Gọi 115 / đến cấp cứu ngay** nếu: chảy máu nhiều (thấm ướt 1 băng vệ sinh/giờ trong 2 giờ liền)"
    );
    expect(miscarriage.content).toContain("Đi khám trong ngày** nếu: ra ít máu đỏ hoặc nâu");
    expect(miscarriage.content).not.toContain("cramp");
    expect(miscarriage.content).not.toContain("Liên hệ cơ sở y tế");
  });

  it("keeps the 115 line on every template stub", () => {
    const postsDir = join(process.cwd(), "content/blog/posts");
    const stubs = [
      "bat-mi-phu-nu-sau-sinh-an-muop-duoc-khong-va-nhung-cong-dung-tu-muop-cho-san-phu.json",
      "bi-tieu-duong-thai-ky-an-banh-mi-duoc-khong-nen-an-loai-nao-73207.json",
      "cham-soc-rang-mieng-trong-thai-ky-vi.json",
      "dai-thao-duong-thai-ky-moi-ban-tam-cua-me-bau-vi.json",
      "giai-dap-thac-mac-sau-sinh-an-da-day-lon-duoc-khong.json",
      "nguyen-nhan-va-cach-giam-dau-xuong-mu-khi-mang-thai-73283.json",
      "nhung-dau-hieu-giup-nhan-biet-thai-luu-vi.json",
      "nhung-dieu-can-biet-khi-mang-thai-lan-dau-de-ca-me-va-be-cung-khoe-manh-vi.json",
      "phu-nu-sau-sinh-an-bun-hen-duoc-khong-luu-y-cho-cac-me-sau-sinh-73177.json",
      "phu-nu-sau-sinh-an-gi-bo-mau-nhung-dieu-chi-em-khong-nen-bo-qua-73178.json",
      "phu-nu-sau-sinh-an-hat-sen-duoc-khong-can-luu-y-gi-khi-an-hat-sen-73159.json",
      "qua-trinh-hinh-thanh-rau-thai-vi.json",
      "sau-sinh-an-kho-qua-duoc-khong-nhung-loi-ich-suc-khoe-kho-qua-mang-lai-la-gi-731.json",
      "say-thai-tu-nhien-ra-mau-trong-bao-lau-vi.json",
      "tam-quan-trong-cua-vitamin-trong-thai-ki-vi.json",
      "thuoc-nao-se-gay-say-thai-vi.json"
    ];
    for (const name of stubs) {
      const post = JSON.parse(readFileSync(join(postsDir, name), "utf8")) as { content: string };
      expect(post.content, name).toContain("Cần cấp cứu ngay (gọi 115");
    }
    expect(ectopic.content).toContain("Gọi 115 hoặc đến ngay khoa cấp cứu");
  });

  it("uses 115 as the only helpline in the emergency copy", () => {
    const owned = [
      ectopic.content,
      miscarriage.content,
      emergencyNow.vi,
      emergencyNow.en,
      seekCareSoon.vi,
      seekCareSoon.en,
      URGENT_NOTE_ACTION.vi,
      URGENT_NOTE_ACTION.en,
      URGENT_NOTE_BANNER.vi,
      URGENT_NOTE_BANNER.en
    ];
    const postsDir = join(process.cwd(), "content/blog/posts");
    for (const name of readdirSync(postsDir)) {
      const post = JSON.parse(readFileSync(join(postsDir, name), "utf8")) as { content?: string };
      if (post.content?.includes("Cần cấp cứu ngay (gọi 115")) owned.push(post.content);
    }
    const otherHelpline =
      /(?:1800|1900)\s*\d{2,8}|\b(?:111|113|114)\b|gọi\s*(?:số\s*)?(?!115\b)\d{2,5}|tư vấn\s*(?:số\s*)?\d{2,8}/iu;
    for (const text of owned) {
      const withoutEmergency = text.replace(/115/g, "");
      expect(withoutEmergency).not.toMatch(otherHelpline);
      expect(text).not.toMatch(/1800\s*6606/);
    }
  });
});

describe("PMP40-R11 delta-11", () => {
  // The delta-11 report was not in the workspace or /tmp. Each case ID below
  // locks the class from that run. The exact QA sentence was unavailable.

  it("FC3 alerts for one kick since yesterday", () => {
    expect(warningsFor("một cú đạp từ hôm qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("mot cu dap tu hom qua")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("GQ1 alerts for one kick since yesterday in English", () => {
    expect(warningsFor("1 kick since yesterday")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("one kick since yesterday")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("GQ2 alerts for one kick across the whole morning", () => {
    expect(warningsFor("only one kick all morning")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("only 1 kick the whole morning")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("GQ6 alerts for one kick over several hours", () => {
    expect(warningsFor("chỉ 1 cú đạp mấy tiếng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chi 1 cu dap may tieng")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("GQ7 alerts for one counted kick across the morning", () => {
    expect(warningsFor("đạp 1 lần cả buổi sáng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dap 1 lan ca buoi sang")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HQ1 alerts for zero kicks over hours", () => {
    expect(warningsFor("zero kicks for hours")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("0 kicks for hours")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HQ2 alerts for one movement across the whole morning", () => {
    expect(warningsFor("một cú cả buổi sáng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("mot cu ca buoi sang")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HQ5 alerts when perception reports one kick since yesterday", () => {
    expect(warningsFor("thấy một cú đạp từ hôm qua")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("thay mot cu dap tu hom qua")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HE2 alerts for one movement for hours", () => {
    expect(warningsFor("one movement for hours")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("1 kick for hours")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HS4 alerts for a stop verb with a movement verb", () => {
    expect(warningsFor("đạp một cái rồi ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dap mot cai roi ngung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy một cú đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hết đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("keeps a bare single kick and a burst silent", () => {
    expect(warningsFor("một cú đạp")).toEqual([]);
    expect(warningsFor("one kick")).toEqual([]);
    expect(warningsFor("thấy 1 cú đạp")).toEqual([]);
    expect(warningsFor("felt one kick")).toEqual([]);
    expect(warningsFor("đạp một tràng")).toEqual([]);
    expect(warningsFor("kicked 4 times in a burst")).toEqual([]);
  });

  it("M03 alerts for negator, perception, and a decrease of movement", () => {
    expect(warningsFor("không cảm nhận được cử động giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("khong cam nhan duoc cu dong giam")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("chưa thấy bé đạp giảm")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("không thấy cử động giảm, bé vẫn đạp")).toEqual([]);
  });

  it("FK3 alerts for a movement noun plus a stop verb and no perception verb", () => {
    expect(warningsFor("cử động thì ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong thi ngung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong het")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động không ngừng")).toEqual([]);
  });

  it("GE2 alerts for the English reduced-movement class", () => {
    expect(warningsFor("decrease in movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("hardly kicking")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("has not kicked since yesterday")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("not a single kick since yesterday")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("GE3 stays an English reduced-movement alert", () => {
    expect(warningsFor("reduced fetal movement")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("the baby is moving less")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("FK4 stays a movement-noun stop alert", () => {
    expect(warningsFor("cử động ngừng")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cu dong dung")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("ngừng mọi cử động")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HQ10 stays an under-ten in two hours alert", () => {
    expect(warningsFor("1 kick in 2 hours")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("một cử động trong 2 giờ")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("only 6 kicks in 2 hours")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HS10 stays a short hết-plus-verb alert", () => {
    expect(warningsFor("hết đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp hết")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("het dap")).toEqual([URGENT_NOTE_BANNER.vi]);
  });

  it("HG2 stays silent when an accented word only folds into a time count", () => {
    expect(warningsFor("từ giờ bé đạp sau bữa")).toEqual([]);
    expect(warningsFor("nằm giờ bé đạp sau bữa")).toEqual([]);
    expect(warningsFor("Bé đạp từ sáng đến giờ")).toEqual([]);
    expect(warningsFor("lần sau bé đạp")).toEqual([]);
  });

  it("JG12 matches an accented token plus lần only on the exact number", () => {
    expect(warningsFor("đạp bốn lần")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("tư lần đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("năm lần đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sáu cái đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp từ lần")).toEqual([]);
    expect(warningsFor("làm lần đạp")).toEqual([]);
    expect(warningsFor("nằm lần đạp")).toEqual([]);
    expect(warningsFor("bọn lần đạp")).toEqual([]);
    expect(warningsFor("đạp lắm lần")).toEqual([]);
  });

  it("JG2 counts an unaccented fold plus lần", () => {
    expect(warningsFor("dap bon lan")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("sau lan dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("nam lan cu dong")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("tu lan dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp từ lần")).toEqual([]);
    expect(warningsFor("lần sau bé đạp")).toEqual([]);
  });

  it("GQ10 stays silent for a vague quantity with an active baby", () => {
    expect(warningsFor("đạp vài cái rồi lại đạp tiếp")).toEqual([]);
    expect(warningsFor("dap vai cai roi lai dap tiep")).toEqual([]);
  });

  it("HV1 stays silent for a few kicks when the baby is very active", () => {
    expect(warningsFor("a few kicks, very active")).toEqual([]);
    expect(warningsFor("few kicks and very active")).toEqual([]);
  });

  it("JV1 stays silent when a vague Vietnamese count is followed by more kicking", () => {
    expect(warningsFor("đạp vài cái rồi đạp nữa")).toEqual([]);
    expect(warningsFor("vài cú rồi đạp nhiều")).toEqual([]);
  });

  it("JV2 stays silent when a few kicks are followed by kept kicking", () => {
    expect(warningsFor("a few kicks, baby kept kicking")).toEqual([]);
    expect(warningsFor("couple of kicks, baby active")).toEqual([]);
  });

  it("JV3 stays silent for several kicks and then active kicking", () => {
    expect(warningsFor("several kicks then active kicking")).toEqual([]);
    expect(warningsFor("đạp vài cái liên tục")).toEqual([]);
  });

  it("JN2 stays silent when Vietnamese kicking never stops", () => {
    expect(warningsFor("đạp suốt không ngừng")).toEqual([]);
    expect(warningsFor("dap suot khong ngung")).toEqual([]);
    expect(warningsFor("never stops kicking")).toEqual([]);
  });

  it("JH4 alerts for a short hết plus a movement verb", () => {
    expect(warningsFor("hết đạp")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp hết")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("het dap")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("dap het")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("cử động thì hết")).toEqual([URGENT_NOTE_BANNER.vi]);
    expect(warningsFor("đạp hết cả buổi")).toEqual([]);
    expect(warningsFor("dap het ca buoi")).toEqual([]);
  });

  it("ENW1 stays silent for history of a past symptom", () => {
    expect(warningsFor("no history of vaginal bleeding")).toEqual([]);
    expect(warningsFor("no history of bleeding")).toEqual([]);
    expect(warningsFor("history of preeclampsia")).toEqual([]);
  });

  it("ENW5 stays silent for a normal scan finding", () => {
    expect(warningsFor("the scan was normal")).toEqual([]);
    expect(warningsFor("ultrasound showed normal movement")).toEqual([]);
    expect(warningsFor("the scan looks normal")).toEqual([]);
  });
});
