/**
 * 検索ページ — /search
 *
 * Algolia による全文検索。URL ?q= を初期値として SearchClient に渡す。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchClient } from '@/components/search/SearchClient';
import { PageHero } from '@/components/common/PageHero';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'searchPage' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/search'),
		robots: { index: false, follow: true },
	};
}

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ q?: string; topic?: string; industry?: string }>;
}

export default async function SearchPage({ params, searchParams }: PageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('searchPage');
	const tNav = await getTranslations('nav');
	const { q = '' } = await searchParams;

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description')}
				bottomLink={{ href: '/articles', label: tNav('insights') }}
			/>

			<section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
				<SearchClient initialQuery={q} />
			</section>
		</main>
	);
}
