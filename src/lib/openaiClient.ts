// src/lib/openaiClient.ts
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = (import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini").trim();

/**
 * 單次聊天（非串流）
 * - 會優先讀 .env 的 VITE_OPENAI_API_KEY
 * - 沒金鑰或呼叫失敗 → 回傳模擬訊息（含 JSON 區塊），方便 demo
 */
export async function chat(
  messages: ChatMessage[],
  apiKeyOverride: string | null = null
): Promise<string> {
  const apiKey = (apiKeyOverride ?? import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();
  const model = DEFAULT_MODEL;

  // 無金鑰 → 直接回傳模擬
  if (!apiKey) return mockReply(messages);

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.5,
      }),
    });

    if (!r.ok) {
      // 出錯也回模擬（不讓 UI 卡住）
      console.warn("[openai] http error:", r.status, await safeText(r));
      return mockReply(messages);
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return text || mockReply(messages);
  } catch (err) {
    console.error("[openai] fetch error:", err);
    return mockReply(messages);
  }
}

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ""; }
}

/** 無金鑰 / 失敗時的本地模擬回覆（符合 SRLCycle 的 JSON 解析格式） */
function mockReply(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const topicGuess = pickTopic(lastUser);
  const count = pickCount(lastUser) ?? 12;
  const confidence = 3;

  const bank = [
    { term: "friend", def: "朋友" },
    { term: "fight", def: "打鬥；奮鬥" },
    { term: "danger", def: "危險" },
    { term: "promise", def: "承諾" },
    { term: "dream", def: "夢想；夢" },
    { term: "job", def: "工作" },
    { term: "power", def: "力量；能力" },
    { term: "heart", def: "心；內心" },
    { term: "help", def: "幫助" },
    { term: "save", def: "拯救；節省" },
    { term: "team", def: "團隊" },
    { term: "boss", def: "老闆；頭目" },
    { term: "fear", def: "恐懼" },
    { term: "smile", def: "微笑" },
    { term: "hurt", def: "傷害" },
    { term: "hope", def: "希望" },
    { term: "risk", def: "風險" },
    { term: "rule", def: "規則" },
    { term: "secret", def: "祕密" },
    { term: "plan", def: "計畫" },
  ];

  const vocab = Array.from({ length: count }, (_, i) => bank[i % bank.length]);

  const json = {
    topic: topicGuess,
    count,
    confidence,
    strategy: [
      "字卡快掃 2 輪（每輪 2–3 分鐘）",
      "開啟朗讀，跟讀每字 10 次並自我錄音檢核",
      "玩貪吃蛇 1 輪，錯字加入複習清單",
      "最後用錯字清單再做 1 輪復盤",
    ],
    vocab,
  };

  // 直接只輸出 JSON 區塊，讓 SRLCycle 可自動帶入
  return "```json\n" + JSON.stringify(json, null, 2) + "\n```";
}

function pickTopic(text: string): string {
  const t = text.trim();
  if (!t) return "daily life";
  // 粗略清理
  return t.slice(0, 80).replace(/\s+/g, " ");
}

function pickCount(text: string): number | null {
  const m = text.match(/(\d{1,2})\s*個?/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (Number.isFinite(n) && n > 0 && n <= 78) return n;
  return null;
}
