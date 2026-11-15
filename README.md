# 小六科學溫習站

香港小學六年級上學期科學溫習靜態網站。傳統中文介面，可部署到 GitHub Pages 的 `/p6-science-term1/`。

課題只有四個：

- 急救箱與簡易急救
- 危機與救援
- 能量的形式與轉換
- 力與摩擦力

## 玩法

- **個人溫習**：選一個課題或混合，每輪 10 題。作答後即時看到短解說。未掌握的題目可以再練。答對獲得科學幣。
- **白板三人**：三欄同時答同一題，適合 1920×1080 智慧板全螢幕。用 pointer events 支援多人同時觸控，版面固定為三欄。愈快答對，科學幣愈多。答錯只會溫柔提示，然後看短解說。
- **動物飼養場與孵蛋**：只有一種蛋。單抽 10 科學幣，十連抽 100 科學幣並多送 1 抽（共 11 隻）。孵出的動物仍分普通 70%、稀有 20%、超稀有 10%。未遇見的動物在飼養場顯示為「？」，不會露出真身。三隻相同的一星合成二星，三隻相同的二星合成三星。
- **登入**：可以不登入，進度只留在這部裝置。用 Google 登入後，科學幣、動物和已掌握的題目會跟住帳號。登入時會把這部裝置和雲端的進度合併，不會刪走較多的那一邊。沒有班內排行榜。名字只在該局顯示。

## Firebase

網站使用老師現有的 Firebase 專案 `mrli-thlch`（與 [mrli-thlch.web.app](https://mrli-thlch.web.app) 相同）。程式只放公開的 Web 設定，沒有服務帳戶金鑰。

同學的進度存在 Firestore `p6science/{uid}`。請在 Firebase Console 完成這些步驟，雲端同步才會成功：

1. Authentication → Sign-in method：確認已啟用 **Google**。
2. Authentication → Settings → Authorized domains：加入 `thomasthlch.github.io`。`localhost` 通常已在清單內。
3. Firestore → Rules：把 `firebase/p6science.rules` 裡面的 `match /p6science/{userId}` **貼進現有規則**，不要整份取代。控制台仍使用 `dashboards/master_dashboard` 和 `eservice/courses`。
4. 規則的意思是：已登入的人只能讀寫自己的文件。
5. 若 API 金鑰有 HTTP referrer 限制，請一併允許 `https://thomasthlch.github.io/*`。

## 題庫

共 **80** 題，沒有重複題幹，每題都有簡短解說。

| 課題 | 選擇題 | 是非題 | 多項選擇 | 合計 |
| --- | ---: | ---: | ---: | ---: |
| 急救箱與簡易急救 | 14 | 4 | 4 | 22 |
| 危機與救援 | 12 | 3 | 5 | 20 |
| 能量的形式與轉換 | 13 | 2 | 3 | 18 |
| 力與摩擦力 | 14 | 3 | 3 | 20 |
| 合計 | 53 | 12 | 15 | 80 |

`npm test` 會核對題數、答案，以及教師提供題目的科學正確版本（例如急救目的是「保存傷者性命」，不是「保存傷者的名字」）。

## 本地開發

```bash
npm install
npm test
npm run dev
```

建置：

```bash
npm run build
npm run preview
```

Vite 的 `base` 是 `'./'`，所以靜態檔可以用相對路徑放在 `/p6-science-term1/`。

## GitHub Pages

`.github/workflows/pages.yml` 會在推上 `main` 時建置並部署。請在倉庫 Settings → Pages → Build and deployment，把 Source 設為 **GitHub Actions**。

部署後的網址會是：

`https://<user>.github.io/p6-science-term1/`
