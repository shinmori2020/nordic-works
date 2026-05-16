# Week 3 / Task 5 — WordPress 接続関数の実装

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 5
**実施日**: 2026-05-15
**ステータス**: ✅ 完了
**前提**: Week 3 Task 4 完了済み（環境変数 `WORDPRESS_API_URL` 設定済）

---

## タスクの目的

Next.js コードから WordPress REST API へアクセスする統一インターフェイス（`src/lib/wordpress.ts`）を実装し、Week 2 で投入したダミーコンテンツ（投稿22件、タクソノミー17項目）を取得できる状態を作る。

具体的には:
- 各CPT（post / service / career / feature / author_profile）の取得関数を提供
- 各タクソノミー（industry / topic / reading_level）の取得関数を提供
- `DATA_SOURCE` 環境変数による「API取得 / 静的JSON読み込み」切替の枠組み
- Next.js 15+ のキャッシュ仕様（fetchがデフォルト非キャッシュ）に対応した `revalidate` 設定
- エラーハンドリング（API失敗時は null/空配列を返す）

これは Week 3 のメインタスク。**「Next.js コードから WP のデータが取得できる」最初の瞬間** が確認できる。

---

## 完了基準

- [x] `web/src/lib/wordpress.ts` が作成され、全CPT・タクソノミーの取得関数を export している
- [x] `page.tsx` から関数を呼び出し、ブラウザで取得結果が表示できる
- [x] 期待件数（投稿13・サービス3・採用2・特集2・著者3・業界6・トピック8・読者レベル3）が全て一致
- [x] ACFフィールド（読了時間など）が REST レスポンスに含まれている
- [x] dev server が引き続き 200 OK を返す
- [x] `DATA_SOURCE=static` の分岐コードが組み込まれている（実装はWeek 8、現状は空配列を返す）

---

## 実装の設計判断

### 判断1: REST API ベース（GraphQL ではなく）

| 比較項目 | REST | GraphQL |
|---|---|---|
| 関連データ取得 | `_embed` クエリで一括取得（簡単） | クエリで指定（柔軟だが冗長） |
| 学習コスト | 低い | やや高い（Apollo / urql / Hasura等） |
| Next.js との相性 | fetch そのまま使える | クライアント導入が必要 |
| 型安全性 | レスポンス型を自前定義 | codegen で自動生成可能 |
| ポートフォリオ的価値 | 標準 | やや高い（モダン感） |

**採用**: REST。Week 3 の目的は最速で「WPからデータが取れる」状態を作ること。GraphQL は将来オプションとして残す（同じ wordpress.ts に追加する形で）。

### 判断2: 単一ファイル `wordpress.ts` への集約

複数ファイル（`wordpress/posts.ts`, `wordpress/services.ts` 等）に分割する案もあったが、現状の関数数（20弱）なら単一ファイルでも見通せる。500行程度に収まった。

将来分割する場合の境界線:
- 1000行を超えたら CPT別に分割
- もしくは「公開API系」と「認証必須系（プレビュー用）」で分ける

### 判断3: 型定義は最低限のみ

完全な型定義は Task 6（`src/types/wordpress.ts`）で扱う。Task 5 では `wordpress.ts` 内に最低限の型をインライン定義:
- `WPRendered` (`{ rendered: string }`)
- `WPMedia`, `WPTerm`, `WPEmbedded`
- `WPPost`, `WPService`, `WPCareer`, `WPFeature`, `WPAuthorProfile`

Task 6 で `src/types/wordpress.ts` に移して、`wordpress.ts` は import するだけにする。

### 判断4: キャッシュ戦略は `docs/06-features.md` 準拠

| 関数 | revalidate | tags |
|---|---|---|
| `getPosts` | 3600（1時間） | `['posts']` |
| `getPostBySlug` | 86400（24時間） | `['posts', 'post-<slug>']` |
| `getServices` | 86400 | `['services']` |
| `getServiceBySlug` | 86400 | `['services', 'service-<slug>']` |
| `getCareers` | 86400 | `['careers']` |
| `getFeatures` | 3600 | `['features']` |
| `getAuthors` | 86400 | `['authors']` |
| タクソノミー系 | 86400 | `['taxonomies', '<type>']` |

`tags` は Week 5 の On-demand Revalidation で個別キャッシュクリアに使う伏線。

### 判断5: エラー時は `null` / 空配列を返す（throw しない）

呼び出し側でのハンドリングを単純にするため、API失敗時は:
- 単一取得 → `null`
- リスト取得 → `[]`

を返す設計。エラーは `console.error` でログするが throw しない。これにより、ページコンポーネント側で `if (!post) notFound()` のようなシンプルな分岐が書ける。

---

## 実装内容

### ファイル構造

```typescript
// 上から順に
1. Configuration   - API_URL, USE_STATIC, 警告ログ
2. Types           - 最小限の型定義
3. Fetch helper    - wpFetch<T>() ユーティリティ
4. Posts           - getPosts, getPostBySlug
5. Services        - getServices, getServiceBySlug
6. Careers         - getCareers, getCareerBySlug
7. Features        - getFeatures, getFeatureBySlug
8. Authors         - getAuthors, getAuthorBySlug
9. Taxonomies      - getIndustries, getTopics, getReadingLevels
```

### コア helper: `wpFetch<T>()`

全関数が使う共通フェッチ関数。

```typescript
async function wpFetch<T>(resource: string, cache: CacheOptions = {}): Promise<T | null> {
	if (!API_URL) return null;
	const url = `${API_URL}/wp/v2/${resource}`;
	const fetchOpts: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {};
	if (cache.revalidate === false) fetchOpts.cache = 'force-cache';
	else fetchOpts.next = { revalidate: cache.revalidate ?? 3600, tags: cache.tags };
	try {
		const res = await fetch(url, fetchOpts);
		if (!res.ok) {
			console.error(`[wp] ${resource} returned ${res.status}`);
			return null;
		}
		return (await res.json()) as T;
	} catch (err) {
		console.error(`[wp] ${resource} fetch error:`, err);
		return null;
	}
}
```

ポイント:
- `cache.revalidate === false` で永続キャッシュ（force-cache）
- それ以外は `next: { revalidate, tags }` を使った時間ベース＋タグキャッシュ
- ジェネリック `<T>` で型を呼び出し側から指定

### `DATA_SOURCE` 分岐

各関数の冒頭で:

```typescript
if (USE_STATIC) {
	// Week 8 で data/posts.json から読み込む実装に置き換え
	return [];
}
```

現状は単に空を返すだけのスタブ。Week 8 のデータエクスポート＋静的読み込み実装時に中身を埋める。

### `src/app/page.tsx` の更新

動作確認のため、デフォルトの welcome ページから「データフロー検証ページ」に置き換え:

- 取得件数のサマリテーブル（期待値との比較で `✓` / `⚠`）
- 投稿された記事の一覧（ID、タイトル、読了時間）
- サービス・採用・特集の3カラム
- フッターに env vars の確認情報

Week 4 で本物のトップページに置き換える前提の暫定UI。

---

## 動作確認結果

### dev server 起動

```
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Environments: .env.local      ← .env.local が読み込まれた証拠
✓ Ready in 27.1s
```

### HTTP レスポンス

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
```

### 取得件数（全て期待値と完全一致 ✓）

| カテゴリ | 取得件数 | 期待値 |
|---|---|---|
| 記事 (post) | 13 | 13（Hello world + シーダー12本） |
| サービス (service) | 3 | 3 |
| 採用情報 (career) | 2 | 2 |
| 特集 (feature) | 2 | 2 |
| 著者 (author_profile) | 3 | 3 |
| 業界 (industry) | 6 | 6 |
| トピック (topic) | 8 | 8 |
| 読者レベル (reading_level) | 3 | 3 |

### ACF フィールドの取得確認

ページ右端に表示されている「分」表記（例: `5分`）は、ACF の `reading_time` フィールド値を `post.acf?.reading_time` 経由で取得・表示したもの。シーダーで投入した値が REST API 経由で取得できることが確認できた。

---

## 作成・変更ファイル

```
web/src/
├ lib/
│  └ wordpress.ts          (新規、約290行)
├ lib/.gitkeep              (削除、wordpress.ts ができたので不要)
└ app/
   └ page.tsx               (更新、デフォルトページ → データフロー検証ページ)
```

---

## 詰まったところ・気づき

### 1. 孤児プロセスが port 3000 を握り続ける問題（再発）

**現象**: 前セッションで稼働させていた `next dev` の Node プロセス（PID 5904）がブラウザで `http://localhost:3000` を握り続けていた。新しい dev server は port 3001 で起動するが、Next.js が「Another next dev server is already running」と判定して exit code 1 で終了。

**対処**: `taskkill /PID 5904 /F` で強制終了 → port 3000 で clean に再起動。

**学び**: Week 3 Task 2 でも同じ問題があった。Windows の Local 開発で `pnpm dev` のセッション間切替時は、毎回 PID 確認 + taskkill する習慣を付けるとよい。Linux/Mac なら `lsof -i :3000` で見つけられる。

### 2. Next.js 16 の `.env.local` ロード表示

dev server 起動ログに `- Environments: .env.local` が表示されるようになった（Next.js 16 の機能）。これで「環境変数ファイルが読み込まれているか」が一目で分かる。

### 3. `_embed` の威力

REST API に `?_embed` を付けるだけで:
- アイキャッチ画像（`_embedded['wp:featuredmedia']`）
- 著者情報（`_embedded.author`）
- タクソノミー（`_embedded['wp:term']`）

が全て一発で取れる。GraphQL を使わないなら、`_embed` は事実上必須。

### 4. ACF フィールドは `post.acf` で取得可能

`show_in_rest: 1` を設定したACFフィールドグループは、REST レスポンスの `acf` キーに全てまとめて入る。今回の page.tsx で `post.acf?.reading_time` が取得できたのがその証拠。

```json
{
  "id": 65,
  "title": { "rendered": "..." },
  "acf": {
    "author_profile": { ... },
    "reading_time": 5,
    "featured_image_caption": "...",
    "related_posts": [ ... ]
  }
}
```

### 5. `Promise.all` で並列取得

8つのエンドポイントを `Promise.all` で並列実行することで、最も遅いリクエストの時間だけで済む。シーケンシャルなら 8 × N 秒、並列なら max(N) 秒。Server Component との相性も良い。

---

## API レスポンスの構造例

`getPosts()` が返すデータの典型例:

```json
[
  {
    "id": 65,
    "slug": "manager-3month-program",
    "date": "2026-05-14T...",
    "title": { "rendered": "マネージャー育成のための3ヶ月プログラム設計" },
    "excerpt": { "rendered": "..." },
    "content": { "rendered": "..." },
    "acf": {
      "author_profile": { "id": 50, "title": "佐藤 美咲", ... },
      "reading_time": 6,
      "featured_image_caption": "...",
      "related_posts": [ ... ]
    },
    "_embedded": {
      "wp:featuredmedia": [
        {
          "id": 78,
          "source_url": "http://nordic-works.local/wp-content/uploads/...",
          "alt_text": "...",
          "media_details": { "width": 1600, "height": 900 }
        }
      ],
      "author": [{ "id": 1, "name": "nordic-works", "slug": "nordic-works" }],
      "wp:term": [
        [ { "id": 11, "name": "IT / SaaS", "slug": "it-saas", "taxonomy": "industry" } ],
        [ { "id": 18, "name": "マネジメント", "slug": "management", "taxonomy": "topic" } ],
        [ { "id": 23, "name": "中級", "slug": "intermediate", "taxonomy": "reading_level" } ]
      ]
    }
  },
  ...
]
```

これだけのデータがREST一発で取れるのが `_embed` の威力。

---

## 振り返り（面接で語れる素材）

### 1. 「Next.js 15+ キャッシュ仕様変更への対応」

Next.js 14 までは `fetch` がデフォルトキャッシュされていたが、v15で挙動が変更。本実装では:
- ページごとに適切な `revalidate` 値を明示
- 更新頻度が低いコンテンツは `force-cache`（永続）
- 全 fetch に `tags` を付与して、Week 5 の On-demand Revalidation に備えた

**伝わるポイント**: フレームワークのバージョン仕様を理解した上でキャッシュ戦略を設計できる。

### 2. 「`_embed` を使った RESTでの効率取得」

GraphQL を使わなくても、REST API の `_embed` パラメータで関連データを一括取得する設計を選択した。「モダンだから GraphQL」ではなく、要件に応じて REST と GraphQL を使い分ける判断ができることをアピール。

### 3. 「`DATA_SOURCE` による環境別データ取得の二重化設計」

`process.env.DATA_SOURCE` で「API取得 / 静的JSON取得」を切り替える枠組みを最初から組み込んだ。これは Week 8 の本番デプロイ戦略（Local WP + 静的エクスポート + Vercel）を前提にした設計判断。

**伝わるポイント**: 開発／本番／デモという複数モードを意識した設計力。

### 4. 「エラーを throw せず null/[] を返す API デザイン」

呼び出し側のハンドリングが簡単になり、`if (!post) notFound()` 等のパターンが書きやすくなる。Server Component の async/await と相性が良い。

---

## 次のタスク

`week-03-task-6-types.md`（予定）:
- `src/types/wordpress.ts` を作成し、`wordpress.ts` 内のインライン型を移動
- ACFフィールドの細かい型（リピーターの sub-field 型など）を追加
- 共通型（`WPRendered`, `WPMedia`, `WPTerm`）を export
- `wordpress.ts` は型を import するだけにしてスリム化

---

## 関連ドキュメント

- 仕様: `docs/06-features.md`（ISR / キャッシュ戦略セクション）
- 設計: `docs/09-deployment-strategy.md`（DATA_SOURCE の意義）
- 前のタスク: `week-03-task-4-env-vars.md`
