/**
 * サイト共通フッター。
 *
 * 静的な内容のみのため Server Component。
 */

import Link from 'next/link';

const FOOTER_LINKS = [
	{ href: '/articles', label: 'Insights' },
	{ href: '/services', label: 'Services' },
	{ href: '/careers', label: 'Careers' },
	{ href: '/resources', label: 'Resources' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
	{ href: '/privacy', label: 'Privacy' },
];

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
					<div className="max-w-xs">
						<p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
							Nordic Works
						</p>
						<p className="mt-2 text-sm leading-relaxed text-zinc-500">
							北欧式の働き方・組織設計を支援する B2B SaaS 企業。
						</p>
					</div>

					<nav>
						<p className="text-xs uppercase tracking-widest text-zinc-400">Sitemap</p>
						<ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
							{FOOTER_LINKS.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>

				<div className="mt-10 border-t border-zinc-200 dark:border-zinc-800 pt-6">
					<p className="text-xs text-zinc-400">
						© {year} Nordic Works. This is a fictional company built as a portfolio project.
					</p>
				</div>
			</div>
		</footer>
	);
}
