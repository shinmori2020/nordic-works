# 05. 技術スタック

## 全体像

| レイヤー | 採用技術 | 役割 |
|---------|---------|------|
| CMS | WordPress + ACF Pro + WPGraphQL | コンテンツ管理 |
| フロントエンドフレームワーク | Next.js 15（App Router） | UI・ルーティング・データ取得 |
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

### Next.js 15（App Router）

- 2026年5月時点のフロントエンドフレームワークのデファクトスタンダード
- App RouterはServer Components・Server Actionsをネイティブサポート
- ISR・On-demand Revalidationが標準機能
- Vercel公式のため、デプロイが最も簡単
- **重要**: Next.js 15はfetchがデフォルトでキャッシュされなくなったので、明示的な`force-cache`や`revalidate`設定が必要

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
| Node.js | v22 LTS（最低v20以上） |
| Next.js | 15.x（最新安定版） |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| WordPress | 最新安定版 |
| PHP | 8.1以上 |

## プロジェクト初期化コマンド

```bash
# Next.jsプロジェクト作成
pnpm create next-app@latest nordic-works \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd nordic-works

# 追加パッケージのインストール
pnpm add motion next-themes algoliasearch
pnpm add resend react-email @react-email/components
pnpm add zod  # バリデーション
pnpm add reading-time  # 読了時間計算
pnpm add @vercel/analytics @vercel/speed-insights
pnpm add -D @types/node
```

## ディレクトリ構成

```
nordic-works/
├ src/
│  ├ app/
│  │  ├ (corporate)/           # コーポレートサイト用ルートグループ
│  │  │  ├ about/page.tsx
│  │  │  ├ services/
│  │  │  │  ├ page.tsx
│  │  │  │  └ [slug]/page.tsx
│  │  │  ├ careers/
│  │  │  │  ├ page.tsx
│  │  │  │  └ [slug]/page.tsx
│  │  │  └ contact/page.tsx
│  │  ├ (media)/               # メディア用ルートグループ
│  │  │  ├ articles/
│  │  │  │  ├ page.tsx
│  │  │  │  └ [slug]/page.tsx
│  │  │  ├ features/
│  │  │  │  ├ page.tsx
│  │  │  │  └ [slug]/page.tsx
│  │  │  ├ authors/
│  │  │  │  ├ page.tsx
│  │  │  │  └ [slug]/page.tsx
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
│  │  └ not-found.tsx
│  ├ components/
│  │  ├ ui/                    # 汎用UIコンポーネント
│  │  ├ corporate/             # コーポレート専用
│  │  ├ media/                 # メディア専用
│  │  └ common/                # ヘッダー、フッター等
│  ├ lib/
│  │  ├ wordpress.ts           # WP接続関数
│  │  ├ algolia.ts             # Algolia関連
│  │  ├ resend.ts              # メール送信
│  │  └ utils.ts               # 汎用ユーティリティ
│  ├ types/
│  │  └ wordpress.ts           # WP関連の型定義
│  └ styles/
│     └ globals.css
├ public/
├ .env.local
├ next.config.ts
├ tailwind.config.ts
├ tsconfig.json
└ package.json
```

## 環境変数

```bash
# .env.local（Git管理しない）

# WordPress
WORDPRESS_API_URL=http://nordic-works.local/wp-json
WORDPRESS_GRAPHQL_URL=http://nordic-works.local/graphql

# プレビュー機能
WORDPRESS_PREVIEW_SECRET=your-secret-token-here

# Revalidation
REVALIDATE_SECRET=your-revalidate-secret-here

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your-search-only-key
ALGOLIA_ADMIN_KEY=your-admin-key  # サーバー側のみ
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=nordic_works

# Resend
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

- WordPressのレスポンス型は `src/types/wordpress.ts` に集約
- API取得関数は `src/lib/wordpress.ts` でラップし、型付きで返す
- 各CPTごとに型を定義（`Post`, `Service`, `Career`, `Feature`, `AuthorProfile`）
- ACFフィールドも型に含める

## 関連ドキュメント

- WordPress側の設計: `04-wordpress.md`
- 機能の実装詳細: `06-features.md`
- 各週のセットアップタスク: `07-roadmap.md`
