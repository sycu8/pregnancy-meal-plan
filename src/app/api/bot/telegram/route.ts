import { NextResponse } from "next/server";
import { z } from "zod";
import { pregnancyProfileSchema } from "@/lib/nutrition/validation";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";

const updateSchema = z.object({
  message: z.object({
    text: z.string().optional(),
    chat: z.object({ id: z.number() }).optional()
  })
});

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_BOT_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = updateSchema.parse(await request.json());
    const text = payload.message.text?.trim() ?? "";
    const chatId = payload.message.chat?.id;

    if (!chatId) return NextResponse.json({ ok: true });

    if (text.startsWith("/start")) {
      await sendTelegram(chatId, "Chào bạn! Gửi /plan 20 để tạo thực đơn tham khảo cho tuần thai 20.\n\nTham khảo only — hỏi bác sĩ trước khi áp dụng.");
      return NextResponse.json({ ok: true });
    }

    const match = text.match(/^\/plan\s+(\d{1,2})/i);
    if (match) {
      const week = Math.min(40, Math.max(1, Number(match[1])));
      const profile = pregnancyProfileSchema.parse({
        lifeStage: "pregnancy",
        pregnancyWeek: week,
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
      });

      const plan = ruleBasedMealPlanner(profile, "vi");
      const day1 = plan.days[0];
      const reply = [
        `Thực đơn tham khảo tuần ${week} (ngày 1):`,
        `Sáng: ${day1.breakfast.name}`,
        `Trưa: ${day1.lunch.name}`,
        `Tối: ${day1.dinner.name}`,
        "",
        "Xem đầy đủ: https://mebauangi.info/planner"
      ].join("\n");

      await sendTelegram(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    await sendTelegram(chatId, "Lệnh hỗ trợ: /plan 20 (tuần thai 1-40)");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

async function sendTelegram(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
