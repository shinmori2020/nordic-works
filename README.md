# Nordic Works — Headless WordPress Portfolio

> 架空の B2B SaaS 企業「Nordic Works」のオウンドメディア + コーポレートサイトを **Headless WordPress + Next.js + Vercel** 構成で構築したポートフォリオプロジェクト。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![WordPress](https://img.shields.io/badge/WordPress-6.9-21759B?logo=wordpress)](https://wordpress.org/)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)](https://vercel.com)

---

## 🌐 デモ

| | |
|---|---|
| 公開URL | **<https://nordic-works.vercel.app>** |
| GitHub | <https://github.com/shinmori2020/nordic-works> |
| 動的機能のデモ動画 | （下記「動的機能のデモ動画」セクション参照） |

---

## 概要

通常の WordPress では原理的に難しい・実装が面倒な機能を中心に作り込んだ、**実案件レベルの Headless 構成**を体験できるサイトです。

主な構築要素:

- 📝 4 種のカスタム投稿タイプ + 3 種のタクソノミー + ACF
- 👀 **下書きプレビュー機能**（ブロックエディタ対応）
- ⚡ **On-demand Revalidation**（WP 更新 → フロント即時反映）
- 🔍 **Algolia 全文検索**（ファセット絞り込み + ハイライト）
- ✉️ **Resend お問い合わせフォーム**（Server Action + Zod + React Email）
- 🌗 ダークモード / スクロールアニメーション / 自動目次 / 読了進捗バー
- 🚀 SEO（sitemap・OGP・JSON-LD）/ 静的エクスポート / 画像同梱

合計: **28 記事 / 4 CPT / 6 業界・8 トピック・3 読了レベル**、画像 204 枚（同一画像のリサイズ違い含む）。

---

## 技術スタック

### フロントエンド
- **Next.js 16** (App Router, Server Components, Server Actions, draftMode)
- **React 19** / **TypeScript 5**
- **Tailwind CSS v4**（CSS 変数 + クラス連動ダークモード）
- **Motion** (旧 Framer Motion)
- **next-themes** — テーマ切替・永続化

### バックエンド・CMS
- **WordPress 6.9.4**（Local 運用）
- **Advanced Custom Fields**（無料版）
- **CPT UI** / **WPGraphQL**

### 外部サービス
- **Algolia** — 全文検索（lite client / Admin Key 分離設計）
- **Resend + React Email** — トランザクションメール
- **Vercel** — 静的サイト配信 + 自動デプロイ

### 検証ツール
- TypeScript strict mode / ESLint
- 全機能を `tsc --noEmit` + 実機 e2e で動作確認

---

## 実装した主要機能

### 編集者体験（ローカル動作）
- **下書きプレビュー**：WP 管理画面の「プレビュー」ボタン → secret token 認証 → `draftMode` 有効化 → Next.js で下書きを表示。**ブロックエディタ対応**（後述の落とし穴セクション参照）
- **On-demand Revalidation**：`save_post` / `transition_post_status` フックから webhook → `revalidatePath` + `revalidateTag` でキャッシュ即時クリア

### コーポレート
- トップページ（ヒーロー・最新記事・特集・サービス・採用導線）
- サービス一覧 / 詳細（機能・料金プラン・FAQ・導入事例）
- 採用情報一覧 / 詳細（雇用形態・必須/歓迎スキル・待遇）
- 会社概要 / お問い合わせ（Resend で実メール送信）

### メディア
- 記事一覧 / 詳細
- 著者プロフィール（その人が書いた記事一覧）
- 特集（関連記事カード付き）
- タクソノミー別ページ（`/topic/[slug]` / `/industry/[slug]` / `/reading-level/[slug]`）

### リッチUX
- **検索 `/search`**：Algolia ファセット絞り込み（横並びチップ + クリアボタン）
- **記事詳細**：自動目次（IntersectionObserver で現在地ハイライト）/ 読了進捗バー / 関連記事レコメンド
- **ダークモード**：OS 設定追従 + 手動切替 + `localStorage` 永続化
- **スクロールアニメ**：`Motion` のフェードイン（`prefers-reduced-motion` 対応）

### SEO・パフォーマンス
- 動的 `sitemap.xml`（61 URL）/ `robots.txt`
- `metadataBase` + 相対 canonical
- OGP / Twitter Card / JSON-LD（Organization + BlogPosting）
- 静的サイト生成（Edge 配信）+ 画像最適化

---

## アーキテクチャ

```
                              [ユーザー]
                                 ↓
                       [Vercel Edge Network]
                                 ↓
                     [Next.js 16 (静的 + ISR)]
        ┌────────────────────────┼────────────────────────┐
        ↓                        ↓                        ↓
  [data/*.json]            [Algolia API]              [Resend API]
  (リポジトリ同梱)           （検索）                    （メール送信）
        ↑
        │ ビルド前 export-wp
        │
  [ローカル WordPress]
        ↑
        │ save_post / transition_post_status
        │
  [WP プラグイン] ─── webhook (本番では発火しない) ─┐
                                                    ↓
                                  [Next.js /api/revalidate（ローカル）]
                                  [Next.js /api/preview（ローカル）]
```

公開 URL（Vercel）は **静的サイト**として動作するため、WP との直接接続はありません。動的な編集者体験（プレビュー・Revalidation）は **ローカル環境で完結**し、動画で証明する設計です（詳細は次節）。

---

## 動的機能のデモ動画

公開 URL は静的エクスポート構成のため、**プレビュー機能と On-demand Revalidation はローカル環境**でのみ動作します。実装が機能していることを以下の動画で確認できます。

### 🎬 下書きプレビュー機能
[![Preview Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID_1/0.jpg)](https://youtu.be/YOUR_VIDEO_ID_1)

WP 管理画面の「プレビュー」ボタン → Next.js で下書き表示 → プレビュー終了までの一連の流れ。secret token 認証 / 投稿タイプ別ルーティング / 下書き slug 自動生成 / ブロックエディタ対応など、Headless WP の落とし穴をすべて解決済み。

### 🎬 On-demand Revalidation
[![Revalidation Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID_2/0.jpg)](https://youtu.be/YOUR_VIDEO_ID_2)

WP で既存記事を更新 → 数秒以内に Next.js 側のキャッシュがクリアされ、リロードで即時反映される動作。`save_post` フックからの非同期 webhook と `revalidateTag('tag', 'max')`（Next.js 16 新仕様）の組み合わせ。

> 🔴 録画予定 — `YOUR_VIDEO_ID_1` / `YOUR_VIDEO_ID_2` は録画 + YouTube 限定公開後に差し替え予定。

---

## プロジェクト構成

```
nordic-works/
├ README.md                          ← このファイル
├ CLAUDE.md                          ← AI 補助作業用
├ docs/                              ← 設計・進捗ログ
│  ├ 01-overview.md 〜 09-deployment-strategy.md   設計ドキュメント
│  └ progress/                       Week 別の作業ログ（21ファイル）
├ web/                               ← Next.js プロジェクト
│  ├ src/
│  │  ├ app/                         App Router（ルートグループ別）
│  │  │  ├ (corporate)/              about, contact, services, careers
│  │  │  ├ (media)/                  articles, authors, features, topic, industry, reading-level
│  │  │  ├ api/                      preview, exit-preview, revalidate
│  │  │  ├ search/                   Algolia 検索ページ
│  │  │  ├ sitemap.ts / robots.ts
│  │  │  └ actions/contact.ts        Resend 送信 Server Action
│  │  ├ components/                  カード・検索UI・ダークモードトグル等
│  │  ├ emails/                      React Email テンプレート
│  │  └ lib/                         wordpress.ts / algolia.ts / site.ts / toc.ts / utils.ts
│  ├ scripts/                        export-wp / index-algolia / add-dark-variants
│  ├ data/                           WP→JSON エクスポート結果（ビルド時に読まれる）
│  └ public/wp-uploads/              WP メディア（リポジトリ同梱）
└ app/public/wp-content/plugins/nordic-works-core/
   ├ nordic-works-core.php           CPT/タクソノミー登録 + Headless 連携フック
   ├ acf-json/                       ACF フィールドグループ JSON
   └ scripts/                        seed-content.php / seed-more-articles.php
```

---

## セットアップ

### 必要環境
- Node.js v20 以上
- pnpm v10
- WordPress 環境（Local 等）+ ACF + WPGraphQL + CPT UI

### 1. 取得 & 依存関係インストール
```bash
git clone https://github.com/shinmori2020/nordic-works.git
cd nordic-works/web
pnpm install
```

### 2. 環境変数
```bash
cp web/.env.example web/.env.local
# 各キーを設定
```

`web/.env.example` に変数の意味と取得方法を記載しています。

### 3. WordPress 側
プラグイン `app/public/wp-content/plugins/nordic-works-core/` を有効化し、シーダーで初期コンテンツを投入:

```bash
# Local の Site Shell から
wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-content.php
wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-more-articles.php
```

### 4. データ取得 & 開発サーバー
```bash
cd web
pnpm run export-wp        # WP → JSON エクスポート + 画像DL
pnpm run index-algolia    # Algolia へバルクインデックス
pnpm dev                  # http://localhost:3000
```

### 5. 本番ビルド（Vercel と同じ構成で動作確認）
```bash
DATA_SOURCE=static pnpm build && pnpm start
```

---

## 工夫した点 / 解決した落とし穴

### 1. ACF 無料版でリピーターが使えない
**Pro 版でしか使えないリピーターフィールド**を、Textarea + `|` 区切り形式に置き換え、フロントエンドの `parseLines` / `parseFaq` 等のパーサで構造化データに復元する設計に変更。**ACF Pro なしで同等の体験**を実現。

### 2. ACF の参照系フィールドが REST API では ID で返る
ACF の `post_object` / `relationship` / `image` フィールドは、`return_format` 設定にかかわらず WP REST API では**数値 ID**として返ります。`getPostsByIds()` / `getAuthorById()` などの解決層を追加し、画像は `_embed` の `wp:featuredmedia` 経由で取得する設計に統一。

### 3. ブロックエディタの「プレビュー」が PHP フィルターを通らない
WP の `preview_post_link` フィルターは古典エディタ向け。ブロックエディタ（Gutenberg）は REST API の `post.link` を起点に JS で URL を組み立てるため、`post_link` / `post_type_link` フィルターで REST 上の `link` 自体を `/api/preview?...` に書き換えて対応。

### 4. 下書き記事に slug が無くプレビュー URL が組めない
下書きは `post_name` が空のことが多いため、`wp_insert_post_data` フィルターで `sanitize_title($post->post_title)` から slug を自動生成。さらに `/api/preview` に `id` フォールバックを実装し、空 slug でも認証付き REST で解決可能に。

### 5. Next.js 16 の `revalidateTag` シグネチャ変更
`revalidateTag(tag)` が `revalidateTag(tag, profile)` に変わり第2引数必須化。`'max'` を渡して即時パージ相当の挙動を維持。

### 6. 日本語 slug の URL エンコード/デコード境界
WP REST が返すタームの slug は URL エンコード済み（`%e3%83%9e...`）、Next.js `params.slug` はデコード済み（`マネジメント`）。`generateStaticParams` で `decodeURIComponent`、API 呼び出しで `encodeURIComponent` を要所で挟むことで双方向に対応。

### 7. Local WP は Vercel から見えない
Vercel ビルド時にローカル WP には到達できないため、`scripts/export-wp-data.mjs` で **WP REST → JSON + 画像** をビルド前に書き出し、`DATA_SOURCE=static` で読む二重化設計に。WP ホスティングへの移行も `DATA_SOURCE=api` に切り替えるだけで完結。

### 8. Tailwind v4 のダークモード対応
Tailwind v4 のデフォルト `dark:` は `prefers-color-scheme` 連動。`@custom-variant dark (&:where(.dark, .dark *))` でクラス連動に切替えて、next-themes と統合。全 20 ファイルへの `dark:` バリアント適用は変換スクリプトで機械的に実施し、自己再マッチを `(?<!dark:)` で防いだ。

---

## 採用面接で語れるエピソード（抜粋）

- **「Next.js 16 の `revalidateTag` 仕様変更にどう気づき対処したか」**
- **「ブロックエディタのプレビュー対応で REST `post.link` 書き換えに辿り着いた経緯」**
- **「ACF 無料版の制約を Pro 課金ではなく設計で解決した」**
- **「Local WP を Vercel に載せるための二重化（api ↔ static）設計」**
- **「Search-Only / Admin の鍵分離による安全な Algolia 統合」**

詳細は [`docs/08-portfolio-prep.md`](./docs/08-portfolio-prep.md) を参照。

---

## 意図的にやらなかったこと（誠実な範囲設定）

- **テストコード**：ポートフォリオの限られた期間内でフロントを厚くする判断。E2E は手動で網羅。
- **多言語化（i18n）**：日本語サイト前提。`next-intl` 等は実案件で別途使用経験あり。
- **WP ホスティングの本番運用**：Local 運用 + 静的エクスポートで代替。コード上は移行容易な設計。
- **CMS の WYSIWYG ガード**：エディタ側の HTML サニタイズは標準の WP に委ねる。
- **A/B テスト / 計測ツール（Hotjar等）**：Vercel Analytics の Server-side 計測のみ。

---

## ライセンス

MIT
