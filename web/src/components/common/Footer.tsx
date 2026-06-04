/**
 * サイト共通フッター。
 *
 * 上段: ブランド説明 (左) + ニュースレター (右) の2カラム。
 * 中段: サイトマップを横一列で配置。
 * 下段: コピーライト。
 *
 * Server Component。翻訳キー経由でテキストを出すため getTranslations を使用。
 */

import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { NewsletterForm } from './NewsletterForm';

const FOOTER_LINKS = [
	{ href: '/articles', key: 'insights' as const },
	{ href: '/services', key: 'services' as const },
	{ href: '/careers', key: 'careers' as const },
	{ href: '/case-studies', key: 'caseStudies' as const },
	{ href: '/resources', key: 'resources' as const },
	{ href: '/about', key: 'about' as const },
	{ href: '/contact', key: 'contact' as const },
	{ href: '/privacy', key: 'privacy' as const },
];

export async function Footer() {
	const year = new Date().getFullYear();
	const tNav = await getTranslations('nav');
	const tFooter = await getTranslations('footer');

	return (
		<footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
			<div className="mx-auto max-w-[1500px] px-6 py-12">
				{/* 上段: ブランド + ニュースレター */}
				<div className="grid gap-10 sm:grid-cols-[1fr_1fr] lg:gap-16">
					<div className="max-w-xs">
						<p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
							Nordic Works
						</p>
						<p className="mt-2 text-sm leading-relaxed text-zinc-500">
							{tFooter('description')}
						</p>
					</div>

					<div>
						<p className="text-xs uppercase tracking-widest text-zinc-400">
							{tFooter('newsletter')}
						</p>
						<p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
							{tFooter('newsletterDescription')}
						</p>
						<div className="mt-3">
							<NewsletterForm variant="compact" idPrefix="nl-footer" />
						</div>
					</div>
				</div>

				{/* 中段: サイトマップ */}
				<nav className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
					<p className="text-xs uppercase tracking-widest text-zinc-400">
						{tFooter('sitemap')}
					</p>
					<ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
						{FOOTER_LINKS.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
								>
									{tNav(link.key)}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				{/* 下段: コピーライト */}
				<div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
					<p className="text-xs text-zinc-400">
						{tFooter('copyright', { year })}
					</p>
				</div>
			</div>
		</footer>
	);
}
