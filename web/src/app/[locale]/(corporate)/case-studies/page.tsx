/**
 * 導入事例一覧ページ — /case-studies
 *
 * WP の case_study CPT を一覧表示。各カードから詳細ページへ。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getCaseStudies } from '@/lib/wordpress';
import { stripHtml, BLUR_DATA_URL } from '@/lib/utils';
import { caseStudyImage } from '@/lib/case-study-image';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CtaBanner } from '@/components/common/CtaBanner';

export const revalidate = 86400;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'caseStudies' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/case-studies'),
	};
}

export default async function CaseStudiesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('caseStudies');
	const tCommon = await getTranslations('common');
	const cases = await getCaseStudies();

	return (
		<main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
			<Breadcrumbs
				items={[
					{ label: t('label') },
				]}
			/>

			<header className="mt-6">
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{t('title')}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>
			</header>

			{cases.length === 0 ? (
				<p className="mt-12 text-sm text-zinc-500">{t('empty')}</p>
			) : (
				<ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{cases.map((cs) => {
						const image = caseStudyImage(cs);
						return (
							<li key={cs.id}>
								<Link
									href={`/case-studies/${cs.slug}`}
									className="group block h-full overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
								>
									<div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-800">
										{image && (
											<Image
												src={image.source_url}
												alt={image.alt_text || stripHtml(cs.title.rendered)}
												fill
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
												placeholder="blur"
												blurDataURL={BLUR_DATA_URL}
												className="object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										)}
									</div>
									<div className="p-5">
										{cs.acf?.client_name && (
											<p className="text-xs uppercase tracking-wide text-zinc-500">
												{cs.acf.client_name}
												{cs.acf.client_industry && (
													<span className="text-zinc-400">
														{' '}
														· {cs.acf.client_industry}
													</span>
												)}
											</p>
										)}
										<h2 className="mt-2 font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
											{cs.title.rendered}
										</h2>
										{cs.acf?.subtitle && (
											<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
												{cs.acf.subtitle}
											</p>
										)}
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			)}

			{/* 袋小路回避: 事例で関心が高まった人をお問い合わせ/サービスへ送る */}
			<CtaBanner
				className="mt-16"
				title={t('ctaTitle')}
				description={t('ctaDescription')}
				buttons={[
					{ label: t('ctaContact'), href: '/contact', primary: true },
					{ label: t('ctaServices'), href: '/services' },
				]}
			/>
		</main>
	);
}
