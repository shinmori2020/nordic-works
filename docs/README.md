# プロジェクトドキュメント

Nordic Works（架空B2B SaaS企業）のオウンドメディア+コーポレートサイトをHeadless WordPress構成で構築するポートフォリオプロジェクトのドキュメント集。

Claude Codeから参照することを前提に整理しています。

---

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| `01-overview.md` | プロジェクトの目的・期間・最終成果物・成功基準 |
| `02-headless-wordpress.md` | Headless WordPressの概念・必要なプログラミング言語 |
| `03-site-design.md` | Nordic Worksのコンセプト・サイト構造・ページ構成 |
| `04-wordpress.md` | WordPress側の情報設計（CPT・タクソノミー・ACF・プラグイン） |
| `05-tech-stack.md` | 採用技術スタック全体像と選定理由 |
| `06-features.md` | 差別化機能の実装方針（プレビュー・ISR・マルチデータソース等） |
| `07-roadmap.md` | 8週間の詳細ロードマップ（タスク・成果物・Claude依頼例） |
| `08-portfolio-prep.md` | ポートフォリオ化の最終ステップ（README・面接準備等） |
| `09-deployment-strategy.md` | デプロイ戦略（Local + 静的エクスポート + デモ動画） |

---

## 読み込み順序

### 全体像を把握したいとき
`01-overview.md` → `02-headless-wordpress.md` → `03-site-design.md`

### 実装を進めるとき
`07-roadmap.md`（該当週） → 関連する仕様ファイル（`04` / `05` / `06`）

### デプロイ・本番運用を理解したいとき
`09-deployment-strategy.md`

### 仕上げ・面接準備のとき
`08-portfolio-prep.md`

---

## Claude Codeへの指示例

```
「docs/07-roadmap.md のWeek 3のタスクを進めて」
「docs/04-wordpress.md のCPT設計をfunctions.phpに実装して」
「docs/06-features.md のプレビュー機能を実装して」
「docs/05-tech-stack.md の構成でNext.jsプロジェクトを初期化して」
```

---

## プロジェクト管理メモ

- 各週末に進捗を `progress.md` 等に記録すると振り返りやすい（任意）
- 詰まったポイント・解決方法もメモすると面接で語れる素材になる
- 仕様変更時は該当ドキュメントを更新してからClaude Codeに指示する

---

## 関連リソース

- [Next.js公式](https://nextjs.org/docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [WPGraphQL](https://www.wpgraphql.com/)
- [Algolia](https://www.algolia.com/doc/)
- [Resend](https://resend.com/docs)

---

*ドキュメント作成日: 2026年5月。Next.js等は半年〜1年で仕様が変わるため、各週開始時に最新ドキュメントを確認すること。*
