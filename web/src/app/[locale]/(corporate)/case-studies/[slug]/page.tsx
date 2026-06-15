/**
 * 導入事例 詳細ページ — /case-studies/[slug]
 *
 * クライアント情報・課題・解決策・成果（数値）・推薦コメント・関連サービスを表示。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
	getCaseStudies,
	getCaseStudyBySlug,
	getServicesByIds,
} from '@/lib/wordpress';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { stripHtml, parseOutcomes, BLUR_DATA_URL } from '@/lib/utils';
import { caseStudyImage } from '@/lib/case-study-image';
import { SITE_NAME, absoluteUrl, localeAlternates } from '@/lib/site';
import type { SlugPageProps } from '@/types/wordpress';

export const revalidate = 86400;

export async function generateStaticParams() {
	const cases = await getCaseStudies();
	return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params;
	const cs = await getCaseStudyBySlug(slug);
	if (!cs) return { title: 'Case Study not found' };
	const description = cs.acf?.subtitle
		? stripHtml(cs.acf.subtitle).slice(0, 160)
		: stripHtml(cs.content.rendered).slice(0, 160);
	return {
		title: stripHtml(cs.title.rendered),
		description,
		alternates: localeAlternates(`/case-studies/${cs.slug}`),
	};
}

export default async function CaseStudyDetailPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	setRequestLocale(locale);

	const cs = await getCaseStudyBySlug(slug);
	if (!cs) notFound();

	const t = await getTranslations('caseStudies');

	const acf = cs.acf;
	const image = caseStudyImage(cs);
	const outcomes = parseOutcomes(acf?.outcomes);

	// 関連サービス ID 配列を実体に解決
	const relatedServiceIds = Array.isArray(acf?.related_services)
		? acf.related_services
		: [];
	const relatedServices = await getServicesByIds(relatedServiceIds);

	// CaseStudy 構造化データ（schema.org Article として近似）
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: stripHtml(cs.title.rendered),
		description: acf?.subtitle ?? '',
		image: image?.source_url,
		datePublished: cs.date,
		dateModified: cs.modified ?? cs.date,
		mainEntityOfPage: absoluteUrl(`/case-studies/${cs.slug}`),
		publisher: { '@type': 'Organization', name: SITE_NAME },
		about: acf?.client_name,
	};

	return (
		<main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<Breadcrumbs
				items={[
					{ label: t('label'), href: '/case-studies' },
					{ label: stripHtml(cs.title.rendered) },
				]}
			/>

			<article className="mt-6">
				{/* ヘッダー */}
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{cs.title.rendered}
				</h1>
				{acf?.subtitle && (
					<p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
						{acf.subtitle}
					</p>
				)}

				{/* クライアントメタ情報 */}
				<dl className="mt-6 grid gap-4 rounded-lg border border-zinc-200 p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
					{acf?.client_name && (
						<MetaCell label={t('client')} value={acf.client_name} />
					)}
					{acf?.client_industry && (
						<MetaCell label={t('industry')} value={acf.client_industry} />
					)}
					{acf?.company_size && (
						<MetaCell label={t('companySize')} value={acf.company_size} />
					)}
					{acf?.project_period && (
						<MetaCell label={t('projectPeriod')} value={acf.project_period} />
					)}
				</dl>

				{image && (
					<div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
						<Image
							src={image.source_url}
							alt={image.alt_text || stripHtml(cs.title.rendered)}
							fill
							sizes="(max-width: 896px) 100vw, 896px"
							placeholder="blur"
							blurDataURL={BLUR_DATA_URL}
							className="object-cover"
							priority
						/>
					</div>
				)}

				{/* 課題 */}
				{acf?.challenge && (
					<section className="mt-12">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('challenge')}
						</h2>
						<div
							className="article-body mt-4 text-zinc-800 dark:text-zinc-200"
							dangerouslySetInnerHTML={{ __html: wpautop(acf.challenge) }}
						/>
					</section>
				)}

				{/* 解決策 */}
				{acf?.solution && (
					<section className="mt-12">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('solution')}
						</h2>
						<div
							className="article-body mt-4 text-zinc-800 dark:text-zinc-200"
							dangerouslySetInnerHTML={{ __html: wpautop(acf.solution) }}
						/>
					</section>
				)}

				{/* 成果（数値ハイライト） */}
				{outcomes.length > 0 && (
					<section className="mt-12">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('outcomes')}
						</h2>
						<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{outcomes.map((o, i) => (
								<div
									key={i}
									className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
								>
									<p className="text-xs uppercase tracking-wide text-zinc-500">
										{o.label}
									</p>
									<p className="mt-2 text-2xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
										{o.value}
									</p>
									{o.note && (
										<p className="mt-1 text-xs text-zinc-500">{o.note}</p>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* 本文（補足ナラティブ） */}
				{cs.content?.rendered && (
					<section className="mt-12">
						<div
							className="article-body text-zinc-800 dark:text-zinc-200"
							dangerouslySetInnerHTML={{ __html: cs.content.rendered }}
						/>
					</section>
				)}

				{/* 推薦コメント */}
				{acf?.testimonial_body && (
					<section className="mt-12">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('testimonial')}
						</h2>
						<blockquote className="mt-4 border-l-4 border-zinc-900 bg-zinc-50 p-5 italic text-zinc-800 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-200">
							<p>「{acf.testimonial_body}」</p>
							{acf.testimonial_author && (
								<footer className="mt-3 text-sm not-italic text-zinc-500">
									— {acf.testimonial_author}
								</footer>
							)}
						</blockquote>
					</section>
				)}

				{/* 関連サービス */}
				{relatedServices.length > 0 && (
					<section className="mt-14 border-t border-zinc-200 pt-10 dark:border-zinc-800">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('relatedServices')}
						</h2>
						<ul className="mt-4 grid gap-4 sm:grid-cols-2">
							{relatedServices.map((s) => (
								<li key={s.id}>
									<Link
										href={`/services/${s.slug}`}
										className="block rounded-md border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
									>
										<p className="font-semibold text-zinc-900 dark:text-zinc-100">
											{s.title.rendered}
										</p>
										{s.acf?.subtitle && (
											<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
												{s.acf.subtitle}
											</p>
										)}
									</Link>
								</li>
							))}
						</ul>
					</section>
				)}
			</article>
		</main>
	);
}

function MetaCell({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
			<dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
				{value}
			</dd>
		</div>
	);
}

/**
 * 簡易 wpautop: 改行を <p> に変換するだけ。
 * ACF textarea の new_lines=wpautop 出力が来ない場合のフォールバック。
 */
function wpautop(text: string): string {
	if (!text) return '';
	if (text.includes('<p>')) return text;
	return text
		.split(/\n{2,}/)
		.map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
		.join('');
}
