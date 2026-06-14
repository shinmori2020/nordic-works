/**
 * サービス一覧ページ — /services
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getServices } from '@/lib/wordpress';
import { ServiceCard } from '@/components/corporate/ServiceCard';
import { PageHero } from '@/components/common/PageHero';

// ISR: サービスは更新頻度が低いため24時間（docs/06-features.md の方針）
export const revalidate = 86400;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'services' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/services'),
	};
}

export default async function ServicesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('services');
	const tNav = await getTranslations('nav');
	const services = await getServices();

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description')}
				anchors={[{ no: '01', label: t('title'), href: '#services-list' }]}
				bottomLink={{ href: '/case-studies', label: tNav('caseStudies') }}
			/>

			<section
				id="services-list"
				className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20"
			>
				{services.length === 0 ? (
					<p className="text-sm text-red-600">⚠️ {t('label')}</p>
				) : (
					<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{services.map((service) => (
							<ServiceCard key={service.id} service={service} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
