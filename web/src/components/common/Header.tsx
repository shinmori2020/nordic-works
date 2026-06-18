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
import { HeaderSearch } from '@/components/search/HeaderSearch';

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
	const [searchOpen, setSearchOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
			<div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
				<Link
					href="/"
					className="group flex items-center gap-3"
					onClick={() => setOpen(false)}
				>
					{/* 北極星マーク（Nordic=北）。アクセント色＝フィヨルドブルー。ホバーで微回転 */}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
						className="h-7 w-7 shrink-0 text-accent-text transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
					>
						<path d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z" />
					</svg>
					{/* 縦罫 */}
					<span aria-hidden="true" className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
					{/* ワードマーク＋極小タグライン（ロックアップ） */}
					<span className="flex flex-col leading-none">
						<span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
							Nordic Works
						</span>
						<span className="mt-1.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-accent-text sm:block">
							Nordic ways of working
						</span>
					</span>
				</Link>

				<div className="flex flex-1 items-center justify-end gap-2">
					{/* ナビ＋検索の領域。検索の入力欄はこの領域に重ねて横へ伸びる（策2a） */}
					<div className="relative flex flex-1 items-center justify-end gap-2">
						<nav
							aria-hidden={searchOpen}
							className={`hidden gap-7 md:flex ${
								searchOpen ? 'pointer-events-none' : ''
							}`}
						>
							{NAV_LINKS.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									tabIndex={searchOpen ? -1 : 0}
									className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
								>
									{t(link.key)}
								</Link>
							))}
						</nav>

						{/* 検索: 平常時はアイコン、押すとその場で横に伸びる */}
						<HeaderSearch open={searchOpen} setOpen={setSearchOpen} />
					</div>

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
