/**
 * サイト共通ヘッダー。
 *
 * デスクトップは横並びナビ、モバイルはハンバーガーメニュー。
 * モバイルメニューの開閉に状態を持つため Client Component。
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
	{ href: '/articles', label: 'Insights' },
	{ href: '/features', label: 'Features' },
	{ href: '/authors', label: 'Authors' },
	{ href: '/services', label: 'Services' },
	{ href: '/careers', label: 'Careers' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
];

export function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
								{link.label}
							</Link>
						))}
					</nav>

					{/* テーマ切替（全幅で表示） */}
					<div className="ml-1">
						<ThemeToggle />
					</div>

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
							{link.label}
						</Link>
					))}
				</nav>
			)}
		</header>
	);
}
