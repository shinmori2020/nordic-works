/**
 * サイト共通ヘッダー。
 *
 * デスクトップは横並びナビ、モバイルはハンバーガーメニュー。
 * モバイルメニューの開閉に状態を持つため Client Component。
 *
 * 内部リンクは next-intl の Link を使い、現在ロケールのプレフィックスを自動付与する。
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV_LINKS = [
	{ href: '/articles', key: 'insights' as const },
	{ href: '/features', key: 'features' as const },
	{ href: '/authors', key: 'authors' as const },
	{ href: '/services', key: 'services' as const },
	{ href: '/careers', key: 'careers' as const },
	{ href: '/case-studies', key: 'caseStudies' as const },
	{ href: '/resources', key: 'resources' as const },
	{ href: '/about', key: 'about' as const },
	{ href: '/contact', key: 'contact' as const },
];

export function Header() {
	const t = useTranslations('nav');
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
			<div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
				<Link
					href="/"
					className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
					onClick={() => setOpen(false)}
				>
					Nordic Works
				</Link>

				<div className="flex items-center gap-2">
					{/* デスクトップナビ */}
					<nav className="hidden gap-7 md:flex">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
							>
								{t(link.key)}
							</Link>
						))}
					</nav>

					{/* 検索 → 検索モーダルを開く（JS無効時は /search へ遷移）。
					    デスクトップは検索バー風、モバイルはアイコンのみ。 */}
					<Link
						href="/search"
						aria-label={t('openSearch')}
						onClick={(e) => {
							e.preventDefault();
							window.dispatchEvent(new Event('nordic:open-search'));
						}}
						className="flex h-9 w-9 items-center justify-center gap-2 rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 sm:w-auto sm:justify-start sm:border sm:border-zinc-200 sm:bg-zinc-50 sm:px-2.5 sm:text-zinc-500 sm:hover:border-zinc-300 sm:hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800 sm:dark:border-zinc-800 sm:dark:bg-zinc-900 sm:dark:text-zinc-400 sm:dark:hover:border-zinc-700 sm:dark:hover:bg-zinc-950"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
							<path
								d="m20 20-3.5-3.5"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
							/>
						</svg>
						<span className="hidden text-sm sm:inline">{t('search')}</span>
						<kbd className="ml-2 hidden rounded border border-zinc-300 px-1.5 py-0.5 font-sans text-[11px] text-zinc-400 sm:inline dark:border-zinc-700 dark:text-zinc-500">
							⌘K
						</kbd>
					</Link>

					{/* 言語切替 */}
					<LanguageSwitcher />

					{/* テーマ切替 */}
					<ThemeToggle />

					{/* モバイルメニュートグル */}
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
						aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
						aria-expanded={open}
						aria-controls="mobile-nav"
					>
						{open ? (
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
								<path
									d="M5 5l10 10M15 5L5 15"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinecap="round"
								/>
							</svg>
						) : (
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
								<path
									d="M3 6h14M3 10h14M3 14h14"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			{/* モバイルメニュー */}
			{open && (
				<nav
					id="mobile-nav"
					className="border-t border-zinc-200 md:hidden dark:border-zinc-800"
				>
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setOpen(false)}
							className="block px-6 py-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
						>
							{t(link.key)}
						</Link>
					))}
				</nav>
			)}
		</header>
	);
}
