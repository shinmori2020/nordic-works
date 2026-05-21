/**
 * 記事詳細ページ — /articles/[slug]
 *
 * 個別記事の本文・著者・読了時間・アイキャッチ・タクソノミーを表示する。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts, getAuthorById } from '@/lib/wordpress';
import { getFeaturedImage, getTerms, stripHtml, formatDate } from '@/lib/utils';
import { buildTableOfContents } from '@/lib/toc';
import { SITE_NAME, absoluteUrl } from '@/lib/site';
import { ArticleCard } from '@/components/media/ArticleCard';
import { ReadingProgress } from '@/components/media/ReadingProgress';
import { TableOfContents } from '@/components/media/TableOfContents';
import type { SlugPageProps } from '@/types/wordpress';

// ISR: 個別記事は更新頻度が低いため24時間（docs/06-features.md の方針）
export const revalidate = 86400;

/**
 * ビルド時に全記事の静的パスを生成する。
 * これにより各記事ページが事前レンダリングされる。
 */
export async function generateStaticParams() {
	const posts = await getPosts();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) {
		return { title: '記事が見つかりません' };
	}
	const description = stripHtml(post.excerpt.rendered).slice(0, 120);
	const image = getFeaturedImage(post);
	const canonical = `/articles/${post.slug}`;
	return {
		title: post.title.rendered,
		description,
		alternates: { canonical },
		openGraph: {
			type: 'article',
			title: post.title.rendered,
			description,
			url: canonical,
			publishedTime: post.date,
			modifiedTime: post.modified,
			images: image ? [image.source_url] : undefined,
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title.rendered,
			description,
			images: image ? [image.source_url] : undefined,
		},
	};
}

export default async function ArticleDetailPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const image = getFeaturedImage(post);
	const topics = getTerms(post, 'topic');
	const industries = getTerms(post, 'industry');

	// 本文に見出し id を注入し、目次データを取り出す
	const { html: bodyHtml, headings } = buildTableOfContents(post.content.rendered);

	// ACF post_object フィールド author_profile は著者の投稿ID。実体に解決する。
	const author =
		typeof post.acf?.author_profile === 'number'
			? await getAuthorById(post.acf.author_profile)
			: null;

	// 関連記事: 同じトピックを持つ他の記事を最大3件
	const topicIds = topics.map((t) => t.id);
	const allPosts = await getPosts();
	const relatedPosts = allPosts
		.filter(
			(p) =>
				p.id !== post.id &&
				getTerms(p, 'topic').some((t) => topicIds.includes(t.id)),
		)
		.slice(0, 3);

	// schema.org BlogPosting 構造化データ（Google の記事リッチリザルト対応）
	const articleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: stripHtml(post.title.rendered),
		description: stripHtml(post.excerpt.rendered).slice(0, 200),
		datePublished: post.date,
		dateModified: post.modified ?? post.date,
		image: image?.source_url,
		mainEntityOfPage: absoluteUrl(`/articles/${post.slug}`),
		author: author
			? { '@type': 'Person', name: stripHtml(author.title.rendered) }
			: { '@type': 'Organization', name: SITE_NAME },
		publisher: { '@type': 'Organization', name: SITE_NAME },
	};

	return (
		<main className="mx-auto max-w-3xl px-6 py-12">
			<ReadingProgress />
			<script
				type="application/ld+json"
				// 自社管理コンテンツ由来の静的JSONなので XSS リスクなし
				dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
			/>
			<Link
				href="/articles"
				className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
			>
				← 記事一覧に戻る
			</Link>

			<article className="mt-6">
				{/* 業界タグ */}
				{industries.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{industries.map((term) => (
							<Link
								key={term.id}
								href={`/industry/${decodeURIComponent(term.slug)}`}
								className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100"
							>
								{term.name}
							</Link>
						))}
					</div>
				)}

				{/* タイトル */}
				<h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
					{post.title.rendered}
				</h1>

				{/* メタ情報 */}
				<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
					<time dateTime={post.date}>{formatDate(post.date)}</time>
					{typeof post.acf?.reading_time === 'number' && (
						<span>· {post.acf.reading_time}分で読めます</span>
					)}
					{author && <span>· 著者: {author.title.rendered}</span>}
				</div>

				{/* アイキャッチ画像 */}
				{image && (
					<figure className="mt-6">
						<div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
							<Image
								src={image.source_url}
								alt={image.alt_text || post.title.rendered}
								fill
								sizes="(max-width: 768px) 100vw, 768px"
								className="object-cover"
								priority
							/>
						</div>
						{post.acf?.featured_image_caption && (
							<figcaption className="mt-2 text-xs text-zinc-400">
								{post.acf.featured_image_caption}
							</figcaption>
						)}
					</figure>
				)}

				{/* 目次（h2/h3 が2つ以上ある場合のみ表示） */}
				{headings.length >= 2 && (
					<div className="mt-8">
						<TableOfContents headings={headings} />
					</div>
				)}

				{/* 本文。WordPress の content.rendered は HTML 文字列。
				    自社管理コンテンツのため dangerouslySetInnerHTML を使用。
				    bodyHtml は見出しに id を注入済み（目次アンカー用）。 */}
				<div
					className="article-body mt-8 text-zinc-800 dark:text-zinc-200"
					dangerouslySetInnerHTML={{ __html: bodyHtml }}
				/>

				{/* トピックタグ */}
				{topics.length > 0 && (
					<div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-6">
						{topics.map((term) => (
							<Link
								key={term.id}
								href={`/topic/${decodeURIComponent(term.slug)}`}
								className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100"
							>
								#{term.name}
							</Link>
						))}
					</div>
				)}

				{/* 著者プロフィール */}
				{author && (
					<aside className="mt-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-5">
						<p className="text-xs uppercase tracking-wide text-zinc-400">著者</p>
						<p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{author.title.rendered}</p>
						{author.acf?.position && (
							<p className="text-sm text-zinc-500">{author.acf.position}</p>
						)}
						{author.acf?.bio && (
							<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{author.acf.bio}</p>
						)}
					</aside>
				)}
			</article>

			{/* 関連記事 */}
			{relatedPosts.length > 0 && (
				<section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
						関連記事
					</h2>
					<div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{relatedPosts.map((p) => (
							<ArticleCard key={p.id} post={p} />
						))}
					</div>
				</section>
			)}
		</main>
	);
}
