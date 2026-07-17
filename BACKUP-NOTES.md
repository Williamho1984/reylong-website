# c:\dev GitHub 備份紀錄（2026-07-17）

所有專案已備份到 GitHub 帳號 **Williamho1984**，新建的 repo 一律為 **private**。

## 資料夾 ↔ repo 對照

| 本地資料夾 | GitHub repo | 備註 |
|---|---|---|
| wuxing_music_engine | wuxing_music_engine | 既有 repo |
| reylong website | reylong-website | 既有 repo |
| OpenMontage | OpenMontage | 私有備份；`origin` 指向上游 calesthio/OpenMontage（唯讀），**推送要用 `git push backup main`** |
| Smart Vision Note | smart-vision-note | 新建 |
| trend hunter | trend-hunter | 新建 |
| 3D 網頁 | 3d-webpage | 新建 |
| Test | test | 新建 |
| Train simulation game | train-simulation-game | 新建 |
| └ train-game | train-game | 內嵌 repo，獨立備份（含 64 個 commit 歷史） |
| animation | animation | 新建 |
| marketing strategy | marketing-strategy | 新建 |
| └ reylong-leads | reylong-leads | 內嵌 repo，獨立備份（含 11 個 commit 歷史） |
| volleyball_machine_docs | volleyball_machine_docs | 新建 |

## ⚠️ 沒有備份到 GitHub 的東西

| 項目 | 大小 | 原因 | 建議 |
|---|---|---|---|
| `reylong website\三封機\`（機台影片） | 約 2.3GB | 超過 GitHub 單檔 100MB／單次推送約 2GB 限制 | 用 Google Drive 或外接硬碟另行備份 |
| `OpenMontage\en_US-ryan-high.onnx`（語音模型） | 115MB | 超過 100MB 上限 | 可從 Piper TTS 官方重新下載 |
| wuxing_music_engine 的 `.sf2` 音色庫 | 142MB / 206MB | 原本就被 .gitignore 忽略 | 可重新下載（FluidR3_GM、MuseScore_General） |
| 各專案的 `.env`（API 金鑰） | — | 安全考量，絕不能上 GitHub | 金鑰另行保管（密碼管理器）；repo 內有 `.env.example` 當範本 |
| `node_modules/`、`.wrangler/` 等 | — | 可由 `npm install` 等重建 | 不需備份 |

## 日後注意

- 這份檔案在 `c:\dev` 底下，而 `c:\dev` 本身不是 git repo，**這份紀錄只存在本機**。
- OpenMontage 要更新備份時：`git push backup main`（不是 origin）。
- 新增專案後記得也建 repo 備份，並確認 `.gitignore` 擋住 `.env` 和超過 100MB 的檔案。
