/**
 * 特集一覧ページ — /features
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeatures } from '@/lib/wordpress';
import { FeatureCard } from '@/components/media/FeatureCard';

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
	const tArticles = await getTranslations('articles');
	const features = await getFeatures();

	return (
		<main className="mx-auto max-w-4xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					{tArticles('backHome')}
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('title')}
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>
			</header>

			{features.length === 0 ? (
				<p className="text-sm text-zinc-500">{t('empty')}</p>
			) : (
				<div className="space-y-12">
					{features.map((feature) => (
						<FeatureCard key={feature.id} feature={feature} />
					))}
				</div>
			)}
		</main>
	);
}
