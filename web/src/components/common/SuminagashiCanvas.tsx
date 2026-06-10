/**
 * 墨流し風 流体シミュレーションの背景キャンバス（Client Component）。
 *
 * ink-simulation のコアを useEffect 内で起動し、アンマウント時に destroy() で
 * requestAnimationFrame・イベントリスナー・Observer をすべて解放する。
 * next-themes の resolvedTheme を監視し、テーマ切替時は「再初期化せず色だけ」
 * 差し替える（紙/墨の反転）。
 *
 * - 画面幅 900px 以下では起動しない（CSS でも .ink-canvas を非表示）。
 * - prefers-reduced-motion は ink-simulation 側で静止1枚描画にフォールバック。
 * - 高さはヒーロー側で確定し canvas は absolute で敷くだけ（CLS ゼロ）。
 */

'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { createInkSimulation, type InkSimulation } from '@/lib/ink-simulation';

// 紙/墨の RGB。ライト=紙/墨、ダーク=反転（黒い水面に白い墨）。
const COLORS = {
	light: { paper: [250, 250, 248], ink: [26, 26, 28] },
	dark: { paper: [24, 24, 27], ink: [228, 228, 231] },
};

export function SuminagashiCanvas() {
	const ref = useRef<HTMLCanvasElement>(null);
	const simRef = useRef<InkSimulation | null>(null);
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		// 900px 以下は起動しない（モバイルは静的背景に任せる）。
		if (window.matchMedia('(max-width: 900px)').matches) return;

		const sim = createInkSimulation(canvas);
		simRef.current = sim;
		return () => {
			sim?.destroy();
			simRef.current = null;
		};
	}, []);

	// テーマ確定後・切替時に色だけ差し替える（模様は連続させる）。
	useEffect(() => {
		const sim = simRef.current;
		if (!sim || !resolvedTheme) return;
		const c = resolvedTheme === 'dark' ? COLORS.dark : COLORS.light;
		sim.setColors(c.paper, c.ink);
	}, [resolvedTheme]);

	return <canvas ref={ref} aria-hidden="true" className="ink-canvas" />;
}
