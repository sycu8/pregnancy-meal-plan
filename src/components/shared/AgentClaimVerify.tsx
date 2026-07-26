"use client";

import { useEffect, useState, type FormEvent } from "react";

const copy = {
  en: {
    title: "Agent claim verification",
    hint: "If an AI agent asked you to confirm ownership, enter the code shown by the agent.",
    code: "User code",
    email: "Email",
    submit: "Confirm ownership",
    success: "Claim verified. You can return to your agent.",
    error: "Could not verify this code. Check the code and try again."
  },
  vi: {
    title: "Xác nhận quyền sở hữu agent",
    hint: "Nếu một AI agent yêu cầu bạn xác nhận, hãy nhập mã mà agent đã hiển thị.",
    code: "Mã xác nhận",
    email: "Email",
    submit: "Xác nhận",
    success: "Đã xác nhận. Bạn có thể quay lại agent.",
    error: "Không xác minh được mã này. Kiểm tra lại và thử lại."
  }
} as const;

export function AgentClaimVerify({ locale }: { locale: "en" | "vi" }) {
  const t = copy[locale];
  const [userCode, setUserCode] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserCode(params.get("user_code") ?? "");
    setEmail(params.get("email") ?? "");
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/agent/identity/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complete: true,
          user_code: userCode.trim(),
          email: email.trim() || undefined
        })
      });
      setStatus(response.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-white p-5">
      <h2 className="text-xl font-semibold">{t.title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.hint}</p>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="font-medium">{t.code}</span>
          <input
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">{t.email}</span>
          <input
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {t.submit}
        </button>
      </form>
      {status === "ok" ? <p className="mt-3 text-sm text-accent">{t.success}</p> : null}
      {status === "error" ? <p className="mt-3 text-sm text-red-600">{t.error}</p> : null}
    </section>
  );
}
