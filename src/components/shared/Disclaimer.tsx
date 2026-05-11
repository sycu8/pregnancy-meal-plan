import { AlertTriangle, ShieldCheck } from "lucide-react";
import { LOCAL_PRIVACY_NOTICE, MEDICAL_DISCLAIMER } from "@/lib/nutrition/safetyRules";
import { cn } from "@/lib/utils";

export function Disclaimer({ privacy = false, className }: { privacy?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-white/75 p-4 text-sm leading-6 text-muted-foreground", className)}>
      <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
        {privacy ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {privacy ? "Quyền riêng tư bản miễn phí" : "Lưu ý an toàn"}
      </div>
      <p>{privacy ? LOCAL_PRIVACY_NOTICE : MEDICAL_DISCLAIMER}</p>
    </div>
  );
}
