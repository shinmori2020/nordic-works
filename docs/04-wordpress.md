# 04. WordPress側の情報設計

## ローカル開発環境

- **推奨ツール**: Local（旧 Local by Flywheel）
- **代替**: Docker (`docker-compose.yml`でWP公式イメージ)
- **PHP**: 8.1以上
- **MySQL**: 8.0以上
- **WordPress**: 最新安定版

## カスタム投稿タイプ（CPT）

| 投稿タイプ | スラッグ | 用途 | REST有効化 | GraphQL有効化 |
|----------|---------|------|----------|------------|
| 投稿（標準） | `post` | 記事・コラム | ✓ | ✓ |
| サービス | `service` | サービス紹介 | ✓ | ✓ |
| 採用情報 | `career` | 採用ポジション | ✓ | ✓ |
| 特集 | `feature` | キュレーション特集 | ✓ | ✓ |
| 著者 | `author_profile` | 著者プロフィール | ✓ | ✓ |

### CPT実装サンプルコード

```php
// functions.php または独自プラグイン
function nordic_register_post_types() {
    // サービス
    register_post_type('service', [
        'label' => 'サービス',
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields', 'revisions'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'services'],
        'menu_icon' => 'dashicons-products',
    ]);

    // 採用情報
    register_post_type('career', [
        'label' => '採用情報',
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'career',
        'graphql_plural_name' => 'careers',
        'supports' => ['title', 'editor', 'custom-fields', 'revisions'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'careers'],
        'menu_icon' => 'dashicons-businessperson',
    ]);

    // 特集
    register_post_type('feature', [
        'label' => '特集',
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'feature',
        'graphql_plural_name' => 'features',
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields', 'revisions'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'features'],
        'menu_icon' => 'dashicons-star-filled',
    ]);

    // 著者プロフィール
    register_post_type('author_profile', [
        'label' => '著者',
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'authorProfile',
        'graphql_plural_name' => 'authorProfiles',
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'authors'],
        'menu_icon' => 'dashicons-admin-users',
    ]);
}
add_action('init', 'nordic_register_post_types');
```

## カスタムタクソノミー

| タクソノミー | スラッグ | 適用先 | 用途 |
|------------|---------|--------|------|
| 業界 | `industry` | post, feature | IT・製造・小売・サービス業等 |
| トピック | `topic` | post, feature | リモートワーク・心理的安全性・組織デザイン等 |
| 読者レベル | `reading_level` | post | 初級・中級・上級 |

### タクソノミー実装サンプルコード

```php
function nordic_register_taxonomies() {
    // 業界
    register_taxonomy('industry', ['post', 'feature'], [
        'label' => '業界',
        'hierarchical' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'industry',
        'graphql_plural_name' => 'industries',
        'rewrite' => ['slug' => 'industry'],
    ]);

    // トピック
    register_taxonomy('topic', ['post', 'feature'], [
        'label' => 'トピック',
        'hierarchical' => false,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'topic',
        'graphql_plural_name' => 'topics',
        'rewrite' => ['slug' => 'topic'],
    ]);

    // 読者レベル
    register_taxonomy('reading_level', ['post'], [
        'label' => '読者レベル',
        'hierarchical' => false,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'readingLevel',
        'graphql_plural_name' => 'readingLevels',
        'rewrite' => ['slug' => 'level'],
    ]);
}
add_action('init', 'nordic_register_taxonomies');
```

## ACFフィールド設計

### 通常投稿（記事）用

| フィールド名 | 型 | 説明 |
|------------|---|------|
| `author_profile` | ポストオブジェクト | 紐づく著者プロフィール |
| `reading_time` | 数値 | 読了時間（分） |
| `featured_image_caption` | テキスト | アイキャッチのキャプション |
| `related_posts` | リレーション | 関連記事（最大3件） |

### サービス（`service`）用

| フィールド名 | 型 | 説明 |
|------------|---|------|
| `subtitle` | テキスト | サブタイトル |
| `hero_image` | 画像 | ヒーロー画像 |
| `features` | リピーター | 機能リスト（タイトル + 説明） |
| `pricing_plans` | リピーター | 料金プラン（名称・価格・含まれる機能） |
| `faq` | リピーター | FAQ（質問・回答） |
| `case_study_links` | リピーター | 導入事例リンク |
| `cta_text` | テキスト | CTAボタンテキスト |
| `cta_url` | URL | CTAリンク先 |

### 採用情報（`career`）用

| フィールド名 | 型 | 説明 |
|------------|---|------|
| `position_type` | セレクト | 正社員・契約・業務委託 |
| `location` | テキスト | 勤務地（リモート可表記含む） |
| `salary_range` | テキスト | 給与レンジ |
| `required_skills` | リピーター | 必須スキル |
| `preferred_skills` | リピーター | 歓迎スキル |
| `benefits` | リピーター | 待遇・福利厚生 |
| `application_url` | URL | 応募フォームのURL |

### 特集（`feature`）用

| フィールド名 | 型 | 説明 |
|------------|---|------|
| `cover_image` | 画像 | カバー画像 |
| `lead_text` | テキストエリア | リード文 |
| `related_articles` | リレーション | 含める記事リスト |
| `published_period_start` | 日付 | 公開開始日 |
| `published_period_end` | 日付 | 公開終了日（任意） |

### 著者プロフィール（`author_profile`）用

| フィールド名 | 型 | 説明 |
|------------|---|------|
| `photo` | 画像 | 顔写真 |
| `position` | テキスト | 肩書き |
| `bio` | テキストエリア | 自己紹介 |
| `twitter_url` | URL | Twitter |
| `linkedin_url` | URL | LinkedIn |
| `website_url` | URL | 個人サイト |

## プラグイン構成

| プラグイン | 用途 | 必須/任意 |
|----------|------|---------|
| Advanced Custom Fields Pro | カスタムフィールド | 必須 |
| Custom Post Type UI | CPT/タクソノミーGUI管理 | 任意（functions.phpでも可） |
| WPGraphQL | GraphQL API化 | 推奨 |
| WPGraphQL for ACF | ACFのGraphQL対応 | 推奨（WPGraphQL使用時） |
| WP REST Cache（任意） | REST APIキャッシュ | 任意 |
| Yoast SEO（任意） | SEOメタ管理 | 任意 |
| Disable Comments（任意） | コメント機能無効化 | 任意 |

## ダミーコンテンツ投入計画

Week 2終了時点で以下のコンテンツが揃っている状態を目指す:

| コンテンツ | 件数 |
|----------|------|
| 通常記事 | 15本（カテゴリー・タグ・著者を分散） |
| サービス | 3〜4個 |
| 採用ポジション | 2〜3個 |
| 特集 | 2〜3個 |
| 著者プロフィール | 3〜4人 |
| カテゴリー（industry） | 4〜5種 |
| タグ（topic） | 8〜10種 |
| メディアライブラリ画像 | 30〜50枚（Unsplashから） |

## REST APIエンドポイント例

```
# 記事一覧
GET /wp-json/wp/v2/posts?_embed&per_page=10

# 記事詳細（slug指定）
GET /wp-json/wp/v2/posts?slug=article-slug&_embed

# サービス一覧
GET /wp-json/wp/v2/service?_embed

# 著者プロフィール一覧
GET /wp-json/wp/v2/author_profile?_embed

# 業界タクソノミー
GET /wp-json/wp/v2/industry

# トピック別記事取得
GET /wp-json/wp/v2/posts?topic=5&_embed
```

`_embed`パラメータを付けると、アイキャッチ画像・著者・タクソノミー情報を一括取得できる。

## GraphQL クエリ例

```graphql
query GetArticles {
  posts(first: 10) {
    nodes {
      id
      slug
      title
      excerpt
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      industries {
        nodes {
          name
          slug
        }
      }
      topics {
        nodes {
          name
          slug
        }
      }
    }
  }
}
```

## 関連ドキュメント

- 機能の実装詳細: `06-features.md`
- 構築の進め方: `07-roadmap.md`（特にWeek 2）
