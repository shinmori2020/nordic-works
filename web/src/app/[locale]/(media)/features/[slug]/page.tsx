/**
 * 特集詳細ページ — /features/[slug]
 *
 * 特集のリード文・カバー画像・本文に加え、ACF relationship フィールドの
 * 関連記事（related_articles）をカード形式で表示する。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeatureBySlug, getFeatures, getPostsByIds } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';
import { getFeaturedImage, stripHtml, formatDate, BLUR_DATA_URL } from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

// ISR: 特集は記事より更新頻度が高いため1時間
export const revalidate = 3600;

export async function generateStaticParams() {
	const features = await getFeatures();
	return features.map((feature) => ({ slug: feature.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const feature = await getFeatureBySlug(slug);
	if (!feature) {
		return { title: 'Not found' };
	}
	return {
		title: feature.title.rendered,
		description: feature.acf?.lead_text
			? stripHtml(feature.acf.lead_text).slice(0, 120)
			: stripHtml(feature.content.rendered).slice(0, 120),
		alternates: localeAlternates(`/features/${feature.slug}`),
	};
}

export default async function FeatureDetailPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	setRequestLocale(locale);
	const feature = await getFeatureBySlug(slug);

	if (!feature) {
		notFound();
	}

	const t = await getTranslations('features');
	const dateLocale = locale === 'en' ? 'en' : 'ja';
	const acf = feature.acf;

	// カバー画像はアイキャッチ画像（_embedded）から取得する。
	const image = getFeaturedImage(feature);

	// ACF relationship フィールドは投稿ID配列で返るため、実体の記事に解決する。
	const relatedIds = Array.isArray(acf?.related_articles) ? acf.related_articles : [];
	const relatedArticles = await getPostsByIds(relatedIds);

	// 掲載期間（開始のみ・両方など、設定状況に応じて整形）
	const periodStart = acf?.published_period_start
		? formatDate(acf.published_period_start, dateLocale)
		: '';
	const periodEnd = acf?.published_period_end
		? formatDate(acf.published_period_end, dateLocale)
		: '';
	const period = periodStart && periodEnd
		? `${periodStart} 〜 ${periodEnd}`
		: periodStart || periodEnd;

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: 'Features', href: '/features' },
					{ label: stripHtml(feature.title.rendered) },
				]}
			/>

			<article className="mt-6">
				{/* ヘッダー */}
				<p className="text-xs uppercase tracking-widest text-accent-text">Feature</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{feature.title.rendered}
				</h1>
				{period && (
					<p className="mt-2 text-sm text-zinc-500">{t('period', { period })}</p>
				)}
				{acf?.lead_text && (
					<p className="mt-3 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						{acf.lead_text}
					</p>
				)}

				{/* カバー画像 */}
				{image && (
					<div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
						<Image
							src={image.source_url}
							alt={image.alt_text || feature.title.rendered}
							fill
							sizes="(max-width: 896px) 100vw, 896px"
							placeholder="blur"
							blurDataURL={BLUR_DATA_URL}
							className="object-cover"
							priority
						/>
					</div>
				)}

				{/* 本文 */}
				{feature.content.rendered && (
					<div
						className="article-body mt-10 text-zinc-800 dark:text-zinc-200"
						dangerouslySetInnerHTML={{ __html: feature.content.rendered }}
					/>
				)}

				{/* 関連記事 */}
				{relatedArticles.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t('articlesInFeature')}</h2>
						<div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2">
							{relatedArticles.map((post) => (
								<ArticleCard key={post.id} post={post} />
							))}
						</div>
					</section>
				)}
			</article>
		</main>
	);
}
