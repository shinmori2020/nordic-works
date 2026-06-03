/**
 * 資料請求 詳細＋申込フォームページ — /resources/[slug]
 *
 * 説明 → フォームの順で縦に積む1カラムレイアウト。
 * すべての可視テキストは locale 対応（whitepapers.ts の i18n フィールド経由）。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
	getAllWhitepaperSlugs,
	getWhitepaperBySlug,
} from '@/lib/whitepapers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { WhitepaperRequestForm } from '@/components/corporate/WhitepaperRequestForm';
import { formatDate } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

export const revalidate = 86400;

export async function generateStaticParams() {
	return getAllWhitepaperSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
	const { slug, locale } = await params;
	const wp = getWhitepaperBySlug(slug, locale as Locale);
	if (!wp) return { title: 'Not found' };
	return {
		title: wp.title,
		description: wp.summary,
		alternates: localeAlternates(`/resources/${wp.slug}`),
	};
}

export default async function WhitepaperDetailPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	setRequestLocale(locale);

	const wp = getWhitepaperBySlug(slug, locale as Locale);
	if (!wp) notFound();

	const t = await getTranslations('resources');

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: t('label'), href: '/resources' },
					{ label: wp.title },
				]}
			/>

			<article className="mt-6">
				<p className="text-xs uppercase tracking-widest text-accent-text">
					Whitepaper
				</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{wp.title}
				</h1>

				<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
					<time dateTime={wp.publishedAt}>
						{t('publishedAt', {
							date: formatDate(wp.publishedAt, locale === 'en' ? 'en' : 'ja'),
						})}
					</time>
					<span>· {t('pageCount', { count: wp.pageCount })}</span>
					<span>· {t('readingTime', { minutes: wp.readingTime })}</span>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{wp.topics.map((topic) => (
						<span
							key={topic}
							className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
						>
							{topic}
						</span>
					))}
				</div>

				<div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					{wp.body.map((paragraph, i) => (
						<p key={i}>{paragraph}</p>
					))}
				</div>

				<aside className="mt-10 rounded-lg bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
					<p className="font-semibold text-zinc-900 dark:text-zinc-100">
						{t('usageNoteTitle')}
					</p>
					<p className="mt-2">
						{t('usageNoteBody')}{' '}
						<Link
							href="/privacy"
							className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
						>
							{t('privacyLinkText')}
						</Link>
					</p>
				</aside>
			</article>

			<section className="mt-12 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('requestFormLabel')}
				</p>
				<h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
					{t('requestFormTitle')}
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{t('requestFormDescription')}
				</p>

				<div className="mt-6">
					<WhitepaperRequestForm
						whitepaperSlug={wp.slug}
						whitepaperTitle={wp.title}
					/>
				</div>
			</section>
		</main>
	);
}
