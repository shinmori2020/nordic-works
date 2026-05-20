# Week 4 / Task 4-D — タクソノミーページ・404・ヘッダー導線

**所属Week**: Week 4
**該当タスク番号**: `07-roadmap.md` の Task 4-D（+ 4-C+ ヘッダー導線追加）
**実施日**: 2026-05-20
**ステータス**: ✅ 完了
**前提**: Task 4-C-1〜4-C-4 完了済み（全4 CPT のページ実装済）

---

## タスクの目的

Week 4 の「ページ構築」フェーズを完結させる。本タスクで以下を一括対応:

- **4-D タクソノミーページ** — `/topic/[slug]`・`/industry/[slug]`・`/reading-level/[slug]`
- **グローバル 404 ページ** — `not-found.tsx`
- **4-C+ サイト導線** — ヘッダーに Authors / Features リンク追加、記事詳細のタグをクリック可能化

これで Next.js 側の「ページ」がすべて揃い、ブラウザ上で全ページを巡回できる状態になる。

---

## 完了基準

- [x] `/topic/[slug]`・`/industry/[slug]`・`/reading-level/[slug]` でターム別の記事一覧が表示される
- [x] 日本語slug（URLエンコード）でも正しくルーティングされる
- [x] 存在しないタームslug にアクセスすると 404 が返る
- [x] 未定義ルートに対して `not-found.tsx` が表示される
- [x] ヘッダーから Authors / Features ページに遷移できる
- [x] 記事詳細のタグをクリックするとタクソノミーページに飛ぶ
- [x] `tsc --noEmit` が型エラーなし
- [x] dev server で全ページが期待通りのステータスを返す

---

## 作成・変更ファイル

```
web/src/
├ lib/
│  └ wordpress.ts                       (更新: getPostsByTerm / getTermBySlug 追加)
├ components/
│  ├ common/
│  │  └ Header.tsx                      (更新: NAV_LINKS に Authors/Features 追加)
│  └ media/
│     └ TaxonomyArticleList.tsx         (新規: 3タクソノミーで共有する一覧UI)
└ app/
   ├ not-found.tsx                      (新規: グローバル404ページ)
   ├ (media)/
   │  ├ articles/[slug]/page.tsx        (更新: タグを Link に変更)
   │  ├ topic/[slug]/page.tsx           (新規)
   │  ├ industry/[slug]/page.tsx        (新規)
   │  └ reading-level/[slug]/page.tsx   (新規)
```

---

## 実装の設計判断

### 判断1: タクソノミーURLは「タクソノミー名ごとに分ける」

`/category/[slug]` のような汎用URLではなく、`/topic/`・`/industry/`・`/reading-level/`
の3ルートに分けた。利点:

- URL を見ただけで「これは業界別/トピック別/レベル別」と意味が伝わる（SEO・UX）
- 各ページで専用のラベル・description を出せる
- 将来「業界ページだけデザインを変える」等の拡張が容易

### 判断2: 共通レンダラ `TaxonomyArticleList` で重複削減

3タクソノミーで「ヘッダー（ラベル+ターム名+件数）+ 記事グリッド」のUIは共通。
コンポーネントに切り出し、各 `page.tsx` は薄い「データ取得 → 渡す」だけに留めた。

各 `page.tsx` の本体ロジックは5行程度に収まり、ルート間の差分が一目で分かる構造。

### 判断3: 日本語 slug の取り扱い — `decodeURIComponent` を要所で適用

WordPress REST API は日本語タームのslugを **URLエンコード済み文字列** で返す
（例: `マネジメント` → `%e3%83%9e%e3%83%8d...`）。一方 Next.js の動的ルート
パラメータ `params.slug` は **自動デコード済み** で渡って来る。

このギャップを次の方針で吸収:

| 場所 | 処理 |
|------|------|
| `generateStaticParams` | API の slug を `decodeURIComponent()` して返す（Next.js の二重エンコード回避） |
| `getTermBySlug` | 渡された slug を `encodeURIComponent()` してから REST に問い合わせ |
| `articles/[slug]` のタグ Link | term.slug を `decodeURIComponent()` してから `href` に埋める |

これで `/topic/マネジメント` の形のURLでも、URLバーに `/topic/%E3%83%9E...` を
直接貼っても、どちらでも正しくルーティング・取得できる。

### 判断4: REST タクソノミーキーは underscore、URL はハイフン

WordPress の REST タクソノミーキーは `reading_level`（アンダースコア）だが、
URL では `reading-level`（ハイフン）が一般的。両方を混在させ:

- ディレクトリ名: `app/(media)/reading-level/[slug]/`
- API 呼び出し: `getPostsByTerm('reading_level', termId)`

ファイル名（=URL）は読みやすさ優先、API キーは WP の実体に合わせる。

### 判断5: `not-found.tsx` をルート直下に配置

Next.js の規約通り `app/not-found.tsx` に配置。各ページの `notFound()` 呼び出し時、
および未定義ルート時に表示される。`robots: { index: false, follow: false }` を付け、
検索エンジンが 404 ページをインデックスしないよう明示。

### 判断6: 記事詳細のタグを `<span>` → `<Link>` 化

タクソノミーページに飛べる導線をUIに組み込む。

- 記事ヘッダー上部の業界タグ → `/industry/[slug]` へ
- 記事末尾のトピックタグ → `/topic/[slug]` へ

ホバー時に背景色変化を入れて「押せる」ことを視覚的に示す。
**ArticleCard 内のタグはリンク化していない**（カード全体が記事へのリンクのため、
リンクの入れ子は HTML 仕様違反）。

---

## 動作確認結果

### HTTP ステータス

```
GET /articles                           → 200
GET /authors  /features  /careers       → 200
GET /services                           → 200
GET /topic/1on1                         → 200（Latin slug）
GET /topic/%E3%83%9E%E3%83%8D%...       → 200（日本語 slug "マネジメント"）
GET /industry/it-saas                   → 200
GET /reading-level/%E5%88%9D%E7%B4%9A   → 200（"初級"）
GET /topic/this-does-not-exist          → 404
GET /this-does-not-exist                → 404
```

### 型チェック

```
$ pnpm exec tsc --noEmit
TSC_OK
```

---

## 詰まったところ・気づき

### 1. dev サーバー全ページ 404 → Turbopack キャッシュ破壊

`not-found.tsx` を新規追加した直後、dev server を再起動したら **全ルート（`/` 含む）が
404 を返す**現象が発生。レスポンスボディは `not-found.tsx` の内容で、HTTP ステータス
だけ 404 という状態。

**原因**: Turbopack の `.next/dev` ファイルシステムキャッシュが、新規追加した
`not-found.tsx` を「全ルートの代替」として誤って永続化していた。
**対処**: dev server を停止し、`.next/` ディレクトリを削除して再起動 → 全ページ復旧。

**学び**: ルート規約に関わるファイル（`not-found.tsx` / `layout.tsx` / `error.tsx` 等）を
追加・移動した場合、`.next/` のクリアが安全。コンテンツファイル変更は HMR で済むが、
**ルート構造の変更時は再起動 + キャッシュクリア**を習慣化する。

### 2. 日本語 slug の URL エンコード問題

WP REST が返す slug（エンコード済み）と Next.js の `params.slug`（デコード済み）の
非対称性に最初気づかず、`generateStaticParams` のパスが二重エンコードされる罠を
踏みかけた。`decodeURIComponent()` を要所で挟むだけで解決するが、
**「どこではエンコード/デコード状態なのか」を意識する**のが重要。

---

## 振り返り（面接で語れる素材）

### 1. 「共通コンポーネント抽出による DRY」

3つのタクソノミーページの共通UIを `TaxonomyArticleList` に切り出し、
各 page.tsx は「データ取得 → 渡す」だけの薄い構造に。
ロジックとUIの分離、変更影響範囲の最小化。

### 2. 「日本語 URL のエンコーディング境界の理解」

WordPress（エンコード）と Next.js（デコード）の挙動差を実データで切り分け、
`decodeURIComponent` / `encodeURIComponent` を適切な箇所に配置。
i18n を扱う Web フロントで頻出する典型問題への対処経験。

### 3. 「ビルドキャッシュ起因の不具合への対応プロセス」

「コードは正しいのに全ページ 404」という不可解な事象を、
ログ → ファイル構造確認 → キャッシュ疑い → クリアして再現確認、と段階的に切り分けた。

---

## Week 4 進捗状況

| Task | 内容 | 状態 |
|------|------|------|
| 4-A | 共通レイアウト（Header / Footer） | ✅ |
| 4-B | トップページ本実装 | ✅ |
| 4-C-1〜4 | 全4 CPT の一覧・詳細ページ | ✅ |
| 4-D | タクソノミーページ + 404 | ✅ |
| 4-E | SEO（sitemap / canonical / JSON-LD） | ⏭️ |
| 4-F | Vercel デプロイ | ⏭️ |

これで Week 4 の **「ページ構築」フェーズが完結**。残るはメタ情報整備（4-E）と
本番デプロイ（4-F）。

---

## 次のタスク

**バッチB: 4-E SEO一括対応**

- `app/sitemap.ts` で動的サイトマップ生成
- `app/robots.ts` で robots.txt 出力
- 各ページの `metadata` に `alternates.canonical` 追加
- 記事詳細・サービス詳細などへ JSON-LD 構造化データ埋め込み
- OGP / Twitter Card メタ追加

---

## 関連ドキュメント

- サイト設計: `docs/03-site-design.md`
- 仕様: `docs/06-features.md`
- 前のタスク: `week-04-task-c2-c4-cpt-pages.md`
