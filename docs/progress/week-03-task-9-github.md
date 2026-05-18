# Week 3 / Task 9 — GitHub リポジトリ作成・初回 push

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 9
**実施日**: 2026-05-16
**ステータス**: ✅ 完了
**前提**: Week 3 Task 1〜8 完了済み（Next.js 実装・記事ページ完成）

---

## タスクの目的

Week 1〜3 で構築したプロジェクト全体を Git でバージョン管理し、GitHub の公開リポジトリに初回 push する。`docs/01-overview.md` の最終成果物「GitHub の公開リポジトリ」の土台を作る。

具体的には:
- プロジェクトルートで `git init`
- `.gitignore` が正しく機能していることを厳密に検証
- 初回コミットを Conventional Commits 形式で作成
- GitHub に公開リポジトリ `nordic-works` を作成
- 初回 push

---

## 完了基準

- [x] プロジェクトルートが Git リポジトリになっている（branch: main）
- [x] WordPress コア / node_modules / 機密情報がコミットに含まれていない
- [x] 独自プラグイン `nordic-works-core` はコミットに含まれている
- [x] 初回コミットが Conventional Commits 形式で作成されている
- [x] GitHub 公開リポジトリ `shinmori2020/nordic-works` が存在する
- [x] `git push` が成功し、`origin/main` を追跡している
- [x] `git status` がクリーン（未コミットの変更なし）

---

## 作業手順

### Step 1: 環境確認

| ツール | 状態 |
|---|---|
| git | v2.35.1 ✓ |
| GitHub CLI (`gh`) | 未インストール |

`gh` が無いため、リポジトリ作成は GitHub Web UI で行う方針に決定。

### Step 2: git のコミット設定確認

```
user.name  = shinmori2020
user.email = kiyoshi315jp@yahoo.co.jp
```

GitHub アカウント（shinmori2020）に登録済みのメールと一致することをユーザーに確認。コミットがプロフィールに実績として紐付くことを担保。

### Step 3: GitHub で空リポジトリ作成（ユーザー作業）

GitHub Web UI（https://github.com/new）で以下の設定で作成:
- Repository name: `nordic-works`
- Visibility: **Public**
- README / .gitignore / license: **全てなし**（空リポジトリ）

→ `https://github.com/shinmori2020/nordic-works.git`

「空」で作ることが重要。README 等を一緒に作るとローカルの初回コミットと履歴が衝突する。

### Step 4: `git init` + main ブランチ設定

```bash
git init
git branch -M main
```

### Step 5: `.gitignore` の検証（コミット前）

`git add -A --dry-run` で「何がステージされるか」を事前確認。以下の危険パスが含まれていないことをチェック:

| 危険パス | 検出数 | 判定 |
|---|---|---|
| `node_modules` | 0 | ✓ |
| `.next/` | 0 | ✓ |
| `wp-admin` / `wp-includes` | 0 | ✓ |
| `.env.local` | 0 | ✓ |
| `conf/` / `logs/` | 0 | ✓ |
| `wp-content/uploads/` | 0 | ✓ |

初回検証で `app/` 配下は `nordic-works-core` プラグインの7ファイルのみがステージされることを確認。`.gitignore` の「`/app/` を全除外しつつプラグインだけ階層的に再 include」する設定が正しく機能している。

### Step 6: `.claude/` の除外判断

初回の dry-run で `.claude/skills/` の33ファイルがステージ対象になっていた。これらは汎用の Claude Code スキル定義（ユーザーの著作物ではなくツール設定）のため、ポートフォリオリポジトリには不要と判断。

`.gitignore` を `.claude/settings.local.json` → `.claude/`（フォルダ全体除外）に変更。

注: プロジェクト固有ドキュメント `CLAUDE.md` はルート直下にあるため、`.claude/` を除外しても追跡対象のまま残る。

→ 再 dry-run で 106ファイル → **73ファイル** に絞り込み完了。

### Step 7: 初回コミット

```
chore: initialize headless WordPress portfolio (Week 1-3)
```

Conventional Commits 形式。本文に WordPress 側・Next.js 側・ドキュメントの内訳を記載。末尾に Co-Authored-By。

結果: `[main (root-commit) 73ae692] 73 files changed, 14964 insertions(+)`

### Step 8: リモート接続 + push

```bash
git remote add origin https://github.com/shinmori2020/nordic-works.git
git push -u origin main
```

push 成功:
```
branch 'main' set up to track 'origin/main'.
 * [new branch]      main -> main
```

---

## コミットに含まれるファイル（73ファイル）

```
.gitignore
CLAUDE.md

app/public/wp-content/plugins/nordic-works-core/   ← 独自プラグインのみ
  ├ nordic-works-core.php
  ├ acf-json/  (5 JSON)
  └ scripts/seed-content.php

docs/                          ← 仕様書9本 + README
  └ progress/                  ← 作業ログ10本

web/                           ← Next.js プロジェクト
  ├ 各種設定 (package.json, tsconfig.json, next.config.ts 等)
  ├ public/  (SVG 5枚)
  └ src/
     ├ app/  (page.tsx, layout.tsx, globals.css, articles ページ)
     ├ components/media/ArticleCard.tsx
     ├ lib/  (wordpress.ts, utils.ts)
     └ types/wordpress.ts
```

`.gitkeep`（11個）も含まれる — 中身未実装の空ディレクトリを Git で追跡するため。

---

## コミットから除外されたもの（.gitignore による）

| 除外対象 | 理由 |
|---|---|
| `web/node_modules/` | 依存パッケージ。`pnpm install` で復元可能 |
| `web/.next/` | ビルドキャッシュ |
| `web/.env.local` | 機密情報（秘密トークン等） |
| `app/` の WP コア・他プラグイン | WordPress 本体。再ダウンロード可能 |
| `app/public/wp-content/uploads/` | メディア画像。シーダーで再生成可能 |
| `conf/` `logs/` | Local の machine-specific 設定 |
| `.claude/` | Claude Code ツール設定 |

`web/.env.example`（テンプレート）は例外的に追跡対象。`!.env.example` ルールで除外を打ち消している。

---

## 詰まったところ・気づき

### 1. `grep -c` の exit code で `&&` チェーンが途切れる

dry-run の検証で `git add -A --dry-run | grep -c "node_modules"` を `&&` で連結したところ、`grep -c` はマッチ0件のとき exit code 1 を返すため、最初の「0件」表示の後でコマンド全体が停止した。

**対処**: dry-run 結果を一時ファイルに保存し、各 `grep -c` に `|| true` を付けて continue させる構成に変更。

**学び**: `grep` は「マッチ無し」を「失敗」として扱う。シェルスクリプトで `grep -c` の数値だけ欲しいときは `|| true` でガードする。

### 2. Windows の LF→CRLF 警告

`git add` 時に大量の `warning: LF will be replaced by CRLF` が出た。これは Windows の git（`core.autocrlf`）が改行コードを変換する際の通知で、**エラーではない**。リポジトリ内は LF、作業ディレクトリは CRLF で保持される。

**今後の改善余地**: `.gitattributes` で `* text=auto eol=lf` を明示すると、改行コードの扱いがチーム間で一貫する。Week 4 以降で追加を検討（今回は未対応）。

### 3. `.gitignore` の「全除外 → 階層的再include」パターンの威力

`/app/` 配下は WordPress 本体で数千ファイルあるが、`.gitignore` の以下のパターンで「プラグインだけ」を追跡できた:

```gitignore
/app/*
!/app/public
/app/public/*
!/app/public/wp-content
/app/public/wp-content/*
!/app/public/wp-content/plugins
/app/public/wp-content/plugins/*
!/app/public/wp-content/plugins/nordic-works-core
```

各階層で「一旦全除外 → 必要なパスだけ再include」を繰り返す。git の仕様上、親ディレクトリが除外されていると子は再includeできないため、この階層的記述が必須。dry-run で7ファイルだけがステージされたことで、このパターンが正しく機能していることを実証。

### 4. push 時の認証

初回 push は GitHub の認証が必要。今回は Git Credential Manager（Git for Windows 同梱）が既存の認証情報を保持していたため、ブラウザ認証ダイアログ無しで push が完了した。

---

## 動作確認結果

```
$ git status --short
(空 = クリーン)

$ git branch -vv
* main 73ae692 [origin/main] chore: initialize headless WordPress portfolio (Week 1-3)

$ git remote get-url origin
https://github.com/shinmori2020/nordic-works.git
```

- 作業ディレクトリはクリーン（未コミットの変更なし）
- ローカル `main` が `origin/main` を追跡
- GitHub 上 https://github.com/shinmori2020/nordic-works でコードが閲覧可能

---

## 振り返り（面接で語れる素材）

### 1. 「コミット前の `.gitignore` 検証プロセス」

`git add -A --dry-run` で「何がコミットされるか」を事前確認し、node_modules や WordPress コア、機密情報（.env.local）が混入しないことを検証してからコミットした。

**伝わるポイント**: 「とりあえず `git add .`」ではなく、リポジトリに何を含めるかを意識的にコントロールできる。機密情報の漏洩を防ぐ意識。

### 2. 「Headless 構成における選択的バージョン管理」

WordPress 本体（数千ファイル）はコミットせず、**自作したプラグインコードだけ**を `.gitignore` の階層的 re-include パターンで追跡対象にした。「再現可能なものはコミットしない、自分の成果物だけ管理する」という方針。

**伝わるポイント**: モノリシックに全部コミットするのではなく、リポジトリの責務を考えた設計。

### 3. 「Conventional Commits の実践」

初回コミットから Conventional Commits 形式（`chore:` プレフィックス + 構造化された本文）を採用。`docs/08-portfolio-prep.md` のコミットメッセージ規約に準拠。

### 4. 「機密情報とテンプレートの分離」

`.env.local`（実値・除外）と `.env.example`（テンプレート・追跡）を分離し、`.gitignore` の `!` 例外ルールで実現。他人がリポジトリをクローンしたとき「何の環境変数が必要か」が分かる。

---

## Week 3 完了

| Task | 内容 | 状態 |
|---|---|---|
| 1 | Next.js プロジェクト初期化 | ✅ |
| 2 | 追加パッケージインストール | ✅ |
| 3 | ディレクトリ構成セットアップ | ✅ |
| 4 | 環境変数設定 | ✅ |
| 5 | WordPress 接続関数の実装 | ✅ |
| 6 | TypeScript 型定義 | ✅ |
| 7 | 記事一覧・記事詳細の最小UI実装 | ✅ |
| 8 | キャッシュ仕様の明示 | ✅ |
| 9 | GitHub リポジトリ作成・初回push | ✅ |

**Week 3 完全完了。** `07-roadmap.md` の Week 3 成果物（記事一覧・詳細が表示される状態 / GitHub公開リポジトリ / 型定義済みデータ取得関数群）を全て達成。

---

## 次のステップ

1. Week 3 全体の総括ログ `week-03.md` の作成
2. Week 4 — コア機能完成（全ページ実装 + ISR + SEO + 画像最適化 + Vercel初回デプロイ）へ

### Week 4 着手前の宿題（これまでの積み残し）

- `docs/05-tech-stack.md` を Next.js 16 ベース + `web/` サブフォルダ構成に更新
- `.gitattributes` の追加（改行コード正規化、任意）
- `@react-email/components` deprecated の再評価（Week 6 で実装時）

---

## 関連ドキュメント

- 最終成果物の定義: `docs/01-overview.md`
- コミット規約: `docs/08-portfolio-prep.md`
- 前のタスク: `week-03-task-7-articles-ui.md`
