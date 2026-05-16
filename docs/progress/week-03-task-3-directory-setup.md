# Week 3 / Task 3 — ディレクトリ構成セットアップ

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 3
**実施日**: 2026-05-15
**ステータス**: ✅ 完了
**前提**: Week 3 Task 2 完了済み（追加パッケージ10種インストール完了、dev server 200 OK）

---

## タスクの目的

`docs/05-tech-stack.md` に記載された Next.js プロジェクトのディレクトリ構成を、`web/src/` 配下に骨組みとして用意する。

具体的には:
- App Router のルートグループ `(corporate)` `(media)` を作成
- 各CPTに対応する動的ルート `[slug]` のフォルダを準備
- API ルート（プレビュー・再検証・お問い合わせ）の受け皿を用意
- コンポーネント・ライブラリ・型定義の格納場所を整備

**重要**: このタスクでは**フォルダ作成のみ**を行う。中身（page.tsx, route.ts 等）は Task 5〜7 で順次実装する。

---

## 完了基準

- [x] `docs/05-tech-stack.md` 記載の全ディレクトリが `web/src/` 配下に存在する
- [x] 空ディレクトリは `.gitkeep` で Git 追跡可能になっている
- [x] dev server が引き続き起動・200 OK を返す（既存ページに影響なし）
- [x] Next.js のルートグループ記法 `(corporate)` `(media)` と動的ルート記法 `[slug]` が正しく適用されている

---

## 作業手順

### Step 1: 全ディレクトリを一括作成

`mkdir -p` で深いネスト含めて一発作成:

```bash
cd web/src
mkdir -p \
  "app/(corporate)/about" \
  "app/(corporate)/services/[slug]" \
  "app/(corporate)/careers/[slug]" \
  "app/(corporate)/contact" \
  "app/(media)/articles/[slug]" \
  "app/(media)/features/[slug]" \
  "app/(media)/authors/[slug]" \
  "app/(media)/category/[slug]" \
  "app/(media)/tag/[slug]" \
  "app/(media)/search" \
  "app/api/preview" \
  "app/api/exit-preview" \
  "app/api/revalidate" \
  "app/api/contact" \
  "components/ui" \
  "components/corporate" \
  "components/media" \
  "components/common" \
  "lib" \
  "types" \
  "styles"
```

ポイント:
- `(corporate)` / `(media)` は Next.js の **ルートグループ** 記法。URL には反映されないがコード上は整理になる
- `[slug]` は **動的ルート** 記法。`page.tsx` を置けば `/articles/foo`, `/articles/bar` 等で動的に解決される
- パーレン `(` `)` とブラケット `[` `]` は bash のメタ文字なので、フォルダ名をダブルクォートで囲んで escape 回避

### Step 2: 空ディレクトリに `.gitkeep` を配置

Git は空ディレクトリを追跡しないため、`.gitkeep`（慣習的な空ファイル）を置く:

```bash
find . -type d -empty -exec touch {}/.gitkeep \;
```

これにより21箇所の末端ディレクトリに `.gitkeep` が作成された。中間ディレクトリ（`app/(corporate)/services/` など、`[slug]/.gitkeep` を含む）は内部にファイルがあるため `.gitkeep` 不要。

### Step 3: dev server の動作確認

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
```

既存ページに影響なし。Next.js は新しい空フォルダを単に無視している（`page.tsx` がないのでルートとして認識されない）。

---

## 作成・変更ファイル

### 新規作成ディレクトリ（30個）

```
web/src/
├ app/
│  ├ (corporate)/
│  │  ├ about/
│  │  ├ services/
│  │  │  └ [slug]/
│  │  ├ careers/
│  │  │  └ [slug]/
│  │  └ contact/
│  ├ (media)/
│  │  ├ articles/
│  │  │  └ [slug]/
│  │  ├ features/
│  │  │  └ [slug]/
│  │  ├ authors/
│  │  │  └ [slug]/
│  │  ├ category/
│  │  │  └ [slug]/
│  │  ├ tag/
│  │  │  └ [slug]/
│  │  └ search/
│  └ api/
│     ├ preview/
│     ├ exit-preview/
│     ├ revalidate/
│     └ contact/
├ components/
│  ├ ui/
│  ├ corporate/
│  ├ media/
│  └ common/
├ lib/
├ types/
└ styles/
```

### 新規作成ファイル（21個の .gitkeep）

```
app/(corporate)/about/.gitkeep
app/(corporate)/careers/[slug]/.gitkeep
app/(corporate)/contact/.gitkeep
app/(corporate)/services/[slug]/.gitkeep
app/(media)/articles/[slug]/.gitkeep
app/(media)/authors/[slug]/.gitkeep
app/(media)/category/[slug]/.gitkeep
app/(media)/features/[slug]/.gitkeep
app/(media)/search/.gitkeep
app/(media)/tag/[slug]/.gitkeep
app/api/contact/.gitkeep
app/api/exit-preview/.gitkeep
app/api/preview/.gitkeep
app/api/revalidate/.gitkeep
components/common/.gitkeep
components/corporate/.gitkeep
components/media/.gitkeep
components/ui/.gitkeep
lib/.gitkeep
styles/.gitkeep
types/.gitkeep
```

---

## URL マッピング設計

各ディレクトリが将来どの URL にマップされるか:

| ディレクトリパス | 対応 URL | 実装する Week |
|---|---|---|
| `app/page.tsx` (既存) | `/` | Week 4 |
| `app/(corporate)/about/page.tsx` | `/about` | Week 4 |
| `app/(corporate)/services/page.tsx` | `/services` | Week 4 |
| `app/(corporate)/services/[slug]/page.tsx` | `/services/<slug>` | Week 4 |
| `app/(corporate)/careers/page.tsx` | `/careers` | Week 4 |
| `app/(corporate)/careers/[slug]/page.tsx` | `/careers/<slug>` | Week 4 |
| `app/(corporate)/contact/page.tsx` | `/contact` | Week 6 |
| `app/(media)/articles/page.tsx` | `/articles` | **Week 3** Task 7 |
| `app/(media)/articles/[slug]/page.tsx` | `/articles/<slug>` | **Week 3** Task 7 |
| `app/(media)/features/page.tsx` | `/features` | Week 4 |
| `app/(media)/features/[slug]/page.tsx` | `/features/<slug>` | Week 4 |
| `app/(media)/authors/page.tsx` | `/authors` | Week 4 |
| `app/(media)/authors/[slug]/page.tsx` | `/authors/<slug>` | Week 4 |
| `app/(media)/category/[slug]/page.tsx` | `/category/<slug>` | Week 4 |
| `app/(media)/tag/[slug]/page.tsx` | `/tag/<slug>` | Week 4 |
| `app/(media)/search/page.tsx` | `/search` | Week 6 |
| `app/api/preview/route.ts` | `POST /api/preview` | Week 5 |
| `app/api/exit-preview/route.ts` | `GET /api/exit-preview` | Week 5 |
| `app/api/revalidate/route.ts` | `POST /api/revalidate` | Week 5 |
| `app/api/contact/route.ts` | `POST /api/contact` | Week 6（または Server Action 化） |

---

## ルートグループ `(corporate)` `(media)` の役割

### URL には現れない、コード整理だけのグループ化

```
URL: /about → 実際のフォルダ: app/(corporate)/about/page.tsx
URL: /articles → 実際のフォルダ: app/(media)/articles/page.tsx
```

`(corporate)` `(media)` という名前はパスに含まれない。これはディレクトリの「論理的なまとまり」を示すだけ。

### 何が嬉しいか

1. **コード上の整理**: 「コーポレートサイト系」「メディア系」が見た目で分かる
2. **グループ別の `layout.tsx` 適用**: `(corporate)/layout.tsx` を作るとコーポレート系だけに共通レイアウトを適用できる（Week 4 で活用予定）
3. **独立した metadata 管理**: 各グループで `metadata` を別設定可能

---

## 詰まったところ・気づき

特になし。フォルダ作成だけの単純作業のため、トラブルなく完了。

ただし以下を意識した:

### bash でのメタ文字エスケープ

`(`, `)`, `[`, `]` はシェルのメタ文字なので、`mkdir` の引数として渡すときは **ダブルクォートで囲む** 必要がある。クォート無しだと bash がパース時にエラーを出すか、想定外の動きをする。

### `find ... -empty` の挙動

`-empty` フラグは「ファイル0、サブディレクトリ0」のディレクトリだけにマッチする。`[slug]` フォルダに `.gitkeep` を作ると、その親 `services/` は「ファイル0だがサブディレクトリ有り」なので空でなくなる → 親には `.gitkeep` が作られない。これは想定通りの挙動。

### docs/05-tech-stack.md と現実の若干の差

`docs/05-tech-stack.md` では `src/styles/globals.css` というパスが書かれているが、Next.js 16 のデフォルトでは `src/app/globals.css` に置かれる。今回は Next.js のデフォルト位置を維持したまま、空の `src/styles/` フォルダだけ作成（将来コンポーネント別CSS等を置く想定）。

`docs/05-tech-stack.md` を Week 3 完了時に更新する宿題リストに追加。

---

## 動作確認結果

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
Vary: rsc, next-router-state-tree, ...
X-Powered-By: Next.js
```

トップページ（`app/page.tsx`）は引き続き Next.js デフォルトページを返す。新規追加した空フォルダはルートとして認識されないため、`/articles` 等にアクセスしても 404 になる（これは想定通り、Task 7 で `page.tsx` を作るまで未実装の状態）。

---

## 振り返り（面接で語れる素材）

### 1. 「Next.js App Router の規約に従ったプロジェクト設計」

`(corporate)` `(media)` のルートグループや、`[slug]` の動的ルートを最初から設計に含めることで、後の実装で迷わない構造を作った。

**伝わるポイント**:
- App Router の規約を理解している
- 「グループ化と階層化」というシンプルなルールでスケールする設計

### 2. 「.gitkeep を使った空ディレクトリの Git 追跡」

「Git は空ディレクトリを追跡しない」という基本仕様への対処として、`.gitkeep` を慣習的に配置。`find -empty -exec touch` で一括処理する手法も知っているとアピール可能。

**伝わるポイント**: Git の仕様を踏まえた上でチーム開発前提の設計ができる

---

## 次のタスク

`week-03-task-4-env-vars.md`（予定）:
- `web/.env.local` の作成（Git管理外）
  - `WORDPRESS_API_URL`
  - `WORDPRESS_GRAPHQL_URL`
- `web/.env.example` の作成（Git管理対象、設定テンプレート）
- 各環境変数の意味と用途のドキュメント化

---

## 関連ドキュメント

- 仕様: `docs/05-tech-stack.md` のディレクトリ構成セクション
- 前のタスク: `week-03-task-2-add-packages.md`
- URL 設計: `docs/03-site-design.md` の URL 設計テーブル
