/**
 * 資料請求一覧ページ — /resources
 *
 * 静的データ（lib/whitepapers.ts）からホワイトペーパー一覧を表示する。
 * 各カードから /resources/[slug] の詳細＋申込フォームへ遷移する。
 */

import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getWhitepapers } from '@/lib/whitepapers';
import { PageHero } from '@/components/common/PageHero';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'resources' });
	return {
		title: t('title'),
		description: t('description'),
		alternates: localeAlternates('/resources'),
	};
}

export default async function ResourcesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('resources');
	const tNav = await getTranslations('nav');
	const whitepapers = getWhitepapers(locale as Locale);

	return (
		<main>
			<PageHero
				breadcrumb={t('title')}
				wordmark={t('label')}
				tagline={t('description')}
				anchors={[{ no: '01', label: t('title'), href: '#resources-list' }]}
				bottomLink={{ href: '/contact', label: tNav('contact') }}
			/>

			<section
				id="resources-list"
				className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20"
			>
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{whitepapers.map((wp) => (
						<li key={wp.slug}>
							<article className="flex h-full flex-col rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600">
								<div className="flex flex-wrap gap-1.5">
									{wp.topics.slice(0, 2).map((topic) => (
										<span
											key={topic}
											className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
										>
											{topic}
										</span>
									))}
								</div>

								<h2 className="mt-3 font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
									{wp.title}
								</h2>

								<p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
									{wp.summary}
								</p>

								<div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
									<span>{t('pageCount', { count: wp.pageCount })}</span>
									<span>· {t('readingTime', { minutes: wp.readingTime })}</span>
								</div>

								<Link
									href={`/resources/${wp.slug}`}
									className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-500 dark:text-zinc-100 dark:hover:text-zinc-400"
								>
									{t('download')}
								</Link>
							</article>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
