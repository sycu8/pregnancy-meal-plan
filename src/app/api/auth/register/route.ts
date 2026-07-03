import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { findOrCreateUserByEmail } from "@/lib/auth/user";

const bodySchema = z.object({
  email: z.string().email(),
  locale: z.enum(["vi", "en"]).optional()
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const user = await findOrCreateUserByEmail(body.email, body.locale ?? "vi");
    const token = await createSession(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        locale: user.locale,
        premium: user.premium
      }
    });
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
