/**
 * 特集詳細ページ — /features/[slug]
 *
 * 特集のリード文・カバー画像・本文に加え、ACF relationship フィールドの
 * 関連記事（related_articles）をカード形式で表示する。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFeatureBySlug, getFeatures, getPostsByIds } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';
import { getFeaturedImage, stripHtml, formatDate } from '@/lib/utils';
import type { SlugPageProps } from '@/types/wordpress';

// ISR: 特集は記事より更新頻度が高いため1時間
export const revalidate = 3600;

export async function generateStaticParams() {
	const features = await getFeatures();
	return features.map((feature) => ({ slug: feature.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const feature = await getFeatureBySlug(slug);
	if (!feature) {
		return { title: '特集が見つかりません' };
	}
	return {
		title: feature.title.rendered,
		description: feature.acf?.lead_text
			? stripHtml(feature.acf.lead_text).slice(0, 120)
			: stripHtml(feature.content.rendered).slice(0, 120),
		alternates: { canonical: `/features/${feature.slug}` },
	};
}

export default async function FeatureDetailPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const feature = await getFeatureBySlug(slug);

	if (!feature) {
		notFound();
	}

	const acf = feature.acf;

	// カバー画像はアイキャッチ画像（_embedded）から取得する。
	const image = getFeaturedImage(feature);

	// ACF relationship フィールドは投稿ID配列で返るため、実体の記事に解決する。
	const relatedIds = Array.isArray(acf?.related_articles) ? acf.related_articles : [];
	const relatedArticles = await getPostsByIds(relatedIds);

	// 掲載期間（開始のみ・両方など、設定状況に応じて整形）
	const periodStart = acf?.published_period_start
		? formatDate(acf.published_period_start)
		: '';
	const periodEnd = acf?.published_period_end
		? formatDate(acf.published_period_end)
		: '';
	const period = periodStart && periodEnd
		? `${periodStart} 〜 ${periodEnd}`
		: periodStart || periodEnd;

	return (
		<main className="mx-auto max-w-4xl px-6 py-12">
			<Link
				href="/features"
				className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
			>
				← 特集一覧に戻る
			</Link>

			<article className="mt-6">
				{/* ヘッダー */}
				<p className="text-xs uppercase tracking-widest text-zinc-500">Feature</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
					{feature.title.rendered}
				</h1>
				{period && (
					<p className="mt-2 text-sm text-zinc-500">掲載期間: {period}</p>
				)}
				{acf?.lead_text && (
					<p className="mt-3 text-lg leading-relaxed text-zinc-600">
						{acf.lead_text}
					</p>
				)}

				{/* カバー画像 */}
				{image && (
					<div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
						<Image
							src={image.source_url}
							alt={image.alt_text || feature.title.rendered}
							fill
							sizes="(max-width: 896px) 100vw, 896px"
							className="object-cover"
							priority
						/>
					</div>
				)}

				{/* 本文 */}
				{feature.content.rendered && (
					<div
						className="article-body mt-10 text-zinc-800"
						dangerouslySetInnerHTML={{ __html: feature.content.rendered }}
					/>
				)}

				{/* 関連記事 */}
				{relatedArticles.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900">この特集の記事</h2>
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
