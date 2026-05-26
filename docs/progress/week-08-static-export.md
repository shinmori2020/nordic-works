# Week 8（前半）— 静的エクスポート + Vercel デプロイ準備

**所属Week**: Week 8（仕上げ・本番デプロイ）
**実施日**: 2026-05-26
**ステータス**: ✅ ローカル本番ビルド成功（Vercel インポート待ち）
**前提**: Week 1〜7 主要部分完了、Vercel アカウント取得済み

---

## タスクの目的

Local WordPress 構成のままで Vercel に静的サイトとしてデプロイできるよう、
`docs/09-deployment-strategy.md` の方針に沿って **WP データをビルド前に
JSON 化 + 画像をリポジトリ同梱**するパイプラインを構築する。

---

## 完了基準

- [x] WP REST API から全 CPT / タクソノミーを JSON に書き出すスクリプト
- [x] WP のメディア画像を `public/wp-uploads/` にダウンロード + JSON 内URLを書き換え
- [x] `wordpress.ts` の全関数に `DATA_SOURCE=static` 分岐を追加
- [x] `pnpm build` が WP 接続なしで通る
- [x] `next start` で全ページ 200、画像も配信される
- [ ] Vercel に GitHub 連携してデプロイ（次の手動ステップ）

---

## 作成・変更ファイル

```
web/
├ scripts/
│  └ export-wp-data.mjs        (新規: WP→JSON+画像 のエクスポーター)
├ data/                        (新規: 8 JSON、114 画像分の出典)
│  ├ posts.json                (13投稿)
│  ├ services.json             (3)
│  ├ careers.json              (2)
│  ├ features.json             (2)
│  ├ authors.json              (3)
│  ├ industries.json           (6)
│  ├ topics.json               (8)
│  └ reading-levels.json       (3)
├ public/wp-uploads/           (新規: 114枚の画像)
├ package.json                 (更新: "export-wp" npm script)
└ src/lib/wordpress.ts         (更新: 全関数に static 分岐)
```

---

## 実装の設計判断

### 判断1: ビルド前エクスポート + リポジトリ同梱（docs 09 の案A）

Local WP は Vercel から見えない。選択肢は (A) JSON+画像同梱 / (B) Cloudinary 等
画像ホスティング。本プロジェクトの規模（114枚）では (A) で十分。

利点: シンプル、Vercel 無料枠で完結、外部依存ゼロ
注意: リポジトリサイズ増（数MB程度なので許容）

### 判断2: 1スクリプトで JSON エクスポート + 画像 DL + URL書き換えを完結

`scripts/export-wp-data.mjs` を Node 標準モジュールのみで実装し、追加依存ゼロ:

1. 各 CPT/タクソノミー を `_embed&per_page=100` でページング取得
2. JSON 内の `http://nordic-works.local/wp-content/uploads/...` URL を抽出
3. 画像ファイルを `public/wp-uploads/<year>/<month>/<filename>` にダウンロード（既存スキップ）
4. JSON の文字列を `/wp-uploads/` の相対パスに一括置換

実行は `pnpm run export-wp` の1コマンド。WP データ更新時もこれを叩くだけ。

### 判断3: 静的データのロードは dynamic import で個別チャンク化

`wordpress.ts` の各 `load*Static()` は `import('../../data/X.json')` を返す薄いヘルパー。
webpack が各 JSON を個別チャンクに分割し、`USE_STATIC` のときだけ評価される。
api モードでは実行時に評価されない（ただしビルド出力には含まれる）。

### 判断4: タクソノミーで投稿を絞り込む処理は静的側でも再現

`getPostsByTerm('topic', 12)` は API 側では `?topic=12` クエリで絞っていたが、
静的側では投稿オブジェクトの `(post as any)[taxonomy]` が term ID 配列なので
`.includes(termId)` でフィルタ。実装が綺麗に対称になった。

### 判断5: 日本語 slug のエンコーディング差を吸収

`getTermBySlug` は呼び出し側からデコード済み slug を受ける一方、JSON 上は
URL エンコード済み slug が保存されている（WP 仕様）。
`t.slug === slug || decodeURIComponent(t.slug) === slug` の OR 条件で両形に対応。

### 判断6: 非画像の `nordic-works.local` 参照は許容

エクスポート後の posts.json には `_links.href`（1086）/ `link`（76）/
`content.rendered` 内の内部リンク（13）が残るが、UI で表示・利用される箇所は
すべて画像 URL（書き換え済み）か `post.slug`（ローカル独立）なので動作影響なし。
将来本番ドメインが決まったら一括置換可能。

---

## 動作確認結果

### 本番ビルド（DATA_SOURCE=static）

```
✓ Generating static pages using 7 workers (56/56) in 10.9s
```

| ルート | 種別 | 生成数 |
|--------|------|--------|
| 静的（`○`） | /, /about, /articles, /authors, /careers, /contact, /features, /services, /robots.txt, /sitemap.xml | 10 |
| SSG（`●`） | /articles/[slug], /services/[slug], /careers/[slug], /authors/[slug], /features/[slug], /topic/[slug], /industry/[slug], /reading-level/[slug] | 41 |
| 動的（`ƒ`） | /api/preview, /api/exit-preview, /api/revalidate | 3 |

日本語 slug（`/industry/サービス業`, `/topic/マネジメント` 等）も正常に静的生成。

### `next start -p 3001` での確認

```
/                              -> 200
/about                         -> 200
/articles                      -> 200
/articles/manager-3month-program -> 200
/services/org-design-lab       -> 200
/topic/1on1                    -> 200
/industry/it-saas              -> 200
/this-does-not-exist           -> 404
/wp-uploads/2026/05/900-14.jpg -> 200 (79774 bytes)
```

---

## 次のステップ（Vercel へのデプロイ）

1. Vercel ダッシュボードで **Add New → Project**
2. GitHub から `nordic-works` リポジトリを選択
3. 重要な設定:
   - **Root Directory**: `web`
   - **Framework Preset**: Next.js（自動検出）
   - **Environment Variables**:
     - `DATA_SOURCE=static`
     - `NEXT_PUBLIC_SITE_URL=https://<deploy-url>`（デプロイ後に確定）
4. Deploy

`WORDPRESS_API_URL` 等は静的モードでは不要（環境変数未設定でも動く）。

---

## 関連ドキュメント

- 仕様: `docs/09-deployment-strategy.md`
- 前のタスク: `week-05-preview-revalidation.md`
