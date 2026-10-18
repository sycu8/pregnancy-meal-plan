import { describe, expect, it } from "vitest";
import { NOTE_IDS, NOTE_LIBRARY, matchPlanIngredient, selectLibraryNotes } from "@/lib/nutrition/noteLibrary";

describe("note library", () => {
  it("stays inside the curated size and uses stable ids", () => {
    expect(NOTE_LIBRARY.length).toBeGreaterThanOrEqual(40);
    expect(NOTE_LIBRARY.length).toBeLessThanOrEqual(80);
    expect(new Set(NOTE_IDS).size).toBe(NOTE_LIBRARY.length);
    expect(NOTE_LIBRARY.some((note) => note.foodSlot)).toBe(true);
    for (const note of NOTE_LIBRARY) {
      expect(note.vi).toMatch(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
      expect(note.en).not.toMatch(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
      expect(note.vi.endsWith(".")).toBe(true);
      expect(note.en.endsWith(".")).toBe(true);
    }
  });

  it("renders a known id in the requested language", () => {
    const vi = selectLibraryNotes({ notes: [{ id: "hydration-steady" }] }, [], "vi");
    const en = selectLibraryNotes({ notes: ["hydration-steady"] }, [], "en");
    expect(vi).toEqual({ ok: true, notes: ["Uống đủ nước trong ngày."] });
    expect(en).toEqual({ ok: true, notes: ["Drink water through the day."] });
  });

  it("fills one food from the ingredient list and drops a food that is not on it", () => {
    const ingredients = ["trứng", "rau cải"];
    expect(matchPlanIngredient("Trứng", ingredients)).toBe("trứng");
    expect(matchPlanIngredient("durian", ingredients)).toBeNull();

    const filled = selectLibraryNotes({ notes: [{ id: "protein-with-food", food: "trứng" }] }, ingredients, "vi");
    expect(filled).toEqual({ ok: true, notes: ["Dùng trứng đã nấu chín như món đạm trong ngày."] });

    const rejected = selectLibraryNotes(
      { notes: [{ id: "protein-with-food", food: "sầu riêng" }, { id: "hydration-steady" }] },
      ingredients,
      "vi"
    );
    expect(rejected).toEqual({ ok: true, notes: ["Uống đủ nước trong ngày."] });
  });

  it("keeps a food slot only when the plan has a food allowed for that topic", () => {
    const iron = selectLibraryNotes({ notes: [{ id: "iron-with-food", food: "thịt bò" }] }, ["bún", "thịt bò"], "vi");
    expect(iron.ok).toBe(true);
    if (iron.ok) expect(iron.notes[0]).toContain("thịt bò");

    expect(selectLibraryNotes({ notes: [{ id: "iron-with-food", food: "bún" }] }, ["bún", "thịt bò"], "vi")).toEqual({
      ok: false,
      detail: "no_valid_notes"
    });
    expect(selectLibraryNotes({ notes: [{ id: "iron-with-food", food: "bún" }, { id: "hydration-steady" }] }, ["bún"], "vi")).toEqual({
      ok: true,
      notes: ["Uống đủ nước trong ngày."]
    });
    expect(selectLibraryNotes({ notes: [{ id: "gdm-pair-food", food: "bún" }] }, ["bún", "yến mạch"], "vi")).toEqual({
      ok: false,
      detail: "no_valid_notes"
    });
    const paired = selectLibraryNotes({ notes: [{ id: "gdm-pair-food", food: "yến mạch" }] }, ["bún", "yến mạch"], "vi");
    expect(paired.ok).toBe(true);
  });

  it("treats two foods or free text as no note", () => {
    expect(selectLibraryNotes({ notes: [{ id: "protein-with-food", food: "trứng" }, { id: "iron-with-food", food: "rau cải" }] }, ["trứng", "rau cải"], "vi")).toEqual({
      ok: false,
      detail: "invalid_notes"
    });
    expect(selectLibraryNotes({ specialNotes: ["Drink water through the day."] }, [], "en")).toEqual({
      ok: false,
      detail: "invalid_notes"
    });
    expect(selectLibraryNotes({ notes: [] }, [], "en")).toEqual({ ok: false, detail: "no_valid_notes" });
    expect(selectLibraryNotes({ notes: [{ id: "missing" }] }, [], "en")).toEqual({ ok: false, detail: "no_valid_notes" });
  });
});
