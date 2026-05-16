# Week 3 / Task 2 — 追加パッケージのインストール

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 2
**実施日**: 2026-05-15
**ステータス**: ✅ 完了
**前提**: Week 3 Task 1 完了済み（Next.js 16.2.6 が `web/` で稼働）

---

## タスクの目的

`docs/05-tech-stack.md` で予定されている Next.js 用ライブラリ群をまとめてインストールし、Week 3〜7 で各機能を実装する際に必要な依存関係を事前に整える。

具体的には:
- アニメーション・ダークモード・検索・メール・解析の主要ライブラリを一括導入
- 各ライブラリの実バージョンを `package.json` に固定
- 既存の dev server 動作（200 OK）を壊さないことを確認

---

## 完了基準

- [x] `docs/05-tech-stack.md` 記載の追加パッケージ10種が `web/package.json` に追加されている
- [x] `pnpm install` が正常完了（依存関係エラーなし）
- [x] `pnpm dev` で開発サーバーが起動し、`http://localhost:3000` で HTTP 200 が返る
- [x] CSS（globals.css）が正常にコンパイルされる

---

## インストールしたパッケージ

| パッケージ | 採用バージョン | 用途 | 使い始める Week |
|---|---|---|---|
| `motion` | 12.38.0 | スクロール連動アニメーション（旧 Framer Motion） | Week 7 |
| `next-themes` | 0.4.6 | ダークモード切替 | Week 7 |
| `algoliasearch` | 5.52.1 | 全文検索クライアント | Week 6 |
| `resend` | 6.12.3 | メール送信 API | Week 6 |
| `react-email` | 6.1.4 | メールテンプレート開発 | Week 6 |
| `@react-email/components` | 1.0.12 ⚠️ deprecated | メールテンプレート部品 | Week 6 |
| `zod` | 4.4.3 | バリデーション | Week 6 |
| `reading-time` | 1.5.0 | 記事の読了時間計算 | Week 7 |
| `@vercel/analytics` | 2.0.1 | アクセス解析 | Week 6 |
| `@vercel/speed-insights` | 2.0.0 | パフォーマンス計測 | Week 6 |

合計 **10 直接依存** + 124 推移的依存 = **134 パッケージ追加**。

### ⚠️ `@react-email/components 1.0.12` は deprecated

`react-email 6.x` で API 体系が変わり、`@react-email/components` は単体パッケージとしては非推奨化。`react-email` 本体に統合されている。Week 6 でメール実装時に最新のドキュメントを確認して切り替えが必要になる可能性あり。

---

## 作業手順

### Step 0: 前作業（クリーンアップ）

前セッション後にルートに残されていた不要な `next.config.ts` を削除（`/web/` 構造では使われないファイル）。dev server は web/ から正常起動することを再確認。

### Step 1: 既存の dev server 停止

バックグラウンドで稼働中だった dev server プロセスを停止。

### Step 2: 一括 `pnpm add`

```bash
cd web
pnpm add motion next-themes algoliasearch resend react-email \
  @react-email/components zod reading-time \
  @vercel/analytics @vercel/speed-insights
```

実行結果: 3分39秒で 134 パッケージ追加完了。`pnpm-lock.yaml` も自動更新。

### Step 3: dev server 起動確認 → 500 エラー発覚

`pnpm dev` で起動するも、`http://localhost:3000/` が **HTTP 500** を返した。Turbopack ログに以下のFATALエラー:

```
FATAL: An unexpected Turbopack error occurred.
Failed to write app endpoint /page
Caused by:
- [project]/src/app/globals.css [app-client] (css)
- creating new process
- node process exited before we could connect to it
  with exit code: 0xc0000142
- Execution of evaluate_webpack_loader failed
```

CSS処理時に子プロセス（esbuild）が起動失敗していた。

### Step 4: 原因特定と修正

`pnpm install` の警告を見直すと:
```
Ignored build scripts: esbuild@0.28.0.
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

pnpm v10 のデフォルト挙動で、esbuild の postinstall スクリプトがブロックされていた。esbuild は postinstall でプラットフォーム別のネイティブバイナリを取得する必要があるため、これがないと CSS 処理時に「DLL初期化失敗」（Windows エラーコード `0xc0000142`）でクラッシュする。

`react-email` が内部で esbuild を使うため、今回の追加で問題が表面化した。

**対処**: `web/pnpm-workspace.yaml` に `onlyBuiltDependencies` を追加して esbuild のビルドを許可:

```yaml
onlyBuiltDependencies:
  - esbuild

ignoredBuiltDependencies:
  - sharp
  - unrs-resolver
```

その後 `pnpm rebuild esbuild` で postinstall スクリプトを実行 → ネイティブバイナリ取得完了。

### Step 5: 動作再確認

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK ✓
```

`✓ Ready in 2.9s` で dev server 起動、CSS処理も正常に動作。

---

## 詰まったところ・気づき

### 問題1: pnpm v10 のビルドスクリプト自動ブロック

**現象**: パッケージインストールは成功するが、実行時に「ネイティブバイナリが見つからない/動かない」エラーが出る。

**原因**: pnpm v10 から**セキュリティ対策として「postinstall スクリプトを自動実行しない」がデフォルト**になった。これは悪意あるパッケージが install 時に任意コードを実行することを防ぐ仕組み。しかし esbuild のような正当なネイティブバイナリのダウンロードもブロックされる。

**対処パターン**:
1. **`onlyBuiltDependencies` 設定**（採用）: 明示的に許可するパッケージを列挙する。最も安全。
2. `pnpm approve-builds`: 対話的に承認する。手作業向け。
3. `pnpm rebuild <package>`: 一度限りの対症療法。`pnpm install` を再実行すると元に戻る。

**学び**: pnpm v10+ では、ネイティブバイナリ依存（esbuild, sharp, sqlite3, etc.）を含むパッケージを追加した時は `onlyBuiltDependencies` の設定を必ずチェック・更新する習慣が必要。

### 問題2: dev server プロセスのゾンビ化

**現象**: TaskStop で停止指示を出しても、port 3000 を握ったままの node.exe プロセスが残った。`pnpm dev` 再実行時に「Port 3000 is in use, using 3001 instead」「Another next dev server is already running. PID: 17208」と Next.js が親切にPIDを表示してくれた。

**対処**: `taskkill /PID <PID> /F` で強制終了 → 再起動成功。

**学び**: TaskStop は Bash プロセスを止めるが、その子プロセス（実際の Node サーバー）は別途終了処理が必要なケースがある。Next.js 16 のエラーメッセージで PID を表示してくれるのは便利な設計。

### 問題3: `@react-email/components` の deprecated 警告

**現象**: インストールログに `@react-email/components 1.0.12 deprecated` の表示。

**原因**: `react-email` のメジャーバージョンアップで、`@react-email/components` の機能が本体パッケージに統合された。`docs/05-tech-stack.md` を書いた時点とは状況が変化。

**対処**: 現時点では使用しないため放置。Week 6 のメールテンプレート実装時に、`react-email` 本体だけで必要な機能が揃うか確認して、必要なら依存を整理する。

**学び**: ライブラリの推奨パッケージ構成は短いサイクルで変わる。`docs/05-tech-stack.md` のような技術スタックドキュメントは、定期的に最新版での妥当性をチェックする運用が必要。

---

## 作成・変更ファイル

```
web/
├ package.json          (10 直接依存を追加)
├ pnpm-lock.yaml        (134 パッケージ分の lock を再生成)
└ pnpm-workspace.yaml   (onlyBuiltDependencies に esbuild を追加)
```

ルート:
```
nordic-works/
└ next.config.ts        ← 削除（前回セッション後のゴミファイル）
```

---

## 動作確認結果

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
Vary: rsc, next-router-state-tree, ...
Cache-Control: no-cache, must-revalidate
X-Powered-By: Next.js
```

dev server ログ:
```
▲ Next.js 16.2.6 (Turbopack)
- Local: http://localhost:3000
✓ Ready in 2.9s
```

CSS（Tailwind 4 + globals.css）も正常コンパイル。

---

## パッケージの役割再確認（後でどこで使うか）

| Week | パッケージ | 使用場面 |
|---|---|---|
| Week 6 | `algoliasearch` | `src/lib/algolia.ts` で検索クライアント生成 |
| Week 6 | `resend` + `zod` | お問い合わせフォームの Server Action |
| Week 6 | `react-email` | メールテンプレート（運営宛通知 + 自動返信） |
| Week 6 | `@vercel/analytics` + `@vercel/speed-insights` | `src/app/layout.tsx` に貼って計測開始 |
| Week 7 | `motion` | 記事カード等のスクロール連動アニメーション |
| Week 7 | `next-themes` | `<ThemeProvider>` でダークモード切替 |
| Week 7 | `reading-time` | 記事詳細ページの読了時間表示 |

---

## 振り返り（面接で語れる素材）

### 1. 「pnpm v10 のセキュリティ仕様を理解した上での対応」

ネイティブバイナリ依存パッケージで `0xc0000142` のような Windows DLL エラーが出ると、原因の特定に時間がかかりがち。今回はインストールログの警告（"Ignored build scripts"）から原因を逆算し、`onlyBuiltDependencies` 設定で持続的に解決した。

**伝わるポイント**: パッケージマネージャの仕様変更に追従できる。エラーコードから根本原因を逆算できる。

### 2. 「依存関係の deprecated を早期に把握」

`@react-email/components 1.0.12` が deprecated になっていることを、`docs/05-tech-stack.md` 記載の構成と現実の差として認識した。Week 6 で実装に入る前に再評価する宿題として記録。

**伝わるポイント**: 古い記事や設計書を盲信せず、実環境で最新状態を確認する習慣。

### 3. 「ゾンビプロセスの管理」

Local 開発で dev server のプロセスがハンドリングが甘いとリソース不足やポート衝突を招く。Next.js が PID 表示してくれる設計を活用しつつ、`taskkill` での強制終了で迅速に復旧。

**伝わるポイント**: 開発環境のトラブルに対する素早い切り分けと対応。

---

## 次のタスク

`week-03-task-3-directory-setup.md` (予定):
- `src/app/(corporate)/` `src/app/(media)/` などのルートグループ作成
- `src/components/` 配下のディレクトリ整備（ui/, common/, corporate/, media/）
- `src/lib/` `src/types/` `src/styles/` の基本構造

---

## 関連ドキュメント

- 仕様: `docs/05-tech-stack.md`
- 前のタスク: `week-03-task-1-nextjs-init.md`
