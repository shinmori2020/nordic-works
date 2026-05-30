/**
 * サービス詳細ページ — /services/[slug]
 *
 * ACF のリピーターフィールド（機能リスト・料金プラン・FAQ・導入事例）を表示する。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceBySlug, getServices } from '@/lib/wordpress';
import {
	getFeaturedImage,
	stripHtml,
	parseServiceFeatures,
	parsePricingPlans,
	parseFaq,
	parseCaseStudyLinks,
} from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
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
		alternates: { canonical: `/services/${service.slug}` },
	};
}

export default async function ServiceDetailPage({ params }: SlugPageProps) {
	const { slug } = await params;
	const service = await getServiceBySlug(slug);

	if (!service) {
		notFound();
	}

	const image = getFeaturedImage(service);
	const acf = service.acf;

	// ACF textarea の生値（区切り文字形式）をパースして構造化データにする
	const features = parseServiceFeatures(acf?.features);
	const pricingPlans = parsePricingPlans(acf?.pricing_plans);
	const faq = parseFaq(acf?.faq);
	const caseStudies = parseCaseStudyLinks(acf?.case_study_links);

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
					{ label: 'ホーム', href: '/' },
					{ label: 'Services', href: '/services' },
					{ label: stripHtml(service.title.rendered) },
				]}
			/>

			<article className="mt-6">
				{/* ヒーロー */}
				<p className="text-xs uppercase tracking-widest text-zinc-500">Service</p>
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
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">主な機能</h2>
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
							料金プラン
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
												おすすめ
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
														? 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
														: 'border border-zinc-300 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800'
												}`}
											>
												このプランで相談する
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
							よくある質問
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

				{/* 導入事例 */}
				{caseStudies.length > 0 && (
					<section className="mt-14">
						<h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">導入事例</h2>
						<ul className="mt-6 space-y-2">
							{caseStudies.map((cs, i) => (
								<li key={i}>
									<a
										href={cs.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-zinc-700 dark:text-zinc-300 underline underline-offset-2 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
									>
										{cs.label} ↗
									</a>
								</li>
							))}
						</ul>
					</section>
				)}

				{/* CTA */}
				{acf?.cta_text && (
					<section className="mt-14 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-8 py-10 text-center">
						<p className="text-lg font-medium text-white dark:text-zinc-900">
							このサービスにご興味がありますか？
						</p>
						<Link
							href={acf.cta_url || '/contact'}
							className="mt-4 inline-block rounded-md bg-white dark:bg-zinc-950 px-6 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
						>
							{acf.cta_text}
						</Link>
					</section>
				)}
			</article>
		</main>
	);
}
