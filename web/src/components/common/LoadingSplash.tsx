/**
 * 初回ロード時のブランドスプラッシュ（Client Component）。
 *
 * クリーンな背景の中央で北極星マークが「描かれ→塗られ→きらめき」、
 * その下に「Nordic Works」がフェードアップ。準備後に全体がフェードアウト。
 *
 * - FOUC 回避のため初期 HTML から表示し（show=true 初期値）、JS で退場・撤去
 * - 退場のフェードは CSS（globals.css の .nw-splash）。JS 無効でも CSS だけで消える
 * - prefers-reduced-motion 環境では描画アニメなし（静止表示）＋短時間で撤去
 * - SPA 遷移では再表示しない（layout に常駐し、一度きりマウント）
 */

'use client';

import { useEffect, useState } from 'react';
import { StarMark } from './StarMark';

const WORD = 'Nordic Works';

export function LoadingSplash() {
	const [show, setShow] = useState(true);

	// 表示時間（TODO: 確認用に一時的に 5 秒。確認後 reduce ? 600 : 1400 へ戻す）
	useEffect(() => {
		const id = window.setTimeout(() => setShow(false), 5000);
		return () => window.clearTimeout(id);
	}, []);

	// 表示中だけ背景スクロールを止める。show が false になったら確実に解除。
	useEffect(() => {
		if (!show) return;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, [show]);

	if (!show) return null;

	return (
		<div className="nw-splash bg-zinc-50 text-accent-text dark:bg-zinc-950" aria-hidden="true">
			<StarMark className="nw-star h-14 w-14" />
			<span className="nw-word text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
				{WORD.split('').map((ch, i) => (
					<span
						key={i}
						className="nw-letter"
						style={{ animationDelay: `${0.6 + i * 0.05}s` }}
					>
						{ch === ' ' ? ' ' : ch}
					</span>
				))}
			</span>
		</div>
	);
}
