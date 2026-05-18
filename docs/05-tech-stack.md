# 05. 技術スタック

## 全体像

| レイヤー | 採用技術 | 役割 |
|---------|---------|------|
| CMS | WordPress + ACF Pro + WPGraphQL | コンテンツ管理 |
| フロントエンドフレームワーク | Next.js 16（App Router） | UI・ルーティング・データ取得 |
| 言語 | TypeScript | 型安全性 |
| スタイリング | Tailwind CSS | ユーティリティCSS |
| アニメーション | Motion（旧Framer Motion） | スクロール連動・ページ遷移 |
| 全文検索 | Algolia | 高速検索 |
| メール送信 | Resend + React Email | お問い合わせフォーム |
| 解析 | Vercel Analytics + Speed Insights | アクセス解析・パフォーマンス |
| デプロイ | Vercel | 本番ホスティング |
| バージョン管理 | Git + GitHub | ソースコード管理 |
| エディタ | VSCode または Cursor | 開発環境 |
| パッケージ管理 | pnpm（推奨）または npm | 依存関係管理 |

## 各技術の選定理由

### Next.js 16（App Router）

- 2026年5月時点のフロントエンドフレームワークのデファクトスタンダード
- App RouterはServer Components・Server Actionsをネイティブサポート
- ISR・On-demand Revalidationが標準機能
- Vercel公式のため、デプロイが最も簡単
- Turbopack が dev/build で標準有効
- **重要**: Next.js 15以降、fetchはデフォルトでキャッシュされない。明示的な`force-cache`や`revalidate`設定が必要
- **注**: docs初版は Next.js 15 を想定していたが、`create-next-app@latest` で 16.x が導入された。本プロジェクトは Next.js 16 で進行する（Week 3 Task 1 で決定）

### TypeScript

- 案件の9割以上で必須
- WordPress APIのレスポンスを型安全に扱える
- IDEの補完が強力で開発速度が上がる
- 採用面接でも評価される

### Tailwind CSS

- Next.js案件のデファクト
- ユーティリティクラスでデザインの一貫性を保ちやすい
- 学習コストが低い
- Tailwind v4以降は設定ファイルがシンプルに

### Motion（旧 Framer Motion）

- 2024年に「Motion」へリブランディング
- Reactでアニメーションを実装する事実上の標準
- スクロール連動・ジェスチャー・レイアウトアニメーションを宣言的に書ける
- `useInView`等のフックでパフォーマンス良く実装可能

### Algolia

- 全文検索の業界標準
- 無料枠（月10,000リクエストまで）でポートフォリオには十分
- WordPress側からPOSTする形式でインデックス可能
- ハイライト・タイポ許容・ファセット検索が標準サポート

### Resend

- 開発者向けに設計された新世代のメール送信サービス
- 無料枠（月100通）でポートフォリオには十分
- React Emailと組み合わせるとメールテンプレートをReactで書ける
- ドメイン認証も比較的シンプル

### Vercel

- Next.js公式のデプロイ先
- 無料枠でポートフォリオには十分
- プレビューデプロイ（PRごとに自動デプロイ）が便利
- Edge Network経由で世界中に高速配信
- Analytics・Speed Insightsが付属

### pnpm

- npmより高速で省ディスク
- 依存関係の管理が厳密で問題を早期発見できる
- モノレポでなくても利点が多い
- npmでも問題なく動作するので任意

## バージョン指定

| 技術 | 推奨バージョン |
|------|------------|
| Node.js | v22 LTS（最低v20以上）／実環境 v22.11.0 |
| Next.js | 16.x（実環境 16.2.6） |
| React | 19.x（実環境 19.2.4） |
| TypeScript | 5.x（実環境 5.9.3） |
| Tailwind CSS | 4.x（実環境 4.3.0） |
| pnpm | v10.x（実環境 10.33.4） |
| WordPress | 最新安定版（実環境 6.9.4） |
| PHP | 8.1以上（実環境 8.2.27） |

## プロジェクト初期化コマンド

> **重要**: Next.js プロジェクトは Local の WordPress（プロジェクトルートの `app/` フォルダ）
> との App Router 衝突を避けるため、ルート直下ではなく **`web/` サブフォルダ** に配置する。
> Next.js は `app/` または `src/app/` を App Router ソースとして自動検出し、ルートに
> `app/` があると WordPress のフォルダを誤認するため。詳細は `progress/week-03-task-1-nextjs-init.md`。

```bash
# create-next-app は既存ファイルがあるディレクトリでは初期化を拒否するため、
# 一時フォルダで作成 → web/ へ移動する手順を取る（詳細は week-03-task-1 参照）。

# 1. 一時フォルダで Next.js を作成
pnpm create next-app@latest nordic-next-init \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack --use-pnpm --skip-install

# 2. 中身を web/ に移動し、一時フォルダを削除

# 3. web/ で依存をインストール
cd web
pnpm install

# 4. 追加パッケージのインストール
pnpm add motion next-themes algoliasearch
pnpm add resend react-email @react-email/components
pnpm add zod                       # バリデーション
pnpm add reading-time              # 読了時間計算
pnpm add @vercel/analytics @vercel/speed-insights
```

> Next.js 関連のコマンド（`pnpm dev` / `pnpm build` 等）は全て `web/` ディレクトリで実行する。
> Vercel デプロイ時は Root Directory に `web` を指定する。

## ディレクトリ構成

Local の WordPress と Next.js プロジェクトが1つの Git リポジトリに同居する。
Next.js は `web/` サブフォルダに配置する（前述の App Router 衝突回避のため）。

```
nordic-works/                    # Local のサイトフォルダ = Git リポジトリルート
├ app/                           # Local 管理の WordPress（.gitignore で除外）
│  └ public/wp-content/plugins/
│     └ nordic-works-core/        # 自作プラグイン（Git 追跡対象）
├ conf/  logs/                    # Local 管理ファイル（除外）
├ docs/                           # プロジェクトドキュメント
├ CLAUDE.md
└ web/                            # ★ Next.js プロジェクト一式
   ├ src/
   │  ├ app/
   │  │  ├ (corporate)/           # コーポレート用ルートグループ
   │  │  │  ├ about/page.tsx
   │  │  │  ├ services/{page.tsx, [slug]/page.tsx}
   │  │  │  ├ careers/{page.tsx, [slug]/page.tsx}
   │  │  │  └ contact/page.tsx
   │  │  ├ (media)/               # メディア用ルートグループ
   │  │  │  ├ articles/{page.tsx, [slug]/page.tsx}
   │  │  │  ├ features/{page.tsx, [slug]/page.tsx}
   │  │  │  ├ authors/{page.tsx, [slug]/page.tsx}
   │  │  │  ├ category/[slug]/page.tsx
   │  │  │  ├ tag/[slug]/page.tsx
   │  │  │  └ search/page.tsx
   │  │  ├ api/
   │  │  │  ├ preview/route.ts
   │  │  │  ├ exit-preview/route.ts
   │  │  │  ├ revalidate/route.ts
   │  │  │  └ contact/route.ts
   │  │  ├ layout.tsx
   │  │  ├ page.tsx               # トップページ
   │  │  ├ globals.css            # グローバルスタイル（Next.js 16 標準位置）
   │  │  └ not-found.tsx
   │  ├ components/
   │  │  ├ ui/                    # 汎用UIコンポーネント
   │  │  ├ corporate/             # コーポレート専用
   │  │  ├ media/                 # メディア専用
   │  │  └ common/                # ヘッダー、フッター等
   │  ├ lib/
   │  │  ├ wordpress.ts           # WP接続関数
   │  │  ├ utils.ts               # 汎用ユーティリティ
   │  │  ├ algolia.ts             # Algolia関連（Week 6）
   │  │  └ resend.ts              # メール送信（Week 6）
   │  ├ types/
   │  │  └ wordpress.ts           # WP関連の型定義
   │  └ styles/                   # 追加スタイル（必要に応じて）
   ├ public/
   ├ .env.local                   # 環境変数（除外）
   ├ .env.example                 # 環境変数テンプレート（追跡）
   ├ next.config.ts
   ├ tsconfig.json
   ├ package.json
   └ pnpm-workspace.yaml
```

注:
- `globals.css` は Next.js 16 のデフォルトに従い `src/app/globals.css` に配置（docs初版の `src/styles/globals.css` から変更）
- Tailwind CSS 4 は `tailwind.config.ts` を使わない。設定は `globals.css` 内の `@theme` で行う
- Vercel デプロイ時は Root Directory を `web` に指定する

## 環境変数

`web/.env.local`（Git管理外）に設定する。テンプレートは `web/.env.example`（Git追跡対象）。

```bash
# web/.env.local（Git管理しない）

# WordPress
WORDPRESS_API_URL=http://nordic-works.local/wp-json
WORDPRESS_GRAPHQL_URL=http://nordic-works.local/graphql

# データソース切替（api: ライブAPI取得 / static: data/*.json 読み込み）
DATA_SOURCE=api

# プレビュー機能・Revalidation（Week 5）
WORDPRESS_PREVIEW_SECRET=your-secret-token-here
REVALIDATE_SECRET=your-revalidate-secret-here

# WordPress 認証（Week 5、Application Password）
WP_USERNAME=
WP_APPLICATION_PASSWORD=

# Algolia（Week 6）
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your-search-only-key
ALGOLIA_ADMIN_KEY=your-admin-key  # サーバー側のみ
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=nordic_works

# Resend（Week 6）
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL_FROM=noreply@nordicworks.example.com
CONTACT_EMAIL_TO=info@nordicworks.example.com
```

## next.config.ts 重要設定

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'nordic-works.local',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'your-production-wp.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  experimental: {
    // 必要に応じて追加
  },
};

export default config;
```

## TypeScript型定義の方針

- WordPressのレスポンス型は `web/src/types/wordpress.ts` に集約
- API取得関数は `web/src/lib/wordpress.ts` でラップし、型付きで返す
- 各CPTごとに型を定義（`WP` プレフィックス: `WPPost`, `WPService`, `WPCareer`, `WPFeature`, `WPAuthorProfile`）
- ACFフィールドは別型として定義（`PostAcf`, `ServiceAcf` 等）し、各CPT型から参照
- ACFの未設定フィールドが返す `false` も型に含める（例: `hero_image?: WPMedia | false`）
- 共通フィールドは `WPEntityBase` に抽出し各CPT型が継承

## 関連ドキュメント

- WordPress側の設計: `04-wordpress.md`
- 機能の実装詳細: `06-features.md`
- 各週のセットアップタスク: `07-roadmap.md`
