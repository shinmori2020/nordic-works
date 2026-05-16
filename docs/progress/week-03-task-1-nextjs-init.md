# Week 3 / Task 1 — Next.js プロジェクト初期化

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 1
**実施日**: 2026-05-14
**ステータス**: ✅ 完了
**前提**: Week 2 完了済み（WordPress 側の構築完了、CPT・ACF・ダミーコンテンツ投入済み）

---

## タスクの目的

`docs/05-tech-stack.md` で予定されている技術スタック（Next.js 15 + TypeScript + Tailwind CSS + App Router + src-dir）で Next.js プロジェクトを初期化し、開発サーバーが `http://localhost:3000` で稼働する状態を作る。

具体的には:
- pnpm をパッケージマネージャとして導入
- `pnpm create next-app@latest` でプロジェクト雛形を生成
- WordPress 関連ファイルと共存できる Git 管理構造を整える
- ブラウザでデフォルトページが閲覧できる状態を作る

---

## 完了基準

- [x] pnpm v10 以上がインストールされている
- [x] Next.js 15 以上の App Router プロジェクトが構築されている
- [x] TypeScript / Tailwind CSS / src-dir / `@/*` import alias が有効
- [x] `pnpm dev` で開発サーバーが起動する
- [x] `http://localhost:3000` で HTTP 200 が返り、デフォルトページが表示される
- [x] `.gitignore` が WP 関連を除外しつつ独自プラグインを追跡する設計になっている

---

## 実装方針の判断

### 判断1: パッケージマネージャは pnpm

`docs/05-tech-stack.md` の推奨に従い、npm ではなく pnpm を採用。理由:
- ディスク効率（コンテンツアドレッサブルストレージ）
- 依存関係の厳密管理
- Next.js / Vercel との相性

`npm install -g pnpm` で v10.33.4 をグローバルインストール。

### 判断2: Next.js の配置場所 — 当初「ルート」→ 途中で「web/ サブフォルダ」に変更

最初は **ルート配置（Option A）** で進めたが、後述の問題により **web/ サブフォルダ（Option B）** へ切り替えた。詳細は「詰まったところ」セクション参照。

### 判断3: Next.js 16 を受け入れる

`docs/05-tech-stack.md` は Next.js 15 を想定していたが、`pnpm create next-app@latest` で **Next.js 16.2.6** がインストールされた。AGENTS.md の警告:

> This version has breaking changes — APIs, conventions, and file structure may all differ from your training data.

があったが、以下の理由で 16 のまま進めることに決定:
- ポートフォリオとして「最新版を使っている」評価
- 必要に応じて `node_modules/next/dist/docs/` で仕様確認可能
- 15 → 16 のメジャーアップは将来必要になる

Week 3 完了時に `docs/05-tech-stack.md` を Next.js 16 ベースに更新する宿題。

### 判断4: create-next-app の生成物の取捨選択

create-next-app が以下のファイルを生成したが、それぞれ扱いを決めた:

| ファイル | 扱い | 理由 |
|---|---|---|
| `CLAUDE.md`（Next.js 生成、`@AGENTS.md` を参照する1行のみ） | 削除 | プロジェクトルートの既存 CLAUDE.md を保持する必要があったため |
| `AGENTS.md` | 保持 | Next.js 16 の breaking change 注意書き、有用 |
| `.git/`（Next.js が自動 init） | 削除 | Week 3 Task 9 で改めて `git init` する設計のため |
| `pnpm-workspace.yaml` | 保持 | `ignoredBuiltDependencies` 設定が含まれる |
| その他（package.json, src/, public/, configs） | 保持 | Next.js の動作に必須 |

---

## 作業手順

### Step 1: pnpm のグローバルインストール

```bash
npm install -g pnpm
# → pnpm v10.33.4 がインストールされた
```

### Step 2: Next.js を一時サブディレクトリで作成

初期の create-next-app コマンド:
```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm --yes
```

は失敗（後述の問題1参照）。回避策として一時ディレクトリで作成:

```bash
pnpm create next-app@latest nordic-next-init --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm --yes --skip-install
```

`--skip-install` で依存関係インストールはスキップし、ファイル生成のみ。

### Step 3: 一時ディレクトリの内容をルートへ移動

```bash
rm -rf nordic-next-init/.git nordic-next-init/CLAUDE.md
mv nordic-next-init/.gitignore nordic-next-init/AGENTS.md nordic-next-init/README.md \
   nordic-next-init/eslint.config.mjs nordic-next-init/next-env.d.ts \
   nordic-next-init/next.config.ts nordic-next-init/package.json \
   nordic-next-init/pnpm-workspace.yaml nordic-next-init/postcss.config.mjs \
   nordic-next-init/public nordic-next-init/src nordic-next-init/tsconfig.json ./
rmdir nordic-next-init
```

### Step 4: pnpm install で依存関係をインストール

```bash
pnpm install
# → 350 パッケージ、3分53秒で完了
# Next.js 16.2.6 / React 19.2.4 / TypeScript 5.9.3 / Tailwind 4.3.0
```

### Step 5: package.json の name を修正

`name: "nordic-next-init"` → `name: "nordic-works"` に変更。

### Step 6: 初回 dev server 起動・確認 → 404 問題発覚

```bash
pnpm dev
# ▲ Next.js 16.2.6 (Turbopack)
# - Local: http://localhost:3000
# ✓ Ready in 20.4s
```

ブラウザで `http://localhost:3000/` を開くと **404 This page could not be found**。詳細は「詰まったところ」セクション。

### Step 7: 問題解決のため web/ サブフォルダへ移行

```bash
mkdir web
mv src public AGENTS.md README.md eslint.config.mjs next-env.d.ts next.config.ts \
   package.json pnpm-lock.yaml pnpm-workspace.yaml postcss.config.mjs tsconfig.json web/
rm -rf node_modules .next   # ロック解放後に削除
cd web && pnpm install      # 2分1秒で完了（キャッシュ使用）
pnpm dev                    # ✓ Ready in 11.6s
```

### Step 8: 動作確認

```bash
curl -sI http://localhost:3000/
# HTTP/1.1 200 OK ← 成功
```

dev server ログにも `○ Compiling /` と `HEAD / 200 in 16.1s` が出力された。

### Step 9: .gitignore を新構造に合わせて分割

- ルート `.gitignore`: 「WordPress / Local / OS / Claude設定」のプロジェクト全体除外
- `web/.gitignore`: 「node_modules / .next / .env / vercel」など Next.js 固有

---

## 詰まったところ・気づき

### 問題1: create-next-app が「ルートに既存ファイルがある」と拒否

**現象**:
```
The directory nordic-works contains files that could conflict:
  app/
  CLAUDE.md
  conf/
  logs/
Either try using a new directory name, or remove the files listed above.
```

**原因**: create-next-app のプリチェックが、root に許可リスト外のファイル（`app/`, `CLAUDE.md`, `conf/`, `logs/` 等）を検知して中断した。Next.js 15+ の安全策。

**対処**: 一時サブディレクトリで作成 → 必要ファイルだけ root に移動するワークフローに切り替え。
- `--skip-install` フラグで依存関係インストールをスキップしてから移動
- 移動後にあらためて `pnpm install`

**学び**: create-next-app は意外と頑固なプリチェックを持っている。`. (current dir)` で初期化したい場合は、コンフリクトする既存ファイルを退避するか、一時ディレクトリ経由で導入する必要がある。

### 問題2: 初期化したのに `localhost:3000` が 404 を返す（核心問題）

**現象**:
- `pnpm dev` は正常に起動（`Ready in 20.4s`）
- ブラウザで `/` にアクセス → 404
- dev server ログには `○ Compiling /_not-found/page ...` と `GET / 404` のみ
- `src/app/page.tsx` も `src/app/layout.tsx` も内容は完全に正常

**原因**: Next.js の App Router 自動検出が `/app/` を優先したため。Next.js は以下の順序で App Router のソースを探す:
```
1. /<projectRoot>/app/   ← 先に検出される
2. /<projectRoot>/src/app/
```

このプロジェクトのルート `nordic-works/` には Local が管理する WordPress 用の `/app/` ディレクトリが存在し、Next.js はこれを App Router のソースと誤認した。`/app/` 配下には `page.tsx` も `layout.tsx` も存在しないため、結果としてすべてのルートが 404 になる。

`/src/app/` 配下の正規の Next.js ページは無視された。

**対処**: Next.js プロジェクトを `web/` サブフォルダへ移動して、ルートの `/app/`（WP）と Next.js の `/web/app/`（あるいは `/web/src/app/`）を物理的に分離。

**学び**:
- Next.js の App Router 検出ロジックは設定で上書きできない（少なくとも Next.js 16 時点では）
- Headless WordPress + Local + Next.js を1リポジトリで運用する場合、Next.js は必ずサブフォルダに置く必要がある
- 設定で解決できないと判明したら、構造を変えるしかない（面接で語れる素材）

### 問題3: ファイル移動時に node_modules がロック

**現象**: `mv node_modules web/` で `Permission denied`。

**原因**: 直前まで稼働していた dev server のファイルウォッチャーが node_modules 内のファイルハンドルを保持していた。

**対処**:
- TaskStop で background task を停止 → 「No task found」（既に終了済み）
- それでも `node_modules` と `.next` はロック残存
- 数十秒後、Windows がハンドルを解放したタイミングで `rm -rf` が成功
- どうせ `web/` で再インストールするので、root の node_modules は **移動ではなく削除** することにした
- これにより複雑な権限問題を回避

**学び**: Node のファイルウォッチャーはプロセス終了後しばらくの間ハンドルを保持することがある。移動できないなら削除して再生成する、という割り切りも選択肢。

### 問題4: 一時ディレクトリ名にピリオドが使えない

**現象**:
```
Could not create a project called ".next-init" because of npm naming restrictions:
    * name cannot start with a period
```

**原因**: npm の package name 命名規則（先頭ピリオド禁止）が一時ディレクトリ名にも適用された。

**対処**: `.next-init` → `nordic-next-init` にリネーム。

**学び**: create-next-app が内部で npm のパッケージ名バリデーションを実行している。一時ディレクトリ名でも npm 規則に従う必要あり。

---

## 作成・変更ファイル

```
nordic-works/                       (Git ルート)
├ .gitignore                        (新規/更新、WP除外ルール中心)
├ web/                              (新規ディレクトリ)
│  ├ .gitignore                     (新規、Next.js固有)
│  ├ AGENTS.md                      (新規、Next.js 16 注意書き)
│  ├ README.md                      (新規、Next.js デフォルト)
│  ├ eslint.config.mjs              (新規)
│  ├ next-env.d.ts                  (新規)
│  ├ next.config.ts                 (新規、現状空コンフィグ)
│  ├ node_modules/                  (新規、350 パッケージ)
│  ├ package.json                   (新規、name: nordic-works)
│  ├ pnpm-lock.yaml                 (新規)
│  ├ pnpm-workspace.yaml            (新規)
│  ├ postcss.config.mjs             (新規)
│  ├ public/                        (新規、SVGアイコン4枚)
│  ├ src/
│  │  └ app/
│  │     ├ favicon.ico              (新規)
│  │     ├ globals.css              (新規)
│  │     ├ layout.tsx               (新規、Geist フォント・Tailwind)
│  │     └ page.tsx                 (新規、デフォルト welcome ページ)
│  └ tsconfig.json                  (新規)
```

依存関係総数: 350 パッケージ。

---

## 確定したバージョン

| ライブラリ | バージョン | docs 想定との差 |
|---|---|---|
| Node.js | v22.11.0 | 想定通り |
| pnpm | v10.33.4 | 想定通り |
| Next.js | **v16.2.6** | docs では v15 想定（要更新） |
| React | v19.2.4 | 想定通り |
| TypeScript | v5.9.3 | 想定通り |
| Tailwind CSS | v4.3.0 | 想定通り |
| eslint-config-next | v16.2.6 | Next.js に合わせて 16 |

---

## 最終的なフォルダ構造

```
nordic-works/             (Git リポジトリのルート)
├ .claude/                (Claude Code 設定)
├ .gitignore              (WP・Local関連の除外ルール)
├ CLAUDE.md               (プロジェクトドキュメント)
├ app/                    (Local WP、.gitignore で除外)
│  └ public/wp-content/plugins/nordic-works-core/   (← Git管理対象)
├ conf/                   (Local 設定、除外)
├ docs/                   (プロジェクトドキュメント、Git管理)
├ logs/                   (Local ログ、除外)
└ web/                    ← Next.js プロジェクト一式
   ├ .gitignore           (Next.js特有の除外ルール)
   ├ AGENTS.md
   ├ README.md
   ├ eslint.config.mjs
   ├ next-env.d.ts
   ├ next.config.ts
   ├ node_modules/        (除外)
   ├ package.json
   ├ pnpm-lock.yaml
   ├ pnpm-workspace.yaml
   ├ postcss.config.mjs
   ├ public/
   ├ src/
   │  └ app/
   │     ├ layout.tsx
   │     ├ page.tsx
   │     ├ globals.css
   │     └ favicon.ico
   └ tsconfig.json
```

---

## 動作確認結果

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
Vary: rsc, next-router-state-tree, next-router-prefetch, ...
Cache-Control: no-cache, must-revalidate
X-Powered-By: Next.js
```

dev server ログ:
```
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.56.1:3000
✓ Ready in 11.6s

○ Compiling / ...
 HEAD / 200 in 16.1s (next.js: 15.8s, application-code: 270ms)
```

ブラウザでデフォルトページ（Next.js ロゴ、`To get started, edit the page.tsx file.`、Deploy Now / Documentation ボタン）が表示されることを目視確認。

---

## 振り返り（面接で語れる素材）

### 1. 「設定で解決できないと判明した場合は、構造を変えて解消する」

Next.js の App Router 自動検出ロジックは、設定で上書きできない（少なくとも Next.js 16 時点）。最初は config 上の解決策を探したが、見つからないと判明した時点で「フォルダ構造を変えて解消する」判断に切り替えた。

回り道をしたが、原因を特定して根本的な解決に切り替えた一連の判断が面接で語れる。

### 2. 「ツールの最新版がドキュメント想定と異なる場合の意思決定」

`docs/05-tech-stack.md` は Next.js 15 を想定していたが、`@latest` で Next.js 16 が入った。ダウングレードする選択肢もあったが、AGENTS.md の注意書きを活用しつつ最新版で進める判断をした。

「ドキュメントの想定」より「最新の現実」を優先するべきタイミングを判断できた事例。

### 3. 「create-next-app が `.` での既存ディレクトリ初期化を拒否する」という細かい知見

公式ツールでも、思わぬプリチェックで失敗するケースがある。回避策（一時サブディレクトリで初期化 → ファイル移動）を編み出した。

---

## 次のタスク

`week-03-task-2-add-packages.md` (予定):
- motion / next-themes / algoliasearch / resend / react-email / zod / reading-time / @vercel/analytics などを `web/` に追加インストール

---

## 関連ドキュメント

- 仕様: `docs/05-tech-stack.md`（Week 3 完了後に Next.js 16 へ更新予定）
- 前のWeek総括: `docs/progress/week-02.md`
