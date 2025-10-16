// src/components/SRLCycle.tsx
import { useMemo, useRef, useState } from "react";
import type { UnitConfig, Word } from "../types";
import { Card, SectionTitle } from "./ui";
import AIChatInline from "./AIChatInline";
import SnakeChallenge from "./SnakeChallenge";
import { downloadJSON, withTimestamp } from "../lib/download";
import type { SnakeReport } from "./SnakeChallenge";

type Phase = "forethought" | "performance" | "reflection" | "done";

/** 從助理回覆擷取 JSON（支援 ```json 區塊或純文字 JSON） */
function pickJson(text: string): any | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const payload = fenced ? fenced[1] : text;
  const brace = payload.match(/\{[\s\S]*\}/);
  if (!brace) return null;
  try {
    return JSON.parse(brace[0]);
  } catch {
    return null;
  }
}
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.round(n)));
const letter = (i: number) => String.fromCharCode(65 + i);

export default function SRLCycle({ unit }: { unit: UnitConfig }) {
  const [phase, setPhase] = useState<Phase>("forethought");

  // Forethought（手填 + AI 自動帶入）
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(12);
  const [confidence, setConfidence] = useState<number>(4);
  const [goalNote, setGoalNote] = useState("");

  // AI 產生的單字（用於本輪）
  const [aiWords, setAiWords] = useState<Word[] | null>(null);
  // 原始 AI 詞彙（未截斷版本，方便進 JSON 保存）
  const [aiWordsRaw, setAiWordsRaw] = useState<Word[] | null>(null);

  // AI transcripts
  const [aiForethoughtTranscript, setAiForethoughtTranscript] = useState<any[]>([]);
  const [aiReflectionTranscript, setAiReflectionTranscript] = useState<any[]>([]);

  // Performance：優先使用 AI 生成詞彙，無才退回單元取樣
  const selectedWords = useMemo<Word[]>(() => {
    if (aiWords && aiWords.length) {
      return aiWords.slice(0, clamp(count, 1, 78));
    }
    const pool = unit.words ?? [];
    let filtered = topic.trim()
      ? pool.filter(
          (w) =>
            w.term.toLowerCase().includes(topic.toLowerCase()) ||
            w.def.toLowerCase().includes(topic.toLowerCase())
        )
      : pool;
    if (filtered.length === 0) filtered = pool;
    const a = [...filtered];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, Math.max(1, Math.min(count, a.length)));
  }, [aiWords, unit.words, topic, count]);

  // Flashcards（簡單版）
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);

  function speak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  // Snake 成績
  const [snakeReport, setSnakeReport] = useState<SnakeReport | null>(null);

  // Reflection
  const [reflectionText, setReflectionText] = useState("");
  const [aiReflection, setAiReflection] = useState<string>("");

  // Log（整輪）
  const startAtRef = useRef<string>(new Date().toISOString());

  function startPerformance() {
    setPhase("performance");
    setIdx(0);
    setFlip(false);
    setSnakeReport(null); // 開新輪把上次成績清掉
  }
  function toReflection() {
    setPhase("reflection");
  }

  function finishAndDownload() {
    const log = {
      project: "SRL Cycle",
      unitId: unit.id,
      unitTitle: unit.title,
      startedAt: startAtRef.current,
      endedAt: new Date().toISOString(),
      forethought: {
        topic,
        count,
        confidence,
        goalNote,
        aiTranscript: aiForethoughtTranscript,
        aiVocabRaw: aiWordsRaw,
      },
      performance: {
        source: aiWords && aiWords.length ? "ai" : "unit-fallback",
        wordList: selectedWords,
        snake: snakeReport,
      },
      reflection: {
        userReflection: reflectionText,
        aiReflection,
        aiTranscript: aiReflectionTranscript,
      },
    };
    downloadJSON(log, withTimestamp(`srl-cycle-u${unit.id}`));
    setPhase("done");
  }

  // —— 更策略導向的系統提示：最後必回 JSON，含 vocab 陣列 —— //
  const forethoughtSystemPrompt = `
你是英語學習教練，使用台灣中文，協助學生完成 SRL「Forethought」並自動產生詞彙清單（A1–C2難度）。

【流程—一次只問一件事】
1) 問「本輪想練習的單字主題」（可多個關鍵字）。
2) 問「本輪想學幾個單字」（建議 6–20；若未提供，預設 12）。
3) 問「自評信心 1–5」。
4) 根據學生回覆提出 3–5 條可執行策略（字卡→口說→小遊戲；包含錯字複習與休息節奏）。

【非常重要的規則】
- 你**不要叫學生列單字**；務必 **自行產生** 'vocab' 清單。
- 若主題是品牌/作品/遊戲/動漫（如「鏈鋸人」、「英雄聯盟」），請**映射到可教的日常主題**（例：情緒、人體、動作、安全、友情、學校、工作…），並**避開血腥與成人內容**。
- 'vocab' 內每個 term 需為 1 個英文單字（必要時可用最常見的兩詞片語），盡量用一般詞彙；**避免專有名詞**。全部小寫；不得重複。
- 'def' 使用**繁體中文（台灣用語）**，簡潔易懂。
- 'vocab' 長度 **必須等於** 'count'。學生未給 'count' 時用 12；未給 'confidence' 用 3。
- 對話最後**只輸出一次** JSON 區塊（放在 \`\`\`json 中）。除了這個 JSON，最後一回覆不要再有其他文字。

【最後輸出的 JSON 範例】
\`\`\`json
{
  "topic": "family, school",
  "count": 12,
  "confidence": 4,
  "strategy": [
    "先用字卡快速掃 2 輪（每輪 2–3 分鐘）",
    "開啟朗讀，跟讀 10 次並錄音自我檢核",
    "開始玩貪吃蛇 1 輪，錯字加到複習清單",
    "結束後用錯字清單再做 1 輪字卡複習"
  ],
  "vocab": [
    { "term": "friend", "def": "朋友" },
    { "term": "fight",  "def": "打鬥；奮鬥" }
    // …共 12 筆
  ]
}
\`\`\`
`;

  return (
    <div className="space-y-4">
      {/* Phase Switcher / HUD */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle title="SRL 循環（Forethought → Performance → Self-reflection）" />
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg border text-xs bg-white">
              階段：<b className="text-neutral-900">{phase}</b>
            </span>
            <span className="px-2 py-1 rounded-lg border text-xs bg-white">
              目標字數：<b>{count}</b>
            </span>
          </div>
        </div>
      </Card>

      {/* Forethought */}
      {phase === "forethought" && (
        <Card>
          <SectionTitle
            title="1) Forethought：訂定學習目標（AI 輔助）"
            desc="AI 收集你的目標，最後會自動填入主題/字數/信心/策略與一組練習單字。"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 人機對話 */}
            <AIChatInline
              className="h-full"   // 想要更高就改這裡；或用 h-full 讓父容器決定

              systemPrompt={forethoughtSystemPrompt}
              starter="嗨～這一輪你想練什麼主題的單字呢？（例：family、school、daily）"
              onTranscript={(msgs) => setAiForethoughtTranscript(msgs)}
              onAssistant={(replyText) => {
                const parsed = pickJson(replyText);
                if (!parsed) return;

                const t =
                  typeof parsed.topic === "string"
                    ? parsed.topic
                    : Array.isArray(parsed.topic)
                    ? parsed.topic.join(", ")
                    : "";
                const c = typeof parsed.count === "number" ? parsed.count : count;
                const cof =
                  typeof parsed.confidence === "number"
                    ? parsed.confidence
                    : confidence;
                const s = Array.isArray(parsed.strategy)
                  ? parsed.strategy.join("\n")
                  : typeof parsed.strategy === "string"
                  ? parsed.strategy
                  : goalNote;

                if (t) setTopic(t);
                if (c) setCount(clamp(c, 1, 78));
                if (cof) setConfidence(clamp(cof, 1, 5));
                if (s) setGoalNote(s);

                // 帶入 AI 產生的 vocab
                if (Array.isArray(parsed.vocab)) {
                  const cleaned: Word[] = parsed.vocab
                    .filter(
                      (x: any) =>
                        x &&
                        typeof x.term === "string" &&
                        typeof x.def === "string"
                    )
                    .map((x: any) => ({
                      term: String(x.term).trim(),
                      def: String(x.def).trim(),
                    }))
                    .filter((x: Word) => x.term && x.def);
                  if (cleaned.length) {
                    setAiWordsRaw(cleaned);
                    setAiWords(
                      cleaned.slice(0, clamp(c || cleaned.length, 1, 78))
                    );
                  }
                }
              }}
            />

            {/* 表單（明確紀錄目標） */}
            <div>
              <div className="space-y-2">
                <label className="block text-sm">主題關鍵字</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：family, school"
                  className="w-full px-3 py-2 rounded-xl border"
                />
                <label className="block text-sm">本輪字數</label>
                <input
                  type="number"
                  min={1}
                  max={78}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border"
                />
                <label className="block text-sm">信心（1~5）</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border"
                />
                <label className="block text-sm">策略（AI 會自動填入，可自行編修）</label>
                <textarea
                  value={goalNote}
                  onChange={(e) => setGoalNote(e.target.value)}
                  rows={6}
                  placeholder="例：字卡→口說→貪吃蛇；錯字加入清單再複習…"
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="mt-3 p-3 rounded-xl border bg-neutral-50">
                {aiWords && aiWords.length ? (
                  <div className="text-sm text-neutral-700">
                    本輪將由 <b>AI 產生</b> <b>{aiWords.length}</b> 個單字，已準備就緒。
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-neutral-700">
                      等待 AI 提供單字清單
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      小提醒：請完成 AI 對話（助理最後會附上 JSON），即會自動帶入單字與策略。
                    </div>
                  </>
                )}
              </div>

              {aiWords && aiWords.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-neutral-500 mb-1">AI 詞彙預覽</div>
                  <div className="max-h-40 overflow-auto rounded-xl border bg-white">
                    {aiWords.map((w, i) => (
                      <div key={i} className="px-3 py-2 text-sm border-b last:border-b-0">
                        {w.term} <span className="text-neutral-500 text-xs">— {w.def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <button
                  onClick={startPerformance}
                  disabled={!aiWords?.length}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90 disabled:opacity-50"
                >
                  開始 Performance 階段
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance */}
      {phase === "performance" && (
        <>
          {/* Flashcards */}
          <Card>
            <SectionTitle
              title="2) Performance：字卡＋口說"
              desc="點擊卡片翻面；可按『朗讀』聽單字。"
            />
            {selectedWords.length === 0 ? (
              <div className="text-sm text-neutral-600">無可用單字。</div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1 p-6 rounded-2xl border bg-white text-center">
                  <div className="text-xs text-neutral-500 mb-2">
                    第 {idx + 1} / {selectedWords.length}
                  </div>
                  <button
                    onClick={() => setFlip((f) => !f)}
                    className="w-full p-10 rounded-xl border bg-neutral-50 text-2xl"
                  >
                    {flip ? selectedWords[idx].def : selectedWords[idx].term}
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => speak(selectedWords[idx].term)}
                      className="px-3 py-1.5 rounded-xl border"
                    >
                      朗讀
                    </button>
                    <button
                      onClick={() => setFlip((f) => !f)}
                      className="px-3 py-1.5 rounded-xl border"
                    >
                      翻面
                    </button>
                    <button
                      onClick={() => setIdx((i) => Math.max(0, i - 1))}
                      className="px-3 py-1.5 rounded-xl border"
                    >
                      上一張
                    </button>
                    <button
                      onClick={() =>
                        setIdx((i) => Math.min(selectedWords.length - 1, i + 1))
                      }
                      className="px-3 py-1.5 rounded-xl border"
                    >
                      下一張
                    </button>
                  </div>
                </div>

                <div className="w-64 hidden md:block">
                  <div className="text-sm mb-2 text-neutral-600">本輪清單</div>
                  <div className="max-h-72 overflow-auto border rounded-xl">
                    {selectedWords.map((w, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 text-sm border-b ${
                          i === idx ? "bg-neutral-100" : "bg-white"
                        }`}
                      >
                        {w.term} <span className="text-neutral-500 text-xs">— {w.def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Snake */}
          <Card>
            <SectionTitle title="小遊戲：貪吃蛇（詞彙）" desc="做完題或死亡即結算，完整記錄作答 log。" />
            <SnakeChallenge
              key={`srl-snake-${unit.id}-${selectedWords.length}`}
              title={`SRL 詞彙挑戰（${selectedWords.length} 題池）`}
              speedMs={200}
              words={selectedWords}
              targetScore={999}
              onFinish={(score, time) => {
                void score; void time; // 目前不寫回 XP；作研究留 log 用
              }}
              onReport={(r) => {
                setSnakeReport(r);
                toReflection();
              }}
            />
          </Card>
        </>
      )}

      {/* Reflection */}
      {phase === "reflection" && (
        <Card>
          <SectionTitle
            title="3) Self-reflection：反思與 AI 回饋"
            desc="填寫反思，並與 AI 討論調整下輪策略。"
          />

          {/* 🆕 反思頁顯示：貪吃蛇結算詳解 */}
          {snakeReport && (
            <div className="mb-4 rounded-xl border bg-white">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-500">本輪成績（貪吃蛇）</div>
                  <div className="text-lg font-semibold">
                    {snakeReport.correct}/{snakeReport.totalQuestions}
                    <span className="ml-2 text-sm text-neutral-500">
                      用時 {snakeReport.usedTime}s
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  是否通過：{" "}
                  {snakeReport.passed ? (
                    <span className="text-green-600">✅ 是</span>
                  ) : (
                    <span className="text-red-600">❌ 否</span>
                  )}
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="text-sm text-neutral-500 mb-2">每題詳解</div>
                <div className="max-h-64 overflow-auto pr-1 space-y-3">
                  {(snakeReport.logs ?? []).map((log: any, i: number) => {
                    const options: string[] = log.options ?? [];
                    const correctTerm: string = log.correctTerm ?? "";
                    const selectedTerm: string | null =
                      typeof log.selectedTerm === "string" ? log.selectedTerm : null;

                    const correctIndex = options.indexOf(correctTerm);
                    const pickedIndex = selectedTerm ? options.indexOf(selectedTerm) : -1;

                    const pickedLabel =
                      pickedIndex === -1
                        ? "（未作答）"
                        : `${letter(pickedIndex)}. ${options[pickedIndex]}`;
                    const correctLabel =
                      correctIndex >= 0
                        ? `${letter(correctIndex)}. ${options[correctIndex]}`
                        : correctTerm || "—";

                    return (
                      <div key={i} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium">
                            {i + 1}. {log.prompt ?? "—"}
                          </div>
                          <div
                            className={`text-sm ${
                              log.isCorrect
                                ? "text-green-600"
                                : pickedIndex === -1
                                ? "text-neutral-500"
                                : "text-red-600"
                            }`}
                          >
                            {log.isCorrect
                              ? "✔️ 正確"
                              : pickedIndex === -1
                              ? "⏱ 未作答"
                              : "❌ 錯誤"}
                          </div>
                        </div>
                        <div className="mt-1 text-sm">
                          你的作答：<span className="font-medium">{pickedLabel}</span>
                        </div>
                        <div className="text-sm">
                          參考答案：<span className="font-medium">{correctLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 反思側 */}
            <div>
              <div className="text-sm text-neutral-600 mb-2">
                請用 3~5 句說明：本輪學到什麼？卡關點？下輪想怎麼調整？
              </div>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 rounded-xl border"
                placeholder="例：我最常錯 family/relative 類型的字…"
              />
              <div className="mt-3">
                <button
                  onClick={finishAndDownload}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90"
                >
                  下載本輪紀錄（JSON）
                </button>
              </div>
            </div>

            {/* AI 回饋側 */}
            <AIChatInline
              systemPrompt={`你是英語學習的反思教練。請根據以下資訊，提供 4~6 行具體建議：1) 強化錯誤最多的詞群；2) 下輪字數建議；3) 遊戲節奏調整；4) 可行的口說練習。
請維持鼓勵、具體、可執行。`}
              starter={
                snakeReport
                  ? `本輪成績：${snakeReport.correct}/${snakeReport.totalQuestions}，用時 ${snakeReport.usedTime}s。請先用一句話正向回饋，再給具體建議。`
                  : "請給予簡短正向回饋與具體建議。"
              }
              onTranscript={(msgs) => {
                setAiReflectionTranscript(msgs);
                const last =
                  msgs.filter((m) => m.role === "assistant").slice(-1)[0]?.content ?? "";
                setAiReflection(last);
              }}
            />
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={() => {
                setPhase("forethought");
                setTopic("");
                setCount(12);
                setConfidence(4);
                setGoalNote("");
                setAiWords(null);
                setAiWordsRaw(null);
                setAiForethoughtTranscript([]);
                setAiReflectionTranscript([]);
                setReflectionText("");
                setAiReflection("");
                setSnakeReport(null);
                startAtRef.current = new Date().toISOString();
              }}
              className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
            >
              開始下一個 SRL 循環
            </button>
          </div>
        </Card>
      )}

      {phase === "done" && (
        <Card>
          <SectionTitle title="本輪已完成 ✅" desc="已下載 JSON 紀錄，可開始新的一輪。" />
          <button
            onClick={() => {
              setPhase("forethought");
              startAtRef.current = new Date().toISOString();
            }}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90"
          >
            新的一輪
          </button>
        </Card>
      )}
    </div>
  );
}
