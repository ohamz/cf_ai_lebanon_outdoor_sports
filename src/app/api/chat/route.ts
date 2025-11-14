import { getCloudflareContext } from "@opennextjs/cloudflare";

// export const runtime = "edge";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemPrompt = `
You are *Lebanon All-Sports Outdoor AI* 🇱🇧 — a concise, expert guide for outdoor activities, trails, sports clubs, and adventures across Lebanon.

## ✦ Response Style
- **Always answer in clean, well-structured Markdown.**
- Prefer short sections and bold labels.
- Keep answers practical and well-structured.
- Use short sections by default, **but when the user asks for “more”, “details”, “explain”, or similar, provide richer information (1–3 short paragraphs + bullet points)**.
- Always format answers in clean Markdown.
- Include Lebanese expressions lightly (“yalla”, “tayyeb”, "habibi") only when natural.

## ✦ Lebanese Context Rules
Always adapt recommendations to:
- Lebanese geography (Mzaar, Cedars, Chouwen, LMT, etc.)
- Real clubs, fields, ski resorts, hiking areas, and terrain
- Seasonal conditions (snow, heat, closures)
- Difficulty, distance, gear, safety, pricing (rough or ranges only)
- Accessibility and transport options when relevant

## ✦ Safety + Reliability
- Mention safety when important (weather, landmines, steep trails).
- If something is uncertain, say: “I'm not fully sure — better check with local guides or clubs.”
- Never invent fake locations or clubs.

## ✦ What You Are
- Friendly, clear, practical
- A Lebanese outdoor sports expert
- Not a booking agent, doctor, or legal advisor

Make every answer in Markdown format.
`;


export async function POST(req: Request): Promise<Response> {
  try {
    const ctx = getCloudflareContext();
    const env = (ctx?.env as unknown) as {
      AI: {
        run: (
          model: string,
          options: { messages: { role: string; content: string }[] }
        ) => Promise<{ response: string }>;
      };
      CHAT_HISTORY?: KVNamespace;
    };

    if (!env) {
      return new Response("Missing Cloudflare context bindings.", {
        status: 500,
      });
    }

    const body = (await req.json()) as { chatId?: string; userMessage?: string };
    const chatId: string =
      body.chatId || crypto.randomUUID();
    const userMessage: string = body.userMessage ?? "";

    if (!userMessage) {
      return new Response("Missing userMessage", { status: 400 });
    }

    // Load existing chat history from KV
    const historyRaw = await env.CHAT_HISTORY!.get(chatId);
    const history: ChatMessage[] = historyRaw ? JSON.parse(historyRaw) : [];

    // Add the new user message
    history.push({ role: "user", content: userMessage });

    // Convert history to model format
    const modelMessages = [
		{ role: "system", content: systemPrompt },
		...history.map((m) => ({
		  role: m.role,
		  content: m.content,
		}))
	];

    // Call Workers AI (Llama 3.3)
    const result = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: modelMessages,
      }
    );

    const assistantReply =
      typeof result.response === "string"
        ? result.response
        : "";

    // Append assistant message to history
    history.push({
      role: "assistant",
      content: assistantReply,
    });

    // Save back to KV
    await env.CHAT_HISTORY!.put(chatId, JSON.stringify(history));

    // Respond to frontend
    return new Response(
      JSON.stringify({
        chatId,
        reply: assistantReply,
        history,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
	} catch (err) {
		console.error("🔥 API ERROR:", err);
	
		return new Response(
		JSON.stringify({
			error: "Chat API error",
			details: err instanceof Error ? err.message : String(err),
			stack: err instanceof Error ? err.stack : undefined
		}),
		{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
