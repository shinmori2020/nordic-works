/**
 * コマンドパレット型 検索モーダル（Client Component）。
 *
 * 起動: Cmd/Ctrl+K、またはヘッダー検索ボタンが投げる 'nordic:open-search' イベント。
 * 操作: 入力でライブ検索（Algolia）／↑↓で候補移動／Enterで遷移／Escで閉じる。
 * /search ページはそのまま残し、本モーダルは「どこからでも開ける入口」を足すもの。
 *
 * layout に常設（NextIntlClientProvider 配下）。開いている間だけ DOM を描画する。
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
	algoliaClient,
	ALGOLIA_CONFIGURED,
	indexNameForLocale,
	type AlgoliaPostHit,
} from '@/lib/algolia';

const MAX_HITS = 7;

export function SearchPalette() {
	const t = useTranslations('searchPage');
	const locale = useLocale();
	const indexName = indexNameForLocale(locale);
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [hits, setHits] = useState<AlgoliaPostHit[]>([]);
	const [loading, setLoading] = useState(false);
	const [active, setActive] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	// 起動: Cmd/Ctrl+K トグル ＋ カスタムイベント
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setOpen((o) => !o);
			}
		}
		function onOpen() {
			setOpen(true);
		}
		window.addEventListener('keydown', onKey);
		window.addEventListener('nordic:open-search', onOpen);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('nordic:open-search', onOpen);
		};
	}, []);

	// 開いたら入力にフォーカス＋背景スクロールロック
	useEffect(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const id = window.setTimeout(() => inputRef.current?.focus(), 0);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.clearTimeout(id);
		};
	}, [open]);

	// 閉じたら状態をリセット（次回開いたとき素の状態に）
	useEffect(() => {
		if (!open) {
			setQuery('');
			setHits([]);
			setActive(0);
		}
	}, [open]);

	// 検索（デバウンス）
	useEffect(() => {
		if (!open) return;
		const client = algoliaClient;
		if (!client) return;
		if (!query.trim()) {
			setHits([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		const id = window.setTimeout(async () => {
			try {
				const res = await client.search({
					requests: [{ indexName, query, hitsPerPage: MAX_HITS }],
				});
				const first = (res.results ?? [])[0] as
					| { hits?: AlgoliaPostHit[] }
					| undefined;
				setHits(first?.hits ?? []);
				setActive(0);
			} catch (err) {
				console.error('[algolia]', err);
				setHits([]);
			} finally {
				setLoading(false);
			}
		}, 150);
		return () => window.clearTimeout(id);
	}, [open, query, indexName]);

	const close = useCallback(() => setOpen(false), []);

	const go = useCallback(
		(url: string) => {
			setOpen(false);
			router.push(url);
		},
		[router],
	);

	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActive((a) => Math.min(a + 1, hits.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActive((a) => Math.max(a - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (hits[active]) go(hits[active].url);
			else if (query.trim()) go(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[60] flex items-start justify-center p-4 sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-label={t('title')}
			onKeyDown={onKeyDown}
		>
			{/* 背景（クリックで閉じる） */}
			<button
				type="button"
				aria-hidden="true"
				tabIndex={-1}
				onClick={close}
				className="absolute inset-0 cursor-default bg-zinc-900/40 backdrop-blur-sm"
			/>

			{/* パネル */}
			<div className="relative mt-[10vh] w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
				{/* 入力 */}
				<div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
					<svg
						aria-hidden="true"
						viewBox="0 0 20 20"
						fill="none"
						className="h-5 w-5 shrink-0 text-zinc-400"
					>
						<circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
						<path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
					</svg>
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={t('placeholder')}
						className="w-full bg-transparent py-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
						aria-label={t('title')}
					/>
					<kbd className="hidden shrink-0 rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:block dark:border-zinc-700">
						Esc
					</kbd>
				</div>

				{/* 本体 */}
				{!ALGOLIA_CONFIGURED ? (
					<p className="px-4 py-6 text-sm text-zinc-500">{t('notConfigured')}</p>
				) : !query.trim() ? (
					<p className="px-4 py-6 text-sm text-zinc-500">{t('enterKeyword')}</p>
				) : loading ? (
					<p className="px-4 py-6 text-sm text-zinc-500">{t('searching')}</p>
				) : hits.length === 0 ? (
					<p className="px-4 py-6 text-sm text-zinc-500">{t('noResults')}</p>
				) : (
					<ul className="max-h-[60vh] overflow-y-auto py-2">
						{hits.map((hit, i) => (
							<li key={hit.objectID}>
								<Link
									href={hit.url}
									onClick={close}
									onMouseEnter={() => setActive(i)}
									className={`block px-4 py-2.5 transition-colors ${
										i === active ? 'bg-zinc-100 dark:bg-zinc-900' : ''
									}`}
								>
									{hit.topics?.[0] && (
										<span className="text-[11px] uppercase tracking-wide text-zinc-500">
											{hit.topics[0]}
										</span>
									)}
									<span
										className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 [&_em]:not-italic [&_em]:text-accent-text"
										dangerouslySetInnerHTML={{
											__html: hit._highlightResult?.title?.value ?? hit.title,
										}}
									/>
								</Link>
							</li>
						))}
					</ul>
				)}

				{/* すべての結果へ */}
				{query.trim() && (
					<button
						type="button"
						onClick={() => go(`/search?q=${encodeURIComponent(query)}`)}
						className="block w-full border-t border-zinc-200 px-4 py-3 text-left text-sm text-accent-text transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
					>
						{t('seeAllResults')} →
					</button>
				)}
			</div>
		</div>
	);
}
