# Week 4 / Task 4-C-2〜4-C-4 — 採用情報・著者・特集の一覧/詳細ページ実装

**所属Week**: Week 4（コア機能・各CPTのページ実装）
**該当タスク番号**: `07-roadmap.md` の Task 4-C-2 / 4-C-3 / 4-C-4
**実施日**: 2026-05-19
**ステータス**: ✅ 完了
**前提**: Task 4-C-1 完了済み（サービス一覧・詳細、ACFリピーター→textarea再設計）

---

## タスクの目的

4-C-1（サービス）と同じパターンで、残り3つのカスタム投稿タイプのページを一括実装する。

- **4-C-2 採用情報** — `/careers` 一覧 + `/careers/[slug]` 詳細 + `CareerCard`（画像なし）
- **4-C-3 著者** — `/authors` 一覧 + `/authors/[slug]` 詳細 + `AuthorCard`（画像あり・著者別記事）
- **4-C-4 特集** — `/features` 一覧 + `/features/[slug]` 詳細（`FeatureCard` は 4-B で作成済み）

これで全4 CPT（service / career / feature / author_profile）が一覧・詳細ページを持つ。

---

## 完了基準

- [x] `/careers` `/authors` `/features` が一覧表示される
- [x] 各 `[slug]` 詳細ページが表示される（`generateStaticParams` / `generateMetadata` / `notFound()`）
- [x] 採用情報詳細でスキル・待遇が箇条書き表示される
- [x] 著者詳細で「その著者が書いた記事」が一覧表示される
- [x] 特集詳細で関連記事（related_articles）がカード表示される
- [x] `tsc --noEmit` が型エラーなし
- [x] dev server で全ページが 200 を返す

---

## 作成・変更ファイル

```
web/src/
├ lib/
│  ├ wordpress.ts        (更新: getPostsByIds / getAuthorById 追加)
│  └ utils.ts            (更新: positionTypeLabel 追加)
├ types/
│  └ wordpress.ts        (更新: ACF の ID 返しに合わせ型修正)
├ components/
│  ├ corporate/
│  │  └ CareerCard.tsx   (新規: 採用情報カード・画像なし)
│  └ media/
│     └ AuthorCard.tsx   (新規: 著者カード・顔写真あり)
└ app/
   ├ (corporate)/careers/
   │  ├ page.tsx                (新規: 採用情報一覧)
   │  └ [slug]/page.tsx         (新規: 採用情報詳細)
   ├ (media)/authors/
   │  ├ page.tsx                (新規: 著者一覧)
   │  └ [slug]/page.tsx         (新規: 著者詳細)
   ├ (media)/features/
   │  ├ page.tsx                (新規: 特集一覧)
   │  └ [slug]/page.tsx         (新規: 特集詳細)
   └ (media)/articles/[slug]/page.tsx  (更新: 著者解決を ID ベースに修正)
```

---

## 実装の設計判断

### 判断1: ACF の参照系フィールドは「REST API では数値ID」だと判明

実装中、ACF の `post_object` / `relationship` / `image` フィールドが REST API 上では
**実体オブジェクトではなく数値ID（または ID 配列）で返る**ことが判明した。

| ACFフィールド | 期待した形 | 実際のREST値 |
|---|---|---|
| `author_profile`（post_object） | 著者オブジェクト | `46`（投稿ID） |
| `related_articles`（relationship） | 記事オブジェクト配列 | `[55,60,63,57]`（ID配列） |
| `photo` / `hero_image` / `cover_image`（image） | 画像オブジェクト | `70` / `73` / `87`（メディアID） |

当初 `related_articles` をオブジェクト配列前提で `ArticleCard` に渡し、
`Cannot read properties of undefined (reading 'rendered')` で 500 エラーになった。

**対処方針（2本立て）**:

1. **画像系** — ACF の `photo` 等は使わず、WordPress コアの**アイキャッチ画像**
   （`_embedded['wp:featuredmedia']`）を `getFeaturedImage()` で取得する。
   シーダーが各CPTにアイキャッチを設定済みなので、これで全画像が表示できる。
2. **参照系（ID）** — ID を実体に解決する取得関数を `wordpress.ts` に追加（判断2）。

`src/types/wordpress.ts` の型もこの実態に合わせて修正（`WPMedia｜false` → `number｜false` 等）。

### 判断2: ID解決用の取得関数を `wordpress.ts` に追加

```typescript
// 関連記事のID配列 → 実体の記事へ。orderby=include で指定順を保持
getPostsByIds(ids: number[]): Promise<WPPost[]>

// 著者の投稿ID → 著者プロフィール実体へ
getAuthorById(id: number): Promise<WPAuthorProfile | null>
```

REST の `include` パラメータで一括取得し、`orderby=include` で
ACF 側で並べた順序をそのまま維持する。

### 判断3: 記事詳細ページの著者表示バグも同時修正

`/articles/[slug]` は従来 `typeof author_profile === 'object'` で著者を判定していたが、
判断1の通り実際は数値IDのため、この条件は**常に false**＝著者ブロックが描画されない
状態だった（4-C-1 以前からの潜在バグ）。

原因が判明したため、`getAuthorById()` でIDから著者を解決する形に修正した。
スコープ外だが、根本原因が共通で修正コストも小さいため同時対応した。

### 判断4: `CareerCard` は画像なしのテキストカード

採用情報にはアイキャッチ画像が無い（職種情報が主体）。
枠線（`border`）ベースのカードにし、雇用形態バッジ・勤務地・給与レンジを表示。

雇用形態は ACF select の値（`full_time` 等）なので、日本語ラベル変換ヘルパー
`positionTypeLabel()` を `utils.ts` に追加（`full_time`→`正社員`）。

### 判断5: 採用情報詳細のスキル・待遇は `parseLines()` で配列化

`required_skills` / `preferred_skills` / `benefits` は 4-C-1 で textarea 化した
「1行1項目」形式。既存の `parseLines()`（4-C-1 で追加）でそのまま配列化し、
共通の `ListSection` コンポーネントで箇条書き表示する。

### 判断6: 著者詳細の「著者別記事」は全記事をフィルタ

`getPosts()` で全記事を取得し、`post.acf.author_profile === author.id` で絞り込む。
記事数が少ない（13件）ポートフォリオ規模なので、専用エンドポイントを作らず
クライアント側フィルタで十分と判断。

---

## 動作確認結果

### 型チェック

```
$ pnpm exec tsc --noEmit
TSC_OK（エラーなし）
```

### HTTP ステータス

```
GET /careers                              → 200
GET /careers/ui-ux-designer               → 200
GET /authors                              → 200
GET /authors/lindberg-anna                → 200
GET /features                             → 200
GET /features/psych-safety-five-actions   → 200
GET /articles  /services（回帰確認）       → 200 / 200
GET /articles/manager-3month-program      → 200（著者解決の修正後）
```

### コンテンツ確認

| 検証 | 結果 |
|---|---|
| 採用情報詳細のセクション | 必須スキル / 歓迎スキル / 待遇・福利厚生 が描画 |
| 特集詳細の関連記事 | 「この特集の記事」セクションが描画 |
| 著者詳細の顔写真 | アイキャッチ経由で表示 |

---

## 詰まったところ・気づき

### 1. ACF + REST API は「参照系を ID で返す」

最大の落とし穴。ACF のフィールド設定（`return_format: array` 等）は
ACF 独自の取得関数（`get_field()`）向けで、**WordPress REST API の `acf` キーには
反映されず、生のID/ID配列が出る**。

WPGraphQL を使えば実体で取れるが、本プロジェクトは Week 3 で REST 採用済み。
→「ID で来る前提」でフロント側に解決層（`getPostsByIds` 等）を置く設計にした。

### 2. 画像はコアのアイキャッチに寄せると楽

ACF image フィールドもIDで来るため、ID→メディア解決が必要になる。
だが各CPTにはコアのアイキャッチ画像が設定済みで、これは `_embed` で
実体が埋め込まれて来る。**画像はすべてアイキャッチに統一**することで
追加の解決処理を1本も書かずに済んだ。

---

## 振り返り（面接で語れる素材）

### 1. 「ACF × REST API の挙動差を実データで特定し、解決層を設計した」

ドキュメントの想定（オブジェクトで返る）と実データ（IDで返る）の差異を
500エラーから切り分け、`getPostsByIds` / `getAuthorById` という解決層を追加。
「APIの実挙動をデバッグして設計に落とす」プロセスを語れる。

### 2. 「潜在バグの発見と根本修正」

記事詳細の著者表示が実は機能していなかったことを、別タスクの調査過程で発見。
原因が共通だったため一括で根治した。

### 3. 「確立したパターンの横展開」

4-C-1（サービス）で作った「一覧 + 詳細 + カード」「`generateStaticParams` /
`generateMetadata` / `notFound()`」「textarea パーサ」のパターンを
3 CPT に一貫適用。コードの予測可能性とレビューしやすさを担保。

---

## Week 4-C 完了状況

| Task | 内容 | 状態 |
|---|---|---|
| 4-C-1 | サービス 一覧・詳細 | ✅ |
| 4-C-2 | 採用情報 一覧・詳細 | ✅ |
| 4-C-3 | 著者 一覧・詳細 | ✅ |
| 4-C-4 | 特集 一覧・詳細 | ✅ |

全4 CPT のページが揃った。

---

## 次のタスク

- **4-D**: タクソノミーページ（`/category/[slug]`・`/tag/[slug]`）+ 404 ページ
- **4-E**: SEO（sitemap / canonical / JSON-LD）
- **4-F**: Vercel デプロイ

---

## 関連ドキュメント

- サイト設計: `docs/03-site-design.md`
- 仕様: `docs/06-features.md`（ISR セクション）
- 前のタスク: `week-04` の 4-C-1（サービスページ実装）
