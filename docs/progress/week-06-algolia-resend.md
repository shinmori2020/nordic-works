# Week 6 — Algolia 全文検索 + Resend お問い合わせメール

**所属Week**: Week 6（差別化②）
**実施日**: 2026-05-27
**ステータス**: ✅ ローカル実装・動作確認完了（Vercel 環境変数追加待ち）

---

## タスクの目的

WordPress + Next.js だけでは難しい/面倒な機能を外部 SaaS で実現する。

- **Algolia**: 高速で精度の高い全文検索 + ファセット絞り込み
- **Resend**: モダンな型安全な仕組みでメール送信（運営宛通知 + 自動返信）

両方とも `docs/06-features.md` の方針に準拠。

---

## 作成・変更ファイル

```
web/
├ scripts/
│  └ index-to-algolia.mjs               (新規: バルクインデックス)
├ src/
│  ├ lib/algolia.ts                     (新規: lite クライアント設定)
│  ├ app/
│  │  ├ search/page.tsx                 (新規: /search 検索ページ)
│  │  └ actions/contact.ts              (更新: Resend 接続)
│  ├ components/
│  │  ├ search/SearchClient.tsx         (新規: 入力・結果・ファセット)
│  │  └ common/Header.tsx               (更新: 検索ボタン追加)
│  └ emails/
│     ├ ContactNoticeEmail.tsx          (新規: 運営宛通知テンプレ)
│     └ ContactAutoReplyEmail.tsx       (新規: 自動返信テンプレ)
└ package.json                          (更新: index-algolia npm script)

app/public/wp-content/plugins/nordic-works-core/
└ nordic-works-core.php                 (更新: save_post → Algolia 自動同期)
```

---

## 実装の設計判断

### 判断1: バルクインデックスは静的エクスポート JSON から作る

`web/data/posts.json`（既にコミット済みの本番投入データ）を読み込んで Algolia に
送信する設計。WP REST から直接取らないため、**WP が起動していなくても再投入できる**。
本番運用フローでも「export-wp → static build → index-algolia」が直線的に並ぶ。

### 判断2: lite クライアントを採用（v5）

`algoliasearch/lite` の `liteClient` は検索専用で、Admin API より軽量（バンドルサイズ削減）。
クライアントバンドルには Search-Only Key だけが入る安全設計。Admin Key は
スクリプトと WP プラグインからしか使わない。

### 判断3: 検索ページは Server Component が薄く、Client Component が中心

`/search/page.tsx` は `searchParams.q` を読んで `<SearchClient initialQuery={q} />` を
返すだけ。実際のクエリ・ファセット・デバウンスは `SearchClient`（Client Component）が処理。
URL ?q= の更新も `router.replace` でデバウンスしながら反映 → リロード/共有可能。

### 判断4: ファセットは searchable(...) で絞り込み + 件数表示

`attributesForFaceting: ['searchable(topics)', 'searchable(industries)', ...]` で
タクソノミー絞り込みに対応。サイドバーで件数を表示しつつ、選択中はトグル動作。

### 判断5: WP の Algolia 認証は wp-config.php 経由

Admin Key はリポジトリにコミットしてはいけないため、wp-config.php（Git 管理外）に
`define()` で書き、プラグインは `defined()` で読み込む。未定義時は黙ってスキップして
プラグイン全体を止めない fail-soft 設計。

### 判断6: Resend は無料枠の制約を踏まえた設計

無料枠（独自ドメイン未設定）の制約:
- 送信元は `onboarding@resend.dev` 固定
- 送信先はアカウント登録メアドのみ可能（運営宛通知 OK）
- 任意アドレスへの送信（自動返信）は失敗する可能性

→ 運営通知が成功すれば全体を success と扱い、自動返信失敗は warn ログのみ。
独自ドメイン認証後は両方とも届く。

### 判断7: メールテンプレートは React Email で書く

`@react-email/components` の JSX で書き、`resend.emails.send({ react: <X /> })` に渡す。
HTML を手書きするより**型安全で再利用しやすく**、メーラー間の互換性も担保される。

### 判断8: Server Action が環境変数未設定時はバリデーションのみ

`RESEND_API_KEY` 等が未設定なら送信せず success を返すスタブ動作にフォールバック。
ローカルでフォームの UX 確認が常時できる。

---

## 動作確認結果

### Algolia 投入

```
📦 13 件の投稿をインデックス対象として整形
⚙️  インデックス設定を反映...
🚀 オブジェクトをアップロード...
  ✅ 13 件アップロード完了
✨ Algolia インデックス完了
```

### Algolia 直接検索（API レベル）

```
"心理的安全性" → 13 件ヒット
```

### dev サーバー

```
GET /          → 200
GET /search    → 200（検索入力欄を出力）
GET /contact   → 200
ヘッダーに `aria-label="記事を検索"` の検索ボタン出力確認
```

### 型チェック

```
$ pnpm exec tsc --noEmit
EXIT=0
```

---

## 次のステップ（ユーザー操作）

### A. Vercel に環境変数を追加（4件）

| Key | Value | Sensitive |
|-----|-------|-----------|
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | `QPODT1B5G4` | No |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | `958611b6db91b0894e9c44308ea43d70` | No |
| `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` | `nordic_works` | No |
| `RESEND_API_KEY` | `re_...` | Yes |

`ALGOLIA_ADMIN_KEY` は本番では使わない（インデックス送信はローカル WP のみ）。
`CONTACT_EMAIL_FROM` / `CONTACT_EMAIL_TO` も追加すれば本番フォームも送信可能。

追加後、最新デプロイの **Redeploy（Use existing Build Cache のチェックを外す）**。

### B. （任意）WordPress の Algolia 自動同期を有効にする
`wp-config.php` に以下を追加すれば、WP で記事保存 → Algolia 自動更新が動く:

```php
define( 'NORDIC_ALGOLIA_APP_ID', 'QPODT1B5G4' );
define( 'NORDIC_ALGOLIA_ADMIN_KEY', '...' );
define( 'NORDIC_ALGOLIA_INDEX', 'nordic_works' );
```

未設定時はサイレントスキップ。バルクインデックスだけでも基本は十分。

---

## 振り返り（面接で語れる素材）

### 1. 「Headless + 外部 SaaS 統合」
WP 単独では難しい全文検索と、Next.js 単独では面倒なメール送信を、
それぞれ外部 SaaS（Algolia / Resend）に委譲。「サービス選定 → 統合 → 運用」を
1サイクル回した経験。

### 2. 「Search-Only / Admin の鍵分離による安全設計」
公開してよい鍵（Search Key）と秘密にすべき鍵（Admin Key）を意識的に分離。
バンドルに含まれるものとサーバー専用のものを設計時から区別。

### 3. 「React Email でテンプレートをコンポーネント化」
メール本文を JSX/コンポーネントで書く現代的な手法。プレビュー・型安全・再利用性。

### 4. 「Server Action + Zod + Resend の組み合わせ」
Next.js のフルスタック性を活かしたフォーム実装。クライアント JS 最小・型安全・段階的フォールバック。

---

## 関連ドキュメント

- 仕様: `docs/06-features.md`（Algolia / Resend セクション）
- 前のタスク: `week-08-static-export.md`
