/**
 * 検索ページ — /search
 *
 * Algolia による全文検索。URL ?q= を初期値として SearchClient に渡す。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchClient } from '@/components/search/SearchClient';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

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
	const tCommon = await getTranslations('common');
	const { q = '' } = await searchParams;

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-8">
				<Breadcrumbs
					items={[
						{ label: t('label') },
					]}
				/>
				<p className="mt-3 text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('title')}
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>
			</header>

			<SearchClient initialQuery={q} />
		</main>
	);
}
