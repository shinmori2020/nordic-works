# Week 2 作業ログ — WordPress側の作り込み

**期間**: 〜 2026-05-14
**ステータス**: ✅ 完了
**前提**: Week 1 完了済み（Local WP環境構築、`http://nordic-works.local/`、WPGraphQL / ACF Pro / CPT UI 有効化済み）

---

## サマリ

`docs/04-wordpress.md` の設計に基づき、独自プラグイン `Nordic Works Core` を実装。CPT 4種・タクソノミー 3種を登録し、ACFフィールドグループ 5本（合計30フィールド）を ACF Local JSON 方式でGit管理可能な形に整備。さらにシーダースクリプトを書き、投稿22件・タクソノミー17項目・画像22枚をコード経由で再現可能に投入できる状態とした。

Week 2 のゴール「Next.jsから取得すべきコンテンツが全て揃った状態」を達成。

---

## 達成タスク

- [x] 1. プラグインインストール（Week 1 で完了）
- [x] 2. カスタム投稿タイプ作成（4種）
- [x] 3. カスタムタクソノミー作成（3種）
- [x] 4. ACFフィールドグループ設計・実装（5グループ／30フィールド）
- [x] 5. ダミーコンテンツ投入（投稿22件＋画像22枚）
- [x] 6. エンドポイント動作確認（REST API / GraphQL）

---

## 作業内容詳細

### フェーズ1: 独自プラグイン作成

CPT UI（GUI管理）ではなくコード管理を選択。理由は Git で構成変更を追跡できること、本番環境への移植が `git push` で済むこと、ポートフォリオ価値（コードで設計できる証拠）。

**作成ファイル**: `app/public/wp-content/plugins/nordic-works-core/nordic-works-core.php`

実装内容:
- プラグインヘッダー（Plugin Name: Nordic Works Core, Version 0.1.0, Requires PHP 8.1）
- `defined( 'ABSPATH' ) || exit;` による直接アクセス防止
- `nordic_register_post_types()` — CPT 4種を `init` フックで登録
- `nordic_register_taxonomies()` — タクソノミー 3種を `init` フックで登録
- 全てに `show_in_rest: true` と `show_in_graphql: true` を付与

#### 登録したCPT

| CPT | rewrite slug | supports | GraphQL名（単/複） |
|---|---|---|---|
| `service` | `services` | title, editor, thumbnail, custom-fields, revisions | service / services |
| `career` | `careers` | title, editor, custom-fields, revisions | career / careers |
| `feature` | `features` | title, editor, thumbnail, custom-fields, revisions | feature / features |
| `author_profile` | `authors` | title, editor, thumbnail, custom-fields | authorProfile / authorProfiles |

#### 登録したタクソノミー

| タクソノミー | hierarchical | 適用先 | rewrite slug |
|---|---|---|---|
| `industry` | true（階層） | post, feature | `industry` |
| `topic` | false（タグ式） | post, feature | `topic` |
| `reading_level` | false（タグ式） | post | `level` |

### フェーズ2: ACF Local JSON 設定とフィールドグループ作成

**追加コード**（`nordic-works-core.php` に追記）:
- `nordic_acf_json_save_point` — `acf/settings/save_json` フィルターでプラグイン内 `acf-json/` を保存先に
- `nordic_acf_json_load_point` — `acf/settings/load_json` フィルターでプラグイン内 `acf-json/` を読み込み元に

これによりACFフィールドグループの定義がプラグイン側に集約され、テーマに依存しない構成になった（Headless運用にも整合）。

**作成ファイル**: `app/public/wp-content/plugins/nordic-works-core/acf-json/`

| ファイル | 対象CPT | フィールド数 | 主要フィールド |
|---|---|---|---|
| `group_nordic_post.json` | post | 4 | author_profile（post_object）, reading_time, featured_image_caption, related_posts（relationship） |
| `group_nordic_service.json` | service | 8 | subtitle, hero_image, features（repeater）, pricing_plans（repeater）, faq（repeater）, case_study_links（repeater）, cta_text, cta_url |
| `group_nordic_career.json` | career | 7 | position_type（select）, location, salary_range, required_skills（repeater）, preferred_skills（repeater）, benefits（repeater）, application_url |
| `group_nordic_feature.json` | feature | 5 | cover_image, lead_text, related_articles（relationship）, published_period_start, published_period_end |
| `group_nordic_author_profile.json` | author_profile | 6 | photo, position, bio, twitter_url, linkedin_url, website_url |

**合計**: 30フィールド。全てに `show_in_graphql: 1` と `graphql_field_name` を設定。

ACFの「同期」操作（管理画面のSync）で5グループをDBにインポートし、`保存しました` ステータスを確認。

### フェーズ3: シーダースクリプト実装

**作成ファイル**: `app/public/wp-content/plugins/nordic-works-core/scripts/seed-content.php`

設計方針:
- WP-CLI 経由で実行（`wp eval-file ...`）
- 冪等性（idempotent）— 既存slugは検出してスキップ、何度実行しても重複しない
- エラー継続 — 個別失敗で全体は止めず、警告ログを出して続行
- 画像はpicsum.photosから自動ダウンロード

ヘルパー関数群:
- `nordic_seed_log()` — WP-CLI/CLI兼用のログ出力
- `nordic_seed_get_or_create_term()` — タクソノミー項目をfind or create
- `nordic_seed_find_post()` — slug + post_type で既存投稿を検索
- `nordic_seed_create_post()` — 既存ならスキップ、なければ wp_insert_post
- `nordic_seed_attach_image()` — media_sideload_image でリモート画像を取得・添付
- `nordic_seed_set_terms()` — wp_set_object_terms ラッパー
- `nordic_seed_set_acf()` — update_field の一括処理

実行順序:
```
[1/6] タクソノミー項目作成（industry / topic / reading_level）
[2/6] 著者プロフィール作成（依存なし）
[3/6] サービス作成（依存なし）
[4/6] 採用情報作成（依存なし）
[5/6] 通常記事作成 → 関連記事リンク設定
[6/6] 特集作成 → 含める記事リンク設定
```

### フェーズ4: トラブルシューティング

#### 問題1: 「記事フィールド」の重複登録

**現象**: ACFフィールドグループ画面で `記事フィールド` (group_nordic_post) が2行表示された。

**原因**: ACF Sync操作中の何らかのタイミングで重複インポートされたと推測。

**対処**: 片方をゴミ箱へ移動 → 完全削除。残った1件を「更新」ボタンで再保存し、`保存待ち` → `保存しました` に修正。

#### 問題2: GraphQL introspection ブロック

**現象**: `__type(name: "Service")` を使った検証クエリで `"GraphQL introspection is not allowed for public requests by default."` エラー。

**原因**: WPGraphQL のセキュリティデフォルト設定（本番運用ではむしろ正しい設定）。

**対処**: introspection を使わず、実データクエリ（`services { nodes { id title serviceFields { ... } } }`）に置き換えることで、スキーマ存在チェックを実現。GraphQLは実行前にスキーマ検証するため、存在しないフィールドを指定するとエラーになる性質を利用。

#### 問題3: picsum.photos からの画像DLが全て失敗

**現象**: シーダー初回実行で全画像が `⚠ image download failed: 無効な画像 URL` で失敗。

**原因**: WordPress の `media_sideload_image()` は URL に `.jpg/.png` 等の拡張子がないと拒否する仕様。当初の `https://picsum.photos/seed/xxx/1600/900` は拡張子なしのため失敗していた。

**対処**: URLに `.jpg` を追加（`https://picsum.photos/seed/xxx/1600/900.jpg`）。picsum.photos が `.jpg` 付与URLにも対応していたため、これだけで解決。スクリプトが冪等であるため、再実行で画像のみ追加投入された。

---

## 作成・変更ファイル一覧

```
app/public/wp-content/plugins/nordic-works-core/
├ nordic-works-core.php                              (新規作成)
├ acf-json/
│  ├ group_nordic_post.json                          (新規作成)
│  ├ group_nordic_service.json                       (新規作成)
│  ├ group_nordic_career.json                        (新規作成)
│  ├ group_nordic_feature.json                       (新規作成)
│  └ group_nordic_author_profile.json                (新規作成)
└ scripts/
   └ seed-content.php                                (新規作成、後にURL修正)

docs/progress/
└ week-02.md                                         (本ファイル、新規作成)
```

合計 8ファイル新規作成。

---

## 重要な意思決定

| # | 決定事項 | 採用した選択肢 | 理由 |
|---|---|---|---|
| 1 | CPT登録方法 | コード管理（独自プラグイン） | Git追跡可能、本番移植が `git push` で済む、ポートフォリオで「コードで設計できる」アピール |
| 2 | ACF Local JSON 保存先 | プラグイン内（`acf-json/`） | テーマに依存しない、Headless運用と整合 |
| 3 | ACFフィールド作成手段 | JSON直接生成 → ACFの「同期」でDB反映 | C方針（GUI+ローカルJSON）の延長として最も効率的 |
| 4 | ダミーコンテンツ投入手段 | PHPシーダースクリプト + WP-CLI | 再現性、Git管理可能、ポートフォリオ価値 |
| 5 | 画像ソース | picsum.photos | 認証不要、URL固定で結果が安定、後で実画像に差し替え可能 |

---

## 投入コンテンツ一覧

### タクソノミー項目（17項目）

| タクソノミー | 項目数 | 内訳 |
|---|---|---|
| industry（業界） | 6 | IT / SaaS、製造業、小売・EC、サービス業、医療・ヘルスケア、金融・保険 |
| topic（トピック） | 8 | リモートワーク、心理的安全性、組織デザイン、北欧の働き方、1on1、マネジメント、採用戦略、カルチャー |
| reading_level（読者レベル） | 3 | 初級、中級、上級 |

### 著者プロフィール（3名）

- 佐藤 美咲（シニアコンサルタント）
- 田中 健一（組織開発リード）
- リンドベリ・アンナ（北欧文化アドバイザー）

### サービス（3つ）

- PsychSafe Score — 心理的安全性スコア計測ツール
- Remote Culture Diagnosis — リモートワーク文化診断
- Org Design Lab — 組織デザインコンサル

### 採用情報（2つ）

- シニア組織コンサルタント（正社員）
- UI/UXデザイナー（業務委託）

### 通常記事（12本）

1. リモートワーク3年目で気づいた「沈黙の罠」
2. 心理的安全性は「優しさ」ではない、最新の研究が示すこと
3. デンマーク企業に学ぶフラットな組織運営
4. 1on1ミーティングが形骸化する5つの兆候
5. スウェーデン式「Fika」が生産性を高める理由
6. リモート時代の新入社員オンボーディング設計
7. 心理的安全性を測る4つの指標とその落とし穴
8. 組織デザインの初手：階層構造を再考する
9. 「ティール組織」を本当に機能させるには
10. エンジニア組織における心理的安全性の作り方
11. 北欧的ワークライフバランスの実装パターン
12. マネージャー育成のための3ヶ月プログラム設計

### 特集（2つ）

- 北欧式リモートワークの教科書（関連記事4本）
- 心理的安全性入門：明日からできる5つの実践（関連記事4本）

### 画像

22枚（picsum.photos からダウンロード、メディアライブラリに格納）。

---

## 動作確認結果

### REST API

以下のエンドポイントで投入データが取得可能なことを確認:

- `/wp-json/wp/v2/posts` — 12件＋デフォルトのHello world
- `/wp-json/wp/v2/service` — 3件
- `/wp-json/wp/v2/career` — 2件
- `/wp-json/wp/v2/feature` — 2件
- `/wp-json/wp/v2/author_profile` — 3件
- `/wp-json/wp/v2/industry` — 6項目
- `/wp-json/wp/v2/topic` — 8項目
- `/wp-json/wp/v2/reading_level` — 3項目

### GraphQL

`VerifyACF` クエリで全CPTのACFフィールドへのアクセスを確認:

```graphql
query VerifyACF {
  services { nodes { id title serviceFields { subtitle ctaText } } }
  careers { nodes { id title careerFields { location positionType } } }
  features { nodes { id title featureFields { leadText } } }
  authorProfiles { nodes { id title authorProfileFields { position bio } } }
  posts { nodes { id title postFields { readingTime } } }
}
```

スキーマ検証を通過し、各CPTのACFフィールドが正しくGraphQL公開されていることを確認。

---

## 次週（Week 3）への引き継ぎ事項

### Week 3 で着手すべきこと

1. Next.js 15 プロジェクト初期化（`pnpm create next-app@latest nordic-works ...`）
2. パッケージインストール（`docs/05-tech-stack.md` 参照）
3. ディレクトリ構成セットアップ
4. 環境変数 `.env.local` 設定
   - `WORDPRESS_API_URL=http://nordic-works.local/wp-json`
   - `WORDPRESS_GRAPHQL_URL=http://nordic-works.local/graphql`
5. WordPress接続関数 `src/lib/wordpress.ts` 実装
6. TypeScript型定義 `src/types/wordpress.ts` 実装
7. 記事一覧・記事詳細の最小UI実装
8. GitHubリポジトリ作成・初回push

### Week 3 で意識すべきこと

- **Next.js 15 はfetchがデフォルトでキャッシュされない** → `cache: 'force-cache'` または `next: { revalidate: N }` を明示
- GraphQLとREST APIどちらを採用するかは記事一覧実装時に判断（GraphQLは複雑なネストが楽、RESTは `_embed` で関連データ取得が一発）
- `featuredImage.node.sourceUrl` は `http://nordic-works.local/...` を返すため、`next.config.ts` の `images.remotePatterns` に `nordic-works.local` を追加すること

### 既知の制約・注意点

- 画像は picsum.photos の固定画像なので、北欧的なミニマル世界観とは異なる。Week 7（リッチUX）で必要に応じて差し替え候補。
- シーダースクリプトは冪等だが、**コンテンツデータを変更後に再実行しても既存投稿は更新されない**（slugで存在判定しスキップする設計のため）。コンテンツ修正が必要な場合は、対象投稿を一度削除して再シードするか、WP管理画面で直接編集する。
- ACF JSON は管理画面で再保存すると ACF が自動的にデフォルトプロパティ（`aria-label`, `conditional_logic`, `wrapper` 等）を追加して書き戻す。これは正常な挙動。

---

## 振り返り（面接で語れる素材）

### 技術判断として語れること

1. **CPT管理をコード化した理由**
   - 「Git管理可能であること」「本番環境への移植容易性」「設定変更履歴の追跡」をトレードオフとして選択。CPT UIで GUI管理する選択肢もあったが、ポートフォリオの性質上 Git で追えるほうが価値が高いと判断。

2. **ACF Local JSON をプラグインに集約した設計**
   - ACFのデフォルト保存先（テーマフォルダ）ではなくプラグインフォルダに保存させた。理由は Headless 構成ではテーマがほぼ使われないため、設定をテーマと分離するほうが整合的と判断。

3. **シーダースクリプトの冪等設計**
   - 「再実行しても安全」を最初から組み込んだ。slugで存在判定 → スキップする方針。実案件で「データ移行スクリプトを何度も走らせる」場面を想定した設計。

4. **introspectionブロックへの対処**
   - WPGraphQL のセキュリティデフォルト（本番では正解）を尊重しつつ、実データクエリでスキーマ検証する代替案で対応。「セキュリティ設定を緩めず動作確認を取る方法を見つけた」という判断。

### つまずきから学んだこと

- `media_sideload_image()` のURL拡張子要件 — WordPress APIには「直感に反する仕様」が時々あるため、エラーメッセージから挙動を逆算する習慣が必要。
- ACFの重複登録 — GUI操作とJSON同期の組み合わせで起こり得る。「両方から触る」ワークフローは慎重に。
