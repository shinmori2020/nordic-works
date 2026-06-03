/**
 * 採用情報一覧ページ — /careers
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCareers } from '@/lib/wordpress';
import { CareerCard } from '@/components/corporate/CareerCard';
import { CtaBanner } from '@/components/common/CtaBanner';

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
	const careers = await getCareers();

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
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
					{t('description', { count: careers.length })}
				</p>
			</header>

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
		</main>
	);
}
