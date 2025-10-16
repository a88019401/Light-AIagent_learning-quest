// src/components/AIChatInline.tsx
import { useEffect, useRef, useState } from "react";
import { chat, type ChatMessage } from "../lib/openaiClient";

export default function AIChatInline({
  systemPrompt,
  starter,
  onTranscript,
  onAssistant,
  className = "h-[420px]", // 預設高度，可由外部覆寫
}: {
  systemPrompt: string;
  starter?: string;
  onTranscript?: (messages: ChatMessage[]) => void;
  onAssistant?: (replyText: string, messages: ChatMessage[]) => void;
  className?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: systemPrompt },
    ...(starter ? ([{ role: "assistant", content: starter }] as ChatMessage[]) : []),
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const viewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || busy) return;
    const next = [...messages, { role: "user", content: input.trim() } as ChatMessage];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const reply = await chat(next, null);
      const next2 = [...next, { role: "assistant", content: reply } as ChatMessage];
      setMessages(next2);
      onTranscript?.(next2);
      onAssistant?.(reply, next2);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-2xl border bg-white flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center gap-2">
        <span className="text-sm text-neutral-600">AI 對話</span>
      </div>

      {/* Messages (fills remaining space) */}
      <div
        ref={viewRef}
        className="flex-1 min-h-0 overflow-auto px-3 py-2 space-y-2 bg-neutral-50"
      >
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              className={m.role === "assistant" ? "text-neutral-900" : "text-neutral-700"}
            >
              <div
                className={`inline-block px-3 py-2 rounded-2xl border ${
                  m.role === "assistant" ? "bg-white" : "bg-sky-50 border-sky-200"
                }`}
              >
                <div className="text-xs whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
      </div>

      {/* Input row (sticks to bottom) */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="輸入訊息…"
          className="flex-1 px-3 py-2 rounded-xl border"
        />
        <button
          onClick={send}
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm disabled:opacity-50"
        >
          發送
        </button>
      </div>
    </div>
  );
}
