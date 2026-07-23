import { buildLlmsTxt } from "@/lib/llmsTxt";

export const revalidate = 3600;

export async function GET() {
  const body = await buildLlmsTxt({ full: true });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
