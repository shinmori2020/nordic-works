/**
 * サービス詳細ページ — /services/[slug]
 *
 * ACF のリピーターフィールド（機能リスト・料金プラン・FAQ・導入事例）を表示する。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
	getServiceBySlug,
	getServices,
	getCaseStudiesByServiceId,
} from '@/lib/wordpress';
import {
	getFeaturedImage,
	stripHtml,
	parseServiceFeatures,
	parsePricingPlans,
	parseFaq,
	parseCaseStudyLinks,
	BLUR_DATA_URL,
} from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import type { SlugPageProps } from '@/types/wordpress';

// ISR: サービスは更新頻度が低いため24時間
export const revalidate = 86400;

export async function generateStaticParams() {
	const services = await getServices();
	return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const service = await getServiceBySlug(slug);
	if (!service) {
		return { title: 'サービスが見つかりません' };
	}
	return {
		title: service.title.rendered,
		description:
			service.acf?.subtitle ?? stripHtml(service.content.rendered).slice(0, 120),
		alternates: localeAlternates(`/services/${service.slug}`),
	};
}

export default async function ServiceDetailPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	setRequestLocale(locale);
	const service = await getServiceBySlug(slug);

	if (!service) {
		notFound();
	}

	const tCases = await getTranslations('caseStudies');
	const t = await getTranslations('services');
	const image = getFeaturedImage(service);
	const acf = service.acf;

	// ACF textarea の生値（区切り文字形式）をパースして構造化データにする
	const features = parseServiceFeatures(acf?.features);
	const pricingPlans = parsePricingPlans(acf?.pricing_plans);
	const faq = parseFaq(acf?.faq);
	const caseStudies = parseCaseStudyLinks(acf?.case_study_links);

	// このサービスに紐づく case_study を取得
	const relatedCases = await getCaseStudiesByServiceId(service.id);

	// schema.org FAQPage 構造化データ（Google 検索結果に FAQ リッチリザルトを出すため）
	const faqJsonLd =
		faq.length > 0
			? {
					'@context': 'https://schema.org',
					'@type': 'FAQPage',
					mainEntity: faq.map((item) => ({
						'@type': 'Question',
						name: item.question,
						acceptedAnswer: { '@type': 'Answer', text: item.answer },
					})),
				}
			: null;

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			{faqJsonLd && (
				<script
					type="application/ld+json"
					// 自社管理コンテンツのため XSS リスクなし
					dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
				/>
			)}
			<Breadcrumbs
				items={[
					{ label: 'Services', href: '/services' },
					{ label: stripHtml(service.title.rendered) },
				]}
			/>

			<article className="mt-6">
				{/* ヒーロー */}
				<p className="text-xs uppercase tracking-widest text-accent-text">Service</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{service.title.rendered}
				</h1>
				{acf?.subtitle && (
					<p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{acf.subtitle}</p>
				)}

				{image && (
					<div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
						<Image
							src={image.source_url}
							alt={image.alt_text || service.title.rendered}
							fill
							sizes="(max-width: 896px) 100vw, 896px"
							placeholder="blur"
							blurDataURL={BLUR_DATA_URL}
							className="object-cover"
							priority
						/>
					</div>
				)}

				{/* 概要 */}
				<div
					className="article-body mt-10 text-zinc-800 dark:text-zinc-200"
					dangerouslySetInnerHTML={{ __html: service.content.rendered }}
				/>

				{/* 機能リスト */}
				{features.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t('features')}</h2>
						<div className="mt-6 grid gap-6 sm:grid-cols-2">
							{features.map((feature, i) => (
								<div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
									<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</section>
				)}

				{/* 料金プラン。プランが3つあるときは中央を「推奨」として強調する。 */}
				{pricingPlans.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('pricing')}
						</h2>
						<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{pricingPlans.map((plan, i) => {
								const isRecommended =
									pricingPlans.length === 3 && i === 1;
								return (
									<div
										key={i}
										className={`flex flex-col rounded-lg border p-6 transition-colors ${
											isRecommended
												? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900'
												: 'border-zinc-200 dark:border-zinc-800'
										}`}
									>
										{isRecommended && (
											<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
												{t('recommended')}
											</p>
										)}
										<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
											{plan.name}
										</h3>
										<p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
											{plan.price}
										</p>
										{plan.includedFeatures.length > 0 && (
											<ul className="mt-4 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
												{plan.includedFeatures.map((item, j) => (
													<li key={j} className="flex gap-2">
														<span className="text-zinc-400">•</span>
														<span>{item}</span>
													</li>
												))}
											</ul>
										)}
										{/* mt-auto で各カードの最下部に揃える（機能数の差で位置がズレるのを防ぐ） */}
										<div className="mt-auto pt-6">
											<Link
												href={`/contact?plan=${encodeURIComponent(plan.name)}&service=${encodeURIComponent(stripHtml(service.title.rendered))}`}
												className={`block rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${
													isRecommended
														? 'bg-accent text-white hover:bg-accent-hover'
														: 'border border-zinc-300 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800'
												}`}
											>
												{t('consultPlan')}
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* FAQ。<details>/<summary> でJSなしの折りたたみ。最初の1件のみ開いておく。 */}
				{faq.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('faq')}
						</h2>
						<div className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
							{faq.map((item, i) => (
								<details
									key={i}
									open={i === 0}
									className="group py-4 [&_summary::-webkit-details-marker]:hidden"
								>
									<summary className="flex cursor-pointer list-none items-start justify-between gap-4">
										<span className="font-semibold text-zinc-900 dark:text-zinc-100">
											Q. {item.question}
										</span>
										<span
											aria-hidden="true"
											className="mt-1 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
										>
											▾
										</span>
									</summary>
									<p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
										{item.answer}
									</p>
								</details>
							))}
						</div>
					</section>
				)}

				{/* 導入事例（ACF の外部リンク版） */}
				{caseStudies.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{tCases('relatedToService')}
						</h2>
						<ul className="mt-6 space-y-2">
							{caseStudies.map((cs, i) => (
								<li key={i}>
									<a
										href={cs.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-zinc-700 underline underline-offset-2 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
									>
										{cs.label} ↗
									</a>
								</li>
							))}
						</ul>
					</section>
				)}

				{/* 関連事例 CPT（case_study）— このサービスに紐づく事例カード */}
				{relatedCases.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{tCases('relatedToService')}
						</h2>
						<ul className="mt-6 grid gap-4 sm:grid-cols-2">
							{relatedCases.map((cs) => (
								<li key={cs.id}>
									<Link
										href={`/case-studies/${cs.slug}`}
										className="block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
									>
										{cs.acf?.client_name && (
											<p className="text-xs uppercase tracking-wide text-zinc-500">
												{cs.acf.client_name}
											</p>
										)}
										<p className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">
											{cs.title.rendered}
										</p>
										{cs.acf?.subtitle && (
											<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
												{cs.acf.subtitle}
											</p>
										)}
									</Link>
								</li>
							))}
						</ul>
					</section>
				)}

				{/* CTA */}
				{acf?.cta_text && (
					<section className="mt-14 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-8 py-10 text-center">
						<p className="text-lg font-medium text-white dark:text-zinc-900">
							{t('interested')}
						</p>
						<Link
							href={acf.cta_url || '/contact'}
							className="mt-4 block w-full rounded-md bg-white dark:bg-zinc-950 px-6 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-200 sm:inline-block sm:w-auto dark:hover:bg-zinc-700"
						>
							{acf.cta_text}
						</Link>
					</section>
				)}
			</article>
		</main>
	);
}
