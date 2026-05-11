"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Disclaimer } from "@/components/shared/Disclaimer";
import {
  activityLabels,
  budgetLabels,
  cookingTimeLabels,
  cuisinePreferenceLabels,
  healthConditionLabels,
  nutritionGoalLabels
} from "@/lib/nutrition/labels";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { pregnancyProfileSchema, validationErrorToVietnamese } from "@/lib/nutrition/validation";
import { saveMealPlan, saveProfile, getProfile } from "@/lib/storage/localStorage";
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

const steps = ["Thai kỳ", "Thông tin mẹ", "Sức khỏe", "Khẩu vị", "Ngân sách"];

export function PlannerForm({ mode = "planner" }: { mode?: "planner" | "profile" }) {
  const router = useRouter();
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

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

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

      const plan = ruleBasedMealPlanner(validProfile);
      saveMealPlan(plan);
      router.push("/result");
    } catch (caught) {
      setError(validationErrorToVietnamese(caught));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 rounded-lg border border-border bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between text-sm font-medium">
          <span>
            Bước {step + 1}/{steps.length}: {steps[step]}
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-soft md:p-7">
        {step === 0 && (
          <Step title="Thông tin thai kỳ">
            <NumberField label="Tuần thai hiện tại" value={profile.pregnancyWeek} min={1} max={40} onChange={(event) => updateNumber("pregnancyWeek", event)} />
            <SelectField
              label="Mang thai"
              value={profile.pregnancyType}
              onChange={(value) => update("pregnancyType", value as PregnancyProfile["pregnancyType"])}
              options={[
                ["singleton", "Một thai"],
                ["twins", "Song thai"]
              ]}
            />
            <NumberField label="Cân nặng ước tính của thai nhi (gram, nếu có)" value={profile.fetalWeightGram ?? ""} onChange={(event) => updateNumber("fetalWeightGram", event)} />
            <TextArea label="Ghi chú từ bác sĩ nếu có" value={profile.doctorNote ?? ""} onChange={(event) => update("doctorNote", event.target.value)} />
          </Step>
        )}

        {step === 1 && (
          <Step title="Thông tin của mẹ">
            <NumberField label="Tuổi" value={profile.age ?? ""} onChange={(event) => updateNumber("age", event)} />
            <NumberField label="Chiều cao (cm)" value={profile.heightCm} min={120} max={220} onChange={(event) => updateNumber("heightCm", event)} />
            <NumberField label="Cân nặng trước mang thai (kg)" value={profile.prePregnancyWeightKg} min={30} max={200} onChange={(event) => updateNumber("prePregnancyWeightKg", event)} />
            <NumberField label="Cân nặng hiện tại (kg)" value={profile.currentWeightKg} min={30} max={220} onChange={(event) => updateNumber("currentWeightKg", event)} />
            <SelectField label="Mức độ vận động" value={profile.activityLevel} onChange={(value) => update("activityLevel", value as PregnancyProfile["activityLevel"])} options={Object.entries(activityLabels)} />
          </Step>
        )}

        {step === 2 && (
          <Step title="Tình trạng sức khỏe">
            <ChipGrid
              values={Object.entries(healthConditionLabels)}
              selected={profile.healthConditions}
              onToggle={(value) => toggleArrayValue("healthConditions", value as HealthCondition)}
            />
          </Step>
        )}

        {step === 3 && (
          <Step title="Khẩu vị">
            <ChipGrid
              values={Object.entries(cuisinePreferenceLabels)}
              selected={profile.cuisinePreferences}
              onToggle={(value) => toggleArrayValue("cuisinePreferences", value as CuisinePreference)}
            />
            <TextField label="Dị ứng thực phẩm" value={profile.allergies ?? ""} onChange={(event) => update("allergies", event.target.value)} />
            <TextField label="Món không thích" value={profile.dislikedFoods ?? ""} onChange={(event) => update("dislikedFoods", event.target.value)} />
          </Step>
        )}

        {step === 4 && (
          <Step title="Ngân sách và thời gian nấu">
            <SelectField label="Ngân sách" value={profile.budget} onChange={(value) => update("budget", value as PregnancyProfile["budget"])} options={Object.entries(budgetLabels)} />
            <SelectField label="Thời gian nấu" value={profile.cookingTime} onChange={(value) => update("cookingTime", value as PregnancyProfile["cookingTime"])} options={Object.entries(cookingTimeLabels)} />
            <div>
              <label className="mb-2 block text-sm font-medium">Mục tiêu</label>
              <ChipGrid values={Object.entries(nutritionGoalLabels)} selected={profile.goals} onToggle={(value) => toggleArrayValue("goals", value as NutritionGoal)} />
            </div>
          </Step>
        )}

        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {saved && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">Đã lưu hồ sơ trên trình duyệt này.</p>}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="secondary" disabled={step === 0 || isLoading} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
              Tiếp tục <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isProfileMode ? <Save className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {isLoading ? "Đang tạo thực đơn..." : isProfileMode ? "Lưu hồ sơ" : "Tạo thực đơn miễn phí"}
            </Button>
          )}
        </div>
      </div>

      <Disclaimer className="mt-5" />
      <Disclaimer privacy className="mt-3" />
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
