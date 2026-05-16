# 07. 8週間ロードマップ

各週で「成果物」を必ず手元に残すこと。最終的にポートフォリオの素材になる。

---

## Week 1: 概念理解 + 企画 + 情報設計

### 目的
Headless WPの仕組みを言語化できる + サイト設計が固まる

### タスク

1. **Headless WP概念学習**
   - Claudeに概念質問を投げて理解を深める
   - サンプル質問:
     - 「Headless WordPressとは？図解で説明して」
     - 「REST APIとGraphQLの違いをサンプルコード付きで」
     - 「SSR/SSG/ISRの違いと使い分け」
     - 「Headless WPでありがちな実装の落とし穴は？」

2. **ローカルWordPress環境を構築**
   - Localをインストール
   - 新規サイトを作成（サイト名: nordic-works）
   - 管理画面にアクセスできる状態にする

3. **REST API・GraphQLの両方を実際に叩く**
   - `/wp-json/wp/v2/posts` にブラウザでアクセス
   - WPGraphQLプラグインを導入してGraphQL IDEで遊ぶ
   - Postman / Thunder Clientでレスポンスを観察
   - 両者の違いを体感

4. **Nordic Works のコンセプト確認・微調整**
   - `03-site-design.md` を読み返す
   - 必要なら社名・テーマ・トーンを微調整
   - サービス名を3〜4個決める

5. **情報設計ドキュメント作成**
   - `04-wordpress.md` を読み込み、CPT・タクソノミー・ACFの全体図を1枚にまとめる
   - フローチャートでも箇条書きでもOK

6. **ワイヤーフレーム作成（簡易）**
   - Figma、紙、Claudeに生成依頼、いずれでも可
   - 主要ページ（トップ・記事一覧・記事詳細・サービス詳細）のみ

### 今週の成果物

- ✅ 動作するローカルWordPress環境
- ✅ 情報設計ドキュメント（マークダウンでOK）
- ✅ 簡単なワイヤーフレーム

### 完了基準

他人に「Headless WPとは？」「このサイトは何を作る？」と聞かれて、5分で説明できる状態。

### Claudeへの依頼例

```
「Headless WordPressについて、通常のWordPressと比べたメリット・デメリットを
ITに詳しくない人にも伝わるように説明してください。」

「Nordic Worksというサービス架空企業のサービスを3〜4個考えてください。
B2B SaaSで、北欧式の働き方・組織設計支援というテーマです。」

「Figma風のシンプルなワイヤーフレームをテキストアートで書いてください。
ページ: B2Bメディアサイトのトップページ」
```

---

## Week 2: WordPress側の作り込み

### 目的
Next.jsから取得すべきコンテンツが全て揃った状態を作る

### タスク

1. **プラグインインストール**
   - Advanced Custom Fields Pro
   - Custom Post Type UI（任意）
   - WPGraphQL
   - WPGraphQL for ACF

2. **カスタム投稿タイプ作成**
   - `service`, `career`, `feature`, `author_profile`
   - 詳細は `04-wordpress.md` 参照

3. **カスタムタクソノミー作成**
   - `industry`, `topic`, `reading_level`

4. **ACFフィールドグループ設計・実装**
   - 各CPT用のフィールドを管理画面で設定
   - 必要に応じてフィールドエクスポート

5. **ダミーコンテンツ投入**
   - 通常記事: 15本
   - サービス: 3〜4個
   - 採用ポジション: 2〜3個
   - 特集: 2〜3個
   - 著者プロフィール: 3〜4人
   - メディアライブラリに画像30〜50枚（Unsplash等から）

6. **エンドポイント動作確認**
   - 各CPTのREST APIエンドポイントが応答する
   - GraphQL IDEで各CPTがクエリ可能

### 今週の成果物

- ✅ 全CPT・タクソノミーが管理画面に表示される
- ✅ ダミーコンテンツが投入済み
- ✅ `/wp-json/wp/v2/`系のエンドポイントで全データが取得できる
- ✅ GraphQLでも同じデータが取得できる

### Claudeへの依頼例

```
「WordPressのfunctions.phpで以下のCPTとタクソノミーを定義する
完全なコードを書いてください。
- CPT: service, career, feature, author_profile（REST/GraphQL有効化）
- カスタムタクソノミー: industry, topic, reading_level
- 適切なrewrite slug
- 管理画面のアイコンも指定」

「ACFで以下のフィールドグループを設計するための推奨フィールド構成を提案してください。
CPT: service
必要な情報: 機能リスト、料金プラン、FAQ、CTA」

「B2B SaaSメディア用に、リモートワーク・心理的安全性をテーマに
ダミー記事を5本、各300文字程度のリード文付きで生成してください。」
```

---

## Week 3: Next.js最小実装

### 目的
WordPressからデータを取得して表示する基盤が動く

### タスク

1. **Next.jsプロジェクト初期化**
   ```bash
   pnpm create next-app@latest nordic-works --typescript --tailwind --app --src-dir
   ```

2. **追加パッケージインストール**
   - `05-tech-stack.md`のコマンドを実行

3. **ディレクトリ構成セットアップ**
   - `05-tech-stack.md`の構成に従って空ディレクトリを作成

4. **環境変数設定**
   - `.env.local`を作成
   - `.gitignore`に追加

5. **WordPress接続関数の実装**
   - `src/lib/wordpress.ts`に基本的なfetch関数群を作成
   - 記事一覧取得・記事詳細取得を実装

6. **TypeScript型定義**
   - `src/types/wordpress.ts`にPost, Service, Career, Feature, AuthorProfile型を定義
   - WordPressのレスポンス型は実際のJSONを見ながら作る

7. **最小UI実装**
   - 記事一覧ページ（`/articles`）
   - 記事詳細ページ（`/articles/[slug]`）
   - ルートレイアウトのヘッダー・フッター仮置き

8. **Next.js 15のキャッシュ仕様に沿った実装**
   - 各fetchで`revalidate`を明示
   - 詳細は `06-features.md` の ISRセクション参照

9. **GitHubリポジトリ作成・初回push**
   - `nordic-works`という名前で作成
   - mainブランチに初回コミット

### 今週の成果物

- ✅ `localhost:3000` で記事一覧・詳細が表示される
- ✅ GitHubに公開リポジトリ
- ✅ 型定義済みのデータ取得関数群

### Claudeへの依頼例

```
「Next.js 15 App RouterでWordPress REST APIから記事一覧を取得して
表示する最小コードを書いてください。
- TypeScriptで型定義込み
- _embedで画像と著者情報も取得
- ISR（1時間ごと再生成）
- エラーハンドリングあり
- コメントで各処理の意図を説明」

「WordPress REST APIの /wp/v2/posts のレスポンス（_embed付き）の
TypeScript型定義を、よく使う基本フィールドのみに絞って書いてください。」
```

---

## Week 4: コア機能完成

### 目的
公開できる状態まで全ページを揃える

### タスク

1. **残りページの実装**
   - トップページ（ヒーロー、最新記事、サービス紹介、CTA）
   - 会社概要（`/about`）
   - サービス一覧・詳細（CPT・ACFを活用）
   - 採用情報一覧・詳細
   - 著者プロフィール一覧・詳細
   - カテゴリー別・タグ別一覧
   - 特集一覧・詳細
   - 404ページ

2. **画像最適化**
   - `next.config.ts`の`remotePatterns`設定
   - Next.js Imageコンポーネント活用
   - 詳細は `06-features.md` の画像最適化セクション参照

3. **ISR設定**
   - 各ページに適切な`revalidate`値（`06-features.md`の表参照）

4. **SEO基本実装**
   - `generateMetadata`で動的メタタグ
   - OGP・Twitter Card
   - canonical URL

5. **レスポンシブ対応**
   - モバイル・タブレット・デスクトップ全対応
   - Tailwindのbreakpointを活用

6. **基本UIコンポーネント整備**
   - 共通ヘッダー・フッター
   - ナビゲーション（モバイルメニュー含む）
   - 記事カード・著者カード・サービスカード
   - ボタン・タグなどのプリミティブ

7. **Vercelに初回デプロイ**
   - GitHubリポジトリをVercelに連携
   - 環境変数を本番用に設定（ただしWPはローカルなので、デモ用に静的データでも可）
   - 公開URL確保

### 今週の成果物

- ✅ 全ページが表示される公開URL（Vercel）
- ✅ スマホで見ても崩れない
- ✅ Lighthouseスコア80以上

### Claudeへの依頼例

```
「Next.js 15 App Routerで、B2B SaaSメディアサイトのトップページを実装してください。
セクション構成:
- ヒーロー（キャッチコピー + サブコピー + CTA 2つ）
- 最新記事一覧（6件、3カラムグリッド）
- 注目特集（1〜2件、大きめのカード）
- サービス紹介（3〜4枚のカード）
- お問い合わせCTA
Tailwind CSSで実装、レスポンシブ対応、Server Componentでデータ取得」

「Next.js ImageでWordPressからのアイキャッチ画像を表示するベストプラクティスを教えてください。
- remotePatterns設定
- width/heightの取得方法
- blurDataURLの実装
- aboveTheFoldの判定」
```

---

## Week 5: 差別化① プレビュー + On-demand Revalidation

### 目的
実案件レベルの編集者体験を実装

### タスク

1. **draftMode実装**
   - `app/api/preview/route.ts` 作成
   - `app/api/exit-preview/route.ts` 作成
   - 詳細実装は `06-features.md` のプレビュー機能セクション参照

2. **WordPress側のプレビューカスタマイズ**
   - `preview_post_link`フィルター実装
   - 投稿タイプごとのフロントエンドURLマッピング
   - 管理画面のプレビューボタンの動作確認

3. **データ取得関数のdraftMode対応**
   - 各取得関数で`draftMode().isEnabled`を判定
   - 認証ヘッダー（Application Password）の付与

4. **プレビューバー実装**
   - draftMode有効時に画面上部に表示
   - 「プレビューを終了」ボタン

5. **On-demand Revalidation実装**
   - `app/api/revalidate/route.ts` 作成
   - 投稿タイプごとのキャッシュタグ・パスのクリア処理

6. **WordPress側のwebhook送信**
   - `save_post` / `transition_post_status` フックでNext.jsのrevalidate APIを叩く
   - secret token認証

7. **動作検証**
   - 下書き記事がプレビューで見える
   - 公開と同時にフロントエンドに即反映
   - プレビュー終了で本番モードに戻る

### 今週の成果物

- ✅ プレビュー機能が動作する状態（採用面接で実演可能）
- ✅ On-demand Revalidationが動作する状態
- ✅ 実装内容を説明できるメモ

### Claudeへの依頼例

```
「Next.js 15 App RouterのdraftMode()を使って、WordPressの下書きプレビュー機能を
実装してください。要件:
- /api/previewでsecret token認証
- 投稿タイプを動的に判定（post / feature / service / career）
- 各ページコンポーネントでdraftMode状態を取得
- データ取得時に下書きを含むかを切り替え
- /api/exit-previewで終了
- TypeScriptで型安全に
完全なコードと、WordPress側のpreview_post_linkフィルター実装も含めて。」

「Next.js のrevalidateTagとrevalidatePathの使い分けを、
具体例を交えて教えてください。
WordPress save_postフックから受け取ったwebhookで両方を呼ぶケース。」
```

---

## Week 6: 差別化② マルチデータソース統合

### 目的
WordPress以外のサービスとも自然に統合できることを示す

### タスク

#### Algolia（全文検索）

1. Algoliaアカウント作成（無料枠）
2. インデックス作成
3. WordPress側で`save_post`フックからAlgoliaにインデックスをPOSTする実装
4. 既存コンテンツのバルクインデックス（手動 or WP-CLI スクリプト）
5. Next.js側で検索UI実装
   - 検索ボックス（ヘッダーに配置）
   - 検索結果ページ（`/search`）
   - ハイライト表示
   - フィルター（業界・トピック）

#### Resend（メール送信）

1. Resendアカウント作成
2. APIキー取得
3. お問い合わせフォーム実装
   - Server Actionsでフォーム処理
   - Zodでバリデーション
   - React Emailでメールテンプレート作成
4. 運営宛通知メール + 送信者への自動返信メール
5. エラーハンドリング・ローディング状態
6. アクセシビリティ配慮（ラベル・aria属性）

#### Vercel Analytics

1. プロジェクトで`@vercel/analytics` + `@vercel/speed-insights`を有効化
2. ルートレイアウトに追加
3. Vercelダッシュボードで動作確認

### 今週の成果物

- ✅ 検索機能が動作（高速・ハイライト付き・フィルター可能）
- ✅ お問い合わせフォームが動作（メール送受信確認済み）
- ✅ アクセス解析が動作

### Claudeへの依頼例

```
「Next.js 15 + Server ActionsでResendを使ったお問い合わせフォームを実装してください。
- TypeScriptで型安全に
- Zodでバリデーション
- React Emailでメールテンプレート（運営宛と自動返信の2種類）
- エラーハンドリングとローディング状態
- アクセシビリティ配慮
- フォーム送信成功・失敗のUI制御
完全なコードを教えてください。」

「WordPressのsave_postフックからAlgoliaに記事をインデックスする実装を教えてください。
- 投稿タイプはpost, feature, serviceのみ対象
- 公開ステータスのみインデックス
- カスタムタクソノミー（industry, topic）の値も含める
- functions.phpに書ける形式で」

「Algoliaのクライアントサイド検索UIをNext.js 15のApp Routerで実装してください。
- InstantSearchは使わず自前実装
- 検索結果のハイライト
- ファセットフィルター（業界・トピック）
- デバウンス処理」
```

---

## Week 7: 差別化③ リッチUX

### 目的
フロントエンド技術力を視覚的にアピールする

### タスク

1. **Motion（旧Framer Motion）導入**
   - パッケージインストール
   - ページ遷移アニメーション
   - スクロール連動アニメーション（記事カードのフェードイン等）
   - ヒーローセクションの動きのある演出

2. **記事詳細の体験向上**
   - 自動目次生成（h2/h3を拾ってフローティング表示）
   - 読了時間表示（`reading-time`ライブラリ）
   - スクロール進捗バー
   - 関連記事レコメンド（カテゴリー・タグの一致度で算出）

3. **ダークモード対応**
   - `next-themes`導入
   - Tailwindで`dark:`クラスを使った配色設計
   - ロゴ・画像のダークモード対応
   - 切替UIの実装

4. **画像の追加最適化**
   - blurDataURLでLQIP実装
   - 画像ギャラリーコンポーネント

5. **マイクロインタラクション**
   - ホバー時のアニメーション
   - ボタンの押下フィードバック
   - フォームのフォーカス演出
   - リンク下線のホバーアニメーション

### 今週の成果物

- ✅ 視覚的に印象に残るサイト
- ✅ スマホでも滑らかに動く
- ✅ ダークモードでも違和感がない

### Claudeへの依頼例

```
「Next.js 15 + Motion（旧Framer Motion）でスクロール連動アニメーションを実装してください。
- 記事カードがビューポートに入ったらフェードイン+少し上に動く
- 一度表示されたら以降は再アニメーションしない
- useInViewフックを使用
- パフォーマンス重視」

「記事本文（HTML文字列）からh2/h3要素を抽出して、フローティング目次として
表示するReactコンポーネントを実装してください。
- 各見出しにidを自動付与
- 現在地のハイライト（IntersectionObserver使用）
- スクロール時のスムーズスクロール
- モバイルでは別UIに切替（ボトムシート風）」

「next-themesでダークモードを実装した後、Tailwind CSSで配色設計をする時のベストプラクティスを教えてください。
- CSS変数の使い方
- ロゴの切替方法
- 画像のフィルター調整
- システム設定に追従するか手動切替を優先するか」
```

---

## Week 8: 仕上げ + ポートフォリオ化

### 目的
ポートフォリオとして提示できる完成度に仕上げる + Local運用構成に最適化

### 重要な前提

このプロジェクトは **Local WordPressのまま運用 + 静的エクスポート + デモ動画** 構成を採用している。詳細は `09-deployment-strategy.md` 参照。

Week 8では、この構成に必要な追加実装も行う。

### タスク

1. **データエクスポートスクリプト実装**
   - `scripts/export-wp-data.ts` を作成（WP REST APIから全データをJSONに）
   - `scripts/download-media.ts` を作成（画像を`public/wp-uploads/`にダウンロード）
   - 画像URLの書き換え処理
   - 詳細は `09-deployment-strategy.md` 参照

2. **データ取得関数の二重化**
   - `DATA_SOURCE`環境変数で開発時（API）と本番（JSON）を切替
   - `src/lib/wordpress.ts` の全関数を対応
   - 動作確認: ローカルで`DATA_SOURCE=static`にして動くこと

3. **デモ動画録画**
   - 動画1: 下書きプレビュー機能（2〜3分）
   - 動画2: On-demand Revalidation（2〜3分）
   - 動画3: Algolia全文検索（1〜2分、任意）
   - YouTube限定公開でアップロード
   - 録画ツール例: macOS標準スクリーン録画、Loom、OBS Studio

4. **パフォーマンス最適化**
   - Lighthouseスコア改善（全項目90以上目標）
   - 不要なJSの削除
   - `@next/bundle-analyzer`でサイズチェック
   - 画像のサイズ・フォーマット見直し
   - LCP・CLS・INPの改善

5. **SEO仕上げ**
   - 構造化データ（JSON-LD: Article, Organization, BreadcrumbList）
   - sitemap.xml（next-sitemap）
   - robots.txt
   - canonical URL

6. **アクセシビリティ**
   - axe DevToolsでチェック
   - キーボード操作対応の確認
   - スクリーンリーダー対応の確認
   - WCAG AAレベルのコントラスト比

7. **README作成**
   - 詳細は `08-portfolio-prep.md` 参照
   - **動的機能のデモ動画セクションを必ず含める**

8. **スクリーンショット撮影**
   - デスクトップ + モバイルの両方
   - 主要ページ + 重要機能（プレビュー、検索、ダークモード等）

9. **採用面接で語れるエピソード整理**
   - 詳細は `08-portfolio-prep.md` 参照
   - **「なぜLocal運用にしたか」の説明も準備**

10. **本番デプロイの最終確認**
    - データエクスポート → コミット → Vercelデプロイの流れが動く
    - 公開URLで全ページが表示される
    - Algolia検索が動作
    - お問い合わせフォーム送信が動作
    - 404・エラー処理が動作するか

### 今週の成果物

- ✅ 公開URL（Vercel本番環境、静的サイトとして動作）
- ✅ データエクスポートスクリプト（リポジトリに含まれる）
- ✅ デモ動画2〜3本（YouTube限定公開）
- ✅ 整備されたGitHubリポジトリ
- ✅ README + スクリーンショット + 動画埋め込み
- ✅ 実装エピソード集（面接対策メモ、Local運用の説明含む）

### Claudeへの依頼例

```
「Node.js (TypeScript)で、ローカルWordPressのREST APIから
全コンテンツをJSON化してdata/ディレクトリに保存するスクリプトを書いてください。
- 投稿タイプ: post, service, career, feature, author_profile
- タクソノミー: industry, topic, reading_level
- _embedで関連データも含める
- ページネーション対応
- エラーハンドリング」

「同じスクリプトで、メディアライブラリの画像も全件public/wp-uploads/に
ダウンロードしてください。JSONデータ内の画像URLも書き換え。」

「以下のNext.jsデータ取得関数を、環境変数DATA_SOURCEで
APIとJSONを切替えられるようにリファクタリングしてください:
[既存コード貼り付け]」

「このNext.js 15プロジェクトのLighthouseスコアを改善するための
チェックリストを優先度順に教えてください。」
```

---

## 全体スケジュール表

| Week | フェーズ | 主なアウトプット |
|------|---------|---------------|
| 1 | 概念理解 + 企画 | ローカルWP環境、情報設計ドキュメント |
| 2 | WordPress構築 | CPT/ACF設定、ダミーコンテンツ投入完了 |
| 3 | Next.js最小実装 | 記事一覧・詳細が表示される状態、GitHubリポジトリ |
| 4 | コア機能完成 | 全ページ表示+ISR+SEO+画像最適化+Vercelデプロイ |
| 5 | 差別化① | プレビュー機能 + On-demand Revalidation |
| 6 | 差別化② | Algolia検索 + Resendフォーム |
| 7 | 差別化③ | リッチUX（アニメーション、目次、ダークモード等） |
| 8 | 仕上げ | パフォーマンス最適化、構造化データ、README、本番デプロイ |

---

## 週次チェックリスト

各週末に以下を確認:

- [ ] 今週のタスクは予定通り進んだか
- [ ] GitHubへpushしたか
- [ ] Vercelデプロイは動作するか
- [ ] 学んだこと・詰まったポイントをメモに残したか
- [ ] 次週のタスクは明確か

---

## 関連ドキュメント

- 機能の実装詳細: `06-features.md`
- 技術スタック: `05-tech-stack.md`
- ポートフォリオ化: `08-portfolio-prep.md`
