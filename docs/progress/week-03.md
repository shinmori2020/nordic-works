# Week 3 作業ログ — Next.js 最小実装

**期間**: 〜 2026-05-16
**ステータス**: ✅ 完了
**前提**: Week 1・2 完了済み（Local WP環境、CPT/ACF/ダミーコンテンツ投入済み）

---

## サマリ

Next.js 16 プロジェクトを初期化し、WordPress REST API からデータを取得して記事一覧・記事詳細ページを表示する基盤を構築した。Headless WordPress の本質である「WordPress に投入したコンテンツが Next.js のページに描画される」状態を達成。最後に GitHub 公開リポジトリを作成し初回 push まで完了。

Week 3 のゴール「`localhost:3000/articles` で記事一覧が表示され、各記事の詳細ページに遷移できる + GitHub公開リポジトリ」を全て達成した。

---

## 達成タスク

- [x] 1. Next.js プロジェクト初期化
- [x] 2. 追加パッケージインストール
- [x] 3. ディレクトリ構成セットアップ
- [x] 4. 環境変数設定
- [x] 5. WordPress 接続関数の実装
- [x] 6. TypeScript 型定義
- [x] 7. 記事一覧・記事詳細の最小UI実装
- [x] 8. キャッシュ仕様の明示（Task 5・7 に統合）
- [x] 9. GitHub リポジトリ作成・初回push

各タスクの詳細ログは `week-03-task-N-*.md` を参照。

---

## 作業内容詳細

### Task 1: Next.js プロジェクト初期化

`pnpm create next-app@latest` で初期化。**Next.js 16.2.6** がインストールされた（docs 想定の v15 から最新版に上昇）。

最大の課題は **ルートの `app/`（Local の WordPress）と Next.js の App Router の衝突**。Next.js は `/app/` を App Router ソースとして優先検出するため、全URLが404になった。解決策として Next.js を `web/` サブフォルダに移動して物理的に分離。

### Task 2: 追加パッケージインストール

motion / next-themes / algoliasearch / resend / react-email / zod / reading-time / @vercel/analytics 等10種を追加。

`react-email` が内部で使う esbuild の postinstall が pnpm v10 のセキュリティ機能でブロックされ、CSS処理がクラッシュした。`pnpm-workspace.yaml` に `onlyBuiltDependencies: [esbuild]` を追加して解決。

### Task 3: ディレクトリ構成セットアップ

`docs/05-tech-stack.md` の構成に従い `web/src/` 配下に30ディレクトリを作成。ルートグループ `(corporate)` `(media)`、動的ルート `[slug]`、API ルートの受け皿。空ディレクトリには `.gitkeep` を配置。

### Task 4: 環境変数設定

`.env.local`（実値・Git管理外）と `.env.example`（テンプレート・Git管理対象）を分離。`.gitignore` に `!.env.example` 例外を追加。`NEXT_PUBLIC_` プレフィックスのスコープ設計を意識。

### Task 5: WordPress 接続関数の実装（Week 3 のメインタスク）

`src/lib/wordpress.ts` に13関数を実装:
- 各CPT取得（getPosts / getServices / getCareers / getFeatures / getAuthors と各 BySlug）
- タクソノミー取得（getIndustries / getTopics / getReadingLevels）

REST API + `_embed` で関連データを一括取得。各 fetch に `revalidate` + `tags` を設定（Next.js 15+ のキャッシュ仕様対応）。`DATA_SOURCE` 環境変数で api/static を切替える枠組みも組み込み。

暫定トップページで動作確認 → 投稿13・サービス3・採用2・特集2・著者3・タクソノミー17が全て期待通り取得できることを確認。

### Task 6: TypeScript 型定義

Task 5 で `wordpress.ts` 内にインライン定義した型を `src/types/wordpress.ts` に切り出し。ACFリピーターの sub-field 型、Next.js 動的ルート型（`SlugPageProps`）を追加。共通ベース型 `WPEntityBase` で DRY 化。`tsc --noEmit` で型エラーゼロを確認。

### Task 7: 記事一覧・記事詳細の最小UI実装（Week 3 フィナーレ）

- `next.config.ts` に `images.remotePatterns` を追加（WP画像を Next.js Image で表示可能に）
- `src/lib/utils.ts` に埋め込みデータ取得ヘルパー
- `ArticleCard` コンポーネント
- `/articles`（記事一覧）と `/articles/[slug]`（記事詳細）を実装
- `generateStaticParams` で全記事を静的生成、`notFound()` で404処理

### Task 8: キャッシュ仕様の明示

独立タスクではなく Task 5・7 に統合。全 fetch（`revalidate` + `tags`）と全ページ（`export const revalidate`）でキャッシュ戦略を明示済み。

### Task 9: GitHub リポジトリ作成・初回push

プロジェクトルートで `git init`。`.gitignore` をコミット前に dry-run で厳密検証（node_modules・WPコア・機密情報の混入ゼロを確認）。`.claude/` フォルダは除外。初回コミット73ファイルを Conventional Commits 形式で作成し、GitHub 公開リポジトリ `shinmori2020/nordic-works` に push。

---

## 作成・変更ファイル一覧

```
nordic-works/
├ .gitignore                       (新規→更新、WP/Local/Claude除外)
├ web/                             (新規、Next.js プロジェクト)
│  ├ .gitignore                    Next.js固有除外
│  ├ .env.local / .env.example     環境変数
│  ├ next.config.ts                images.remotePatterns
│  ├ package.json 他               設定一式
│  └ src/
│     ├ app/
│     │  ├ page.tsx                暫定トップ（データ検証ページ）
│     │  ├ layout.tsx / globals.css
│     │  └ (media)/articles/
│     │     ├ page.tsx             記事一覧
│     │     └ [slug]/page.tsx      記事詳細
│     ├ components/media/ArticleCard.tsx
│     ├ lib/wordpress.ts           WP接続関数13個
│     ├ lib/utils.ts               埋め込みデータヘルパー
│     └ types/wordpress.ts         型定義 約25個
└ docs/progress/
   └ week-03*.md                   作業ログ8本（task別 + 本総括）
```

---

## 重要な意思決定

| # | 決定事項 | 採用 | 理由 |
|---|---|---|---|
| 1 | Next.js の配置場所 | `web/` サブフォルダ | ルートの `app/`（WP）との App Router 衝突を回避 |
| 2 | Next.js バージョン | 16.2.6（最新） | docs想定の v15 から更新。最新版で進める判断 |
| 3 | パッケージマネージャ | pnpm | docs推奨、ディスク効率 |
| 4 | データ取得方式 | REST API + `_embed` | GraphQL より最速で動く。GraphQL は将来オプション |
| 5 | エラー時の戻り値 | null / 空配列（throw しない） | 呼び出し側のハンドリングを単純化 |
| 6 | 型の置き場所 | `src/types/wordpress.ts` に集約 | lib=振る舞い、types=形 の責務分離 |
| 7 | Git 管理範囲 | 自作コードのみ（WP本体除外） | 再現可能なものはコミットしない方針 |
| 8 | `.claude/` の扱い | Git 除外 | 汎用ツール設定でありポートフォリオの成果物ではない |

---

## 動作確認結果

### 開発サーバー
```
▲ Next.js 16.2.6 (Turbopack)
- Local: http://localhost:3000
- Environments: .env.local
```

### ページ
| URL | 結果 |
|---|---|
| `/` | 200 OK（暫定データ検証ページ） |
| `/articles` | 200 OK、記事カード13枚 |
| `/articles/[slug]` | 200 OK、本文・著者・画像表示 |
| `/articles/存在しないslug` | 404 Not Found（`notFound()` 動作） |

### 型チェック
```
$ pnpm exec tsc --noEmit
EXIT: 0  (型エラーなし)
```

### GitHub
```
https://github.com/shinmori2020/nordic-works
初回コミット 73ae692 / 73ファイル / origin/main 追跡
```

---

## 詰まったポイントと解決方法（Week 3 全体）

| 問題 | 原因 | 解決 |
|---|---|---|
| 全URLが404 | ルート `app/`（WP）を Next.js が App Router と誤認 | Next.js を `web/` サブフォルダに移動 |
| CSS処理が500エラー | pnpm v10 が esbuild の postinstall をブロック | `pnpm-workspace.yaml` に `onlyBuiltDependencies` 追加 |
| dev server がポート競合 | 旧 `next dev` の孤児プロセスが port 3000 占有 | `taskkill /PID <PID> /F`（毎回発生する既知パターン） |
| create-next-app が初期化拒否 | ルートに既存ファイルがある | 一時サブディレクトリで作成 → ファイル移動 |
| `grep -c` でシェルが停止 | マッチ0件で exit code 1 | `\|\| true` でガード |

---

## 次週（Week 4）への引き継ぎ事項

### Week 4 でやること（コア機能完成）

1. 残り全ページ実装（トップ、会社概要、サービス一覧/詳細、採用一覧/詳細、著者一覧/詳細、特集一覧/詳細、カテゴリ別、タグ別、404）
2. 共通ヘッダー・フッター・ナビゲーション
3. SEO基本（`generateMetadata`、OGP、Twitter Card、canonical）
4. 画像最適化（blurDataURL）
5. レスポンシブ対応
6. **Vercel 初回デプロイ → 公開URL確保**
7. Lighthouse スコア 80+

### 引き継ぎメモ

- 暫定トップページ（`src/app/page.tsx`）は Week 4 で本物に置き換える
- 記事本文は `dangerouslySetInnerHTML` + `.article-body` の最小スタイル。Week 4/7 で `@tailwindcss/typography` 導入を検討
- 共通ヘッダー未実装。各ページは個別の戻りリンクで暫定対応中
- dev server 再起動時は孤児プロセスに注意（PID を taskkill）

### 積み残し宿題

- `docs/05-tech-stack.md` を Next.js 16 + `web/` 構成に更新（→ 本タスクと同時に対応）
- `.gitattributes` 追加（改行コード正規化、任意）
- `@react-email/components` deprecated の再評価（Week 6 実装時）

---

## 振り返り（面接で語れる素材）

### 1. 「設定で解決できないと判明したら構造を変える」
Next.js の App Router 自動検出は設定で上書きできない。WordPress の `app/` フォルダとの衝突を、`web/` サブフォルダへの移動という構造変更で根本解決した。

### 2. 「フレームワークの最新版とドキュメント想定のズレへの対応」
docs は Next.js 15 想定だったが 16 が入った。AGENTS.md の警告を活用しつつ最新版で進める判断をした。

### 3. 「Next.js 15+ キャッシュ仕様への対応」
fetch がデフォルト非キャッシュになった仕様変更を理解し、ページ特性ごとに `revalidate` 値を設計。`tags` で On-demand Revalidation の伏線も設置。

### 4. 「Server Components によるゼロJSのページ」
記事一覧・詳細を全て Server Component で実装。クライアントへ JS を送らず、サーバーで HTML を組み立てる構成。

### 5. 「コミット前の `.gitignore` 検証」
`git add --dry-run` で「何がコミットされるか」を事前確認し、機密情報や巨大ファイルの混入を防いだ。

### 6. 「型の集約管理と責務分離」
`lib`=振る舞い、`types`=形 という責務分担。ACF の `false` 返却を型に組み込み、実行時エラーを型システムで予防。

---

## Week 3 成果サマリ

```
Next.js 16.2.6 プロジェクト (web/)
├ WordPress 接続層: 13関数 (REST API + キャッシュ戦略)
├ TypeScript 型: 約25型を src/types に集約
├ 記事一覧ページ /articles (13記事カード表示)
├ 記事詳細ページ /articles/[slug] (本文・著者・画像・404)
├ ディレクトリ構成: 全ルートグループ・動的ルートの受け皿完成
└ GitHub 公開リポジトリ: shinmori2020/nordic-works (73ファイル)

到達点: Headless WordPress の本質的動作が完成
       「WP に投入したデータが Next.js のページに表示される」
```

8週間中3週完了（37.5%）。基盤フェーズ終了、Week 4 からコア機能の作り込みフェーズへ。

---

## 関連ドキュメント

- 各タスク詳細: `week-03-task-1〜9-*.md`
- 前週総括: `week-02.md`
- ロードマップ: `docs/07-roadmap.md`
