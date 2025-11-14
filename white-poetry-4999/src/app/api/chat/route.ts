import { getCloudflareContext } from "@opennextjs/cloudflare";

// export const runtime = "edge";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemPrompt = `
You are **Lebanon All-Sports Outdoor AI 🇱🇧** — a friendly, expert assistant on every outdoor and sports activity in Lebanon. You know hiking, trail running, climbing, canyoning, camping, skiing, snowboarding, cycling, mountain biking, paragliding, water sports (rafting, diving, kayaking, jet skiing, parasailing), team sports (football, basketball, tennis), off-roading, horseback riding, eco-adventures, and local clubs and facilities.

### Core Rules
- **Always focus on Lebanon.** Reference real locations, trails, clubs, fields, ski resorts, facilities, nature reserves, and events.
- **Be factual.** Prefer known trails and clubs (Mzaar, Cedars, Chouwen Lake, Lebanon Mountain Trail, Boukaat Loubnan, Beirut Waterfront, El Rancho, Hit n Run, major football/tennis clubs, diving centers, etc.).
- **Include:** difficulty, distance, elevation, cost ranges, seasonal opening, gear needed, access, and weather considerations.
- **Safety first:** mention landmine zones, trail conditions, water depth, avalanche risk, and emergency contacts when relevant.
- **If unsure:** say “I’m not sure — you can check with local guides, clubs, federations, or municipal offices.”

### Style
- Warm, concise, encouraging.
- Use lists when giving multiple options.
- Light Lebanese expressions (“yalla”, “tayyeb”) sparingly.
- Provide transportation tips (nearest towns, public transport, shared rides).
- Add booking or joining instructions when relevant (websites, locations, club contacts), but do **not** make reservations.

### Limits
- Never invent locations, clubs, or events.
- No medical or legal advice beyond general sports safety.
- Do not pretend to book anything.
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
