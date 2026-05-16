# Week 3 / Task 4 — 環境変数設定

**所属Week**: Week 3（Next.js 最小実装）
**該当タスク番号**: `07-roadmap.md` の Task 4
**実施日**: 2026-05-15
**ステータス**: ✅ 完了
**前提**: Week 3 Task 3 完了済み（ディレクトリ構成セットアップ完了）

---

## タスクの目的

`.env.local`（実値、Git管理外）と `.env.example`（テンプレート、Git管理対象）を分離して、本プロジェクトで必要な全環境変数の設計図を整える。

具体的には:
- Week 3 で必要な WordPress 接続情報を設定
- Week 5〜6 で使う予定の変数もテンプレート上で先取り定義
- `.env.example` を Git に追加することで「他人が同じ環境を再現する手順」を明示
- `.env.local` を Git 管理外にして個人ごとの値（あるいは将来の本番値）が漏れない設計

---

## 完了基準

- [x] `web/.env.local` が作成されている（WP接続値、Git管理外）
- [x] `web/.env.example` が作成されている（テンプレート、Git管理対象）
- [x] `web/.gitignore` で `.env.local` は除外、`.env.example` は追跡される
- [x] dev server が引き続き起動・200 OK を返す（環境変数追加でビルドが壊れない）

---

## 環境変数の分類と用途

### 🟢 Week 3 ですぐ使う（実値設定済）

| 変数名 | 値 | 用途 |
|---|---|---|
| `WORDPRESS_API_URL` | `http://nordic-works.local/wp-json` | REST API のベースURL |
| `WORDPRESS_GRAPHQL_URL` | `http://nordic-works.local/graphql` | GraphQL エンドポイント |
| `DATA_SOURCE` | `api` | データ取得モード切替（Week 8 で `static` を追加予定） |

### 🟡 Week 5 で使う（プレースホルダー）

| 変数名 | 用途 |
|---|---|
| `WORDPRESS_PREVIEW_SECRET` | 下書きプレビュー時の認証トークン（WP側と一致が必要） |
| `REVALIDATE_SECRET` | On-demand Revalidation の認証トークン |
| `WP_USERNAME` | 下書き記事を認証付きで取得する際のWPユーザー名 |
| `WP_APPLICATION_PASSWORD` | 同上、Application Password |

### 🟡 Week 6 で使う（プレースホルダー）

| 変数名 | 公開範囲 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | クライアント | Algolia アプリID |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | クライアント | Algolia 検索キー（読み取り専用） |
| `ALGOLIA_ADMIN_KEY` | サーバーのみ | Algolia 管理キー（インデックス書き込み用） |
| `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` | クライアント | インデックス名（`nordic_works` をデフォルト） |
| `RESEND_API_KEY` | サーバーのみ | Resend API キー |
| `CONTACT_EMAIL_FROM` | サーバーのみ | 送信元メールアドレス |
| `CONTACT_EMAIL_TO` | サーバーのみ | 通知先メールアドレス |

---

## 作業手順

### Step 1: `web/.gitignore` の調整

Next.js デフォルトの `.env*` パターンは `.env.example` も巻き込んでしまうため、`!.env.example` で例外指定:

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

`git check-ignore -v` で動作確認:
```
.env.local    → .gitignore:33:.env* (IGNORED)
.env.example  → .gitignore:34:!.env.example (TRACKED)
.env          → .gitignore:33:.env* (IGNORED)
```

期待通り、`.env.local` は除外、`.env.example` は追跡対象。

### Step 2: `.env.example` の作成

将来必要になる全変数を **コメント付き** で記載。利用者が「いつ何を設定する必要があるか」を把握できる構造に。

セクション分け:
1. WordPress connection
2. Data source switch
3. Preview & Revalidation
4. WordPress 認証
5. Algolia
6. Resend

`NEXT_PUBLIC_` プレフィックスの意味（クライアント公開）と、それ以外（サーバー専用）をコメントで明示。

### Step 3: `.env.local` の作成

`.env.example` をコピーした上で、Week 3 時点で実値が分かるもののみ埋める:

- `WORDPRESS_API_URL` → 実値設定
- `WORDPRESS_GRAPHQL_URL` → 実値設定
- `DATA_SOURCE` → `api`
- それ以外 → プレースホルダーまたは空

`WORDPRESS_PREVIEW_SECRET` / `REVALIDATE_SECRET` は Week 5 で本格的にランダム文字列を生成するため、現状は `local-dev-preview-secret-change-me` のような自己説明的なプレースホルダーを設定。

### Step 4: Git 追跡の挙動を確認

`git check-ignore -v` で各ファイルが期待通りに扱われることを確認。テストの副作用で `web/.git/` が作られたため、Task 9 の `git init` 設計を尊重して削除。

### Step 5: dev server の動作確認

```
$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
```

環境変数を追加してもまだコードで読み込んでいないため、ビルドへの影響なし。Task 5 で `src/lib/wordpress.ts` から `process.env.WORDPRESS_API_URL` を参照する時に初めて意味を持つ。

---

## 作成・変更ファイル

```
web/
├ .env.local       (新規、Git管理外、Week 3用の実値+プレースホルダー)
├ .env.example     (新規、Git管理対象、全変数のテンプレート)
└ .gitignore       (更新、!.env.example 例外を追加)
```

---

## Next.js の `.env.*` ファイル優先順位

Next.js が同時に複数の .env ファイルを認識する場合のロード順は以下の通り（後勝ち）:

```
.env                    ← デフォルト（コミット可、共通設定）
.env.development        ← 開発時のみ
.env.production         ← 本番時のみ
.env.local              ← ローカル個別（gitignore必須）
.env.development.local  ← 開発時のローカル個別
.env.production.local   ← 本番時のローカル個別
```

本プロジェクトでは `.env.local` のみ使用し、開発/本番の差は **Vercel の環境変数機能** で管理する方針（Week 8 デプロイ時）。

---

## `NEXT_PUBLIC_` プレフィックスの意味

| プレフィックス有 | 例: `NEXT_PUBLIC_ALGOLIA_APP_ID` | クライアント JS バンドルにインライン化される。**機密情報を入れてはいけない**。 |
|---|---|---|
| プレフィックス無 | 例: `RESEND_API_KEY` | サーバーサイドのみで参照可能。クライアントには漏れない。 |

**設計判断**: Algolia の検索キーは公開してよい（ブラウザから直接Algolia APIを叩くため必須）。Algolia の管理キーは公開してはいけない（インデックス書き込み権限を持つため）。これを別変数として明確に分離している。

---

## 詰まったところ・気づき

### 1. `.gitignore` の `.env*` パターンが `.env.example` も巻き込む

**現象**: 初期の `.gitignore` は `.env*` 一行だけだった。これだと `.env.example` も無視され、Git で追跡できない。

**対処**: `!.env.example` を追加して例外指定。`git check-ignore -v` で実際にどのルールが適用されているか確認する習慣が役立った。

**学び**: `.gitignore` のパターンには順序と例外（`!`）があり、Next.js のデフォルトはテンプレートファイルの存在を考慮していない場合がある。

### 2. `git check-ignore` の副作用で `git init` が暗黙的に発生

**現象**: `git check-ignore` を git 未初期化フォルダで実行する前に `git init` で初期化する必要があった。先走って `git init -q` を実行してしまった結果、`web/.git/` が作られてしまった。

**対処**: 当該 `.git/` ディレクトリを削除。Task 9 で改めてプロジェクトルートから `git init` する方針を維持。

**学び**: 「動作確認のための一時操作」が「実装の事前設定」を侵食しないように注意。テスト用と本番用の作業を意識的に分ける。

### 3. WordPress Application Password の発行は WP 管理画面が必要

`WP_USERNAME` と `WP_APPLICATION_PASSWORD` は、WP 管理画面 → ユーザー → プロフィール → **アプリケーションパスワード** セクションから発行する。通常のログインパスワードを入れるのは NG（セキュリティ的にも仕様的にも）。

Week 5 でプレビュー機能を実装する際に、改めて手順を進める。

---

## 動作確認結果

```
$ ls -la web/.env*
-rw-r--r-- .env.example  (3205 bytes)
-rw-r--r-- .env.local    (2189 bytes)

$ curl -sI http://localhost:3000/
HTTP/1.1 200 OK
```

dev server は引き続き正常応答。環境変数はまだコードで参照していないため、ビルドへの影響なし。

---

## セキュリティチェックリスト

このタスクで意識した安全設計:

- [x] `.env.local` は `.gitignore` で完全除外
- [x] `.env.example` には実値・実シークレットを書かない（プレースホルダーのみ）
- [x] `NEXT_PUBLIC_` プレフィックスは公開してよい変数だけに付与
- [x] 管理キー（Algolia Admin Key、Resend API Key 等）はサーバー専用
- [x] Application Password は通常ログインパスワードとは別物として管理

---

## 振り返り（面接で語れる素材）

### 1. 「環境変数のスコープ設計」

`NEXT_PUBLIC_` プレフィックスでクライアント公開とサーバー専用を明示的に分離する設計。Algolia の search key と admin key を別変数として扱うなど、**「最小権限の原則」をフロントエンド側にも適用** している。

**伝わるポイント**: セキュリティ意識が単なる「秘密を隠す」を超えて、権限スコープの設計まで及んでいる。

### 2. 「`.env.example` をテンプレートとして整備」

`.env.example` をコメント付きで整備することで、新規参画者（あるいは未来の自分）が「どの変数が、いつ、なぜ必要か」を一目で理解できる。

**伝わるポイント**: 「動けばいい」ではなく、チーム開発・引き継ぎを意識した設計ができる。

### 3. 「Next.js の `.env.*` ロード順序を理解した上での運用方針決定」

複雑な `.env.development.local` 等のチェーンは使わず、`.env.local` 一本に統一しつつ、本番値は Vercel の環境変数機能で管理する方針を意図的に選んだ。「使えるものを全部使う」ではなく「シンプルに保つ」判断。

---

## 次のタスク

`week-03-task-5-wordpress-lib.md`（予定）:
- `src/lib/wordpress.ts` の実装
  - `getPosts()`, `getPostBySlug()`, `getServices()`, `getCareers()`, `getFeatures()`, `getAuthors()`
  - REST API ベースで実装（GraphQL は後の選択肢）
  - 各 fetch で `revalidate` を明示（Next.js 15+ のキャッシュ仕様対応）
- `DATA_SOURCE` 環境変数に応じた api/static の分岐実装も含める
- 動作確認: `lib/wordpress.ts` を一時的にトップページで呼び出して値が取れるか確認

このタスクで初めて **「WP のコンテンツが Next.js コードから取得できる」** 瞬間を迎える。

---

## 関連ドキュメント

- 仕様: `docs/05-tech-stack.md` の環境変数セクション
- 設計: `docs/09-deployment-strategy.md`（DATA_SOURCE の意義）
- 前のタスク: `week-03-task-3-directory-setup.md`
