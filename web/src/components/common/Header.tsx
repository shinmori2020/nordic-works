/**
 * サイト共通ヘッダー。
 *
 * デスクトップは横並びナビ、モバイルはハンバーガーメニュー。
 * モバイルメニューの開閉に状態を持つため Client Component。
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
	{ href: '/articles', label: 'Insights' },
	{ href: '/services', label: 'Services' },
	{ href: '/careers', label: 'Careers' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
];

export function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<Link
					href="/"
					className="text-lg font-semibold tracking-tight text-zinc-900"
					onClick={() => setOpen(false)}
				>
					Nordic Works
				</Link>

				{/* デスクトップナビ */}
				<nav className="hidden gap-7 md:flex">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* モバイルメニュートグル */}
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden"
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

			{/* モバイルメニュー */}
			{open && (
				<nav id="mobile-nav" className="border-t border-zinc-200 md:hidden">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setOpen(false)}
							className="block px-6 py-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
						>
							{link.label}
						</Link>
					))}
				</nav>
			)}
		</header>
	);
}
