/**
 * Cookie 同意バナー（Client Component）。
 *
 * - 初回アクセス時のみ画面下部に表示
 * - 「同意」または「拒否」を選ぶと localStorage に記録、以後表示しない
 * - 同意状態は他コンポーネントから getCookieConsent() で参照可能
 *
 * 注: 本サイトの Vercel Web Analytics は Cookie を使わない設計だが、
 *     将来的に Resend や追加の解析ツールで Cookie が増えることを見越し
 *     最初から同意 UI を用意しておく。
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'nordic-cookie-consent';
type Consent = 'accepted' | 'declined';

/** 他コンポーネントから同意状態を読む（"未選択" は null） */
export function getCookieConsent(): Consent | null {
	if (typeof window === 'undefined') return null;
	const v = window.localStorage.getItem(STORAGE_KEY);
	return v === 'accepted' || v === 'declined' ? v : null;
}

export function CookieConsent() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// マウント後に判定（SSR と整合性を保つ）
		if (getCookieConsent() === null) {
			setVisible(true);
		}
	}, []);

	const decide = (consent: Consent) => {
		window.localStorage.setItem(STORAGE_KEY, consent);
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div
			role="dialog"
			aria-label="Cookie 利用への同意"
			className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					本サイトはサイト改善のため Cookie および類似技術を利用します。詳しくは
					{' '}
					<Link
						href="/privacy"
						className="underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						プライバシーポリシー
					</Link>
					をご覧ください。
				</p>
				<div className="flex shrink-0 gap-2">
					<button
						type="button"
						onClick={() => decide('declined')}
						className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
					>
						拒否する
					</button>
					<button
						type="button"
						onClick={() => decide('accepted')}
						className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
					>
						同意する
					</button>
				</div>
			</div>
		</div>
	);
}
