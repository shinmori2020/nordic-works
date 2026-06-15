/**
 * 著者詳細ページ — /authors/[slug]
 *
 * 著者プロフィール（写真・肩書・経歴・SNS）と、その著者が執筆した記事一覧を表示する。
 * 著者別の記事は、全記事を取得して ACF の author_profile で絞り込む。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAuthorBySlug, getAuthors, getPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';
import { getFeaturedImage } from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { SlugPageProps } from '@/types/wordpress';

// ISR: 著者情報は更新頻度が低いため24時間
export const revalidate = 86400;

export async function generateStaticParams() {
	const authors = await getAuthors();
	return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const author = await getAuthorBySlug(slug);
	if (!author) {
		return { title: '執筆者が見つかりません' };
	}
	return {
		title: author.title.rendered,
		description:
			author.acf?.bio ?? `${author.title.rendered} が執筆した記事の一覧。`,
		alternates: localeAlternates(`/authors/${author.slug}`),
	};
}

export default async function AuthorDetailPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	setRequestLocale(locale);
	const author = await getAuthorBySlug(slug);

	if (!author) {
		notFound();
	}

	const t = await getTranslations('authors');
	const acf = author.acf;
	// 顔写真は ACF photo ではなくアイキャッチ画像（_embedded）から取得する。
	const photo = getFeaturedImage(author);

	// この著者が執筆した記事を抽出する。
	// ACF post_object フィールド author_profile は REST 上では著者の投稿ID。
	const allPosts = await getPosts();
	const authoredPosts = allPosts.filter(
		(post) => post.acf?.author_profile === author.id,
	);

	// SNS / Web リンク（設定されているものだけ表示）
	const links = [
		{ label: 'X (Twitter)', url: acf?.twitter_url },
		{ label: 'LinkedIn', url: acf?.linkedin_url },
		{ label: 'Website', url: acf?.website_url },
	].filter((l): l is { label: string; url: string } => Boolean(l.url));

	return (
		<main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
			<Breadcrumbs
				items={[
					{ label: 'Authors', href: '/authors' },
					{ label: author.title.rendered },
				]}
			/>

			{/* プロフィール */}
			<section className="mt-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
				<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
					{photo ? (
						<Image
							src={photo.source_url}
							alt={photo.alt_text || author.title.rendered}
							fill
							sizes="112px"
							className="object-cover"
							priority
						/>
					) : (
						<div className="flex h-full items-center justify-center text-xs text-zinc-300 dark:text-zinc-600">
							No Photo
						</div>
					)}
				</div>

				<div className="mt-4 sm:mt-0">
					<p className="text-xs uppercase tracking-widest text-accent-text">
						{t('detailLabel')}
					</p>
					<h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
						{author.title.rendered}
					</h1>
					{acf?.position && (
						<p className="mt-1 text-sm text-zinc-500">{acf.position}</p>
					)}
					{acf?.bio && (
						<p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{acf.bio}</p>
					)}
					{links.length > 0 && (
						<ul className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
							{links.map((link) => (
								<li key={link.label}>
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-zinc-600 dark:text-zinc-400 underline underline-offset-2 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
									>
										{link.label} ↗
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			{/* 執筆記事 */}
			<section className="mt-14">
				<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('postsByAuthor', { name: author.title.rendered })}
				</h2>
				{authoredPosts.length === 0 ? (
					<p className="mt-4 text-sm text-zinc-500">
						{t('noPostsByAuthor')}
					</p>
				) : (
					<div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2">
						{authoredPosts.map((post) => (
							<ArticleCard key={post.id} post={post} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
