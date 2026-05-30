/**
 * Service Worker 登録（Client Component）。
 *
 * 本番環境（production）でのみ /sw.js を登録する。
 * 開発時に SW が動くと HMR と干渉するため、process.env.NODE_ENV で gate する。
 *
 * 登録/更新失敗はサイレント（console に警告のみ）。SW は補助機能なので、
 * 失敗してもアプリの動作に影響しない設計にする。
 */

'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production') return;
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

		const register = async () => {
			try {
				const reg = await navigator.serviceWorker.register('/sw.js', {
					scope: '/',
				});
				// 新バージョンが pending 状態になったら自動でアクティブ化を試みる
				reg.addEventListener('updatefound', () => {
					const installing = reg.installing;
					if (!installing) return;
					installing.addEventListener('statechange', () => {
						if (
							installing.state === 'installed' &&
							navigator.serviceWorker.controller
						) {
							// 新SWが待機中。次回ロードで自動切替（強制リロードはしない）。
						}
					});
				});
			} catch (err) {
				console.warn('[sw] registration failed:', err);
			}
		};

		// ロード完了後に登録（初回描画を妨げない）
		if (document.readyState === 'complete') {
			register();
		} else {
			window.addEventListener('load', register, { once: true });
		}
	}, []);

	return null;
}
