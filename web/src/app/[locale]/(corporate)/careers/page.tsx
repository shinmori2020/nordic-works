/**
 * 採用情報一覧ページ — /careers
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCareers } from '@/lib/wordpress';
import { CareerCard } from '@/components/corporate/CareerCard';
import { CtaBanner } from '@/components/common/CtaBanner';
import { PageHero } from '@/components/common/PageHero';

// ISR: 採用情報は更新頻度が低いため24時間
export const revalidate = 86400;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'careers' });
	const tArticles = await getTranslations({ locale, namespace: 'articles' });
	return {
		title: t('title'),
		description: tArticles('description'),
		alternates: localeAlternates('/careers'),
	};
}

export default async function CareersPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('careers');
	const tArticles = await getTranslations('articles');
	const tNav = await getTranslations('nav');
	const careers = await getCareers();

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description', { count: careers.length })}
				anchors={[{ no: '01', label: t('title'), href: '#careers-list' }]}
				bottomLink={{ href: '/about', label: tNav('about') }}
			/>

			<section
				id="careers-list"
				className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20"
			>
				{careers.length === 0 ? (
					<p className="text-sm text-red-600">⚠️ {tArticles('fetchError')}</p>
				) : (
					<div className="grid gap-6 sm:grid-cols-2">
						{careers.map((career) => (
							<CareerCard key={career.id} career={career} />
						))}
					</div>
				)}

				{/* 袋小路回避: 応募前の候補者を会社理解（About）と面談（Contact）へ誘導 */}
				<CtaBanner
					className="mt-16"
					title={t('ctaTitle')}
					description={t('ctaDescription')}
					buttons={[
						{ label: t('ctaContact'), href: '/contact', primary: true },
						{ label: t('ctaAbout'), href: '/about' },
					]}
				/>
			</section>
		</main>
	);
}
