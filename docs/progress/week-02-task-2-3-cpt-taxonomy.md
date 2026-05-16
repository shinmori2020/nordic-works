# Week 2 / Task 2-3 — カスタム投稿タイプ・タクソノミー登録

**所属Week**: Week 2（WordPress側の作り込み）
**該当タスク番号**: `07-roadmap.md` の Task 2 + Task 3
**実施日**: 2026-05-14
**ステータス**: ✅ 完了

---

## タスクの目的

Nordic Works のサイト構造（コーポレート＋メディア）に必要な、ブログ記事以外のコンテンツ種別と分類軸を WordPress に追加する。

具体的には:
- 4つのカスタム投稿タイプ（CPT）を登録し、サービス・採用・特集・著者を独立した管理単位にする
- 3つのカスタムタクソノミーを登録し、業界・トピック・読者レベルの分類軸を設ける
- 全てを REST API および GraphQL に公開し、Next.js から取得可能にする

`docs/04-wordpress.md` の設計を満たすこと。

---

## 完了基準

- [x] 4種のCPT（service, career, feature, author_profile）が管理画面サイドバーに表示される
- [x] 3種のタクソノミー（industry, topic, reading_level）が対応CPTから利用可能
- [x] 全CPTの REST API エンドポイントが応答する
- [x] WPGraphQL のスキーマに 4種のCPT・3種のタクソノミーが反映される
- [x] 設定が Git 管理可能な形（コード）で記述されている

---

## 実装方針の判断

### CPT UI（GUI）か独自プラグイン（コード）か

WordPress には Custom Post Type UI という GUI管理プラグインが既にインストール済みだが、本プロジェクトでは **独自プラグイン（コード管理）** を採用した。

| 比較項目 | CPT UI（GUI） | 独自プラグイン（採用） |
|---|---|---|
| 設定の保存場所 | データベース | PHPファイル |
| Git管理 | ❌ 不可 | ✅ 可能 |
| 環境間の移植 | DBエクスポートが必要 | ファイルコピーだけ |
| 設定変更履歴 | 残らない | コミット履歴に残る |
| 本番デプロイ | 手作業で再設定 | `git push` で完了 |
| ポートフォリオ的評価 | △ | ⭕ コードで設計できる証拠 |

---

## 作業手順

### Step 1: プラグインフォルダとメインファイルの作成

**パス**: `app/public/wp-content/plugins/nordic-works-core/nordic-works-core.php`

プラグインヘッダー仕様:
- Plugin Name: Nordic Works Core
- Version: 0.1.0
- Requires PHP: 8.1
- Text Domain: nordic-works-core

セキュリティ対策:
- `defined( 'ABSPATH' ) || exit;` を冒頭に記述し、PHPファイルが直接アクセスされた場合に即終了

### Step 2: CPT登録関数の実装

`nordic_register_post_types()` を `init` フックで実行。各CPTに以下を設定:

| CPT | rewrite slug | supports | GraphQL名（単/複） | menu_icon |
|---|---|---|---|---|
| `service` | `services` | title, editor, thumbnail, custom-fields, revisions | service / services | dashicons-products |
| `career` | `careers` | title, editor, custom-fields, revisions | career / careers | dashicons-businessperson |
| `feature` | `features` | title, editor, thumbnail, custom-fields, revisions | feature / features | dashicons-star-filled |
| `author_profile` | `authors` | title, editor, thumbnail, custom-fields | authorProfile / authorProfiles | dashicons-admin-users |

共通設定:
- `public: true`
- `show_in_rest: true`（REST API公開）
- `show_in_graphql: true`（WPGraphQL公開）
- `has_archive: true`
- `labels` を日本語で個別設定

### Step 3: タクソノミー登録関数の実装

`nordic_register_taxonomies()` を `init` フックで実行。

| タクソノミー | hierarchical | 適用先 | rewrite slug | GraphQL名 |
|---|---|---|---|---|
| `industry` | true（階層あり：カテゴリー型） | post, feature | `industry` | industry / industries |
| `topic` | false（タグ式） | post, feature | `topic` | topic / topics |
| `reading_level` | false（タグ式） | post | `level` | readingLevel / readingLevels |

共通設定:
- `public: true`
- `show_in_rest: true`
- `show_in_graphql: true`
- `labels` を日本語で個別設定

### Step 4: WP Adminでの有効化

1. プラグイン → インストール済みプラグイン
2. 「Nordic Works Core」を **有効化**
3. サイドバーに `サービス / 採用情報 / 特集 / 著者` が追加されることを確認

### Step 5: パーマリンク再保存

CPTの `rewrite` スラッグを有効化するため必須。

1. 設定 → パーマリンク
2. 何も変更せずに「変更を保存」をクリック
3. リライトルールが再生成される

### Step 6: REST API 動作確認

ブラウザで直接エンドポイントへアクセスし、`[]`（空配列）が返ることを確認:

- `http://nordic-works.local/wp-json/wp/v2/service`
- `http://nordic-works.local/wp-json/wp/v2/career`
- `http://nordic-works.local/wp-json/wp/v2/feature`
- `http://nordic-works.local/wp-json/wp/v2/author_profile`
- `http://nordic-works.local/wp-json/wp/v2/industry`
- `http://nordic-works.local/wp-json/wp/v2/topic`
- `http://nordic-works.local/wp-json/wp/v2/reading_level`

データはまだ無いので空配列が正常。

### Step 7: GraphQL 動作確認

GraphQL IDE で `VerifyCPT` クエリを実行:

```graphql
query VerifyCPT {
  services { nodes { id title } }
  careers { nodes { id title } }
  features { nodes { id title } }
  authorProfiles { nodes { id title } }
  industries { nodes { id name } }
  topics { nodes { id name } }
  readingLevels { nodes { id name } }
}
```

全て `"nodes": []` が返ることを確認 → スキーマに正しく登録されている証拠。

---

## 作成・変更ファイル

```
app/public/wp-content/plugins/nordic-works-core/
└ nordic-works-core.php   (新規作成)
```

行数: 約160行（Task 4 でACF Local JSON設定を追記する前の時点）。

---

## 詰まったところ・気づき

### CPT UIとの競合チェック

最初に「Custom Post Type UI が有効化されていたので、競合する可能性」を懸念した。`CPT UI → Add/edit taxonomies` 画面の「利用する投稿タイプ」セクションに **「投稿（WPコア）」「固定ページ（WPコア）」「メディア（WPコア）」しか出ていなかった** ことから、CPT UI による登録が無いことを確定。安心して独自プラグインを有効化できた。

### GraphQL の Unnamed query エラー

最初の動作確認クエリ実行時に `"This anonymous operation must be the only defined operation."` エラー。原因はエディタに既存の無名クエリ `{ posts { ... } }` と新規の `query VerifyCPT { ... }` が共存していたため。GraphQL仕様では無名クエリは1つだけ存在できる。不要な既存クエリを削除して解決。

### dashicons の選定

`menu_icon` には WordPress 標準の dashicons を使用。`dashicons-products` / `dashicons-businessperson` / `dashicons-star-filled` / `dashicons-admin-users` は意味的に対応する選択肢から選んだ。dashicons の一覧は https://developer.wordpress.org/resource/dashicons/ で確認可能。

---

## 関連ドキュメント

- 仕様: `docs/04-wordpress.md`
- 設計判断: `docs/02-headless-wordpress.md`
- 次のタスク: `week-02-task-4-acf-fields.md`
