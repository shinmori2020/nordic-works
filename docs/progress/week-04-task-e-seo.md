# Week 4 / Task 4-E — SEO 一括対応

**所属Week**: Week 4
**該当タスク番号**: `07-roadmap.md` の Task 4-E
**実施日**: 2026-05-20
**ステータス**: ✅ 完了
**前提**: Task 4-D 完了済み（全ページ実装済）

---

## タスクの目的

全ページが揃ったタイミングで、SEO関連メタ情報を一括整備する。

- 動的 `sitemap.xml` 生成（全ページを列挙）
- `robots.txt` 出力（sitemap 場所を明示）
- 全ページに canonical URL を設定
- OGP / Twitter Card メタを root + 記事詳細に設定
- 記事詳細に JSON-LD（BlogPosting）、ルートに Organization 構造化データ

---

## 完了基準

- [x] `/sitemap.xml` で全ページのURLが列挙される（静的 + 動的）
- [x] `/robots.txt` が出力され、sitemap への参照を含む
- [x] root + 全ページに canonical 設定
- [x] OGP メタが root にデフォルト、記事詳細でページ固有の値に上書きされる
- [x] Twitter Card メタが summary_large_image で設定される
- [x] ルートに Organization、記事詳細に BlogPosting の JSON-LD が出力される
- [x] `tsc --noEmit` が型エラーなし
- [x] dev server で全ページ動作確認

---

## 作成・変更ファイル

```
web/
├ .env.local                                  (更新: NEXT_PUBLIC_SITE_URL 追加)
├ .env.example                                (更新: 同上)
└ src/
   ├ lib/
   │  └ site.ts                               (新規: サイトメタ情報の中央管理)
   └ app/
      ├ layout.tsx                            (更新: metadataBase, OGP, Organization JSON-LD)
      ├ sitemap.ts                            (新規: 動的サイトマップ)
      ├ robots.ts                             (新規: robots.txt)
      ├ (media)/
      │  ├ articles/page.tsx                  (更新: canonical 追加)
      │  ├ articles/[slug]/page.tsx           (更新: canonical/OGP/JSON-LD)
      │  ├ authors/page.tsx                   (更新: canonical 追加)
      │  ├ authors/[slug]/page.tsx            (更新: canonical 追加)
      │  ├ features/page.tsx                  (更新: canonical 追加)
      │  ├ features/[slug]/page.tsx           (更新: canonical 追加)
      │  ├ topic/[slug]/page.tsx              (更新: canonical 追加)
      │  ├ industry/[slug]/page.tsx           (更新: canonical 追加)
      │  └ reading-level/[slug]/page.tsx      (更新: canonical 追加)
      └ (corporate)/
         ├ services/page.tsx                  (更新: canonical 追加)
         ├ services/[slug]/page.tsx           (更新: canonical 追加)
         ├ careers/page.tsx                   (更新: canonical 追加)
         └ careers/[slug]/page.tsx            (更新: canonical 追加)
```

---

## 実装の設計判断

### 判断1: `src/lib/site.ts` でサイトメタを中央管理

`SITE_URL` / `SITE_NAME` / `SITE_DESCRIPTION` / `SITE_LOCALE` を1ヶ所に集約し、
`absoluteUrl(path)` ヘルパーで絶対URLを組み立てる。

**理由**: sitemap / robots / canonical / OGP / JSON-LD と多くの箇所で
同じ情報を使う。一元化すれば変更時の漏れが無く、本番デプロイ時に
`NEXT_PUBLIC_SITE_URL` を変えるだけで全箇所が追従する。

`SITE_URL` は環境変数の末尾スラッシュを `replace(/\/$/, '')` で除去し、
組み立て側の `${SITE_URL}${path}` が `//` を生まないように防御。

### 判断2: `metadataBase` を root layout に設定

`new URL(SITE_URL)` を `metadata.metadataBase` に渡すことで、各ページの
metadata に書く相対URL（例: `alternates.canonical: '/articles'`）が
自動的に絶対URLに解決される。各ページで毎回絶対URLを書く必要がない。

### 判断3: `sitemap.ts` で動的生成、`Promise.all` で並行取得

`MetadataRoute.Sitemap` 型を使い、Next.js 規約に従って実装。

- 静的ルート: トップ + 各CPT一覧の計6本
- 動的ルート: 全 posts/services/careers/features/authors + 3タクソノミー全ターム
- 8つの fetch を `Promise.all` で並行化、生成時間を最小化
- `lastModified` は `post.modified` から取得、changeFrequency と priority も
  コンテンツ種別ごとに差別化（記事は daily/0.9、サービスは monthly/0.7 等）

`/about` `/contact` は未実装ページなのでサイトマップに含めない（404 URLが
sitemap に載るとクロール効率を落とすため）。

### 判断4: `robots.ts` は最小構成

- 全クローラを `Allow: /`
- `/api/` のみ Disallow（Next.js API ルート、Week 5+ で内部用APIが増える想定）
- `sitemap` フィールドで sitemap.xml の場所を明示

### 判断5: canonical はすべて相対パスで指定

`alternates: { canonical: '/services/${slug}' }` のように相対パスで書く。
`metadataBase` が絶対URL化してくれるので、本番ドメイン変更時に
ページ側を一切変更しなくて済む。

### 判断6: JSON-LD は「Organization」（全ページ）+ 「BlogPosting」（記事詳細のみ）

最低限の構造化データ:

- **root layout に Organization** — 全ページで出力。Google Knowledge Graph や
  ブランドリッチリザルト の候補になる。
- **記事詳細に BlogPosting** — Google の「Article リッチリザルト」対応の主要対象。
  headline / datePublished / dateModified / image / author / publisher を含む。

サービス・特集の Service / Article 構造化データはスコープを絞って今回見送り。
必要になれば後から追加可能（ヘッダー/フッターと独立）。

### 判断7: OGP は root にデフォルト、記事詳細でページ固有値に上書き

- root: `og:type=website`、`og:site_name`、`og:locale=ja_JP`、デフォルトタイトル/説明
- 記事詳細: `og:type=article`、`og:title/description/image/url` をページ値で上書き、
  `og:image` にアイキャッチ画像URLを設定
- Twitter Card: `summary_large_image` で大画像表示に対応

OGP画像は Next.js の `metadata.openGraph.images` に URL を渡すと自動で
`og:image` メタタグになる。

---

## 動作確認結果

### 型チェック

```
$ pnpm exec tsc --noEmit
TSC_OK
```

### SEO エンドポイント

```
GET /robots.txt   → 200
  User-Agent: *
  Allow: /
  Disallow: /api/
  Sitemap: http://localhost:3000/sitemap.xml

GET /sitemap.xml  → 200 (合計 46 URLs)
  - 静的ルート 6 本
  - 投稿/サービス/採用/特集/著者 の各エントリ
  - 3タクソノミー × 全ターム
```

### 記事詳細の meta タグ（/articles/manager-3month-program）

```html
<link rel="canonical" href="http://localhost:3000/articles/manager-3month-program"/>
<meta property="og:title" content="マネージャー育成のための3ヶ月プログラム設計"/>
<meta property="og:description" content="..."/>
<meta property="og:url" content="..."/>
<meta property="og:image" content="http://nordic-works.local/.../900-14.jpg"/>
<meta property="og:type" content="article"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="..."/>
<meta name="twitter:image" content="..."/>
<script type="application/ld+json">{"@type":"BlogPosting", ...}</script>
```

### ルートの meta タグ（/）

```html
<link rel="canonical" href="http://localhost:3000"/>
<meta property="og:title" content="Nordic Works — 北欧式の働き方・組織設計を支援する"/>
<meta property="og:site_name" content="Nordic Works"/>
<meta property="og:locale" content="ja_JP"/>
<meta property="og:type" content="website"/>
<script type="application/ld+json">{"@type":"Organization", ...}</script>
```

### 全ページ HTTP ステータス

```
/                                       → 200
/articles  /services  /careers          → 200
/authors   /features                    → 200
/articles/<slug>  /services/<slug>      → 200
/careers/<slug>   /features/<slug>      → 200
/authors/<slug>                         → 200
/topic/1on1                             → 200
/topic/<日本語slug>                     → 200
/industry/it-saas                       → 200
/reading-level/<日本語slug>             → 200
/this-does-not-exist                    → 404
```

---

## 詰まったところ・気づき

### 1. dev サーバー再起動直後、全詳細ページが 404

`sitemap.ts` と `robots.ts`（ルート規約系ファイル）を追加した後、dev を再起動
したら、初回コンパイル中にローカル WP が応答15秒以上の状態になり、
**WP cold-start の遅延で getPostBySlug が null** を返し、Next.js のデータ
キャッシュにその結果が記録される現象が発生。

WP が温まった後でも詳細ページは 404 のまま。

**対処**: `.next/` を完全削除して dev を再起動 → 全ページ復旧。

**学び**: Local WP の cold start は数十秒かかる場合があり、その間に走った
fetch の null 結果がキャッシュに焼き付くと、復旧してもキャッシュをクリア
しないと反映されない。**「.next/ クリア → 再起動 → WP に空打ち1回 → 動作確認」**
の手順を習慣化する。

### 2. ACF 画像ID問題で `og:image` が使えない可能性を事前検証

ACF の画像フィールドは ID で返るが、`getFeaturedImage()`（コアのアイキャッチ）を
使えば実URLが取れる。これは 4-C 系で既に踏んだ問題への対処が活きた。
`og:image` はアイキャッチから安全に組み立てられた。

---

## 振り返り（面接で語れる素材）

### 1. 「サイトメタの単一の出所による保守性」

`src/lib/site.ts` を1ヶ所の出所として、sitemap / robots / canonical / OGP /
JSON-LD すべてを連動。本番デプロイ時は `NEXT_PUBLIC_SITE_URL` だけ差し替えれば
46 URLすべての絶対URL、JSON-LD、canonical、OGP が一斉に切り替わる。

### 2. 「Next.js App Router の SEO ベストプラクティス準拠」

- `metadataBase` + 相対 canonical
- `MetadataRoute.Sitemap` / `MetadataRoute.Robots` 型による規約準拠
- 各ページの `generateMetadata` で動的 OGP
- JSON-LD は `<script>` に `JSON.stringify` で出力（自社管理コンテンツのため XSS リスクなし）

これらは Next.js 公式が推奨する「Metadata API」と「File Conventions」に完全準拠。

### 3. 「リッチリザルト対応の段階的導入」

最も価値の高い記事の BlogPosting と、全ページ共通の Organization の2つに絞って
JSON-LD を追加。やみくもに全種類入れず、Google リッチリザルトテストで効果が
出やすい型から始めた。スコープのコントロール。

---

## Week 4 進捗状況

| Task | 内容 | 状態 |
|------|------|------|
| 4-A 〜 4-D | レイアウト / トップ / 全CPTページ / タクソノミー / 404 | ✅ |
| **4-E** | **SEO（sitemap / robots / canonical / OGP / JSON-LD）** | ✅ |
| 4-F | Vercel デプロイ | ⏭️ |

---

## 次のタスク

**バッチC: 4-F Vercel デプロイ**

- 環境変数を Vercel に登録
- 静的データ出力（`DATA_SOURCE=static` モード）の準備
- WordPress 本番投入 or 静的JSON配信の選択
- 本番ビルド検証、本番動作確認

---

## 関連ドキュメント

- 仕様: `docs/06-features.md`（SEOセクション）
- デプロイ戦略: `docs/09-deployment-strategy.md`
- 前のタスク: `week-04-task-d-taxonomy-and-404.md`
