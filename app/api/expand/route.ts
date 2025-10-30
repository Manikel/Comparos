import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Expand vague product inputs into structured shopping specs." },
      { role: "user", content: `
Return JSON with fields: {fullName, brand, model, category, keywords[]}.
Input: "${query}"
` }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const text = completion.choices[0].message.content || "{}";
  return NextResponse.json(JSON.parse(text));
}