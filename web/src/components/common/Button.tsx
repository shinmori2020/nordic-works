/**
 * 汎用ボタン（Server Component 可）。
 *
 * 配色をこの1ファイルに集約し、アクセント色（フィヨルド・ブルー）の調整を
 * 一元管理できるようにする。href があれば next-intl の Link（ロケール保持）、
 * なければ <button> としてレンダリングする。
 *
 * variant:
 *   primary   … 塗り（主アクション）= アクセント色
 *   secondary … 枠線（副アクション）
 */

import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

// フォーカスリングは globals.css の :focus-visible で全サイト共通に付与する。
const base =
	'inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors';

const variants: Record<Variant, string> = {
	primary: 'bg-accent text-white hover:bg-accent-hover',
	secondary:
		'border border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900',
};

interface ButtonProps {
	children: ReactNode;
	variant?: Variant;
	href?: string;
	type?: 'button' | 'submit' | 'reset';
	className?: string;
}

export function Button({
	children,
	variant = 'primary',
	href,
	type = 'button',
	className = '',
}: ButtonProps) {
	const cls = `${base} ${variants[variant]} ${className}`;

	if (href) {
		return (
			<Link href={href} className={cls}>
				{children}
			</Link>
		);
	}

	return (
		<button type={type} className={cls}>
			{children}
		</button>
	);
}
