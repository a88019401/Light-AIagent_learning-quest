研究主題

在「遊戲式英語字彙學習」環境中導入AI 對話教練（AI agent），引導學生依 SRL 三階段——前導規劃（Forethought）、歷程監控（Performance）、賽後反思（Self-reflection）——設定目標、監控歷程並生成反思與下輪策略，檢驗其對學習成效與策略使用的影響（Panadero, 2014）。 
無法判斷網站名稱

問題意識

遊戲式學習常能提升學習效果，但成效差異與設計品質相關；適當的任務結構與回饋更能放大效果（Wouters, van Nimwegen, van Oostendorp, & van der Spek, 2013）。
ResearchGate

多數學習系統未內建 SRL 腳手架，學生欠缺「如何訂目標、如何監控、如何反思」的明確引導；對話式教學代理能以提示與回饋支援這些歷程（Azevedo et al., 2009；Rus et al., 2010）。
johnnietfeld.com
+1

生成式 AI 進一步讓個別化策略、在地語言介面、任務後回饋更即時可行，但在語言學習＋遊戲情境的實證對照仍少，值得系統化驗證（Panadero, 2014；Wouters et al., 2013）。 
無法判斷網站名稱
+1

理論基礎

自我調整學習（SRL）循環：學習者在 Forethought 設定目標與策略、在 Performance 自我監控、在 Self-reflection 進行成因歸因與策略調整；循環性帶來長期成長（Panadero, 2014）。
無法判斷網站名稱

教學／對話代理支援 SRL：多代理系統（如 MetaTutor）會在閱讀或任務中提示計畫、監控與反思策略，能改善策略使用與學習歷程品質（Azevedo et al., 2009；Rus et al., 2010）。
johnnietfeld.com
+1

遊戲式學習成效：統合分析顯示，相對於傳統教學，嚴謹設計的遊戲在認知與保留上有小至中等的正效應，語言領域效果尤其顯著（Wouters et al., 2013）。（此研究同時指出多回合學習、與其他教學結合、同儕合作等條件可放大效果。）
ResearchGate

AI 工具應用規劃

AI-SRL 對話教練（中文介面）

Forethought：蒐集「主題／字數／信心」並產出可操作策略與本輪詞彙清單（JSON 直寫畫面表單與題庫）。

Performance：以 AI 詞彙進行字卡＋口說與貪吃蛇詞彙遊戲；記錄正誤、反應時間、錯誤型態、用時。

Self-reflection：在結算畫面呈現本輪成績與錯題明細，並由 AI 生成個別化回饋與下輪策略；整輪對話與行為資料輸出 JSON。

研究指標與工具

學習成效：前測／後測／延宕測之字彙測驗。

策略使用：採 MSLQ（動機與策略子量表）做量化評估（Pintrich et al., 1991）。
files.eric.ed.gov

行為分析：題目層級正確率、反應時間、錯誤分布與回合時長，用於學習軌跡與預測模型（參照遊戲式學習成效之條件性與多回合優勢；Wouters et al., 2013）。
ResearchGate

研究設計（建議）

準實驗：兩班分組——AI-SRL 組（AI 教練＋SRL 三階段） vs 對照組（同教材與遊戲，但給靜態說明無對話教練）。

介入 3–5 週，每週 1–2 輪 SRL 循環；以 ANCOVA/混合效應模型比組間差異，並以行為資料探討策略—成效關聯。

預期成果

學習成效提升：AI-SRL 組在後測與延宕測的字彙表現顯著優於對照組；行為資料呈現更有效的學習軌跡（多回合漸進改善、錯誤類型聚焦修正）（Wouters et al., 2013）。
ResearchGate

策略品質提升：AI 介入能使目標更具體、策略更多樣且更貼任務；反思文本在歸因與調整層面更成熟（Azevedo et al., 2009；Panadero, 2014）。
johnnietfeld.com
+1

設計準則與開源資源：提供一套可重複的 AI-SRL 腳手架＋遊戲結算整合範式，以及可復用的JSON 日誌結構與研究儀表板，以利後續擴充與再現。

參考文獻（APA）

Azevedo, R., Harley, J. M., Trevors, G., Duffy, M., Feyzi-Behnagh, R., Bouchet, F., & Landis, R. S. (2009). Using multiple external representations to support self-regulated learning with MetaTutor. University of Memphis. https://doi.org/10.5555/1989482.1989492
 （MetaTutor 專案與多代理支援 SRL 的論述與實作） 
johnnietfeld.com

Panadero, E. (2014). A review of self-regulated learning: Six models and four directions for research. Frontiers in Psychology, 5, 422. https://doi.org/10.3389/fpsyg.2014.00422
 （開放取用） 
無法判斷網站名稱

Pintrich, P. R., Smith, D. A., García, T., & McKeachie, W. J. (1991). A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ). Ann Arbor, MI: University of Michigan, National Center for Research to Improve Postsecondary Teaching and Learning.（可於 ERIC/相關典藏取得） 
files.eric.ed.gov

Rus, V., D’Mello, S., Hu, X., & Graesser, A. C. (2010). Recent advances in conversational intelligent tutoring systems. In Proceedings of the Twenty-Third International Florida Artificial Intelligence Research Society Conference (FLAIRS).（含 MetaTutor/對話代理技術脈絡，開放 PDF） 
cs.memphis.edu

Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. Journal of Educational Psychology, 105(2), 249–265.（作者上傳全文可公開存取） 
ResearchGate