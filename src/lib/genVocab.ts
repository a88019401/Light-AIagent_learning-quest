// src/lib/genVocab.ts
export type Word = { term: string; def: string };

type GenVocabParams = {
  topic: string;   // 使用者目標主題，如 "daily routines"
  count: number;   // 要幾個（例如 12）
  level?: "A1" | "A2" | "B1" | "B2";
  locale?: "zh-TW" | "zh-CN";
};

// 開發用途可直接前端呼叫（⚠️ 不要把金鑰上傳到正式環境或公開 repo）
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

export async function generateVocabWithAI({
  topic,
  count,
  level = "A2",
  locale = "zh-TW",
}: GenVocabParams): Promise<Word[]> {
  if (!API_KEY) throw new Error("Missing VITE_OPENAI_API_KEY");

  const sys = `
你是英語教學設計師。請根據主題與程度，產生 ${count} 個實用單字，輸出 JSON。
每個詞提供英文 term 與${locale === "zh-CN" ? "简体中文" : "繁體中文"}簡潔釋義（10~20字）。
避免過度專有或冷僻詞；以生活化、可搭配簡單句型的詞為主。`.trim();

  const user = `
主題: ${topic}
程度: ${level}
輸出格式(JSON 物件)：{ "words": [ { "term": "xxx", "def": "中文定義" }, ... ] }
數量：精準 ${count} 筆。`.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as { words?: Word[] };

  const words = Array.isArray(parsed.words) ? parsed.words : [];
  // 去重、截斷保險
  const uniq = Array.from(
    new Map(words.map(w => [w.term.toLowerCase(), w])).values()
  );
  return uniq.slice(0, count).map(w => ({ term: w.term.trim(), def: w.def.trim() }));
}
