/**
 * Nordic Works - Service Worker
 *
 * Strategy:
 *  - Navigation (HTML)    : Network-only（locale 切替時の古いキャッシュ問題を防ぐ）
 *                            ネットワーク失敗時のみ /offline にフォールバック
 *  - Same-origin static   : Stale-while-revalidate（_next/* は hashed URL なので安全）
 *  - その他                : ブラウザのデフォルト (no interception)
 *
 * 既知の問題対応:
 *   v1 では HTML を network-first + cache していたため、i18n 修正前の HTML が
 *   キャッシュに残り、ロケール切替時にナビゲーションが壊れていた。
 *   v2 では HTML を一切キャッシュしない。
 *
 * バージョンを変えたい時は CACHE 定数を更新する（古いキャッシュは activate で掃除）。
 */

const CACHE = 'nordic-works-v2';
const OFFLINE_URL = '/offline';
const PRECACHE_URLS = [OFFLINE_URL, '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;

	// GET 以外（POST のフォーム送信等）は介入しない
	if (req.method !== 'GET') return;

	const url = new URL(req.url);

	// 別オリジン（画像CDN等）はキャッシュしない
	if (url.origin !== self.location.origin) return;

	// HTMLナビゲーション: network-only。失敗時のみ /offline。
	// （HTML をキャッシュしないことで、ロケール切替や i18n 修正が即時反映される）
	if (req.mode === 'navigate') {
		event.respondWith(
			fetch(req).catch(() => caches.match(OFFLINE_URL)),
		);
		return;
	}

	// 静的アセット（同一オリジン GET）: stale-while-revalidate
	if (
		url.pathname.startsWith('/_next/') ||
		url.pathname.startsWith('/wp-uploads/') ||
		url.pathname.endsWith('.css') ||
		url.pathname.endsWith('.js') ||
		url.pathname.endsWith('.woff2')
	) {
		event.respondWith(
			caches.open(CACHE).then((cache) =>
				cache.match(req).then((cached) => {
					const networkFetch = fetch(req)
						.then((res) => {
							cache.put(req, res.clone());
							return res;
						})
						.catch(() => cached);
					return cached || networkFetch;
				}),
			),
		);
	}
});
