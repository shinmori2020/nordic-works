/**
 * 読了進捗バー（Client Component）。
 *
 * ページのスクロール量に応じて画面最上部のバーを伸縮させる。
 */

'use client';

import { motion, useScroll } from 'motion/react';

export function ReadingProgress() {
	const { scrollYProgress } = useScroll();

	return (
		<motion.div
			style={{ scaleX: scrollYProgress }}
			className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-zinc-900 dark:bg-zinc-100"
			aria-hidden="true"
		/>
	);
}
