import { URGENT_NOTE_ACTION } from "@/lib/nutrition/safetyRules";
import type { Locale } from "@/lib/i18n";

/** Blocking alert shown above the meal plan when the doctor's note matches a red flag. */
export function UrgentWarningBanner({ locale, messages }: { locale: Locale; messages: string[] }) {
  if (!messages.length) return null;
  const action = URGENT_NOTE_ACTION[locale];

  return (
    <div
      role="alert"
      data-testid="urgent-warning-banner"
      className="rounded-lg border-2 border-red-800 bg-red-50 p-5 text-base leading-7 text-red-950"
    >
      {messages.map((message) => (
        <p key={message}>{emphasizeAction(message, action)}</p>
      ))}
    </div>
  );
}

function emphasizeAction(message: string, action: string) {
  const index = message.indexOf(action);
  if (index < 0) return message;
  return (
    <>
      {message.slice(0, index)}
      <strong>{action}</strong>
      {message.slice(index + action.length)}
    </>
  );
}
