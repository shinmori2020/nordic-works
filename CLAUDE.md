# Nordic Works - Headless WordPress Portfolio Project

このプロジェクトのドキュメントは `docs/` フォルダにあります。
**タスク開始前に必ず `docs/README.md` を読み、関連するドキュメントを参照してください。**

---

## プロジェクト概要

架空のB2B SaaS企業「Nordic Works」のオウンドメディア+コーポレートサイトを
Headless WordPress構成で構築するポートフォリオプロジェクト。

詳細: `docs/01-overview.md`

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **CMS**: WordPress + ACF Pro + WPGraphQL（ローカル運用）
- **アニメーション**: Motion (旧 Framer Motion)
- **検索**: Algolia
- **メール**: Resend + React Email
- **デプロイ**: Vercel

詳細: `docs/05-tech-stack.md`

## 開発の進め方

1. 現在のWeekに該当するタスクを `docs/07-roadmap.md` で確認
2. 該当Weekで使うskillを後述「Week別のskill使用ガイド」で確認
3. 機能の実装詳細は `docs/06-features.md` を参照
4. WordPress側の実装は `docs/04-wordpress.md` を参照
5. ファイル作成・変更時は `docs/05-tech-stack.md` のディレクトリ構成に従う

---

## 重要な前提

### 運用構成

**Local WordPress + 静的エクスポート + Vercel構成**を採用しています。

- 開発時: ローカル Next.js ↔ ローカル WordPress（ライブAPI）
- 本番時: Vercel（JSON静的データ）+ Algolia + Resend
- 動的機能（プレビュー、Revalidation）はローカル動作 + デモ動画

詳細: `docs/09-deployment-strategy.md`

### Next.js 15 のキャッシュ仕様

**fetchはデフォルトでキャッシュされない**。明示的に指定が必要:

```typescript
fetch(url, { cache: 'force-cache' })          // SSG相当（永続キャッシュ）
fetch(url, { next: { revalidate: 3600 } })    // ISR（時間ベース再生成）
fetch(url)                                     // 動的取得（デフォルト）
```

### データ取得の二重化

環境変数 `DATA_SOURCE` で「ライブAPI取得」と「JSONファイル読み込み」を切替:

- `DATA_SOURCE=api` → WordPress REST APIから取得（開発時）
- `DATA_SOURCE=static` → `data/*.json` から読み込み（本番ビルド時）

実装は `src/lib/wordpress.ts` に集約。

---

## ドキュメント参照ガイド

| 何をしたい時 | 参照ファイル |
|------------|------------|
| プロジェクト全体像を把握したい | `docs/01-overview.md` |
| Headless WPの概念を確認したい | `docs/02-headless-wordpress.md` |
| サイト構造・ページ仕様を知りたい | `docs/03-site-design.md` |
| WordPress側のCPT/ACF設計を実装する | `docs/04-wordpress.md` |
| Next.js初期化・パッケージ追加する | `docs/05-tech-stack.md` |
| 機能（プレビュー、ISR、検索等）を実装する | `docs/06-features.md` |
| 今週のタスクを確認する | `docs/07-roadmap.md` |
| 本番デプロイ・デモ動画の準備をする | `docs/09-deployment-strategy.md` |
| README作成・面接準備をする | `docs/08-portfolio-prep.md` |

---

## skillsの活用ガイド

`.claude/skills/` 内のskillについて、互換性チェックの結果に基づく使用方針です。

### 🟢 主要に使うskills（6つ）

| Skill | 主な用途 | 主な使用Week |
|-------|---------|------------|
| `accessibility` | フォームa11y、WCAG AA対応、axe DevToolsチェック | Week 4, 6, 7, 8 |
| `core-web-vitals` | LCP/INP/CLS、Lighthouseスコア対策 | Week 4, 8 |
| `performance` | 速度最適化（preconnect, preload, lazy load） | Week 4, 8 |
| `seo` | robots.txt, sitemap, canonical, JSON-LD | Week 8 |
| `frontend-design` | UI設計、ビジュアル方針 | Week 4, 7 |
| `web-quality-audit` | 上記5skillを統合した親skill、最終チェック用 | Week 8 |

### 🟡 範囲を限定して使うskills（3つ）

#### `best-practices`
- **利用**: コード品質チェック全般、`npm audit` 等
- **注意**: CSP/HSTSなどHTTPヘッダ前提の例はVercel環境では `next.config.ts` または `vercel.json` 経由になる。`docs/05-tech-stack.md` の `next.config` 設定と整合させること
- **使用Week**: Week 8直前のセキュリティ確認

#### `wordpress-pro`
- **利用する章**:
  - `references/plugin-architecture.md` の Custom Post Types & Taxonomies
  - `references/hooks-filters.md` の REST API HOOKS / REST API FILTERS / Actions（`save_post`, `transition_post_status`）
  - `references/performance-security.md` の Security Hardening
- **無視する章**:
  - `references/theme-development.md` 全般（Template Hierarchy、Classic/FSE Theme は Next.js が代替）
  - `references/gutenberg-blocks.md` の描画コード（構造化JSON出力のみ活用）
- **使用Week**: Week 2（CPT登録）、Week 5-6（functions.php編集）

#### `wp-performance-review`
- **利用**: Week 5-6 の `save_post` → revalidate / Algolia POST 実装のレビュー時のみ
- 通常のテンプレートPHPレビュー機能は本プロジェクトでは出番なし

### 🔴 使用しないskills（3つ）

以下のskillsは本プロジェクトと根本的に合わないため、トリガー条件が合致しても呼び出さないでください:

#### `ui-designer`
`npx create-react-app` を案内するが、CRAは2023年に非推奨化済み。本プロジェクトはNext.js 15 App Routerで初期化済み。テンプレート内に中国語プレースホルダ（`{项目背景}` 等）も残存。
**代替**: UI設計が必要な場合は `frontend-design` を使用

#### `web-design-builder`
単一HTMLファイル生成前提のワークフロー（`<!DOCTYPE html>` から生成）。App RouterのServer/Client Components構成と前提が合わない。Playwright MCP検証も未設定。
**代替**: 静的モックが必要な場合のみ限定使用。基本的には `frontend-design` を使用

#### `interface-design`
SKILL.md内で「Use for: Dashboards, admin panels, SaaS apps... Not for: Landing pages, marketing sites」と明示。本プロジェクトはB2Bメディア+コーポレートで、自己宣言されたスコープ外。
**代替**: `frontend-design` を使用

### Week別のskill使用ガイド

| Week | 主タスク | 使用するskills |
|------|--------|--------------|
| 1 | 概念理解・ワイヤー | （補助的に `frontend-design`） |
| 2 | WP構築（CPT/ACF/GraphQL） | `wordpress-pro`（Hooks/REST/CPT章のみ） |
| 3 | Next.js最小実装 | （補助的に `frontend-design`, `accessibility`） |
| 4 | コア機能・Lighthouse 80+ | `performance`, `core-web-vitals`, `accessibility`, `seo`, `frontend-design` |
| 5 | プレビュー + On-demand Revalidation | `wordpress-pro`（functions.phpセキュリティ） |
| 6 | Algolia + Resend フォーム | `accessibility`（フォーム）, `wordpress-pro`（save_postフック）, `wp-performance-review`（webhook実装レビュー） |
| 7 | リッチUX（Motion / ダークモード / 目次） | `frontend-design`, `accessibility`（prefers-reduced-motion） |
| 8 | 仕上げ・Lighthouse 90+ | `web-quality-audit`（親）, `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices` |

### `web-quality-audit` の位置づけ

`web-quality-audit` は `performance` / `accessibility` / `seo` / `best-practices` / `core-web-vitals` を意図的に統合した親skillです。重複は仕様です。

**使い分け**:
- 個別観点を深堀りする時 → 各個別skillを使う
- 総合的な最終チェック（Week 8など） → `web-quality-audit` を使う

---

## コミットメッセージ規約

英語、Conventional Commits 形式:

```
feat: add preview mode for draft posts
fix: correct image optimization for WP media
docs: update README with deployment steps
refactor: simplify wordpress fetcher
chore: update WP data export
style: format code with prettier
test: add unit tests for fetcher
```

---

## 開発時の留意事項

- WordPress側のコードを書く際は `wordpress-pro` skill の指定章を参照しつつ、Headless固有の実装は `docs/06-features.md` を優先する
- Next.js側のコードでは Server Components / Server Actions を積極的に活用する
- 全てのfetchで適切なキャッシュ戦略を指定する（v15のデフォルトは「キャッシュなし」）
- TypeScriptの型はWordPressレスポンスを `src/types/wordpress.ts` で集約管理する
- 環境変数は `.env.local`（Git管理外）と `.env.example`（Git管理）に分離する
- Tailwind CSSの `dark:` バリアントを使う際は、CSS変数で配色を一元管理する
- 画像はNext.js Imageコンポーネントを使い、`next.config.ts` の `remotePatterns` に必要なドメインを追加する

---

## トラブルシューティング

### よくあるエラーと対処

**Next.jsのfetchが想定通りキャッシュされない**
→ Next.js 15ではデフォルトでキャッシュされない。`cache: 'force-cache'` または `next: { revalidate: N }` を明示する

**Vercel上で画像が表示されない**
→ `next.config.ts` の `images.remotePatterns` に WordPress のドメインが登録されているか確認する

**プレビュー機能が動かない**
→ Application Password認証、secret token一致、`preview_post_link`フィルターの3点を確認する。詳細は `docs/06-features.md`

**On-demand Revalidationが反映されない**
→ secret tokenの一致、`revalidateTag` / `revalidatePath` のタグ・パスがfetch側の指定と一致しているか確認する
