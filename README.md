# AI 對話教練 × 遊戲式英語字彙學習（SRL）

## 研究主題
在「遊戲式英語字彙學習」環境中導入 AI 對話教練（AI agent），引導學生依 SRL 三階段——前導規劃（Forethought）、歷程監控（Performance）、賽後反思（Self-reflection）——設定目標、監控歷程並生成反思與下輪策略，檢驗其對學習成效與策略使用的影響（Panadero, 2017）。

## 問題意識
- 遊戲式學習常能提升學習效果，但成效差異與設計品質相關；嚴謹的任務結構與回饋可放大效果（Wouters, van Nimwegen, van Oostendorp, & van der Spek, 2013）。
- 多數學習系統未內建 SRL 腳手架，學生欠缺「如何訂目標、如何監控、如何反思」的明確引導；對話式教學代理可用提示與回饋支援這些歷程（Azevedo et al., 2009；Rus, D’Mello, Hu, & Graesser, 2010/2013）。
- 生成式 AI 讓個別化策略、在地語言介面與任務後回饋更即時可行，但於語言學習 × 遊戲情境的實證對照仍少，值得系統化驗證（Panadero, 2017；Wouters et al., 2013）。

## 理論基礎
- **自我調整學習（SRL）循環**：在 Forethought 設定目標與策略、在 Performance 自我監控、在 Self-reflection 進行歸因與策略調整；循環性帶來長期成長（Panadero, 2017）。
- **教學／對話代理支援 SRL**：多代理系統（如 MetaTutor）在閱讀或任務中促發計畫、監控與反思策略，能改善策略使用與歷程品質（Azevedo et al., 2009；Rus et al., 2010/2013）。
- **遊戲式學習成效**：相較傳統教學，嚴謹設計的遊戲在學習與保留上具小至中等正效應；多回合學習、與其他教學結合、同儕合作等條件能放大效果（Wouters et al., 2013）。

## AI 工具應用規劃（AI-SRL 對話教練，中文介面）
- **Forethought**：蒐集「主題／目標字數／自我效能（信心）」並產出可操作策略與本輪詞彙清單（直接帶入表單與題庫）（Panadero, 2017）。
- **Performance**：以本輪詞彙進行字卡練習與小型遊戲（如貪吃蛇詞彙版）；記錄正誤、反應時間、錯誤型態、回合用時（Wouters et al., 2013）。
- **Self-reflection**：結算畫面呈現本輪成績與錯題明細，AI 生成個別化回饋與下輪策略；整輪對話與行為資料輸出 JSON（Azevedo et al., 2009；Rus et al., 2010/2013）。

## 研究指標與工具
- **學習成效**：前測／後測／延宕測之字彙測驗（Wouters et al., 2013）。
- **策略與動機**：MSLQ（動機與策略子量表）做量化評估（Pintrich, Smith, García, & McKeachie, 1991）。
- **行為分析**：題目層級正確率、反應時間、錯誤分布、回合時長、提示使用率，用於軌跡建模與預測（Wouters et al., 2013）。

## 研究設計（建議）
- **準實驗**：兩班分組——AI-SRL 組（AI 教練＋SRL 三階段） vs. 對照組（同教材與遊戲，但僅提供靜態說明、無對話教練）。
- **介入週期**：3–5 週；每週 1–2 輪 SRL 循環。分析採 ANCOVA／混合效應模型比較組間差異，並以行為資料探討策略—成效關聯（Wouters et al., 2013）。
- **倫理與資料治理**：匿名化、告知同意、資料保存天期（於論文與 README 另列）。

## 預期成果
- **學習成效提升**：AI-SRL 組在後測與延宕測的字彙表現優於對照組；行為資料呈現更有效的學習軌跡（多回合漸進改善、錯誤類型聚焦修正）（Wouters et al., 2013）。
- **策略品質提升**：AI 介入使目標更具體、策略更多樣且更貼任務；反思文本在歸因與調整層面更成熟（Azevedo et al., 2009；Panadero, 2017）。
- **設計準則與開源資源**：整理可重複的 AI-SRL 腳手架＋遊戲結算整合範式，與可復用的 JSON 日誌結構／研究儀表板範本（Azevedo et al., 2009）。

---

## 參考文獻（APA 第 7 版）
Azevedo, R., Harley, J. M., Trevors, G., Duffy, M., Feyzi-Behnagh, R., Bouchet, F., & Landis, R. S. (2009). *Using multiple external representations to support self-regulated learning with MetaTutor*. University of Memphis. https://doi.org/10.5555/1989482.1989492

Panadero, E. (2017). A review of self-regulated learning: Six models and four directions for research. *Frontiers in Psychology, 8*, 422. https://doi.org/10.3389/fpsyg.2017.00422

Pintrich, P. R., Smith, D. A., García, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)*. National Center for Research to Improve Postsecondary Teaching and Learning, University of Michigan.

Rus, V., D’Mello, S., Hu, X., & Graesser, A. C. (2010). Recent advances in conversational intelligent tutoring systems. In *Proceedings of the Twenty-Third International Florida Artificial Intelligence Research Society Conference (FLAIRS)*.

Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265. https://doi.org/10.1037/a0031311
