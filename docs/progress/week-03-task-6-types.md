# Week 3 / Task 6 — TypeScript 型定義

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 6
**実施日**: 2026-05-16
**ステータス**: ✅ 完了
**前提**: Week 3 Task 5 完了済み（`src/lib/wordpress.ts` 実装、データ取得確認済）

---

## タスクの目的

Task 5 で `src/lib/wordpress.ts` 内にインライン定義した型を `src/types/wordpress.ts` に切り出し、型を1箇所で集約管理する構造にする。あわせて ACF リピーターの sub-field 型や Next.js ルート型など、Task 7 で必要になる型を拡充する。

具体的には:
- `src/types/wordpress.ts` を新規作成し、全 WordPress レスポンス型を集約
- ACF リピーターフィールドの sub-field を個別の名前付き型として定義
- Next.js 15+ の動的ルート props 型（`params: Promise<...>`）を定義
- `src/lib/wordpress.ts` は型を import するだけのスリムな状態にする
- 型エラーがないことを `tsc --noEmit` で確認

CLAUDE.md の方針「TypeScriptの型はWordPressレスポンスを `src/types/wordpress.ts` で集約管理する」に準拠。

---

## 完了基準

- [x] `src/types/wordpress.ts` が作成され、全型を export している
- [x] `src/lib/wordpress.ts` がインライン型定義を持たず、`@/types/wordpress` から import している
- [x] ACF リピーターの sub-field 型（`ServiceFeature`, `PricingPlan` 等）が定義されている
- [x] Next.js 動的ルート用の型（`SlugPageProps`, `SlugParam`）が定義されている
- [x] `pnpm exec tsc --noEmit` が exit code 0（型エラーなし）
- [x] dev server で動作確認ページが従来通り表示される（リファクタの無影響を確認）

---

## 実装の設計判断

### 判断1: 型ファイルは単一ファイルに集約

`docs/05-tech-stack.md` の構成では `types/wordpress.ts` 一本。CPT別に分割（`types/post.ts` 等）する案もあったが、現状の型数（30弱）なら単一ファイルで見通せる。約230行に収まった。

将来 1000行を超えるようなら CPT 別分割を検討。

### 判断2: 型は再 export しない（単一の入手経路）

Task 5 では `wordpress.ts` が型を `export` していた。リファクタ後、型は `@/types/wordpress` からのみ import する設計に統一:

- 関数: `import { getPosts } from '@/lib/wordpress'`
- 型: `import type { WPPost } from '@/types/wordpress'`

`wordpress.ts` から型を再 export する案もあったが、「型の入手経路は1つ」の方が混乱がない。`page.tsx` は型を import していなかったため、この変更で既存コードは壊れない。

### 判断3: 共通ベース型 `WPEntityBase` の導入

Task 5 では各 CPT 型（`WPPost`, `WPService` 等）が `id` / `slug` / `date` / `title` / `content` / `_embedded` を個別に持っていた（重複）。

Task 6 では共通部分を `WPEntityBase` インターフェイスに抽出し、各 CPT 型は `extends WPEntityBase` する形に。

```typescript
export interface WPEntityBase {
	id: number;
	slug: string;
	date: string;
	modified?: string;
	status?: WPPostStatus;
	title: WPRendered;
	content: WPRendered;
	_embedded?: WPEmbedded;
}

export interface WPPost extends WPEntityBase {
	excerpt: WPRendered;   // post のみ excerpt を持つ
	acf?: PostAcf;
}
```

DRY 原則の適用。`excerpt` は `post` だけが持つ（他CPTは `supports` に `excerpt` を含めていない）ため、ベースには入れず `WPPost` 固有とした。

### 判断4: ACF リピーターの sub-field を名前付き型に

Task 5 ではリピーターの sub-field がインラインのオブジェクト型（`{ title: string; description: string }[]`）だった。Task 6 で名前付きインターフェイスに昇格:

| sub-field 型 | 用途 |
|---|---|
| `ServiceFeature` | サービスの機能リスト1項目 |
| `PricingPlan` | 料金プラン1項目 |
| `FaqItem` | FAQ 1項目 |
| `CaseStudyLink` | 導入事例リンク1項目 |
| `SkillItem` | 採用スキル1項目（required/preferred 共通） |
| `BenefitItem` | 待遇1項目 |

名前付きにすることで、コンポーネント側で「FAQ 1件を受け取るコンポーネント」の props 型として `FaqItem` を直接 import できる。Task 7 以降で効いてくる。

### 判断5: ACF の `false` を型に含める

ACF の `post_object` / `relationship` / `image` フィールドは、**値が未設定のとき WordPress が `false` を返す**ことがある。これを型に反映:

```typescript
hero_image?: WPMedia | false;
related_posts?: WPPost[] | false;
```

これを忘れると、`post.acf.hero_image.source_url` のようなアクセスで実行時エラーになりうる。型で `| false` を明示することで、コンパイラが「false チェックしてから使え」と警告してくれる。

### 判断6: Next.js 15+ の Promise params 型

Next.js 15 以降、動的ルートの `params` と `searchParams` は **Promise** になった。これを型として定義:

```typescript
export interface SlugPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
```

Task 7 で `/articles/[slug]/page.tsx` を実装する際、`export default async function Page({ params }: SlugPageProps)` のように使う。`const { slug } = await params;` で値を取り出す。

---

## 作成・変更ファイル

```
web/src/
├ types/
│  ├ wordpress.ts      (新規、約230行、全WP型を集約)
│  └ .gitkeep           (削除、wordpress.ts ができたため不要)
└ lib/
   └ wordpress.ts       (更新、インライン型を削除し import 文に置換)
```

---

## `src/types/wordpress.ts` の構成

```
1. 基本型           WPRendered, WPPostStatus
2. メディア・タクソノミー  WPMedia, WPTerm, WPAuthorRef, WPEmbedded
3. ACF リピーター sub-field  ServiceFeature, PricingPlan, FaqItem,
                            CaseStudyLink, SkillItem, BenefitItem, PositionType
4. ACF フィールドグループ  PostAcf, ServiceAcf, CareerAcf,
                          FeatureAcf, AuthorProfileAcf
5. エンティティ型      WPEntityBase, WPPost, WPService, WPCareer,
                      WPFeature, WPAuthorProfile, WPEntity (union)
6. Next.js ルート型   SlugPageProps, SlugParam
```

合計 約25個の型を export。

---

## `src/lib/wordpress.ts` の変更点

### Before（Task 5 時点）

```typescript
// ファイル内に約115行のインライン型定義
export interface WPPost { ... }
export interface WPService { ... }
// ... 9個のインターフェイス
```

### After（Task 6）

```typescript
import type {
	WPPost,
	WPService,
	WPCareer,
	WPFeature,
	WPAuthorProfile,
	WPTerm,
} from '@/types/wordpress';
```

インライン型定義 約115行が import 文 8行に置き換わり、`wordpress.ts` は「データ取得ロジックだけのファイル」になった。役割が明確化。

---

## 動作確認結果

### 型チェック

```
$ pnpm exec tsc --noEmit
=== EXIT: 0 ===
```

型エラーゼロ。リファクタによる型の不整合がないことを確認。

### dev server

```
▲ Next.js 16.2.6 (Turbopack)
- Environments: .env.local
✓ Ready in 16.1s
```

### ページレンダリング（リファクタ前後で同一）

```
$ curl http://localhost:3000/ → 取得件数
記事 13 / サービス 3 / 採用 2 / 特集 2 / 著者 3 / 業界 6 / トピック 8 / 読者レベル 3

$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
```

Task 5 完了時とまったく同じ表示。型の置き場所を変えただけで、実行時の挙動には一切影響しないことを確認。

---

## 詰まったところ・気づき

特に大きなトラブルなし。型定義の移動とリファクタはスムーズに完了した。

### 気づき1: TypeScript の型は前方参照可能

`PostAcf` 型は `WPPost` と `WPAuthorProfile` を参照するが、これらはファイル内で `PostAcf` より後に定義されている。TypeScript は型宣言を hoisting するため、同一ファイル内の前方参照・循環参照は問題なく解決される。

```typescript
export interface PostAcf {
	related_posts?: WPPost[] | false;  // WPPost はこの下で定義されている
}
// ...
export interface WPPost extends WPEntityBase {
	acf?: PostAcf;  // PostAcf は上で定義済み（循環参照）
}
```

### 気づき2: `import type` で型のみ import

`import type { ... }` を使うと「これは型情報だけで、実行時には消える」とコンパイラに明示できる。バンドルサイズに影響せず、循環 import の問題も避けやすい。Task 5 の関数 import（`import { getPosts }`）とは区別している。

### 気づき3: `tsc --noEmit` での検証

`pnpm exec tsc --noEmit` は「型チェックだけ実行してファイル出力はしない」コマンド。dev server を起動しなくても型の正しさを高速に検証できる。型リファクタの確認に最適。

`package.json` の scripts に `"typecheck": "tsc --noEmit"` を追加しておくと、今後のCI等で便利（今回は未追加、必要に応じてWeek 8で）。

---

## 振り返り（面接で語れる素材）

### 1. 「型の集約管理とレイヤー分離」

データ取得ロジック（`lib/wordpress.ts`）と型定義（`types/wordpress.ts`）を分離した。「`lib` は振る舞い、`types` は形」という責務分担を明確にした設計。

**伝わるポイント**: 単に動かすだけでなく、ファイルの責務を意識した構造設計ができる。

### 2. 「ACF の `false` を型で表現したディフェンシブ設計」

ACF が未設定フィールドで `false` を返す仕様を型に `| false` として組み込んだ。これによりコンパイラが「null/false チェックを忘れている」箇所を検出してくれる。実行時エラーを型システムで予防する設計。

**伝わるポイント**: 外部APIの「クセ」を型で吸収し、バグを未然に防ぐ意識。

### 3. 「共通ベース型による DRY」

`WPEntityBase` を抽出して各 CPT 型が `extends` する構造にした。フィールド追加時に1箇所の修正で済む。

### 4. 「Next.js 15+ の破壊的変更への追従」

`params` が Promise 化された Next.js 15+ の仕様変更を理解し、`SlugPageProps` 型として正しく定義した。フレームワークのバージョン差異を型レベルで吸収。

---

## 次のタスク

`week-03-task-7-articles-ui.md`（予定）— Week 3 のフィナーレ:
- `/articles`（記事一覧ページ）の実装
- `/articles/[slug]`（記事詳細ページ）の実装
- 暫定トップページ（現 `page.tsx`）から本物の記事ページへ
- `SlugPageProps` 型を使った動的ルートの実装
- `generateStaticParams` での静的パス生成
- 記事カードコンポーネントの作成

このタスクで Week 3 の目標「`localhost:3000/articles` で記事一覧が表示され、各記事の詳細ページに遷移できる」を達成する。

---

## 関連ドキュメント

- 仕様: `docs/05-tech-stack.md` の TypeScript 型定義の方針セクション
- 前のタスク: `week-03-task-5-wordpress-lib.md`
- 参照: CLAUDE.md「TypeScriptの型はWordPressレスポンスを src/types/wordpress.ts で集約管理する」
