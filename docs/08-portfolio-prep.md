# 08. ポートフォリオ化の最終ステップ

8週間の成果物（Nordic Worksサイト）を、採用や案件獲得で活かすための整え方。

---

## GitHubリポジトリの整え方

### READMEテンプレート

```markdown
# Nordic Works - Headless WordPress Portfolio

> 架空のB2B SaaS企業「Nordic Works」のオウンドメディア+コーポレートサイトを
> Headless WordPress構成で構築したポートフォリオプロジェクト。

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://vercel.com)

## デモ

- 🌐 公開URL: https://nordic-works.vercel.app
- 📸 スクリーンショット: 後述
- 🎥 動的機能のデモ動画: 後述

## 動的機能のデモ動画

公開URLは静的エクスポート構成のため、以下の機能はローカル環境で動作させたデモ動画でご確認ください。

### 下書きプレビュー機能
[![Preview Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID_1/0.jpg)](https://youtu.be/YOUR_VIDEO_ID_1)

WordPress管理画面の「プレビュー」ボタンから、Next.js側で下書き記事を表示する一連の流れ。
secret token認証、投稿タイプごとのパスマッピング、プレビュー終了処理まで含む。

### On-demand Revalidation
[![Revalidation Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID_2/0.jpg)](https://youtu.be/YOUR_VIDEO_ID_2)

WordPressで記事を更新した瞬間にNext.js側にキャッシュクリアがwebhookで通知され、即座に反映される動作。

## 概要

実案件で求められるHeadless WordPress構成を、深掘りして実装したポートフォリオ。
通常のWordPressでは原理的に難しい以下の体験を盛り込んでいる:

- 編集者向けの下書きプレビュー機能
- WordPress更新と同時にフロントへ自動反映（On-demand Revalidation）
- WordPress + Algolia + Resend のマルチデータソース統合
- リッチなフロントエンド体験（スクロールアニメーション、ダークモード等）

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS**
- **Motion** (旧Framer Motion) — アニメーション
- **next-themes** — ダークモード

### バックエンド・CMS
- **WordPress** (CMS as Backend)
- **Advanced Custom Fields Pro** — カスタムフィールド
- **WPGraphQL** — GraphQL API

### サードパーティサービス
- **Algolia** — 全文検索
- **Resend + React Email** — お問い合わせメール
- **Vercel** — デプロイ + Analytics + Speed Insights

## 実装した主要機能

- 📝 **カスタム投稿タイプ4種**（service, career, feature, author_profile）
- 👀 **下書きプレビュー機能**（draftMode + WP preview_post_link連携 + secret token認証）
- ⚡ **On-demand Revalidation**（WPのsave_postフック → Next.jsへのwebhook → revalidateTag）
- 🔍 **Algolia全文検索**（WP更新時に自動インデックス、ハイライト・フィルター対応）
- ✉️ **お問い合わせフォーム**（Server Actions + Zod + React Email、自動返信付き）
- 📖 **動的目次**（h2/h3を抽出、IntersectionObserverで現在地ハイライト）
- ⏱️ **読了時間表示**
- 🌙 **ダークモード**
- 📱 **完全レスポンシブ**
- 🎨 **スクロール連動アニメーション**
- 🚀 **ISR**（ページごとに最適なrevalidate値を設定）
- 🖼️ **画像最適化**（Next.js Image + remotePatterns + blurDataURL）
- 🔍 **SEO**（動的メタタグ、OGP、Twitter Card、JSON-LD構造化データ、sitemap.xml）

## アーキテクチャ

\`\`\`
[ユーザー] ←→ [Vercel Edge Network] ←→ [Next.js 15 App]
                                          ↓
              ┌───────────────────┼────────────────────┐
              ↓                    ↓                     ↓
        [WordPress API]      [Algolia]              [Resend]
        ↑   ↓                                          ↑
        ↑   ↓                                          │
   [WP管理画面] ─ webhook ─→ [/api/revalidate]         │
        │                                              │
        └─── save_post ─→ [/api/algolia-index]    [/api/contact]
\`\`\`

## セットアップ

### 必要環境

- Node.js v22 LTS以上
- pnpm
- ローカルWordPress環境（Local等）

### 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/your-username/nordic-works.git
cd nordic-works
pnpm install
\`\`\`

### 2. 環境変数の設定

\`.env.example\`を\`.env.local\`にコピーして必要な値を設定:

\`\`\`bash
cp .env.example .env.local
\`\`\`

必要な環境変数:
- \`WORDPRESS_API_URL\`
- \`WORDPRESS_PREVIEW_SECRET\`
- \`REVALIDATE_SECRET\`
- \`NEXT_PUBLIC_ALGOLIA_APP_ID\`
- \`NEXT_PUBLIC_ALGOLIA_SEARCH_KEY\`
- \`ALGOLIA_ADMIN_KEY\`
- \`RESEND_API_KEY\`

### 3. WordPress側のセットアップ

\`wordpress-setup/\`ディレクトリに、functions.phpへ追記するコードを含めています。
詳細は \`wordpress-setup/README.md\` 参照。

### 4. 開発サーバー起動

\`\`\`bash
pnpm dev
\`\`\`

## スクリーンショット

### デスクトップ
![Top Page](./docs/screenshots/desktop-top.png)
![Article Detail](./docs/screenshots/desktop-article.png)

### モバイル
![Mobile Top](./docs/screenshots/mobile-top.png)
![Mobile Search](./docs/screenshots/mobile-search.png)

### ダークモード
![Dark Mode](./docs/screenshots/dark-mode.png)

## 工夫した点

### 1. Next.js 15のキャッシュ仕様変更への対応

v14ではfetchがデフォルトでキャッシュされていたが、v15でデフォルトキャッシュなしに変更された。
全fetchを見直し、ページごとに適切な\`revalidate\`値を設定。

### 2. プレビュー機能の自前実装

通常WPでは標準機能だが、Headlessでは自前実装が必要。
\`draftMode()\` + WP側の\`preview_post_link\`フィルター + secret token認証の3要素で実現。

### 3. マルチデータソース統合の自然な設計

WP単独では難しい全文検索をAlgoliaで補完。WordPress更新時に自動同期する仕組み。
「なぜこの構成か」を技術的根拠を持って説明できる設計。

## 運用構成

ポートフォリオとしての公開コストを抑える判断で、**Local WordPress + 静的エクスポート + Vercel**の構成を採用しています。

```
[開発時]
ローカルWP ←→ ローカル Next.js（ライブ取得）

[ビルド・公開時]
ローカルWP → エクスポートスクリプト → JSON → Git → Vercel（静的サイト）
```

データエクスポートスクリプト（`scripts/export-wp-data.ts`）でWordPress→JSON変換を行い、Vercel上では静的データとして配信。Algolia検索とResendメール送信は外部サービスなので本番でも完全動作します。

本番WordPress運用への切替が必要になった場合、データ取得関数の二重化設計により最小限の変更で対応可能です。

## ライセンス

MIT
```

### `.env.example` の用意

実際の値は入れず、変数名と説明だけのテンプレートをリポジトリに含める。

```bash
# WordPress
WORDPRESS_API_URL=
WORDPRESS_GRAPHQL_URL=

# Preview Feature
WORDPRESS_PREVIEW_SECRET=

# Revalidation
REVALIDATE_SECRET=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=

# Resend
RESEND_API_KEY=
CONTACT_EMAIL_FROM=
CONTACT_EMAIL_TO=
```

### ブランチ運用

- `main`: 本番リリース版
- `develop`: 開発中（任意）
- 機能ごとにfeatureブランチを切る習慣

### コミットメッセージ

英語で統一すると印象が良い。Conventional Commitsを参考にする:

```
feat: add preview mode for draft posts
fix: correct image optimization for WP media
docs: update README with deployment steps
refactor: simplify wordpress fetcher
```

---

## ポートフォリオサイトへの掲載

自分のポートフォリオページに以下を載せる:

### プロジェクト紹介セクションのテンプレート

```
# Nordic Works
Headless WordPress構成のB2B SaaS向けオウンドメディア+コーポレートサイト

## 概要
（3行で要約）

## 使用技術
Next.js 15, TypeScript, Tailwind CSS, WordPress, Algolia, Resend, Vercel

## 工夫した点（3〜5項目）
- Next.js 15のキャッシュ仕様変更に対応した適切なISR設計
- WordPress編集者向けの下書きプレビュー機能を自前実装
- WordPress更新と同時にフロントへ自動反映する仕組み
- 全文検索をAlgoliaで補完したマルチデータソース構成

## リンク
🌐 [サイトを見る](https://nordic-works.vercel.app)
💻 [GitHubで見る](https://github.com/.../nordic-works)
```

---

## 採用面接で語れるエピソード

以下のエピソードを事前に整理し、それぞれ2〜3分で語れるようにしておく。

### エピソード1: 「Next.js 15のキャッシュ仕様変更にどう対応したか」

**話す内容の骨子**
- Next.js 14ではfetchが自動キャッシュされていたが、v15で挙動が変わった
- 当初、Next.js 14時代の記事を参考に実装していて、本番デプロイ後にパフォーマンスが想定より悪いことに気づいた
- 公式ドキュメントを読み、fetchがデフォルトでキャッシュされない設計に変わったことを理解
- 全fetchを見直し、ページごとに適切な`revalidate`値を明示設計した
- トップページ・記事一覧は1時間、記事詳細は24時間、会社概要は`force-cache`、と使い分けた

**伝わるポイント**
- 公式ドキュメントを読む習慣
- 問題に気づいて掘り下げる姿勢
- 設計判断ができる

### エピソード2: 「プレビュー機能をHeadlessでどう実現したか」

**話す内容の骨子**
- 通常のWordPressでは無料機能だがHeadlessでは自前実装が必要
- 必要な要素は3つ：Next.js側のdraftMode、secret token認証、WordPress側のpreview_post_linkフィルター
- WordPress側で書いたフィルターでプレビューURLをNext.jsに向け、secret token付きで遷移
- Next.js側でtoken検証してdraftMode有効化、リダイレクト先のページコンポーネントがdraftMode状態を判定して下書き含むデータを取得
- 投稿タイプを動的に判定して、適切なフロントエンドパスにマッピング

**伝わるポイント**
- 編集者体験を理解している
- バックエンドとフロントエンド両方を設計できる
- セキュリティ意識（secret token）

### エピソード3: 「マルチデータソースの統合方針」

**話す内容の骨子**
- WordPress単独では全文検索の精度・速度に限界がある
- Algoliaで補完する設計にしたが、WordPress側のコンテンツ更新時に自動同期する仕組みが必要
- save_postフックでAlgolia REST APIに直接POST。投稿タイプを絞り、公開ステータスのみ対象
- フロントは自前実装でハイライト・フィルター対応
- 「なぜこのサービスを選んだか」を技術選定理由として説明できる状態

**伝わるポイント**
- 複数サービスを統合できる
- 必然性を持って技術選定できる
- データ同期の設計力

### エピソード4: 「画像最適化で詰まったポイント」

**話す内容の骨子**
- Next.js Imageコンポーネントを使おうとしたら、最初は外部ドメインの画像が表示されず詰まった
- next.config.jsの`remotePatterns`にWordPressドメインを許可する必要があった
- さらに、width/heightを正しく渡さないとレイアウトシフトが起きるため、WP REST APIの`_embed`でメディア情報を取得して渡す設計に
- blurDataURLを実装してLCP改善

**伝わるポイント**
- パフォーマンスに敏感
- 詰まりポイントを乗り越えた経験

### エピソード5: 「ISRとOn-demand Revalidationの使い分け」

**話す内容の骨子**
- ISRは「時間経過で再生成」、On-demand Revalidationは「明示的にトリガーして再生成」
- 時間ベースだけだと「更新したのに反映されない」問題が出る
- WordPress側でsave_postフックからNext.jsのrevalidate APIをwebhookで叩く実装
- 投稿タイプごとに適切なタグ・パスをクリアする設計
- secret tokenでセキュリティ担保

**伝わるポイント**
- 編集者体験への配慮
- イベントドリブンな設計力

### エピソード6: 「Local運用を選んだ判断とその対応」

**話す内容の骨子**
- ポートフォリオとしての公開コストを抑える判断
- Local WordPress + 静的エクスポート + Vercel という構成にした
- データ取得関数は環境変数で「ライブAPI取得」と「JSONファイル読み込み」を切替えられるよう設計
- 動的機能（プレビュー・On-demand Revalidation）はローカルで完全動作し、デモ動画で証明
- 本番WordPressホスティングへの移行も想定済みで、コード変更ほぼなしで対応可能な設計
- 実案件ではXserver等を使うと想定し、CORS設定・移行手順も検証済み

**伝わるポイント**
- コスト判断を意識的にしている
- 制約の中でベストを尽くす姿勢
- 設計の柔軟性（環境による切替）
- 本番運用への移行知識
- 実案件への応用可能性

---

## エージェント面談・採用面接の対策

### 面談前の準備

1. ポートフォリオURLとGitHubリンクを履歴書に明記
2. 「このプロジェクトで一番工夫した点」を1分で語れるようにしておく
3. 上記の5つのエピソードのうち、最低3つは即座に話せる状態にする
4. 質問されそうな技術的詳細をメモにまとめておく

### よく聞かれる質問への準備

**「Headless WordPressと通常WordPressの違いは？」**
- データと表示の分離
- 通常WPでは原理的に難しいことができる
- 構築コストは2〜3倍だが性能・自由度で勝る

**「なぜNext.jsを選んだ？」**
- App Router・Server Componentsが標準
- ISR・On-demand Revalidationが組み込み
- Vercelデプロイが簡単
- React 19の機能をフル活用

**「TypeScriptを使う理由は？」**
- WordPressレスポンスを型安全に扱える
- IDE補完で開発速度が上がる
- 案件で必須

**「Algoliaを使った理由は？」**
- WP単独では全文検索の精度・速度に限界
- 無料枠で十分なサイズ
- ハイライト・タイポ許容が標準

**「本番運用で気をつけることは？」**
- 環境変数の管理（secret tokenの本番値）
- WordPress側のドメイン変更時の対応
- Revalidate失敗時のリトライ設計
- Algoliaのインデックス再構築手順

**「WordPressはどう本番運用していますか？」**
- ポートフォリオではコスト判断でLocal運用＋静的エクスポート構成
- データ取得関数を二重化（API取得とJSON読み込みを環境変数で切替）して、本番WPホスティング移行にも備えた設計
- 動的機能（プレビュー、Revalidation）はデモ動画で証明
- 実案件ではXserver等のレンタルサーバー、または WP Engine 等のマネージドホスティングを想定

---

## 関連ドキュメント

- 全体像: `01-overview.md`
- 機能詳細: `06-features.md`
- 実装スケジュール: `07-roadmap.md`
