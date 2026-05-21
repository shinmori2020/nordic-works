# Week 5 — 下書きプレビュー + On-demand Revalidation

**所属Week**: Week 5（差別化①）
**実施日**: 2026-05-21
**ステータス**: ✅ コード実装・検証完了（Application Password 設定で end-to-end 完成）
**前提**: Week 4 完了済み

---

## タスクの目的

実案件レベルの編集者体験を実装する。

- **下書きプレビュー**: WP 管理画面の「プレビュー」ボタンで、Next.js 上に下書きを表示
- **On-demand Revalidation**: WP で公開・更新した瞬間に、該当ページのキャッシュを再検証して即時反映

`docs/06-features.md` のプレビュー / Revalidation セクションの方針に準拠。

---

## 完了基準

- [x] `/api/preview` が secret 検証 → draftMode 有効化 → 投稿タイプ別にリダイレクト
- [x] `/api/exit-preview` が draftMode 無効化 → cookie 削除 → 復帰
- [x] `/api/revalidate` が secret 検証 → 投稿タイプ別の path/tag を再検証
- [x] BySlug 取得関数が draftMode 対応（下書き含む取得 + 認証 + no-store）
- [x] プレビュー時に画面上部へバナー表示
- [x] WP プラグインに preview_post_link / save_post webhook を追加
- [x] 各エンドポイントの動作を curl で検証
- [ ] **Application Password を設定して下書き取得を end-to-end 確認**（次の手動ステップ）

---

## 作成・変更ファイル

```
web/src/
├ lib/wordpress.ts                    (更新: wpFetch draft対応 + fetchBySlug 共通化)
├ app/
│  ├ layout.tsx                       (更新: draftMode 時に PreviewBanner 表示)
│  └ api/
│     ├ preview/route.ts              (新規: プレビュー有効化)
│     ├ exit-preview/route.ts         (新規: プレビュー終了)
│     └ revalidate/route.ts           (新規: On-demand Revalidation)
└ components/common/PreviewBanner.tsx (新規: プレビュー中バナー)

app/public/wp-content/plugins/nordic-works-core/
└ nordic-works-core.php               (更新: preview_post_link + revalidate webhook)
```

---

## 実装の設計判断

### 判断1: BySlug 取得を `fetchBySlug` に共通化し draftMode 対応

post/service/career/feature の各 BySlug 関数が同じ「slug取得 + draft分岐」を持つため、
`fetchBySlug(restBase, slug, tags, revalidate)` に共通化した。内部で `draftMode()` を判定:

- 通常時: `status=publish`（暗黙）+ ISR（revalidate + tags）
- プレビュー時: `status=draft,publish` + `cache: no-store` + Basic 認証ヘッダ

これにより各関数は1行になり、プレビュー対応が一元化された。

### 判断2: 認証は Application Password の Basic 認証

下書きは認証なしでは REST API から取得できない。`WP_USERNAME` + `WP_APPLICATION_PASSWORD`
を Base64 で `Authorization: Basic` ヘッダにして付与する（`draftAuthHeaders()`）。
未設定時はヘッダを付けない（公開記事のみ取得）= 安全側に倒す。

### 判断3: プレビューバナーは layout で draftMode 判定

`draftMode()` はサーバー専用 API。root layout を async 化し、`isEnabled` 時のみ
`PreviewBanner` を表示。通常訪問者には影響しない（draft cookie が無ければ静的描画のまま）。

### 判断4: revalidate は path と tag の両方をクリア

ISR の `tags`（fetch 側で設定済み）と、ページパスの両方を再検証することで、
一覧・詳細・トップのいずれも確実に更新を反映する。投稿タイプ別に対象を定義。

### 判断5: Next.js 16 の revalidateTag 仕様変更に対応

Next.js 16 で `revalidateTag(tag)` は第2引数（cache profile）が必須化された。
`revalidateTag(tag, 'max')` として即時パージ相当（旧挙動）を維持。

### 判断6: WP 側は plugin に集約、secret は定数で .env と一致

theme の functions.php ではなく、追跡対象の plugin（nordic-works-core）に
`preview_post_link` フィルターと `save_post` / `transition_post_status` webhook を実装。
secret / frontend URL は `define()` 定数化し、`web/.env.local` と同じ開発用 secret を
直書き（ローカル運用前提）。本番は wp-config.php 定数等へ移す想定をコメントで明記。

### 判断7: webhook は非同期（blocking=false）

`wp_remote_post(..., ['blocking' => false])` で投げっぱなしにし、保存操作の体感速度を
落とさない。Next.js 側のレスポンスを待たない。

---

## 動作確認結果（curl）

```
GET  /api/preview?secret=wrong...                 → 401
GET  /api/preview?secret=<正>&slug=...&type=post  → 307 → /articles/...  + Set-Cookie __prerender_bypass
POST /api/revalidate (x-revalidate-secret: wrong) → 401
POST /api/revalidate (正, post/slug)              → {"revalidated":true, paths:[...], tags:[...]}
GET  /api/exit-preview                            → 307 → / + cookie 削除
```

型チェック: `tsc --noEmit` → EXIT=0

---

## 詰まったところ・気づき

### 1. Next.js 16 の revalidateTag が2引数必須

`revalidateTag(tag)` が型エラー（TS2554）。Next.js 16 で
`revalidateTag(tag: string, profile: string | CacheLifeConfig)` に変わり、第2引数必須。
`'max'` を渡して解決。「単一引数は deprecated、`'max'` か `updateTag` を使え」との警告仕様。

### 2. dev モードでは ISR が効かず毎回再描画

`next dev` は本番ビルドと異なり毎リクエスト再レンダリングするため、layout の draftMode()
による「全ページ遅い」状態は dev 固有。本番（next build + start）では draft cookie が
無い限り静的描画/ISR が維持される。dev のログだけで dynamic 化を判断しないこと。

---

## 振り返り（面接で語れる素材）

### 1. 「Headless での編集者体験の自前実装」

通常 WP では自動の「下書きプレビュー」を、Headless では draftMode + preview_post_link +
認証付き fetch で再現。「公開 CMS の体験を、フロント分離後も損なわない」設計力を示せる。

### 2. 「On-demand Revalidation によるリアルタイム反映」

ISR の時間ベース再生成を超えて、WP の保存フックから webhook → revalidatePath/Tag で
即時反映。キャッシュ戦略（tags 設計）と Webhook 連携の理解。

### 3. 「セキュリティ：secret 検証・認証・オープンリダイレクト対策」

全エンドポイントで secret 検証、下書き取得は Application Password 認証、
exit-preview のリダイレクト先はサイト内パスのみ許可。

---

## 次のステップ（手動）

下書きの実取得には WordPress の **Application Password** が必要。
別途案内する手順で発行し、`web/.env.local` の `WP_USERNAME` / `WP_APPLICATION_PASSWORD`
を設定すれば、管理画面の「プレビュー」ボタンから下書きが Next.js 上に表示される。

その後の残タスク:
- **Week 6**: Algolia 検索 / Resend フォーム（要アカウント）
- **Week 4-F / Week 8**: Vercel デプロイ / 静的エクスポート

---

## 関連ドキュメント

- 仕様: `docs/06-features.md`（プレビュー / On-demand Revalidation）
- 前のタスク: `week-04-07-pages-and-rich-ux.md`
