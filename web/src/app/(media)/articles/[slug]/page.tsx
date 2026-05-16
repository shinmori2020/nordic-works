/**
 * 記事詳細ページ — /articles/[slug]
 *
 * 個別記事の本文・著者・読了時間・アイキャッチ・タクソノミーを表示する。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/lib/wordpress';
import { getFeaturedImage, getTerms, stripHtml, formatDate } from '@/lib/utils';
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
		return { title: '記事が見つかりません | Nordic Works' };
	}
	return {
		title: `${post.title.rendered} | Nordic Works`,
		description: stripHtml(post.excerpt.rendered).slice(0, 120),
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

	// ACF post_object フィールド。設定済みならオブジェクトで返る。
	const author =
		post.acf?.author_profile && typeof post.acf.author_profile === 'object'
			? post.acf.author_profile
			: null;

	return (
		<main className="mx-auto max-w-3xl px-6 py-12">
			<Link
				href="/articles"
				className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
			>
				← 記事一覧に戻る
			</Link>

			<article className="mt-6">
				{/* 業界タグ */}
				{industries.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{industries.map((term) => (
							<span
								key={term.id}
								className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
							>
								{term.name}
							</span>
						))}
					</div>
				)}

				{/* タイトル */}
				<h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-900">
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
						<div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
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

				{/* 本文。WordPress の content.rendered は HTML 文字列。
				    自社管理コンテンツのため dangerouslySetInnerHTML を使用。 */}
				<div
					className="article-body mt-8 text-zinc-800"
					dangerouslySetInnerHTML={{ __html: post.content.rendered }}
				/>

				{/* トピックタグ */}
				{topics.length > 0 && (
					<div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-200 pt-6">
						{topics.map((term) => (
							<span
								key={term.id}
								className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
							>
								#{term.name}
							</span>
						))}
					</div>
				)}

				{/* 著者プロフィール */}
				{author && (
					<aside className="mt-8 rounded-lg bg-zinc-50 p-5">
						<p className="text-xs uppercase tracking-wide text-zinc-400">著者</p>
						<p className="mt-1 font-semibold text-zinc-900">{author.title.rendered}</p>
						{author.acf?.position && (
							<p className="text-sm text-zinc-500">{author.acf.position}</p>
						)}
						{author.acf?.bio && (
							<p className="mt-2 text-sm leading-relaxed text-zinc-700">{author.acf.bio}</p>
						)}
					</aside>
				)}
			</article>
		</main>
	);
}
