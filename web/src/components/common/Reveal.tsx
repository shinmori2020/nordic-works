/**
 * スクロール連動フェードインのラッパー（Client Component）。
 *
 * ビューポートに入ったら一度だけフェード+少し上に動く。
 * Server Component（カード等）を children として受け取れる。
 * prefers-reduced-motion の場合はアニメーションせずそのまま表示する。
 */

'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealProps {
	children: ReactNode;
	/** 開始遅延（秒）。グリッドで少しずつずらす用途 */
	delay?: number;
	className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-80px' }}
			transition={{ duration: 0.5, delay, ease: 'easeOut' }}
		>
			{children}
		</motion.div>
	);
}
