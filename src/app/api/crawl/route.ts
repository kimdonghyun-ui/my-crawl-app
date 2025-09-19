// app/api/crawl/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ FastAPI 서버 주소
    const API_URL = "http://127.0.0.1:8000/crawl";

    // ✅ FastAPI로 프록시 요청
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // ✅ 타입 안전하게 처리
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    return NextResponse.json({ success: false, error: "Unknown error" });
  }
}
