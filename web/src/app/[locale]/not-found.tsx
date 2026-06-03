/**
 * グローバル404ページ（ロケール内）。
 *
 * 各ページの notFound() 呼び出し、および未定義ルートで表示される。
 * 直近記事と主要ナビゲーションを並べ、行き場を失った訪問者を回遊に戻す。
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';

const SECTION_KEYS = [
	{ href: '/articles', key: 'insights' as const, navKey: 'insights' as const },
	{ href: '/services', key: 'services' as const, navKey: 'services' as const },
	{ href: '/careers', key: 'careers' as const, navKey: 'careers' as const },
	{ href: '/about', key: 'about' as const, navKey: 'about' as const },
	{ href: '/contact', key: 'contact' as const, navKey: 'contact' as const },
];

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('notFound');
	return {
		title: t('title'),
		robots: { index: false, follow: false },
	};
}

export default async function NotFound() {
	const t = await getTranslations('notFound');
	const tNav = await getTranslations('nav');

	const allPosts = await getPosts().catch(() => []);
	const recentPosts = [...allPosts]
		.sort((a, b) => (b.date > a.date ? 1 : -1))
		.slice(0, 4);

	return (
		<main className="mx-auto max-w-6xl px-6 py-16">
			<section className="text-center">
				<p className="text-xs uppercase tracking-widest text-accent-text">
					{t('label')}
				</p>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					{t('title')}
				</h1>
				<p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{t('description')}
				</p>

				<div className="mt-8 flex flex-col gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center">
					<Link
						href="/"
						className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
					>
						{t('backHome')}
					</Link>
					<Link
						href="/search"
						className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
					>
						{t('goSearch')}
					</Link>
				</div>
			</section>

			<section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
				<h2 className="text-xs uppercase tracking-widest text-accent-text">
					{t('majorSections')}
				</h2>
				<ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					{SECTION_KEYS.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="block rounded-md border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
							>
								<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
									{tNav(link.navKey)}
								</p>
								<p className="mt-0.5 text-xs text-zinc-500">
									{t(`sections.${link.key}`)}
								</p>
							</Link>
						</li>
					))}
				</ul>
			</section>

			{recentPosts.length > 0 && (
				<section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
					<div className="flex items-baseline justify-between">
						<h2 className="text-xs uppercase tracking-widest text-accent-text">
							{t('recentArticles')}
						</h2>
						<Link
							href="/articles"
							className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
						>
							{t('viewAll')}
						</Link>
					</div>
					<div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
						{recentPosts.map((post) => (
							<ArticleCard key={post.id} post={post} />
						))}
					</div>
				</section>
			)}
		</main>
	);
}
