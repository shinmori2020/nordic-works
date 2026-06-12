/**
 * 特集一覧ページ — /features
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getFeatures } from '@/lib/wordpress';
import { FeatureCard } from '@/components/media/FeatureCard';
import { PageHero } from '@/components/common/PageHero';

// ISR: 特集は記事より更新頻度が高いため1時間
export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'features' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/features'),
	};
}

export default async function FeaturesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('features');
	const tNav = await getTranslations('nav');
	const features = await getFeatures();

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description')}
				bottomLink={{ href: '/articles', label: tNav('insights') }}
			/>

			<section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
				{features.length === 0 ? (
					<p className="text-sm text-zinc-500">{t('empty')}</p>
				) : (
					<div className="space-y-12">
						{features.map((feature) => (
							<FeatureCard key={feature.id} feature={feature} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
