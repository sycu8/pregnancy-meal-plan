import { AlertTriangle, ShieldCheck } from "lucide-react";
import { LOCAL_PRIVACY_NOTICE, MEDICAL_DISCLAIMER } from "@/lib/nutrition/safetyRules";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const english = {
  medicalTitle: "Safety note",
  privacyTitle: "Free-version privacy",
  medical:
    "This meal plan is generated automatically from the information you provide and is for reference only. The app does not diagnose, treat or replace advice from an obstetrician or registered dietitian. If you have gestational diabetes, hypertension, preeclampsia risk, severe anemia, fetal growth concerns or any medical issue, ask your clinician before following the plan.",
  privacy:
    "In this free early version, your information is stored in this browser with localStorage. The app does not sync your profile to a server."
};

export function Disclaimer({ privacy = false, className, locale = "vi" }: { privacy?: boolean; className?: string; locale?: Locale }) {
  const title = locale === "vi" ? (privacy ? "Quyền riêng tư bản miễn phí" : "Lưu ý an toàn") : privacy ? english.privacyTitle : english.medicalTitle;
  const body = locale === "vi" ? (privacy ? LOCAL_PRIVACY_NOTICE : MEDICAL_DISCLAIMER) : privacy ? english.privacy : english.medical;

  return (
    <div className={cn("rounded-lg border border-border bg-white/75 p-4 text-sm leading-6 text-muted-foreground", className)}>
      <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
        {privacy ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {title}
      </div>
      <p>{body}</p>
    </div>
  );
}
