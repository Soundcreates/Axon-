import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // forward an SSE request to backend with any query/body you want
  const backend = "http://localhost:8000/assistant/stream";
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: req.nextUrl.searchParams.get("text") || "" })
  };
  const r = await fetch(backend, init);
  const readable = r.body as ReadableStream;
  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" }
  });
}

// helper endpoint the panel uses
export async function HEAD() { return new Response("OK"); }
