"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/app/api/chat/route";

export default function Chat() {
  const [chatId, setChatId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Optimistic user message
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          userMessage: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data: {
        chatId: string;
        reply: string;
        history: ChatMessage[];
      } = await res.json();

      if (data.chatId && data.chatId !== chatId) {
        setChatId(data.chatId);
      }

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      // Optional: show error message as assistant bubble
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while contacting the AI. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-2xl mx-auto mt-6 mb-6 bg-gradient-to-br from-white via-red-50 to-green-50 border border-red-200 rounded-2xl shadow-2xl">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-500 via-white to-green-500 rounded-t-2xl animate-headerFade flex flex-col items-center text-center shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl drop-shadow-sm">🇱🇧</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
          Lebanon Outdoor Sports AI
        </h1>
      </div>

      {/* Chat messages (scrollable only here) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[radial-gradient(circle_at_top,_rgba(0,80,0,0.08),_transparent_60%)]">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Ask anything about outdoor sports in Lebanon...
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-lg text-sm animate-msgFade ${
                m.role === "user"
                  ? "bg-[#d11f1f] text-white"
                  : "bg-white border border-gray-300 text-gray-800"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm leading-relaxed"
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <textarea
          className="w-full resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d11f1f]"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#d11f1f] text-white disabled:opacity-60 hover:bg-[#b01a1a] transition transform hover:scale-[1.05] active:scale-[0.95]"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-headerFade {
          animation: headerFade 0.8s ease-out forwards;
        }

        @keyframes msgFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-msgFade {
          animation: msgFade 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
}