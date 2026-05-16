# Week 2 / Task 5 — ダミーコンテンツ投入

**所属Week**: Week 2（WordPress側の作り込み）
**該当タスク番号**: `07-roadmap.md` の Task 5
**実施日**: 2026-05-14
**ステータス**: ✅ 完了
**前提**: Task 2-3 完了（CPT・タクソノミー登録済み）、Task 4 完了（ACFフィールドグループ実装済み）

---

## タスクの目的

Next.js から取得するためのテストデータを WordPress に投入する。`docs/04-wordpress.md` の「ダミーコンテンツ投入計画」に沿った件数を、再現可能かつGit管理可能な形で用意する。

具体的には:
- 通常記事: 12本（docs目標は15本だが、12本で十分なバリエーションを確保）
- サービス: 3つ
- 採用情報: 2つ
- 特集: 2つ
- 著者プロフィール: 3名
- タクソノミー項目: 17項目（業界6 + トピック8 + 読者レベル3）
- メディア画像: 22枚（picsum.photos からダウンロード）

---

## 完了基準

- [x] 12本の通常記事が投入されている（各々アイキャッチ・著者・タクソノミー・ACFフィールド付き）
- [x] 3つのサービスが投入されている（リピーター系ACFも完備）
- [x] 2つの採用情報が投入されている
- [x] 2つの特集が投入されている（関連記事リンク完備）
- [x] 3名の著者プロフィールが投入されている
- [x] タクソノミー項目17件が登録されている
- [x] 22枚の画像がメディアライブラリに格納されている
- [x] 記事間の `related_posts` リンクが設定されている
- [x] スクリプトが冪等（再実行しても重複が発生しない）

---

## 実装方針の判断

### 手作業 vs シーダースクリプト

| 比較項目 | A. 手作業（WP管理画面） | B. シーダースクリプト（採用） |
|---|---|---|
| 所要時間 | 4〜8時間（30件分） | データ作成2時間+実行5分 |
| 再現性 | 手元のDBに依存 | スクリプト再実行でいつでも復元 |
| Git管理 | ❌ | ✅ |
| ポートフォリオ価値 | 普通 | ⭕ 「データ管理を自動化した」と語れる |
| 学習価値 | WP管理画面の操作経験 | `wp_insert_post` + `update_field` の理解 |

採用根拠: `docs/09-deployment-strategy.md` で計画されているエクスポートスクリプトと対になり、**「コンテンツも再現可能」というポートフォリオ価値** を生む。

### 実行方法: WP-CLI 経由

- Local アプリには WP-CLI が同梱されている（Site Shell 機能経由でアクセス）
- `wp eval-file` コマンドでスクリプトを実行
- スクリプトは WordPress コンテキストで動くので、`wp_insert_post()` 等が直接使える

### 画像戦略: picsum.photos

- 認証不要、安定したAPI
- `seed` パラメータで実行ごとに同じ画像を返せる（決定論的）
- 本プロジェクトの北欧ミニマル世界観とは違うが、Week 7（リッチUX）で必要なら差し替え可能

---

## 作業手順

### Step 1: スクリプト本体の作成

**パス**: `app/public/wp-content/plugins/nordic-works-core/scripts/seed-content.php`

ファイル構成（約500行）:

```
[Bootstrap]
- wp-load.php の自動検出（WP-CLI外でも動作可能に）
- 必要なadmin includesの読み込み（media handling用）
- ACF有効化チェック

[Helper Functions]
- nordic_seed_log()                 — WP-CLI/通常CLI兼用ログ
- nordic_seed_get_or_create_term()  — タクソノミー項目をfind or create
- nordic_seed_find_post()           — slug + post_typeで既存投稿を検索
- nordic_seed_create_post()         — 既存ならスキップ、なければwp_insert_post
- nordic_seed_attach_image()        — media_sideload_imageでリモート画像を取得・添付
- nordic_seed_set_terms()           — wp_set_object_termsラッパー
- nordic_seed_set_acf()             — update_fieldの一括処理

[Data]
- $industries     — 業界6項目
- $topics         — トピック8項目
- $reading_levels — 読者レベル3項目
- $authors_data   — 著者3名 + ACFフィールド + 画像seed
- $services_data  — サービス3つ + 全ACFフィールド（FAQ・料金等）
- $careers_data   — 採用2つ + 全ACFフィールド
- $posts_data     — 記事12本 + 本文 + メタデータ
- $features_data  — 特集2つ + 関連記事slug

[Execution]
[1/6] タクソノミー項目作成
[2/6] 著者プロフィール作成
[3/6] サービス作成
[4/6] 採用情報作成
[5/6] 通常記事作成 + 関連記事リンク設定
[6/6] 特集作成 + 関連記事リンク設定
```

### Step 2: 冪等性（idempotency）の組み込み

スクリプトを **何度実行しても安全** にするため、以下の判定を組み込み:

- 投稿: `slug + post_type` で既存検索、あれば「↻ exists」表示してスキップ
- タクソノミー: `name` で既存検索、あれば既存IDを返す
- 画像: `get_post_thumbnail_id()` で既存添付チェック、あればスキップ

ただし、ACFフィールドとタクソノミー紐付けは毎回再実行（既存投稿でも上書き）する設計。これにより「画像だけ後から再ダウンロード」「ACFフィールドだけ追記」などの部分更新が可能。

### Step 3: Local Site Shell での実行

1. Local アプリ起動
2. `nordic-works` サイトを右クリック → 「Open Site Shell」
3. 黒いターミナルウィンドウが開く
4. プロンプトは `C:\Users\.../nordic-works/app/public>` で開始
5. 以下のコマンドを実行:
   ```
   wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-content.php
   ```

### Step 4: 出力確認

初回実行のログ抜粋:

```
========================================
 Nordic Works Content Seeder
========================================

[1/6] Creating taxonomy terms...
    + term  [industry] IT / SaaS
    + term  [industry] 製造業
    ... (17項目)

[2/6] Creating authors...
    + post  [author_profile] 佐藤 美咲
    ⚠ image download failed: 無効な画像 URL。
    + post  [author_profile] 田中 健一
    ⚠ image download failed: 無効な画像 URL。
    ...

[5/6] Creating posts...
    + post  [post] リモートワーク3年目で気づいた「沈黙の罠」
    ⚠ image download failed: 無効な画像 URL。
    ...

========================================
 Seeding completed!
========================================
```

→ **画像DLが全て失敗** していたが、それ以外は成功。次のステップで修正。

---

## 詰まったところ・気づき

### 問題: 画像ダウンロード全失敗（無効な画像 URL）

**現象**: `⚠ image download failed: 無効な画像 URL` が全画像で発生。

**原因**: WordPress の `media_sideload_image()` は内部で以下の正規表現でURL検証する:

```
/[^\?]+\.(jpe?g|jpe|gif|png)\b/i
```

URLに画像拡張子（`.jpg` `.png` 等）が含まれていないと「無効な画像URL」として拒否される。

最初に使った URL: `https://picsum.photos/seed/xxx/1600/900` — 拡張子なし → 失敗。

**対処**: URL に `.jpg` を追加。picsum.photos は拡張子付きURLにも対応している。

修正前:
```php
$url = "https://picsum.photos/seed/{$seed}/{$width}/{$height}";
```

修正後:
```php
$url = "https://picsum.photos/seed/{$seed}/{$width}/{$height}.jpg";
```

スクリプトが冪等なため、修正後に再実行するだけで画像のみ追加投入された。投稿本体は `↻ exists` でスキップ → 画像添付処理だけが走る。

### 設計上の気づき: ログ出力の細かさ

「全画像が失敗していたこと」がログで明示的にわかったのは、`nordic_seed_attach_image()` 内で失敗時に `⚠ image download failed:` を出力する設計にしていたから。**重要なエラーをサイレントに飲み込まない** ことの大切さを再確認。

### Site Shell のディレクトリ位置

Local の Site Shell は `app/public/` ディレクトリで開く。プラグインへの相対パスは `wp-content/plugins/nordic-works-core/...` から始まる。WP-CLI は WordPress ルートからのパス解決をするので、これで正しく動く。

### 画像が添付されているかの確認方法

実行ログには「画像添付成功」のログを入れていなかったため、視覚的な確認は以下で行う:

1. WP Admin → メディア → ライブラリ で22枚が並んでいる
2. 投稿一覧から1件開いて、編集画面右側にアイキャッチが表示されている
3. GraphQL で `featuredImage.node.sourceUrl` がnullでない値を返す

将来的にはログにも「+ image attached」を追加する余地あり。

---

## 投入されたコンテンツ詳細

### タクソノミー項目

**業界 (industry)**: IT / SaaS、製造業、小売・EC、サービス業、医療・ヘルスケア、金融・保険

**トピック (topic)**: リモートワーク、心理的安全性、組織デザイン、北欧の働き方、1on1、マネジメント、採用戦略、カルチャー

**読者レベル (reading_level)**: 初級、中級、上級

### 著者プロフィール

- 佐藤 美咲（シニアコンサルタント）
- 田中 健一（組織開発リード）
- リンドベリ・アンナ（北欧文化アドバイザー）

### サービス

- PsychSafe Score（心理的安全性スコア計測ツール）
- Remote Culture Diagnosis（リモートワーク文化診断）
- Org Design Lab（組織デザインコンサル）

### 採用情報

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

### 特集

- 北欧式リモートワークの教科書（関連記事4本）
- 心理的安全性入門：明日からできる5つの実践（関連記事4本）

---

## 作成・変更ファイル

```
app/public/wp-content/plugins/nordic-works-core/
└ scripts/
   └ seed-content.php   (新規作成、後にURL拡張子修正)
```

合計 約500行のPHPファイル1本。

---

## スクリプトの再実行方法

このシーダーは冪等なので、以下のケースで安心して再実行できる:

- 画像が一部欠けたとき → 再実行で再ダウンロードを試行
- ACFフィールドを変更したとき → 再実行で全投稿のACFが更新される
- タクソノミー紐付けを変更したとき → 再実行で再設定される

ただし以下のケースでは再実行では対応できない:

- 既存投稿の **本文** や **タイトル** を変更したい場合
  → 該当投稿を一度削除（DB含む完全削除）して再シード、または管理画面で直接編集
- 既存投稿を削除したい場合
  → 管理画面で削除（再シードでも再作成されてしまうため、シーダー側のデータも消す必要あり）

---

## 関連ドキュメント

- 仕様: `docs/04-wordpress.md` のダミーコンテンツ投入計画
- 前のタスク: `week-02-task-4-acf-fields.md`
- 次のWeek: `docs/07-roadmap.md` の Week 3（Next.js 最小実装）
