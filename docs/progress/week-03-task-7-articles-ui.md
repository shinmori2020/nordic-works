# Week 3 / Task 7 — 記事一覧・記事詳細の最小UI実装

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 7
**実施日**: 2026-05-16
**ステータス**: ✅ 完了
**前提**: Week 3 Task 6 完了済み（型定義を `src/types/wordpress.ts` に集約）

---

## タスクの目的

Week 3 のフィナーレ。これまで「データが取得できる」ことを暫定ページで確認してきたが、本タスクで **実際のページ** を実装する。

具体的には:
- `/articles`（記事一覧ページ）— 全記事をカード形式で表示
- `/articles/[slug]`（記事詳細ページ）— 個別記事の本文・著者・アイキャッチを表示
- 記事カードコンポーネントの作成
- Next.js Image での WordPress 画像表示
- `generateStaticParams` による静的パス生成
- `notFound()` による 404 処理

これで Week 3 の目標「`localhost:3000/articles` で記事一覧が表示され、各記事の詳細ページに遷移できる」を達成する。

---

## 完了基準

- [x] `/articles` で13記事がカード形式で一覧表示される
- [x] `/articles/[slug]` で個別記事の本文・著者・読了時間・アイキャッチが表示される
- [x] 存在しない slug にアクセスすると 404 ページが返る
- [x] WordPress のアイキャッチ画像が Next.js Image 経由で表示される
- [x] `generateStaticParams` で全記事の静的パスが生成される
- [x] `tsc --noEmit` が型エラーなし
- [x] dev server で全ページが 200 を返す

---

## 作成・変更ファイル

```
web/
├ next.config.ts                            (更新: images.remotePatterns 追加)
├ src/
│  ├ lib/
│  │  └ utils.ts                            (新規: 埋め込みデータ取得ヘルパー)
│  ├ components/
│  │  └ media/
│  │     └ ArticleCard.tsx                  (新規: 記事カード)
│  ├ app/
│  │  ├ globals.css                         (更新: .article-body スタイル追加)
│  │  ├ page.tsx                            (更新: /articles へのリンク追加)
│  │  └ (media)/
│  │     └ articles/
│  │        ├ page.tsx                      (新規: 記事一覧ページ)
│  │        └ [slug]/
│  │           └ page.tsx                   (新規: 記事詳細ページ)
```

---

## 実装の設計判断

### 判断1: `next.config.ts` の `images.remotePatterns`

Next.js の `<Image>` は、セキュリティ上、外部ドメインの画像をデフォルトでは扱わない。WordPress のメディア画像（`http://nordic-works.local/wp-content/uploads/...`）を表示するため、許可リストに追加:

```typescript
images: {
	remotePatterns: [
		{
			protocol: 'http',
			hostname: 'nordic-works.local',
			pathname: '/wp-content/uploads/**',
		},
	],
}
```

これを忘れると `<Image>` が「hostname not configured」エラーを出す。`docs/06-features.md` の画像最適化セクションで予告されていた設定。

### 判断2: `src/lib/utils.ts` に埋め込みデータ取得ヘルパーを集約

WordPress REST の `_embedded` 構造は扱いづらい（`wp:featuredmedia` は配列、`wp:term` は二次元配列）。各ページで毎回パースするのは冗長なので、ヘルパー関数に切り出した:

| 関数 | 役割 |
|---|---|
| `getFeaturedImage(entity)` | アイキャッチ画像を取得（無ければ null） |
| `getTerms(entity, taxonomy)` | 指定タクソノミーのタームを取得 |
| `stripHtml(html)` | HTML タグを除去してプレーンテキスト化 |
| `formatDate(iso)` | ISO 日付を「2026年5月14日」形式に整形 |

`lib` = 振る舞い、という Task 6 の方針に沿って `lib/utils.ts` に配置。

### 判断3: 記事本文は `dangerouslySetInnerHTML`

WordPress の `content.rendered` は HTML 文字列。React で描画するには `dangerouslySetInnerHTML` が必要。

「dangerously」という名前は XSS リスクへの警告だが、本プロジェクトのコンテンツは **自社管理の WordPress から来る信頼できるHTML** なので使用してよい。コード内にもコメントで明記した。

外部ユーザー入力（コメント等）を描画する場合は別途サニタイズが必須だが、今回は該当しない。

### 判断4: 本文スタイルは `globals.css` の `.article-body` で最小対応

`content.rendered` の HTML（`<p>`, `<h2>`, `<ul>` 等）に Tailwind は自動適用されない（Tailwind の Preflight でむしろリセットされる）。

本格的には `@tailwindcss/typography`（`prose` クラス）を使うが、Task 7 は「最小UI実装」なので、`globals.css` に `.article-body` の最小スタイル（段落間隔・見出しサイズ・リスト）を直書きした。

Week 4 または Week 7 で `@tailwindcss/typography` 導入を検討する宿題。

### 判断5: `generateStaticParams` で静的パス生成

`/articles/[slug]/page.tsx` に `generateStaticParams` を実装。ビルド時に全記事の slug を取得し、各詳細ページを事前レンダリングする。

```typescript
export async function generateStaticParams() {
	const posts = await getPosts();
	return posts.map((post) => ({ slug: post.slug }));
}
```

これにより本番ビルド時、13記事すべてが静的HTML化される（SSG）。`revalidate = 86400` と組み合わせて ISR にもなる。

### 判断6: 暫定トップページは残し、リンクを追加

現 `src/app/page.tsx` は Task 5 のデータ検証ページ。Week 4 で本物のトップページに置き換わる予定。

今回は削除せず、`/articles` への導線（ボタンリンク）を追加するに留めた。検証ページとしての役割を維持しつつ、ナビゲーションを可能にした。

### 判断7: 共通ヘッダーは作らない（Week 4 の範囲）

`docs/07-roadmap.md` では共通ヘッダー・フッターは Week 4 のタスク。Task 7 では作らず、ページ内に最小限の導線リンク（「← 記事一覧に戻る」「← ホーム」）を置くに留めた。

---

## 実装したページの仕様

### `/articles`（記事一覧）

- `getPosts()` で全記事取得 → `ArticleCard` でグリッド表示
- レスポンシブ: モバイル1列 / タブレット2列 / デスクトップ3列
- `revalidate = 3600`（1時間ごと再生成）
- `generateMetadata` 相当の静的 `metadata` を設定
- 記事0件時はエラーメッセージ表示（WP未起動時のフォールバック）

### `/articles/[slug]`（記事詳細）

- `getPostBySlug(slug)` で記事取得、無ければ `notFound()`
- 表示要素: 業界タグ / タイトル / 公開日 / 読了時間 / 著者名 / アイキャッチ / 本文 / トピックタグ / 著者プロフィール
- `revalidate = 86400`（24時間ごと再生成）
- `generateStaticParams` で全記事を静的生成
- `generateMetadata` で記事ごとの動的 title / description
- ACF `author_profile`（post_object）からの著者情報取得
- アイキャッチに `priority` 指定（LCP 改善）

### `ArticleCard` コンポーネント

- Server Component（インタラクション不要）
- アイキャッチ / トピック / タイトル / 抜粋 / 公開日 / 読了時間
- ホバーで画像ズーム + タイトル色変化（`group` / `group-hover`）
- `line-clamp-2` で抜粋を2行に制限

---

## 動作確認結果

### 型チェック

```
$ pnpm exec tsc --noEmit
=== tsc EXIT: 0 ===
```

### HTTP ステータス

```
GET /                                        → 200 OK
GET /articles                                → 200 OK
GET /articles/silence-trap-remote-3rd-year   → 200 OK
GET /articles/this-does-not-exist            → 404 Not Found
```

### コンテンツ確認

| 検証 | 結果 |
|---|---|
| `/articles` の記事カード数 | 13枚（`href="/articles/..."` のユニーク数） |
| 詳細ページのタイトル表示 | 「沈黙の罠」等が表示される |
| 「記事一覧に戻る」リンク | 表示される |
| 読了時間表示 | 「N分で読めます」が表示される |
| 本文 `.article-body` | 描画される |
| 404 処理 | 存在しない slug で `notFound()` が発火 |
| 画像最適化 | `/_next/image?url=...` 経由で WP 画像が処理される |

画像URLが `nordic-works.local%2Fwp-content%2Fuploads%2F...` のように URL エンコードされて `/_next/image` のクエリに乗っていることから、Next.js Image の最適化パイプラインを通過していることを確認。

---

## 詰まったところ・気づき

### 1. 孤児プロセスによる port 3000 占有（再々発）

`next.config.ts` を変更したため dev server の再起動が必要だったが、TaskStop で停止しても旧 `next dev` プロセス（PID 12988）が port 3000 を握り続けた。Week 3 Task 2・5 でも同じパターン。

**対処**: Next.js が表示する PID を `taskkill /PID 12988 /F` で終了 → clean に再起動。

**学び**: もはや恒例。Local 開発で dev server を再起動する時は「孤児プロセスが残る」前提で動く。`next.config.ts` 変更時は特に再起動が必須なので遭遇しやすい。

### 2. `next.config.ts` 変更は HMR では反映されない

`page.tsx` や CSS の変更は HMR（ホットリロード）で即反映されるが、`next.config.ts` は **dev server の再起動が必須**。設定ファイルは起動時に1回読まれるだけのため。

### 3. Tailwind と `dangerouslySetInnerHTML` の相性

Tailwind の Preflight（リセットCSS）が効いているため、`content.rendered` の `<h2>` や `<ul>` は「スタイル無し」状態で描画される。`.article-body` で明示的にスタイルを当てる必要があった。

本格的には `@tailwindcss/typography` の `prose` クラスを使うのが定石。

### 4. `_embedded['wp:term']` は二次元配列

`wp:term` はタクソノミーごとにグループ化された配列の配列（`WPTerm[][]`）。`getTerms()` ヘルパーで `.flat()` してから `taxonomy` でフィルタする実装にした。

---

## 振り返り（面接で語れる素材）

### 1. 「Next.js Image での外部画像最適化」

`remotePatterns` でドメインを許可し、WordPress の画像を Next.js の画像最適化パイプライン（リサイズ・WebP変換・遅延読み込み）に通した。`docs/08-portfolio-prep.md` の「画像最適化で詰まったポイント」エピソードに直結する実装。

### 2. 「SSG + ISR のハイブリッド」

`generateStaticParams`（ビルド時静的生成）と `revalidate`（時間ベース再生成）を組み合わせ、「初回は爆速の静的HTML、かつコンテンツの鮮度も保つ」構成を実現した。

**伝わるポイント**: Next.js のレンダリング戦略を理解し、ページ特性に応じて使い分けられる。

### 3. 「Server Components によるゼロJS の一覧・詳細ページ」

`ArticleCard` も各ページも全て Server Component。クライアントに JavaScript を送らずに、サーバーで HTML を組み立てて配信。最速の初期表示とSEOの両立。

### 4. 「埋め込みデータのパースをヘルパーに集約」

`_embedded` の扱いづらい構造を `getFeaturedImage` / `getTerms` に切り出し、ページコンポーネントをシンプルに保った。DRY とテスタビリティの意識。

---

## Week 3 完了状況

| Task | 内容 | 状態 |
|---|---|---|
| 1 | Next.js プロジェクト初期化 | ✅ |
| 2 | 追加パッケージインストール | ✅ |
| 3 | ディレクトリ構成セットアップ | ✅ |
| 4 | 環境変数設定 | ✅ |
| 5 | WordPress 接続関数の実装 | ✅ |
| 6 | TypeScript 型定義 | ✅ |
| 7 | 記事一覧・記事詳細の最小UI実装 | ✅ |
| 8 | キャッシュ仕様の明示 | ✅（Task 5・7 で各 fetch / page に `revalidate` 設定済） |
| 9 | GitHub リポジトリ作成・初回push | ⏭️ 未着手 |

**Week 3 の主目標は達成**。残るは Task 9（Git/GitHub）のみ。

---

## 次のタスク

`week-03-task-9-github.md`（予定）:
- プロジェクトルートで `git init`
- 初回コミット作成（Conventional Commits 形式）
- GitHub に公開リポジトリ `nordic-works` を作成
- 初回 push
- `.gitignore` の最終確認（WP除外・プラグインのみ追跡が効いているか）

その後、Week 3 全体の総括ログ `week-03.md` を作成し、Week 4 へ。

---

## 関連ドキュメント

- 仕様: `docs/06-features.md`（画像最適化・ISR セクション）
- サイト設計: `docs/03-site-design.md`（記事詳細ページの仕様）
- 前のタスク: `week-03-task-6-types.md`
