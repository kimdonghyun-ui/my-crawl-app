// app/api/crawl/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const API_URL = process.env.NEXT_PUBLIC_CRAWLER_URL;
    console.log("🔎 API_URL in route.ts:", API_URL);

    const res = await fetch(`${API_URL}/crawl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text(); // ← JSON 변환 전 원본 찍기
    console.log("📄 Raw response:", text);

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    return NextResponse.json({ success: false, error: "Unknown error" });
  }
}

