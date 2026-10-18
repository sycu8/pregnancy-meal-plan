import { describe, expect, it } from "vitest";
import { detectUrgentWarnings, URGENT_NOTE_ACTION, URGENT_NOTE_BANNER } from "@/lib/nutrition/safetyRules";
import type { PregnancyProfile } from "@/types/pregnancy";

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

const VI_BANNER = URGENT_NOTE_BANNER.vi;
const EN_BANNER = URGENT_NOTE_BANNER.en;

function warningsFor(doctorNote: string, locale: "vi" | "en" = "en") {
  return detectUrgentWarnings({ ...baseProfile, doctorNote }, locale);
}

describe("PMP-EN-01 plain English red flags", () => {
  it("keeps the 115 banner and the signed swelling sentences", () => {
    expect(warningsFor("bleeding", "en")).toEqual([EN_BANNER]);
    expect(warningsFor("bleeding", "vi")).toEqual([VI_BANNER]);
    expect(VI_BANNER).toContain("Phù hoặc sưng đột ngột ở mặt hay tay là dấu hiệu cần cấp cứu.");
    expect(EN_BANNER).toContain("Sudden swelling of the face or hands needs emergency care.");
    expect(URGENT_NOTE_ACTION.vi).toContain("115");
    expect(URGENT_NOTE_ACTION.en).toContain("115");
    expect(VI_BANNER).toContain("115");
    expect(EN_BANNER).toContain("115");
    expect(EN_BANNER).not.toContain("1800");
    expect(VI_BANNER).not.toContain("1800");
    expect(warningsFor("Hôm nay thai máy giảm", "vi")).toEqual([VI_BANNER]);
    expect(warningsFor("Bác sĩ dặn ăn thêm đạm")).toEqual([]);
  });

  it("alerts on English symptoms that match the Vietnamese list", () => {
    // The PMP-EN-01 hold-out sentences were not in the repo. These cover that class.
    expect(warningsFor("I am bleeding")).toEqual([EN_BANNER]);
    expect(warningsFor("heavy bleeding since this morning")).toEqual([EN_BANNER]);
    expect(warningsFor("severe abdominal pain")).toEqual([EN_BANNER]);
    expect(warningsFor("severe headache")).toEqual([EN_BANNER]);
    expect(warningsFor("chest pain")).toEqual([EN_BANNER]);
    expect(warningsFor("Chest pain when I lie down")).toEqual([EN_BANNER]);
    expect(warningsFor("shortness of breath")).toEqual([EN_BANNER]);
    expect(warningsFor("I can't breathe")).toEqual([EN_BANNER]);
    expect(warningsFor("I cannot breathe")).toEqual([EN_BANNER]);
    expect(warningsFor("had a seizure")).toEqual([EN_BANNER]);
    expect(warningsFor("I fainted")).toEqual([EN_BANNER]);
    expect(warningsFor("high fever")).toEqual([EN_BANNER]);
    expect(warningsFor("I have a fever")).toEqual([EN_BANNER]);
    expect(warningsFor("blurred vision")).toEqual([EN_BANNER]);
    expect(warningsFor("my face is swollen")).toEqual([EN_BANNER]);
    expect(warningsFor("swollen hands")).toEqual([EN_BANNER]);
    expect(warningsFor("high blood pressure")).toEqual([EN_BANNER]);
    expect(warningsFor("my water broke")).toEqual([EN_BANNER]);
    expect(warningsFor("pink discharge")).toEqual([EN_BANNER]);
    expect(warningsFor("vomiting blood")).toEqual([EN_BANNER]);
    expect(warningsFor("I can't keep food down")).toEqual([EN_BANNER]);
    expect(warningsFor("shoulder pain")).toEqual([EN_BANNER]);
    expect(warningsFor("continuous contractions")).toEqual([EN_BANNER]);
    expect(warningsFor("Am I bleeding?")).toEqual([EN_BANNER]);
    expect(warningsFor("Do I have chest pain?")).toEqual([EN_BANNER]);
  });

  it("alerts on reduced movement using perception, quantity, stop, and negator words", () => {
    expect(warningsFor("baby not moving")).toEqual([EN_BANNER]);
    expect(warningsFor("the baby is not moving")).toEqual([EN_BANNER]);
    expect(warningsFor("no movement")).toEqual([EN_BANNER]);
    expect(warningsFor("stopped kicking")).toEqual([EN_BANNER]);
    expect(warningsFor("fewer kicks")).toEqual([EN_BANNER]);
    expect(warningsFor("reduced fetal movement")).toEqual([EN_BANNER]);
    expect(warningsFor("I haven't felt any kicks")).toEqual([EN_BANNER]);
    expect(warningsFor("felt only 1-2 kicks")).toEqual([EN_BANNER]);
    expect(warningsFor("baby not moving, kicking normally")).toEqual([EN_BANNER]);
    expect(warningsFor("fewer kicks, but still moving")).toEqual([EN_BANNER]);
  });

  it("stays silent for English negations, parallel to NEG-01", () => {
    expect(warningsFor("no bleeding")).toEqual([]);
    expect(warningsFor("not bleeding")).toEqual([]);
    expect(warningsFor("I don't have chest pain")).toEqual([]);
    expect(warningsFor("no chest pain")).toEqual([]);
    expect(warningsFor("never had a seizure")).toEqual([]);
    expect(warningsFor("haven't had any bleeding")).toEqual([]);
    expect(warningsFor("no bleeding or chest pain")).toEqual([]);
    expect(warningsFor("no fever")).toEqual([]);
    expect(warningsFor("I don't feel chest pain")).toEqual([]);
    expect(warningsFor("not short of breath")).toEqual([]);
    expect(warningsFor("no decrease, baby still moving")).toEqual([]);
    expect(warningsFor("not fewer kicks, still moving")).toEqual([]);
    expect(warningsFor("the baby is kicking normally")).toEqual([]);
    expect(warningsFor("not the kicks")).toEqual([]);
    expect(warningsFor("do not move the chair")).toEqual([]);
    expect(warningsFor("swollen ankles")).toEqual([]);
    expect(warningsFor("leg swelling")).toEqual([]);
    expect(warningsFor("I feel fine today")).toEqual([]);
    expect(warningsFor("I can keep food down")).toEqual([]);
    expect(warningsFor("no headache, bleeding")).toEqual([EN_BANNER]);
    expect(warningsFor("no chest pain, I fainted")).toEqual([EN_BANNER]);
  });
});

describe("PMP42-EN-01 English movement hold-outs", () => {
  it("alerts for reduced movement and stays silent for a normal count or a how-to question", () => {
    // FE6, EN13, FK4, FE3, FE4, and GE5 were not in the delta9 report. Same English class.
    expect(warningsFor("movement has decreased")).toEqual([EN_BANNER]);
    expect(warningsFor("kicks are fewer")).toEqual([EN_BANNER]);
    expect(warningsFor("the baby stopped moving")).toEqual([EN_BANNER]);
    expect(warningsFor("fewer than 10 kicks in 2 hours")).toEqual([EN_BANNER]);
    expect(warningsFor("only 6 kicks in 2 hours")).toEqual([EN_BANNER]);
    expect(warningsFor("haven't felt any kicks")).toEqual([EN_BANNER]);
    expect(warningsFor("15 kicks in 2 hours")).toEqual([]);
    expect(warningsFor("I felt 20 kicks")).toEqual([]);
    expect(warningsFor("ten kicks in 2 hours")).toEqual([]);
    expect(warningsFor("how do I count kicks")).toEqual([]);
    expect(warningsFor("How do I count kicks?")).toEqual([]);
    expect(warningsFor("how to count fetal movement")).toEqual([]);
    expect(warningsFor("no bleeding")).toEqual([]);
    expect(warningsFor("no chest pain")).toEqual([]);
    expect(warningsFor("never had a seizure")).toEqual([]);
    expect(warningsFor("no decrease, baby still moving")).toEqual([]);
    expect(warningsFor("not fewer kicks, still moving")).toEqual([]);
    expect(warningsFor("kicking normally, no decrease")).toEqual([]);
    expect(warningsFor("fewer kicks, but still moving")).toEqual([EN_BANNER]);
    expect(warningsFor("baby not moving, kicking normally")).toEqual([EN_BANNER]);
  });

  it("alerts when an English stop verb is on fetal movement", () => {
    // FK4's exact prior string was not in the repo or the delta notes.
    expect(warningsFor("kicking stopped")).toEqual([EN_BANNER]);
    expect(warningsFor("movement has stopped")).toEqual([EN_BANNER]);
    expect(warningsFor("the baby was kicking but now it stopped")).toEqual([EN_BANNER]);
  });
});

describe("PMP42-FA-01 English history, normal findings, and gum bleeding", () => {
  it("stays silent for a previous pregnancy, last time, a normal finding, and gum bleeding from brushing or flossing", () => {
    expect(warningsFor("I had bleeding in a previous pregnancy")).toEqual([]);
    expect(warningsFor("reduced movement in my last pregnancy")).toEqual([]);
    expect(warningsFor("last time the baby stopped kicking")).toEqual([]);
    expect(warningsFor("last time I had no fetal movement")).toEqual([]);
    expect(warningsFor("the scan said movement is normal")).toEqual([]);
    expect(warningsFor("the doctor said fetal movement is normal")).toEqual([]);
    expect(warningsFor("ultrasound showed movement normal")).toEqual([]);
    expect(warningsFor("my gums bleed when I brush")).toEqual([]);
    expect(warningsFor("bleeding gums from flossing")).toEqual([]);
    expect(warningsFor("gums bleeding after brushing my teeth")).toEqual([]);
    expect(warningsFor("no history of bleeding")).toEqual([]);
    expect(warningsFor("no history of vaginal bleeding")).toEqual([]);
    expect(warningsFor("history of bleeding")).toEqual([]);
    expect(warningsFor("history of vaginal bleeding")).toEqual([]);
    expect(warningsFor("history of reduced movement")).toEqual([]);
    expect(warningsFor("no history of reduced fetal movement")).toEqual([]);
    expect(warningsFor("no history of high blood pressure")).toEqual([]);
    expect(warningsFor("the scan was normal")).toEqual([]);
    expect(warningsFor("normal scan finding")).toEqual([]);
    expect(warningsFor("ultrasound was normal")).toEqual([]);
    expect(warningsFor("the scan looks normal")).toEqual([]);
  });

  it("still alerts for current reduced or stopped movement and for vaginal bleeding", () => {
    expect(warningsFor("the baby is not moving")).toEqual([EN_BANNER]);
    expect(warningsFor("kicking stopped")).toEqual([EN_BANNER]);
    expect(warningsFor("movement has stopped")).toEqual([EN_BANNER]);
    expect(warningsFor("reduced fetal movement")).toEqual([EN_BANNER]);
    expect(warningsFor("vaginal bleeding")).toEqual([EN_BANNER]);
    expect(warningsFor("I have vaginal bleeding")).toEqual([EN_BANNER]);
    expect(warningsFor("last time was fine, but the baby is not moving today")).toEqual([EN_BANNER]);
    expect(warningsFor("the scan said movement is normal, but kicking stopped")).toEqual([EN_BANNER]);
    expect(warningsFor("my gums bleed when I floss, and I have vaginal bleeding")).toEqual([EN_BANNER]);
    expect(warningsFor("the doctor said movement has stopped")).toEqual([EN_BANNER]);
  });
});
