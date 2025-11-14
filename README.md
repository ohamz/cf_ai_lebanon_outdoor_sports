# Lebanon Outdoor Sports AI 🇱🇧  
Live: https://ai.lebanon-outdoor-sports.workers.dev/

An AI chatbot that helps users discover outdoor activities, trails, clubs, and adventures across Lebanon — powered by **Cloudflare Workers**, **Workers AI (Llama 3.3)**, **KV memory**, and a **Next.js UI** deployed through **Cloudflare Pages**.

---

## 🚀 Features
- Llama 3.3 chatbot with Lebanese sports/outdoor expertise  
- Conversation memory stored in Cloudflare KV  
- Clean, animated chat interface  
- Lebanese color palette and simple UX  
- Fully deployed on Cloudflare's global edge  

---

## 🧱 Project Structure
```
src/
  app/api/chat/route.ts   → Backend Worker (AI + memory)
  app/page.tsx            → Chat page
  components/chat/Chat.tsx
wrangler.jsonc            → Worker + KV config
cloudflare-env.d.ts       → Type bindings
open-next.config.ts       → OpenNext build config
```

---

## 💬 How It Works
1. Frontend sends message → `/api/chat`
2. Worker loads memory from KV
3. Worker builds system prompt
4. Calls Workers AI (Llama 3.3)
5. Saves updated memory → KV
6. Returns assistant message to UI

---

## 🙌 Author
Made by **Omar Hammoud**.