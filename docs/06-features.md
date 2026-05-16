# 06. 機能の実装方針

このドキュメントでは、通常WPでは原理的に難しい・面倒な機能を中心に、各機能の実装方針を記載する。

---

## 1. プレビュー機能（draftMode）

### 概要

WordPress管理画面の「プレビュー」ボタンを押すと、Next.js側で下書き状態の記事を表示できる仕組み。通常WPでは自動だが、Headlessでは自前実装が必要。

### 仕組み

```
[WordPress 管理画面]
プレビューボタンクリック
    ↓
preview_post_link フィルターでURL書き換え
    ↓
Next.jsの /api/preview?secret=xxx&id=yyy&slug=zzz&type=post に遷移
    ↓
[Next.js]
secret token 検証
    ↓
draftMode().enable()
    ↓
対象ページにリダイレクト
    ↓
ページコンポーネントが draftMode 状態を判定して下書き含むデータを取得
```

### 対象コンテンツ

post, feature, service, career の全てで動作させる。

### Next.js側実装

```typescript
// src/app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'post';

  // secret token検証
  if (secret !== process.env.WORDPRESS_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  // draftMode有効化
  (await draftMode()).enable();

  // 投稿タイプに応じてリダイレクト先を決定
  const pathMap: Record<string, string> = {
    post: `/articles/${slug}`,
    feature: `/features/${slug}`,
    service: `/services/${slug}`,
    career: `/careers/${slug}`,
  };

  redirect(pathMap[type] || `/articles/${slug}`);
}
```

```typescript
// src/app/api/exit-preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  (await draftMode()).disable();
  redirect('/');
}
```

### WordPress側実装

```php
// functions.php
function nordic_set_preview_link($preview_link, $post) {
    $frontend_url = 'http://localhost:3000'; // 本番では環境変数等で管理
    $secret = 'your-secret-token-here'; // .env.localと一致させる

    return sprintf(
        '%s/api/preview?secret=%s&slug=%s&type=%s',
        $frontend_url,
        $secret,
        $post->post_name,
        $post->post_type
    );
}
add_filter('preview_post_link', 'nordic_set_preview_link', 10, 2);
```

### データ取得関数の対応

```typescript
// src/lib/wordpress.ts
import { draftMode } from 'next/headers';

export async function getPostBySlug(slug: string) {
  const { isEnabled: isDraft } = await draftMode();

  const status = isDraft ? 'draft,publish' : 'publish';
  const url = `${process.env.WORDPRESS_API_URL}/wp/v2/posts?slug=${slug}&status=${status}&_embed`;

  const res = await fetch(url, {
    // プレビュー時はキャッシュしない
    cache: isDraft ? 'no-store' : 'force-cache',
    next: isDraft ? undefined : { tags: ['posts', `post-${slug}`] },
  });

  if (!res.ok) return null;

  const posts = await res.json();
  return posts[0] || null;
}
```

### 認証付きステータス取得の注意

draftモードを取得するにはWordPressの認証が必要。Application Passwordsを使うのが現実的:

```typescript
const headers = isDraft
  ? {
      Authorization: 'Basic ' + Buffer.from(
        `${process.env.WP_USERNAME}:${process.env.WP_APPLICATION_PASSWORD}`
      ).toString('base64'),
    }
  : {};
```

---

## 2. ISR（Incremental Static Regeneration）

### 概要

ページを静的生成しつつ、指定した時間ごとに自動で再生成する仕組み。表示は爆速のまま、コンテンツの新しさも担保できる。

### Next.js 15での重要な注意

**Next.js 15からfetchはデフォルトでキャッシュされなくなった**。Next.js 14時代の「自動キャッシュ」前提のコードはそのままだとパフォーマンスが落ちるので注意。

```typescript
// ❌ Next.js 14時代の感覚（v15ではキャッシュされない）
const res = await fetch(url);

// ✅ v15で明示的にISR
const res = await fetch(url, {
  next: { revalidate: 3600 },
});

// ✅ v15で永続キャッシュ（SSG相当）
const res = await fetch(url, {
  cache: 'force-cache',
});
```

### ページごとのrevalidate設定方針

| ページ | revalidate | 理由 |
|--------|-----------|------|
| トップページ | 3600（1時間） | 最新記事の更新頻度に合わせる |
| 記事一覧 | 3600（1時間） | 同上 |
| 記事詳細 | 86400（24時間） | 個別記事は更新頻度が低い |
| サービス一覧・詳細 | 86400（24時間） | 更新が稀 |
| 採用情報 | 86400（24時間） | 更新が稀 |
| 著者プロフィール | 86400（24時間） | 更新が稀 |
| 会社概要 | force-cache | ほぼ静的 |

### ページレベルの設定例

```typescript
// src/app/articles/page.tsx
export const revalidate = 3600;

export default async function ArticlesPage() {
  // ...
}
```

### fetch個別設定例

```typescript
const res = await fetch(`${apiUrl}/wp/v2/posts`, {
  next: {
    revalidate: 3600,
    tags: ['posts'],
  },
});
```

`tags`を設定するとOn-demand Revalidationでタグ単位の再検証が可能になる。

---

## 3. On-demand Revalidation

### 概要

WordPress側で記事を更新した瞬間に、Next.js側のキャッシュをクリアして即時反映する仕組み。ISRの「指定時間後に更新」を超えて、リアルタイム更新を実現できる。

### 仕組み

```
[WordPress]
記事公開・更新
    ↓
save_post / transition_post_status フック発火
    ↓
カスタムwebhook（投稿IDと種別を送信）
    ↓
[Next.js]
/api/revalidate エンドポイント受信
    ↓
secret token検証
    ↓
revalidateTag('posts') + revalidatePath(`/articles/${slug}`)
    ↓
キャッシュクリア・即時反映
```

### Next.js側実装

```typescript
// src/app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postType, slug } = body;

    // 投稿タイプごとのキャッシュタグとパスをクリア
    const pathMap: Record<string, string[]> = {
      post: [`/articles/${slug}`, '/articles', '/'],
      feature: [`/features/${slug}`, '/features', '/'],
      service: [`/services/${slug}`, '/services'],
      career: [`/careers/${slug}`, '/careers'],
    };

    const tagMap: Record<string, string[]> = {
      post: ['posts', `post-${slug}`],
      feature: ['features', `feature-${slug}`],
      service: ['services', `service-${slug}`],
      career: ['careers', `career-${slug}`],
    };

    // パスを再検証
    (pathMap[postType] || []).forEach(path => revalidatePath(path));

    // タグを再検証
    (tagMap[postType] || []).forEach(tag => revalidateTag(tag));

    return NextResponse.json({ revalidated: true, postType, slug });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}
```

### WordPress側実装

```php
// functions.php
function nordic_trigger_revalidate($post_id) {
    // 自動保存・リビジョンは除外
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
        return;
    }

    $post = get_post($post_id);
    if (!$post || $post->post_status !== 'publish') {
        return;
    }

    $allowed_types = ['post', 'service', 'career', 'feature', 'author_profile'];
    if (!in_array($post->post_type, $allowed_types)) {
        return;
    }

    $frontend_url = 'http://localhost:3000'; // 本番では環境変数等で管理
    $secret = 'your-revalidate-secret-here';

    wp_remote_post($frontend_url . '/api/revalidate', [
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Revalidate-Secret' => $secret,
        ],
        'body' => wp_json_encode([
            'postType' => $post->post_type,
            'slug' => $post->post_name,
        ]),
        'blocking' => false, // 非同期で投げて待たない
        'timeout' => 5,
    ]);
}
add_action('save_post', 'nordic_trigger_revalidate');
add_action('transition_post_status', function($new_status, $old_status, $post) {
    if ($new_status === 'publish' || $old_status === 'publish') {
        nordic_trigger_revalidate($post->ID);
    }
}, 10, 3);
```

---

## 4. マルチデータソース統合

### Algolia（全文検索）

#### 概要

WordPress単独では難しい高速・高精度な全文検索を実現。WP更新時に自動でAlgoliaにインデックスを送る。

#### WordPress側: インデックス送信

```php
// functions.php
function nordic_index_to_algolia($post_id) {
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) return;

    $post = get_post($post_id);
    if (!$post || $post->post_status !== 'publish') return;

    $allowed_types = ['post', 'feature', 'service'];
    if (!in_array($post->post_type, $allowed_types)) return;

    // Algolia REST APIに直接POST、または公式PHPライブラリを使用
    $app_id = 'YOUR_APP_ID';
    $admin_key = 'YOUR_ADMIN_KEY';
    $index_name = 'nordic_works';

    $record = [
        'objectID' => $post->post_type . '_' . $post_id,
        'postType' => $post->post_type,
        'title' => $post->post_title,
        'slug' => $post->post_name,
        'excerpt' => wp_strip_all_tags($post->post_excerpt),
        'content' => wp_strip_all_tags($post->post_content),
        'date' => $post->post_date,
        'industries' => wp_get_post_terms($post_id, 'industry', ['fields' => 'names']),
        'topics' => wp_get_post_terms($post_id, 'topic', ['fields' => 'names']),
    ];

    wp_remote_post(
        "https://{$app_id}.algolia.net/1/indexes/{$index_name}",
        [
            'headers' => [
                'X-Algolia-API-Key' => $admin_key,
                'X-Algolia-Application-Id' => $app_id,
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode($record),
        ]
    );
}
add_action('save_post', 'nordic_index_to_algolia');
```

#### Next.js側: 検索UI

```typescript
// src/lib/algolia.ts
import { algoliasearch } from 'algoliasearch';

export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export async function searchArticles(query: string) {
  const { results } = await searchClient.search({
    requests: [
      {
        indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
        query,
        attributesToHighlight: ['title', 'excerpt'],
        hitsPerPage: 20,
      },
    ],
  });
  return results[0];
}
```

検索UIは自前実装でもInstantSearchライブラリでも可。自前のほうがNext.js 15のServer Componentsと相性が良く、SEOにも有利。

### Resend（お問い合わせフォーム）

#### Server Actionsでフォーム受信

```typescript
// src/app/contact/actions.ts
'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import ContactEmail from '@/emails/contact-email';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  company: z.string().optional(),
  message: z.string().min(10, 'メッセージは10文字以上で入力してください'),
});

export async function submitContact(formData: FormData) {
  const validated = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    message: formData.get('message'),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, company, message } = validated.data;

  // 運営側への通知メール
  await resend.emails.send({
    from: process.env.CONTACT_EMAIL_FROM!,
    to: process.env.CONTACT_EMAIL_TO!,
    subject: `[Nordic Works] お問い合わせ: ${name}様`,
    react: ContactEmail({ name, email, company, message }),
  });

  // 送信者への自動返信
  await resend.emails.send({
    from: process.env.CONTACT_EMAIL_FROM!,
    to: email,
    subject: 'お問い合わせを受け付けました - Nordic Works',
    react: ContactEmail({ name, email, company, message, isAutoReply: true }),
  });

  return { success: true };
}
```

### Vercel Analytics

`@vercel/analytics`と`@vercel/speed-insights`をルートレイアウトに追加するだけ。

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 5. リッチUX

### スクロール連動アニメーション

```typescript
// src/components/media/ArticleCard.tsx
'use client';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export function ArticleCard({ article }: { article: Article }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* カード内容 */}
    </motion.div>
  );
}
```

### 自動目次（Table of Contents）

記事のh2/h3を抽出してフローティング表示。本文内に`id`を自動付与。

```typescript
// src/lib/toc.ts
export function extractToc(html: string) {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/g;
  const matches = Array.from(html.matchAll(regex));
  return matches.map(([, level, text]) => ({
    level: parseInt(level),
    text: text.replace(/<[^>]+>/g, ''),
    id: text.toLowerCase().replace(/[^a-z0-9ぁ-ん亜-熙ァ-ヴ\s]/g, '').replace(/\s+/g, '-'),
  }));
}
```

### 読了時間表示

```typescript
import readingTime from 'reading-time';

const stats = readingTime(post.content.rendered);
// stats.minutes → 5.2
// stats.text → "5 min read"
```

### ダークモード

```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Tailwindのdarkバリアントを使ったスタイル設計が必要。`tailwind.config.ts`で`darkMode: 'class'`を設定。

---

## 6. 画像最適化

### remotePatterns設定（重要）

`next.config.ts`でWordPressドメインを許可しないと、Next.js Imageは動作しない。

```typescript
images: {
  remotePatterns: [
    { protocol: 'http', hostname: 'nordic-works.local', pathname: '/wp-content/uploads/**' },
    { protocol: 'https', hostname: 'your-wp-domain.com', pathname: '/wp-content/uploads/**' },
  ],
}
```

### Next.js Imageコンポーネント

WPの`_embed`でメディア情報を取得し、width/heightを正しく渡す。

```typescript
import Image from 'next/image';

const media = post._embedded?.['wp:featuredmedia']?.[0];

<Image
  src={media.source_url}
  alt={media.alt_text || post.title.rendered}
  width={media.media_details.width}
  height={media.media_details.height}
  className="object-cover"
  priority={isAboveTheFold}
/>
```

---

## 7. SEO

### 動的メタタグ

```typescript
// src/app/articles/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title.rendered,
    description: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
    openGraph: {
      title: post.title.rendered,
      description: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
      images: [post._embedded?.['wp:featuredmedia']?.[0]?.source_url],
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}
```

### 構造化データ（JSON-LD）

Article, Organization, BreadcrumbListをページに応じて出力。

```typescript
// src/components/JsonLd.tsx
export function ArticleJsonLd({ post }: { post: Post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.rendered,
    datePublished: post.date,
    dateModified: post.modified,
    author: { '@type': 'Person', name: post.author_name },
    image: post.featured_image_url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### サイトマップ

`next-sitemap`を導入し、ビルド時に`sitemap.xml`を自動生成。

```bash
pnpm add -D next-sitemap
```

```javascript
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://nordicworks.example.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
};
```

`package.json`に`"postbuild": "next-sitemap"`を追加。

---

## 関連ドキュメント

- 技術スタック詳細: `05-tech-stack.md`
- 実装スケジュール: `07-roadmap.md`
