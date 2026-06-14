/**
 * 記事一覧ページ — /articles
 *
 * 1ページ目はリード記事を大きく見せ、残りをグリッドで一覧。
 * 先頭は共通の扉ヘッダー（PageHero）＋トピックのチップで回遊性を持たせる。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/wordpress';
import {
	getFeaturedImage,
	getTerms,
	stripHtml,
	formatDate,
	BLUR_DATA_URL,
	ARTICLES_PER_PAGE,
} from '@/lib/utils';
import { collectTopics, localizeTermName } from '@/lib/taxonomy';
import { ArticleCard } from '@/components/media/ArticleCard';
import { ArticleListIntro } from '@/components/media/ArticleListIntro';
import { Pagination } from '@/components/common/Pagination';
import { PageHero } from '@/components/common/PageHero';

// ISR: 1時間ごとに再生成（docs/06-features.md の方針）
export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'articles' });
	return {
		title: t('title'),
		description: t('metaDescription'),
		alternates: localeAlternates('/articles'),
	};
}

export default async function ArticlesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const dateLocale = locale === 'en' ? 'en' : 'ja';

	const t = await getTranslations('articles');
	const tNav = await getTranslations('nav');
	const posts = await getPosts();

	const totalPages = Math.max(1, Math.ceil(posts.length / ARTICLES_PER_PAGE));
	const topics = collectTopics(posts);

	// 1ページ目: リード1本（大）＋残りをグリッド。合計は ARTICLES_PER_PAGE 件。
	const leadPost = posts[0];
	const leadImage = leadPost ? getFeaturedImage(leadPost) : null;
	const leadTopic = leadPost ? getTerms(leadPost, 'topic')[0] : undefined;
	const gridPosts = posts.slice(1, ARTICLES_PER_PAGE);

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description')}
				anchors={[{ no: '01', label: t('title'), href: '#articles-list' }]}
				bottomLink={{ href: '/features', label: tNav('features') }}
			/>

			<section
				id="articles-list"
				className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20"
			>
				<ArticleListIntro topics={topics} locale={locale} />

				{posts.length === 0 ? (
					<p className="text-sm text-red-600">{t('fetchError')}</p>
				) : (
					<>
						{/* リード記事 */}
						{leadPost && (
							<Link
								href={`/articles/${leadPost.slug}`}
								className="group mb-12 block"
							>
								<div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:aspect-[21/9]">
									{leadImage && (
										<Image
											src={leadImage.source_url}
											alt={leadImage.alt_text || leadPost.title.rendered}
											fill
											sizes="(max-width: 1152px) 100vw, 1152px"
											placeholder="blur"
											blurDataURL={BLUR_DATA_URL}
											className="object-cover transition-transform duration-300 group-hover:scale-105"
											priority
										/>
									)}
								</div>
								<div className="mt-5">
									{leadTopic && (
										<p className="text-xs uppercase tracking-wide text-accent-text">
											{localizeTermName(leadTopic.name, locale)}
										</p>
									)}
									<h2 className="mt-1 text-2xl font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100 sm:text-3xl">
										{leadPost.title.rendered}
									</h2>
									<p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
										{stripHtml(leadPost.excerpt.rendered)}
									</p>
									<time
										dateTime={leadPost.date}
										className="mt-2 block text-xs text-zinc-400"
									>
										{formatDate(leadPost.date, dateLocale)}
									</time>
								</div>
							</Link>
						)}

						{/* 残りの記事グリッド */}
						{gridPosts.length > 0 && (
							<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
								{gridPosts.map((post) => (
									<ArticleCard key={post.id} post={post} />
								))}
							</div>
						)}

						<Pagination
							currentPage={1}
							totalPages={totalPages}
							basePath="/articles"
						/>
					</>
				)}
			</section>
		</main>
	);
}
