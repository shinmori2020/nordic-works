# Week 4 残ページ + Week 7 リッチUX — about/contact・ダークモード・アニメーション・記事強化

**所属Week**: Week 4（残ページ）+ Week 7（リッチUX）
**実施日**: 2026-05-21
**ステータス**: ✅ 完了
**前提**: Week 4-E（SEO）完了済み

---

## タスクの目的

外部アカウント不要・ローカル完結で進められる「バッチ①+②」を一括実施する。

- **バッチ①（Week 4 残）**: `/about`・`/contact` ページ実装（ナビの 404 を解消）
- **バッチ②（Week 7 相当）**: ダークモード / スクロールアニメーション / 記事詳細の強化（目次・読了進捗バー・関連記事）

これでサイトの全ページが揃い、見た目・体験が一段リッチになる。

---

## 完了基準

- [x] `/about` が会社概要として表示される
- [x] `/contact` がフォーム付きで表示され、バリデーションが効く
- [x] ヘッダーのテーマ切替でライト/ダークが切り替わる
- [x] OS のカラースキームを初期値に、手動切替が localStorage に保持される
- [x] 全ページ・カードがダークモードで破綻なく表示される
- [x] ホームのカードがスクロールでフェードイン（prefers-reduced-motion 配慮）
- [x] 記事詳細に目次（現在地ハイライト）・読了進捗バー・関連記事が出る
- [x] `tsc --noEmit` 型エラーなし
- [x] dev server で全ページ 200（存在しないURLは 404）

---

## 作成・変更ファイル

```
web/
├ scripts/
│  └ add-dark-variants.mjs              (新規: dark: 一括付与の一回限りスクリプト)
└ src/
   ├ app/
   │  ├ globals.css                     (更新: クラス連動 dark + CSS変数)
   │  ├ layout.tsx                      (更新: ThemeProvider 導入)
   │  ├ page.tsx ほか全ページ            (更新: dark: バリアント付与)
   │  ├ actions/contact.ts              (新規: お問い合わせ Server Action)
   │  └ (corporate)/
   │     ├ about/page.tsx               (新規: 会社概要)
   │     └ contact/page.tsx             (新規: お問い合わせ)
   ├ components/
   │  ├ common/
   │  │  ├ ThemeProvider.tsx            (新規: next-themes ラッパー)
   │  │  ├ ThemeToggle.tsx              (新規: ライト/ダーク切替ボタン)
   │  │  ├ Reveal.tsx                   (新規: スクロール連動フェードイン)
   │  │  └ Header.tsx / Footer.tsx      (更新: dark + トグル配置)
   │  ├ corporate/
   │  │  └ ContactForm.tsx              (新規: フォーム本体 Client Component)
   │  └ media/
   │     ├ ReadingProgress.tsx          (新規: 読了進捗バー)
   │     ├ TableOfContents.tsx          (新規: 目次 + 現在地ハイライト)
   │     └ 各カード                      (更新: dark)
   └ lib/
      └ toc.ts                          (新規: 本文HTMLから目次抽出 + 見出しid注入)
```

---

## 実装の設計判断

### 判断1: ダークモードは「クラス連動 + CSS変数」（CLAUDE.md 準拠）

Tailwind v4 のデフォルト `dark:` は `prefers-color-scheme` 連動。これを
`@custom-variant dark (&:where(.dark, .dark *));` で **クラス連動**に上書きし、
next-themes が付与する `<html class="dark">` に反応させる。

`globals.css` の `:root` / `.dark` で `--background` / `--foreground` を定義し、
body の地の色は CSS 変数で一元管理（CLAUDE.md の方針通り）。
個別要素は zinc パレットの `dark:` バリアントで対応する。

### 判断2: dark: 一括付与は変換スクリプトで機械的に

既存20ファイルに手作業で `dark:` を付けると漏れ・ばらつきが出る。
`scripts/add-dark-variants.mjs` で zinc クラス → 対応 dark クラスを正規表現で
一括付与した。マッピングは light/dark の明度を反転する方針で統一:

| light | dark |
|---|---|
| text-zinc-900 | dark:text-zinc-100 |
| text-zinc-600 | dark:text-zinc-400 |
| bg-white | dark:bg-zinc-950 |
| bg-zinc-50 | dark:bg-zinc-900 |
| bg-zinc-900（CTA） | dark:bg-zinc-100（反転） |
| border-zinc-200 | dark:border-zinc-800 |

手書きで dark 対応済みのファイル（layout / about / contact / Header 等）は
EXCLUDE で二重付与を防止。スクリプトはリポジトリに残し、変換方針を記録した。

### 判断3: テーマトグルはハイドレーション安全に

`ThemeToggle` は `mounted` 状態を持ち、マウント前はプレースホルダーを描画。
SSR 時点では実テーマが不明なため、アイコンの不一致（hydration mismatch）を回避。
`<html suppressHydrationWarning>` も併用。

### 判断4: Server Component を Reveal でラップしてアニメーション

`Reveal`（Client Component）は children に Server Component（カード）を受け取れる。
これにより「サーバーで HTML 生成」しつつ「クライアントで whileInView アニメ」を両立。
`useReducedMotion` で OS の「視差効果を減らす」設定時はアニメ無効（アクセシビリティ）。

### 判断5: 目次は本文HTMLに id を注入して生成

`buildTableOfContents()` が `content.rendered` から h2/h3 を抽出し、
`id="section-N"` を注入した HTML と目次配列を返す。`dangerouslySetInnerHTML` には
この id 付き HTML を渡し、目次のアンカーリンクが本文見出しに一致するようにした。
現在地ハイライトは IntersectionObserver（`TableOfContents`）。

### 判断6: お問い合わせは Server Action + Zod、メール送信は Week 6 でスタブ

`submitContact` は Zod でバリデーションし、フィールド別エラーを `useActionState`
経由で返す。実際のメール送信（Resend）は Week 6 で接続するため、現状は
バリデーション成功で受付完了とするスタブ。フォームは a11y 配慮（label 関連付け・
aria-invalid・aria-describedby・role=alert/status）。

### 判断7: 関連記事は共通トピックで算出

記事詳細で全記事を取得し、現在記事と **同じ topic ターム**を持つ記事を最大3件表示。
ポートフォリオ規模（13記事）ではクライアント側フィルタで十分。

---

## 動作確認結果

### 型チェック

```
$ pnpm exec tsc --noEmit
TSC_OK
```

### HTTP ステータス（全ページ 200 / 不在は 404）

```
/  /about  /contact                         → 200
/articles  /articles/<slug>                 → 200
/services  /services/<slug>                 → 200
/careers   /careers/<slug>                  → 200
/authors   /authors/<slug>                  → 200
/features  /features/<slug>                 → 200
/topic/<slug>  /industry/<slug>             → 200
/this-does-not-exist                        → 404
```

### 出力 HTML の確認

| 検証 | 結果 |
|---|---|
| テーマトグル | `aria-label="テーマを切り替え"` が描画 |
| next-themes | localStorage / color-scheme 注入を確認 |
| 記事目次 | 「目次」+ `id="section-1"` 注入を確認 |
| 読了進捗バー | `origin-left`（scaleX バー）を確認 |
| 関連記事 | 「関連記事」セクションを確認 |
| お問い合わせフォーム | 入力欄・送信ボタンを確認 |

---

## 詰まったところ・気づき

### 1. dark: 一括スクリプトの正規表現順序バグ

`hover:bg-zinc-200` → 挿入した `dark:hover:bg-zinc-700` を、後続の
`hover:bg-zinc-700` ルールが**再マッチ**して `dark:hover:bg-zinc-300` を重複付与する
バグが発生（4箇所）。`(?<!dark:)` の否定後読みで修正し、重複分は除去。

**学び**: 「挿入した文字列が後続ルールに食われる」のは置換チェーンの典型罠。
否定後読み or 一時プレースホルダーで自己再マッチを防ぐ。

### 2. Local の MySQL が起動失敗（環境トラブル）

作業中に Local の MySQL が `Can't connect to MySQL server on '::1:10017'` で
起動失敗。原因は**孤児 mysqld プロセスの残留**。一部は権限の都合で kill 不可だった
ため、最終的に Local 再起動で復旧。コードとは無関係の環境問題。

**学び**: Local が「Starting」で固まる時は mysqld の孤児プロセスを疑う。
タスクマネージャ（管理者）か PC 再起動でクリアできる。

### 3. WP cold start 中のキャッシュ汚染（再掲）

WP 停止/低速時に走った fetch の null 結果が Next.js データキャッシュに残ると
復旧後も 404 のまま。`.next/` クリア → 再起動 → WP 空打ち → 確認の手順で対処。

---

## 振り返り（面接で語れる素材）

### 1. 「CLAUDE.md の方針に沿ったダークモード設計」

Tailwind v4 のクラス連動 dark + CSS 変数による配色一元管理。next-themes で
OS 追従 + 手動切替 + localStorage 永続化。ハイドレーション不一致も
`suppressHydrationWarning` + mounted ガードで回避。

### 2. 「Server Component × Client アニメーションの両立」

`Reveal` で Server Component をラップし、SSR の利点を保ちつつ
スクロールアニメを付与。`prefers-reduced-motion` 対応でアクセシビリティも確保。

### 3. 「大量ファイルの機械的変換とそのデバッグ」

20ファイルの dark 対応を変換スクリプトで実施し、正規表現の自己再マッチバグを
検知・修正。手作業の限界を見極めて自動化し、かつ自動化の落とし穴も理解。

### 4. 「アクセシブルなフォーム実装」

Server Actions + Zod + useActionState で型安全に。label 関連付け・aria-invalid・
aria-describedby・role=alert/status で支援技術にも配慮。

---

## 次のタスク

残りは外部アカウント・デプロイが必要なバッチ:

- **Week 5**: プレビュー / On-demand Revalidation（WP functions.php + Application Password）
- **Week 6**: Algolia 検索 / Resend フォーム接続（各サービスのアカウント）
- **Week 4-F / Week 8**: Vercel デプロイ / 静的エクスポート

---

## 関連ドキュメント

- 仕様: `docs/06-features.md`
- 前のタスク: `week-04-task-e-seo.md`
