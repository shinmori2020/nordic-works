/**
 * 汎用 CTA バナー（Server Component）。
 *
 * 一覧ページなど「袋小路」になりやすいページの末尾に置き、
 * 次の行動（お問い合わせ・About 等）へ誘導する。
 * 濃色背景でページ末に視覚的なまとまりとインパクトを出す。
 *
 * 内部リンクは next-intl の Link でロケールプレフィックスを保持する。
 */

import { Link } from '@/i18n/navigation';

export interface CtaButton {
	label: string;
	href: string;
	/** true で塗りボタン（主アクション）、false で枠ボタン（副アクション） */
	primary?: boolean;
}

interface Props {
	title: string;
	description?: string;
	buttons: CtaButton[];
	className?: string;
}

export function CtaBanner({ title, description, buttons, className = '' }: Props) {
	return (
		<section
			className={`rounded-lg bg-zinc-900 px-8 py-12 text-center dark:bg-zinc-100 ${className}`}
		>
			<h2 className="text-2xl font-semibold text-white dark:text-zinc-900">
				{title}
			</h2>
			{description && (
				<p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 dark:text-zinc-600">
					{description}
				</p>
			)}
			<div className="mt-6 flex flex-wrap justify-center gap-3">
				{buttons.map((btn) => (
					<Link
						key={btn.href}
						href={btn.href}
						className={
							btn.primary
								? 'rounded-md bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800'
								: 'rounded-md border border-zinc-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:border-zinc-400 dark:text-zinc-900 dark:hover:bg-zinc-200'
						}
					>
						{btn.label}
					</Link>
				))}
			</div>
		</section>
	);
}
