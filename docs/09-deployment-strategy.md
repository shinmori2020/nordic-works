# 09. デプロイ戦略（Local + 静的エクスポート + デモ動画）

## 概要

WordPressはLocal（ローカル開発環境）のまま運用し、Next.jsはVercelに本番デプロイする構成。Vercel上のNext.jsはローカルWordPressに直接アクセスできないため、**ビルド時にWordPressのデータをJSONとしてエクスポートしてリポジトリに含める**戦略を採る。

動的な編集者体験（プレビュー・On-demand Revalidation）は公開URLでは再現できないので、**ローカル環境で動作確認した上でデモ動画を録画し、ポートフォリオに添付する**。

---

## 本構成の全体像

```
[開発時]
ローカルWP                    ローカル Next.js
nordic-works.local      ←→    localhost:3000
  │
  │ Algolia API
  │ Resend API
  ↓
  外部サービス（独立ホスト）

[ビルド・デプロイ時]
ローカルWP
  ↓ エクスポートスクリプト実行
data/*.json
  ↓ git commit & push
GitHub
  ↓ Vercel webhook
Vercel ビルド → 静的サイト生成 → 公開
  │
  │ Algolia, Resend は外部サービスとして本番でも動作
  ↓
公開URL（nordic-works.vercel.app）
```

---

## 公開URLで動作する/しない機能

### ✅ 公開URLで完全動作

- 全ページの閲覧（記事、サービス、特集、採用、著者プロフィール等）
- カテゴリー・タグ別一覧
- Algolia全文検索（Algoliaは外部ホストで独立動作）
- お問い合わせフォーム送信（Resendは外部ホストで独立動作）
- ダークモード切替
- スクロール連動アニメーション
- 動的目次・読了時間表示
- レスポンシブデザイン
- SEO（メタタグ・OGP・JSON-LD・sitemap.xml）

### ❌ 公開URLでは動作しない（デモ動画で証明）

- **下書きプレビュー機能**: WordPress管理画面から本番URLに飛ばせない（Local非公開のため）
- **On-demand Revalidation**: WordPressのwebhookが本番Next.jsに到達できない

### △ 一部制約あり

- **ISR**: ビルド時にJSON化するため、`revalidate`値の意味が薄くなる。本来のISRデモは限定的
- **編集者体験**: WordPress管理画面自体は公開URLからアクセス不可

---

## データエクスポートスクリプト

### 実装方針

ビルド前にローカルで実行し、WordPressから全データをJSONファイルとして`data/`ディレクトリに保存する。

### ディレクトリ構成

```
nordic-works/
├ data/                           # ← エクスポート結果（Git管理）
│  ├ posts.json
│  ├ services.json
│  ├ careers.json
│  ├ features.json
│  ├ authors.json
│  ├ industries.json
│  └ topics.json
├ scripts/
│  └ export-wp-data.ts           # エクスポートスクリプト
└ src/
   └ lib/
      └ wordpress.ts             # データ取得関数（dev/prodで切替）
```

### エクスポートスクリプト例

```typescript
// scripts/export-wp-data.ts
import fs from 'fs/promises';
import path from 'path';

const WP_URL = 'http://nordic-works.local/wp-json/wp/v2';
const DATA_DIR = path.join(process.cwd(), 'data');

const endpoints = [
  { name: 'posts', path: 'posts' },
  { name: 'services', path: 'service' },
  { name: 'careers', path: 'career' },
  { name: 'features', path: 'feature' },
  { name: 'authors', path: 'author_profile' },
  { name: 'industries', path: 'industry' },
  { name: 'topics', path: 'topic' },
];

async function fetchAll(endpoint: string) {
  const results = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${WP_URL}/${endpoint}?_embed&per_page=${perPage}&page=${page}`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 400) break; // ページオーバー
      throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
    }

    const data = await res.json();
    results.push(...data);

    if (data.length < perPage) break;
    page++;
  }

  return results;
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  for (const { name, path: endpoint } of endpoints) {
    console.log(`📦 Exporting ${name}...`);
    try {
      const data = await fetchAll(endpoint);
      await fs.writeFile(
        path.join(DATA_DIR, `${name}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`  ✅ ${data.length} items saved to data/${name}.json`);
    } catch (error) {
      console.error(`  ❌ Failed: ${error}`);
    }
  }

  console.log('✨ Export completed!');
}

main();
```

### package.jsonへの追加

```json
{
  "scripts": {
    "export-wp": "tsx scripts/export-wp-data.ts",
    "build:prod": "pnpm run export-wp && pnpm run build"
  }
}
```

### 使い方

```bash
# 1. ローカルWordPressを起動

# 2. データをエクスポート
pnpm run export-wp

# 3. 確認
ls data/
# posts.json  services.json  careers.json  features.json  ...

# 4. コミット&プッシュ（Vercelが自動デプロイ）
git add data/
git commit -m "chore: update WP data export"
git push
```

---

## データ取得関数の二重化

開発時は WordPress API から、本番ビルド時は JSON ファイルから取得する設計。

### 環境変数

```bash
# .env.local（開発時）
DATA_SOURCE=api
WORDPRESS_API_URL=http://nordic-works.local/wp-json

# .env.production（Vercel上）
DATA_SOURCE=static
```

### 取得関数の実装例

```typescript
// src/lib/wordpress.ts
const USE_STATIC = process.env.DATA_SOURCE === 'static';

export async function getPosts() {
  if (USE_STATIC) {
    const data = await import('@/../data/posts.json');
    return data.default;
  }

  const res = await fetch(`${process.env.WORDPRESS_API_URL}/wp/v2/posts?_embed`, {
    next: { revalidate: 3600, tags: ['posts'] },
  });
  return res.json();
}

export async function getPostBySlug(slug: string) {
  if (USE_STATIC) {
    const data = await import('@/../data/posts.json');
    return data.default.find((p: any) => p.slug === slug) || null;
  }

  const res = await fetch(
    `${process.env.WORDPRESS_API_URL}/wp/v2/posts?slug=${slug}&_embed`,
    { next: { revalidate: 3600, tags: [`post-${slug}`] } }
  );
  const posts = await res.json();
  return posts[0] || null;
}
```

この設計により、**同じコードベースで開発時はライブ取得、本番では静的データ**を扱える。

---

## メディア（画像）の取り扱い

最大の課題：WordPressにアップロードした画像は`http://nordic-works.local/wp-content/uploads/...`のURLになるが、これは本番から見えない。

### 対応策の選択肢

#### 案A: 画像をリポジトリにコミット（推奨）

```bash
# エクスポートスクリプトを拡張して画像もダウンロード
scripts/download-media.ts → public/wp-uploads/ に保存
```

JSONデータ内の画像URLを `https://nordic-works.local/wp-content/uploads/2026/05/hero.jpg` → `/wp-uploads/2026/05/hero.jpg` に書き換え。

- メリット: シンプル、Vercel無料枠で動く
- デメリット: リポジトリサイズが膨らむ（画像数が多い場合）

#### 案B: Cloudinary等の画像ホスティングサービス

WordPressにアップロードした画像をCloudinaryにも同期。本番ではCloudinary URLを参照。

- メリット: リポジトリが軽い、最適化も自動
- デメリット: 設定が増える

**ポートフォリオ用途なら案A（リポジトリ同梱）が現実的**。30〜50枚程度なら問題ない。

### download-media.ts のサンプル

```typescript
// scripts/download-media.ts
import fs from 'fs/promises';
import path from 'path';

const WP_URL = 'http://nordic-works.local/wp-json/wp/v2';
const MEDIA_DIR = path.join(process.cwd(), 'public', 'wp-uploads');

async function downloadMedia() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });

  const res = await fetch(`${WP_URL}/media?per_page=100`);
  const media = await res.json();

  for (const item of media) {
    const url = item.source_url;
    const filename = path.basename(new URL(url).pathname);
    const filePath = path.join(MEDIA_DIR, filename);

    const imageRes = await fetch(url);
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    console.log(`📸 Downloaded ${filename}`);
  }
}

downloadMedia();
```

JSONエクスポート時に画像URLを書き換える処理も追加すること。

---

## デモ動画の作成計画

公開URLで体験できない以下の機能は、動画で証明する。

### 動画1: 下書きプレビュー機能（2〜3分）

**録画内容**
1. WordPress管理画面で新規記事作成
2. 下書き保存
3. 「プレビュー」ボタンクリック
4. Next.js側でプレビューモードが有効になり、下書き記事が表示される
5. プレビューバーの「プレビュー終了」ボタンクリック
6. 通常モードに戻ることを確認

**録画ツール**: macOSなら標準のスクリーン録画、Windowsならゲームバー or OBS Studio

### 動画2: On-demand Revalidation（2〜3分）

**録画内容**
1. WordPress管理画面で既存記事を更新
2. 「更新」ボタンクリック
3. Next.js側のページをリロード
4. 即座に更新内容が反映されることを確認
5. 開発者ツールでネットワークを表示し、revalidate APIが叩かれていることを示す

### 動画3: Algolia全文検索（1〜2分・任意）

これは公開URLでも動作するが、検索機能のアピールとして1分程度の動画を作っておくと良い。

### 動画のホスティング

- **YouTube限定公開**: 無料、リンク共有可
- **Vimeo**: 無料枠あり、見た目がきれい
- **Loom**: ビジネス向け、ナレーション込みで撮りやすい

**おすすめ**: YouTube限定公開。READMEとポートフォリオページに埋め込み可能。

### READMEへの埋め込み

```markdown
## 動的機能のデモ

公開URLでは Local WordPress の制約上、以下の機能は触れません。
代わりにローカル環境での動作を録画したデモ動画をご覧ください。

### 下書きプレビュー機能
[![Preview Demo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://youtu.be/VIDEO_ID)

### On-demand Revalidation
[![Revalidation Demo](https://img.youtube.com/vi/VIDEO_ID2/0.jpg)](https://youtu.be/VIDEO_ID2)
```

---

## 採用面接でこの構成を聞かれたときの答え方

**質問例**: 「WordPressは本番でどう運用していますか？」

**模範回答**:

> ポートフォリオとしての公開コストを抑える判断で、WordPressはローカル運用にしています。ビルド時にWP→JSONエクスポートしてVercelに静的デプロイする構成です。
> 
> ただし、Headless WPの真価である**下書きプレビュー機能とOn-demand Revalidation**はローカル環境で完全に動作する状態を作り込みました。これらはデモ動画でご覧いただけます。
> 
> 実案件では本番WordPressをXserver等にホスティングする想定で、データ移行手順とCORS設定の検証も済ませています。必要であれば、本番運用への切替もすぐに対応可能です。

この回答で伝わるポイント:
- コスト判断を意識的にしている
- 制約の中でベストを尽くしている
- 本番移行の知識もある
- デモ動画で証明している

---

## 将来のアップグレードパス

ポートフォリオ運用の中で「やはり本番WPもホスティングしたい」となった場合、以下の手順で移行可能（所要時間: 1〜2時間）:

1. レンタルサーバー契約（Xserver等、月600〜1000円）
2. ドメイン取得（任意、なくても可）
3. WordPressインストール
4. プラグイン群インストール（ACF Pro、WPGraphQL等）
5. **All-in-One WP Migration**でローカルWPからエクスポート
6. レンタルサーバーのWordPressにインポート
7. Next.js側の環境変数を本番WP URLに更新
8. `DATA_SOURCE=api`に変更してVercel再デプロイ
9. CORS設定 + プレビュー/Revalidation の動作確認

データ取得関数の二重化設計のおかげで、コード変更ほぼなしで移行可能。

---

## 関連ドキュメント

- 機能の実装詳細: `06-features.md`
- ポートフォリオ化: `08-portfolio-prep.md`
- Week 8の作業: `07-roadmap.md`
