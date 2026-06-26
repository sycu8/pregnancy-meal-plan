"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { getNutritionLabels } from "@/lib/nutrition/labels";
import { fetchMealPlan } from "@/lib/nutrition/fetchMealPlan";
import { pregnancyProfileSchema, validationErrorToLocale } from "@/lib/nutrition/validation";
import { saveMealPlan, saveProfile, getProfile } from "@/lib/storage/localStorage";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { CuisinePreference, HealthCondition, NutritionGoal, PregnancyProfile } from "@/types/pregnancy";

const defaultProfile: PregnancyProfile = {
  pregnancyWeek: 20,
  pregnancyType: "singleton",
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 57,
  activityLevel: "light",
  healthConditions: ["none"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

const copy = {
  vi: {
    steps: ["Thai kỳ", "Thông tin mẹ", "Sức khỏe", "Khẩu vị", "Ngân sách"],
    progress: "Bước",
    pregnancyInfo: "Thông tin thai kỳ",
    pregnancyWeek: "Tuần thai hiện tại",
    pregnancyType: "Mang thai",
    singleton: "Một thai",
    twins: "Song thai",
    fetalWeight: "Cân nặng ước tính của thai nhi (gram, nếu có)",
    doctorNote: "Ghi chú từ bác sĩ nếu có",
    motherInfo: "Thông tin của mẹ",
    age: "Tuổi",
    height: "Chiều cao (cm)",
    preWeight: "Cân nặng trước mang thai (kg)",
    currentWeight: "Cân nặng hiện tại (kg)",
    activity: "Mức độ vận động",
    health: "Tình trạng sức khỏe",
    taste: "Khẩu vị",
    allergies: "Dị ứng thực phẩm",
    dislikedFoods: "Món không thích",
    budgetTime: "Ngân sách và thời gian nấu",
    budget: "Ngân sách",
    cookingTime: "Thời gian nấu",
    goals: "Mục tiêu",
    saved: "Đã lưu hồ sơ trên trình duyệt này.",
    back: "Quay lại",
    next: "Tiếp tục",
    loading: "Đang tạo thực đơn...",
    saveProfile: "Lưu hồ sơ",
    submit: "Tạo thực đơn miễn phí"
  },
  en: {
    steps: ["Pregnancy", "About you", "Health", "Taste", "Budget"],
    progress: "Step",
    pregnancyInfo: "Pregnancy information",
    pregnancyWeek: "Current pregnancy week",
    pregnancyType: "Pregnancy type",
    singleton: "Singleton",
    twins: "Twins",
    fetalWeight: "Estimated fetal weight (grams, optional)",
    doctorNote: "Doctor's note, if any",
    motherInfo: "About the mother",
    age: "Age",
    height: "Height (cm)",
    preWeight: "Pre-pregnancy weight (kg)",
    currentWeight: "Current weight (kg)",
    activity: "Activity level",
    health: "Health concerns",
    taste: "Taste preferences",
    allergies: "Food allergies",
    dislikedFoods: "Foods you dislike",
    budgetTime: "Budget and cooking time",
    budget: "Budget",
    cookingTime: "Cooking time",
    goals: "Goals",
    saved: "Profile saved in this browser.",
    back: "Back",
    next: "Continue",
    loading: "Creating meal plan...",
    saveProfile: "Save profile",
    submit: "Create a free plan"
  }
} as const;

export function PlannerForm({ mode = "planner", locale = "vi" }: { mode?: "planner" | "profile"; locale?: Locale }) {
  const router = useRouter();
  const labels = getNutritionLabels(locale);
  const t = copy[locale];
  const [profile, setProfile] = useState<PregnancyProfile>(defaultProfile);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const isProfileMode = mode === "profile";

  useEffect(() => {
    const stored = getProfile();
    if (stored) setProfile({ ...defaultProfile, ...stored });
  }, []);

  const progress = useMemo(() => Math.round(((step + 1) / t.steps.length) * 100), [step, t.steps.length]);

  function update<K extends keyof PregnancyProfile>(key: K, value: PregnancyProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function updateNumber(key: keyof PregnancyProfile, event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value === "" ? undefined : Number(event.target.value);
    update(key, value as never);
  }

  function toggleArrayValue<T extends HealthCondition | CuisinePreference | NutritionGoal>(
    key: "healthConditions" | "cuisinePreferences" | "goals",
    value: T
  ) {
    const current = profile[key] as T[];
    let next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    if (key === "healthConditions") {
      next = value === "none" && !current.includes(value) ? (["none"] as T[]) : next.filter((item) => item !== "none");
      if (next.length === 0) next = ["none"] as T[];
    }
    update(key, next as never);
  }

  async function handleSubmit() {
    setError("");
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    try {
      const validProfile = pregnancyProfileSchema.parse(profile);
      saveProfile(validProfile);

      if (isProfileMode) {
        setSaved(true);
        return;
      }

      const plan = await fetchMealPlan(validProfile, locale);
      saveMealPlan(plan);
      router.push(localizedPath(locale, "/result"));
    } catch (caught) {
      setError(validationErrorToLocale(caught, locale));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 rounded-lg border border-border bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between text-sm font-medium">
          <span>
            {t.progress} {step + 1}/{t.steps.length}: {t.steps[step]}
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-soft md:p-7">
        {step === 0 && (
          <Step title={t.pregnancyInfo}>
            <NumberField label={t.pregnancyWeek} value={profile.pregnancyWeek} min={1} max={40} onChange={(event) => updateNumber("pregnancyWeek", event)} />
            <SelectField
              label={t.pregnancyType}
              value={profile.pregnancyType}
              onChange={(value) => update("pregnancyType", value as PregnancyProfile["pregnancyType"])}
              options={[
                ["singleton", t.singleton],
                ["twins", t.twins]
              ]}
            />
            <NumberField label={t.fetalWeight} value={profile.fetalWeightGram ?? ""} onChange={(event) => updateNumber("fetalWeightGram", event)} />
            <TextArea label={t.doctorNote} value={profile.doctorNote ?? ""} onChange={(event) => update("doctorNote", event.target.value)} />
          </Step>
        )}

        {step === 1 && (
          <Step title={t.motherInfo}>
            <NumberField label={t.age} value={profile.age ?? ""} onChange={(event) => updateNumber("age", event)} />
            <NumberField label={t.height} value={profile.heightCm} min={120} max={220} onChange={(event) => updateNumber("heightCm", event)} />
            <NumberField label={t.preWeight} value={profile.prePregnancyWeightKg} min={30} max={200} onChange={(event) => updateNumber("prePregnancyWeightKg", event)} />
            <NumberField label={t.currentWeight} value={profile.currentWeightKg} min={30} max={220} onChange={(event) => updateNumber("currentWeightKg", event)} />
            <SelectField label={t.activity} value={profile.activityLevel} onChange={(value) => update("activityLevel", value as PregnancyProfile["activityLevel"])} options={Object.entries(labels.activityLabels)} />
          </Step>
        )}

        {step === 2 && (
          <Step title={t.health}>
            <ChipGrid
              values={Object.entries(labels.healthConditionLabels)}
              selected={profile.healthConditions}
              onToggle={(value) => toggleArrayValue("healthConditions", value as HealthCondition)}
            />
          </Step>
        )}

        {step === 3 && (
          <Step title={t.taste}>
            <ChipGrid
              values={Object.entries(labels.cuisinePreferenceLabels)}
              selected={profile.cuisinePreferences}
              onToggle={(value) => toggleArrayValue("cuisinePreferences", value as CuisinePreference)}
            />
            <TextField label={t.allergies} value={profile.allergies ?? ""} onChange={(event) => update("allergies", event.target.value)} />
            <TextField label={t.dislikedFoods} value={profile.dislikedFoods ?? ""} onChange={(event) => update("dislikedFoods", event.target.value)} />
          </Step>
        )}

        {step === 4 && (
          <Step title={t.budgetTime}>
            <SelectField label={t.budget} value={profile.budget} onChange={(value) => update("budget", value as PregnancyProfile["budget"])} options={Object.entries(labels.budgetLabels)} />
            <SelectField label={t.cookingTime} value={profile.cookingTime} onChange={(value) => update("cookingTime", value as PregnancyProfile["cookingTime"])} options={Object.entries(labels.cookingTimeLabels)} />
            <div>
              <label className="mb-2 block text-sm font-medium">{t.goals}</label>
              <ChipGrid values={Object.entries(labels.nutritionGoalLabels)} selected={profile.goals} onToggle={(value) => toggleArrayValue("goals", value as NutritionGoal)} />
            </div>
          </Step>
        )}

        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {saved && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{t.saved}</p>}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="secondary" disabled={step === 0 || isLoading} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            <ArrowLeft className="h-4 w-4" /> {t.back}
          </Button>
          {step < t.steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => Math.min(t.steps.length - 1, current + 1))}>
              {t.next} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isProfileMode ? <Save className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {isLoading ? t.loading : isProfileMode ? t.saveProfile : t.submit}
            </Button>
          )}
        </div>
      </div>

      <Disclaimer locale={locale} className="mt-5" />
      <Disclaimer locale={locale} privacy className="mt-3" />
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </section>
  );
}

function baseInputClass() {
  return "mt-2 w-full rounded-md border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
}

function NumberField(props: { label: string; value: number | string; min?: number; max?: number; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <input type="number" value={props.value} min={props.min} max={props.max} onChange={props.onChange} className={baseInputClass()} />
    </label>
  );
}

function TextField(props: { label: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <input value={props.value} onChange={props.onChange} className={baseInputClass()} />
    </label>
  );
}

function TextArea(props: { label: string; value: string; onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <textarea value={props.value} onChange={props.onChange} rows={3} className={baseInputClass()} />
    </label>
  );
}

function SelectField(props: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <select value={props.value} onChange={(event) => props.onChange(event.target.value)} className={baseInputClass()}>
        {props.options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChipGrid<T extends string>({ values, selected, onToggle }: { values: [T, string][]; selected: readonly string[]; onToggle: (value: T) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {values.map(([value, label]) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`rounded-md border px-3 py-3 text-left text-sm transition ${
              active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-white hover:bg-muted"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
