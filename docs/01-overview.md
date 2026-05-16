# 01. プロジェクト概要

## プロジェクト名

Nordic Works - Headless WordPress ポートフォリオサイト

## 目的

「Headless WordPress対応可能」を採用面接・エージェント面談・案件獲得で証明できる**1サイト深掘り型ポートフォリオ**を構築する。

通常のWordPressでもできる機能を寄せ集めるのではなく、**通常WPでは原理的に難しい・不可能なこと**（マルチプラットフォーム配信の素地、エッジ配信、SPA体験、複数データソース統合、編集者向けプレビュー実装）を盛り込むことを最重要視する。

## 期間と稼働

- 期間: 8週間
- 想定稼働: 週10〜15時間
- 総工数: 80〜120時間

## 最終成果物

1. Vercelにデプロイされた**公開URL**（静的サイトとして全ページ閲覧可能）
2. **GitHubの公開リポジトリ**（READMEとスクリーンショット込み）
3. ローカル動作する**WordPressバックエンド**（コンテンツ管理画面）
4. **デモ動画**（YouTube限定公開）— プレビュー機能・On-demand Revalidation
5. 面接で語れる**実装エピソード集**（後述の08参照）

## 運用構成

**Local WordPress + 静的エクスポート + Vercel** の構成を採用。詳細は `09-deployment-strategy.md` 参照。

- 開発時: ローカル Next.js ↔ ローカル WordPress（ライブAPI）
- 本番時: Vercel（JSON静的データ）+ Algolia + Resend
- 動的機能（プレビュー、Revalidation）: ローカル動作 + デモ動画で証明

## 成功基準

- [ ] Lighthouseスコアが全項目90以上
- [ ] スマホで見ても崩れない（レスポンシブ完了）
- [ ] 公開URLで全ページが閲覧できる（静的サイトとして動作）
- [ ] Algolia全文検索が公開URLで動作する
- [ ] お問い合わせフォーム送信が公開URLで動作する（Resend連携）
- [ ] ローカル環境で下書きプレビュー機能が動作する（デモ動画で証明）
- [ ] ローカル環境でOn-demand Revalidationが動作する（デモ動画で証明）
- [ ] ダークモード切替えに対応
- [ ] 構造化データ（JSON-LD）が出力されている
- [ ] sitemap.xmlが生成されている
- [ ] データエクスポートスクリプトが動作する
- [ ] GitHubのREADMEに技術スタック・機能・デモURL・デモ動画が整理されている

## 対象スキルレベル

- HTML/CSS/JavaScript基礎は習得済み
- React基礎（useState/useEffect）が使える状態
- WordPress基礎（管理画面・投稿・固定ページ・CPT）を理解
- Gitの基本操作（add/commit/push/pull/branch）ができる

## このプロジェクトで習得する技術

- Next.js 15 App Router（フロントエンドの中核）
- TypeScript（型安全な実装）
- Tailwind CSS（モダンCSS設計）
- WordPress REST API + WPGraphQL（バックエンド連携）
- ISR / On-demand Revalidation（モダンキャッシュ戦略）
- Server Actions（フォーム処理）
- Motion（旧Framer Motion）（リッチアニメーション）
- Vercelデプロイ（CDN配信）
- Algolia（全文検索）
- Resend（トランザクションメール）

## 関連ドキュメント

- 技術詳細: `05-tech-stack.md`
- 8週間の進め方: `07-roadmap.md`
- 完成後の見せ方: `08-portfolio-prep.md`
