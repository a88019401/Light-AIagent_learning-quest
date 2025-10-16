2025/10/16
本次規則調整
貪吃蛇（SnakeChallenge）

無倒數計時：移除全局 totalTime/left 倒數；但仍記錄實際遊玩秒數（開始於按「開始挑戰」，結束於 Game Over/做完所有題）。

結束條件：

撞牆、2) 撞到自己、或 3) 題庫走完（全部題目皆答完）。

題庫與出題：

從 words 建立 deck：shuffle(words).slice(0, min(78, words.length))。

正解不重複：一輪最多 78 題；每題 3 選（1 正解 + 2 誘答，從 pool 排除正解後隨機取）。

選項位置隨機落在不與蛇重疊的格子上。

題幹模式可切換：defToTerm（看中文吃英文）或 termToDef（看英文吃中文）。

操作限制：WASD/方向鍵與 D-Pad 皆可；禁止 180° 直接回頭。

成績與回報：

每題記錄：round/prompt/promptMode/correctTerm/correctDef/options/selectedTerm/isCorrect/responseTimeMs。

onFinish(score, usedTime)；onReport({...}) 回傳：title, totalQuestions(=TOTAL), passScore(=TOTAL), totalTime(=usedTime), usedTime, correct, wrong, passed(=correct===TOTAL), logs, wrongByTerm。

另會 window.dispatchEvent("learning-quest:snake-report", {detail:{ correct, total: TOTAL }})（供頒發「貪吃蛇之王」用）。

UI：

進度條顯示 roundIdx / TOTAL。

移除「通關門檻/倒數時間」的 HUD；結算卡顯示 成績：score / TOTAL 與 耗時 usedSec。

重新開始 會重置並 重建 deck（重新洗牌）。

可調參數：speedMs(預設 200ms)、questionMode、growOnCorrect(答對是否加長，預設 true)。

徽章（可選擴充）：監聽 snake-report，當 correct ≥ 78 頒發 SNAKE_KING。

俄羅斯方塊（Grammar Tetris / ReorderSentenceGame）

題庫範圍：改為使用 unit.grammar.flatMap(g => g.examples ?? []) 全量（不再 slice 限制）。

結束與上報：子元件在回合結束時觸發
window.dispatchEvent("learning-quest:grammar-tetris-report", { detail: { roundsPlayed, reason } })，其中

reason: "completed" 完成一輪、"no-fit" 無可放位置、"wrong-limit" 錯誤達上限。

獎章邏輯：App 監聽上述事件並呼叫 useProgress().reportGrammarTetris(detail)；在 reducer 內 當 reason === "completed" 且 roundsPlayed ≥ 80 頒發 SUPER_GRAMMAR_EXPERT。

XP/最佳成績：父層沿用原邏輯：onFinished(score) 加 XP，並更新 grammar.reorderBest。
2025/10/7 筆記
學習區 大致上OK了 挑戰區 我固定住json 檔案 然後 讓遊戲完結後會有即時反饋 看錯的題目 跟內容詳解 進行一個學習的動作

2025/9/19 筆記 
questionGen.ts的用途是 給 VocabQuiz.tsx和ChallengeRun.tsx製造四選一選擇題用的
然後 學習區 檔案靠 units.ts 挑戰區 則要靠 public\challenges\unit-1\level-1.json 慢慢建構起來


# 一頁摘要（Executive Summary）

LearningQuest 是一個可模組化的英語學習網站原型，採用 React + TypeScript + Vite + Tailwind v4 打造。整體以「資料驅動」為核心：只要編輯 `src/data/units.ts` 的教材結構，即可替換 6 個單元的單字、文法與課文內容；系統會自動生成小測與挑戰題庫，並記錄學習進度、XP、星等與徽章。挑戰區支援標準 4 選 1 題庫與可嵌入的小遊戲（例如貪吃蛇 Snake）。

---

# 專案定位與目標

* **定位**：可快速擴充教材與活動的「英語學習平台原型」。
* **教學目標**：

  1. 提供單字、文法、課文三類內容的互動練習；
  2. 加入挑戰與徽章機制，提高動機與持續性；
  3. 以資料結構統一管理教學資源，降低維護成本。
* **使用情境**：國中英語課、課後自學、補習班練習網站。

---

# 系統架構（Technical Overview）

* **核心技術**：Vite（開發/建置）、React + TypeScript、Tailwind CSS v4。
* **執行流程**：

  1. `index.html` 掛載根節點 `#root`，載入 `src/main.tsx`；
  2. `main.tsx` 建立 React root 並渲染 `App`；
  3. `App.tsx` 載入資料與狀態（`useProgress`），切換分頁（學習/挑戰/獎章），渲染各子元件；
  4. 進度儲存於 `localStorage`，包含各單元星等、XP、徽章等。

## 檔案結構（重點）

```
src/
├─ components/
│  ├─ ArrangeSentencesGame.tsx     # 課文句子排列遊戲
│  ├─ BadgesView.tsx               # 徽章一覽與解鎖狀態
│  ├─ ChallengeRun.tsx             # 4 選 1 限時挑戰（每單元 10 題）
│  ├─ GrammarExplain.tsx           # 文法重點說明
│  ├─ ReorderSentenceGame.tsx      # 文法「重組句子」
│  ├─ SnakeChallenge.tsx           # 小遊戲：貪吃蛇（可作為關卡）
│  ├─ StoryViewer.tsx              # 課文閱讀
│  ├─ VocabQuiz.tsx                # 單字 4 選 1 小測
│  ├─ VocabSet.tsx                 # 單字集（翻牌、瀏覽）
│  └─ ui.tsx                       # 共用 UI（Card、SectionTitle、TabButton）
│
├─ data/
│  └─ units.ts                     # 教材資料（6 單元：單字/文法/課文）
│
├─ lib/
│  └─ questionGen.ts               # 題目自動生成器（單字/文法/課文/挑戰）
│
├─ state/
│  └─ progress.ts                  # 進度與徽章邏輯（useProgress hook）
│
├─ types.ts                        # 型別：Unit/Word/Grammar/Story/Progress…
├─ App.tsx                         # 主應用：分頁/子視圖/關卡解鎖/整合 Snake
├─ main.tsx                        # 入口檔，渲染 App
└─ index.css                       # Tailwind v4 與自訂樣式
```

---

# 核心功能設計（Features）

## 1) 學習區（6 個單元）

* **單字**：單字集瀏覽（翻面）、4 選 1 小測（由題庫生成器產出）。
* **文法**：重點說明＋重組句子遊戲；完成加 XP，記錄最佳表現。
* **課文**：故事閱讀與「句型排列」遊戲；完成加 XP，記錄最高分。

## 2) 挑戰區

* 與單元對應的題庫（每關 10 題）；**60 秒限時**、即時計分；
* 星等規則（預設：9/7/4 對應 3/2/1 星）；
* **關卡解鎖**：前一關達 **2 星** 才能解鎖下一關；
* 可替換某些關卡為 **SnakeChallenge（貪吃蛇）**，與 ChallengeRun 共存。

## 3) 獎章區

* 自動根據進度解鎖徽章（例如：FIRST\_STEPS、SPEEDSTER、PERFECT\_10、UNIT\_MASTER…）；
* 顯示解鎖狀態、時間戳與說明。

---

# 資料驅動與題庫生成

## 單元資料（units.ts）

* 每個 `UnitConfig` 含 `id`、`title`、`words[]`、`grammar[]`、`story{}`：

  * `words[]`：{ term, def, example? }
  * `grammar[]`：{ point, desc, examples\[] }
  * `story`：{ title, paragraphs\[], sentencesForArrange\[] }
* 只要新增/修改 `UNITS` 陣列，即可更換教材與題庫來源（單字小測、文法題、課文題）。

## 題庫生成（questionGen.ts）

* 輸入 `UnitConfig`，輸出 MCQ（單字/文法/課文），並可被 ChallengeRun 組合成每關 10 題的挑戰題庫；
* 支援解題回饋（explain）與標記（tag）。

---

# 進度模型與徽章（state/progress.ts）

* **儲存位置**：`localStorage`，含 `totalXP`、各單元的 XP、星等、最佳成績；
* **Hook**：`useProgress()` 提供 `progress`、`addXP`、`patchUnit`、`awardBadge`、`reset`；
* **星等**：由最佳表現推算，可在 `computeStars()` 客製；
* **徽章規則**：集中於 `evaluateBadges()`（如 PERFECT\_10、SPEEDSTER…）。

---

# 主要元件說明（Components）

* **VocabSet**：翻牌瀏覽單字集；可逐字學習，累積「已學」。
* **VocabQuiz**：單字 4 選 1 測驗；計分與回饋（explain）。
* **GrammarExplain**：展示文法重點，點擊視為一次「學習」。
* **ReorderSentenceGame**：將句子打散並重組；完成與否影響 XP 與最佳紀錄。
* **StoryViewer**：段落式閱讀；完成一次增加閱讀次數與 XP。
* **ArrangeSentencesGame**：將課文句子排序；使用者得分作為 `arrangeBest`。
* **ChallengeRun**：標準 4 選 1 限時挑戰（10 題 / 60 秒）；結束回傳 `(score, timeUsed)`；

  * 用於關卡化（每單元 10 關），搭配解鎖條件（2 星解鎖下一關）。
* **SnakeChallenge**：極簡貪吃蛇（20×20 邏輯格；鍵盤/WASD/行動方向鍵）；

  * Props：`totalTime=60`、`targetScore=10`、`speedMs`、`onFinish(score, time)`；
  * 可被指定為某些關卡的內容，與 ChallengeRun 混用。
* **BadgesView**：以格狀卡片顯示已解鎖/未解鎖徽章，若已解鎖顯示時間戳。
* **ui.tsx**：共用 `Card`、`SectionTitle`、`TabButton` 等樣式組件。

---

# App.tsx：版面與體驗

* 頂端三分頁：**學習區** / **挑戰區** / **獎章區**；
* HUD：顯示目前單元、該單元 XP、總 XP；提供「重置進度」、「如何擴充？」快捷；
* 單元選擇（共 6）：切換時保留挑戰區解鎖狀態；
* 挑戰區：

  * 關卡選單（10 關）；
  * **2 星解鎖**；
  * 關卡內容可在 **貪吃蛇** 與 **標準 4 選 1** 之間切換；
  * 完成關卡會呼叫 `onFinish` 更新 XP / 星等 / 徽章。

---

# 安裝、開發與部署（Ops）

## 環境需求

* Node.js 20.19+ 或 22.12+。

## 開發命令

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build
npm run preview
```

## 部署建議

* **Vercel**：Framework 選 Vite；Build Command `npm run build`；Output `dist`；
* **Netlify**：Build `npm run build`；Publish `dist`。

---

# 客製與延伸（Customization & Roadmap）

## 客製內容

* 在 `src/data/units.ts` 直接換內容：單字、文法點、課文段落與「可排列句子」。
* 調整挑戰題數、限時、星等門檻：集中於 `ChallengeRun` 與 `App.tsx` 計算函式。
* 將某些關卡改為小遊戲：以 `SnakeChallenge` 取代個別關卡內容。

## 延伸方向

* **更多小遊戲**：接水果、打地鼠、打字挑戰；以共用 `onFinish(score, time)` 介面接入。
* **進度雲同步**：以後端 API 或 Supabase 取代 `localStorage`。
* **題庫管理台**：表單化編輯 `units.ts`，自動產出 PR。
* **學習分析**：紀錄作答時間、錯題類型，生成精準複習清單。
* **多語支援**：詞彙與說明以 JSON i18n 管理。

---

# Demo 指南（口頭報告用）

1. 進入首頁：說明三分頁與 HUD（單元、XP、重置）。
2. 切換到 **學習區** → 單字翻牌 → 單字小測；
3. 切到 **文法** → 簡要說明 → 重組句子（示範一次）；
4. 切到 **課文** → 閱讀 → 句子排列；
5. 轉到 **挑戰區**：亮出 10 關格子，說明 **2 星解鎖規則**；
6. 示範第 2 或 3 關改為 **貪吃蛇**，60 秒 / 10 分為過關門檻；
7. 完成一關，展示 XP 增加、星等、徽章變化；
8. 收尾：說明如何在 `units.ts` 替換教材與題庫、自動延展到整站。

---

# 附錄：型別與資料結構（摘要）

* `UnitConfig`：`{ id, title, words[], grammar[], story{} }`
* `Progress`：`totalXP` + `byUnit`（含單字/文法/課文/挑戰子結構：最佳分數/次數）+ `badges{}`
* `SnakeChallengeProps`：`{ title?, totalTime?, targetScore?, speedMs?, onFinish(score, time) }`

> 本文件可作為說明文件、專案 README 擴充章節，或投影片講稿的基底。
