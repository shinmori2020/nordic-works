/**
 * コマンドパレット型 検索モーダル（Client Component）。
 *
 * 起動: Cmd/Ctrl+K、またはヘッダー検索ボタンが投げる 'nordic:open-search' イベント。
 * 操作: 入力でライブ検索（Algolia）／↑↓で候補移動／Enterで遷移／Escで閉じる。
 *
 * リッチ化:
 * - 空状態に「人気のトピック」＋「おすすめの記事」（空クエリの結果/ファセット）
 * - 各候補にスニペット（ハイライト付き）
 * - フッターにキーボードヒント
 * - アクティブ候補を左アクセントバーで強調＋自動スクロール
 * - 入場アニメ（globals.css の sp-* / prefers-reduced-motion 対応）
 *
 * layout に常設（NextIntlClientProvider 配下）。開いている間だけ DOM を描画する。
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
	algoliaClient,
	ALGOLIA_CONFIGURED,
	indexNameForLocale,
	type AlgoliaPostHit,
} from '@/lib/algolia';

const MAX_HITS = 7;
const SUGGEST_HITS = 6;

export function SearchPalette() {
	const t = useTranslations('searchPage');
	const locale = useLocale();
	const indexName = indexNameForLocale(locale);
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [hits, setHits] = useState<AlgoliaPostHit[]>([]);
	const [suggestHits, setSuggestHits] = useState<AlgoliaPostHit[]>([]);
	const [popularTopics, setPopularTopics] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [active, setActive] = useState(0);
	const inputRef = (el: HTMLInputElement | null) => {
		if (el && open) el.focus();
	};

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

	// 開いている間は背景スクロールロック。閉じたら状態リセット。
	useEffect(() => {
		if (!open) {
			setQuery('');
			setHits([]);
			setActive(0);
			return;
		}
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, [open]);

	// 検索（デバウンス）。空クエリ時は「おすすめ＋人気トピック」を取得。
	useEffect(() => {
		if (!open) return;
		const client = algoliaClient;
		if (!client) return;
		const q = query.trim();
		setLoading(true);
		const id = window.setTimeout(
			async () => {
				try {
					const res = await client.search({
						requests: [
							{
								indexName,
								query: q,
								hitsPerPage: q ? MAX_HITS : SUGGEST_HITS,
								facets: q ? [] : ['topics'],
							},
						],
					});
					const first = (res.results ?? [])[0] as
						| {
								hits?: AlgoliaPostHit[];
								facets?: Record<string, Record<string, number>>;
						  }
						| undefined;
					const resultHits = first?.hits ?? [];
					if (q) {
						setHits(resultHits);
					} else {
						setSuggestHits(resultHits);
						setPopularTopics(
							Object.entries(first?.facets?.topics ?? {})
								.sort((a, b) => b[1] - a[1])
								.slice(0, 8)
								.map(([name]) => name),
						);
					}
					setActive(0);
				} catch (err) {
					console.error('[algolia]', err);
					if (q) setHits([]);
				} finally {
					setLoading(false);
				}
			},
			q ? 150 : 0,
		);
		return () => window.clearTimeout(id);
	}, [open, query, indexName]);

	// キーボードで選択中の候補を表示領域内へスクロール
	useEffect(() => {
		if (!open) return;
		document.getElementById(`sp-hit-${active}`)?.scrollIntoView({ block: 'nearest' });
	}, [active, open]);

	const close = useCallback(() => setOpen(false), []);
	const go = useCallback(
		(url: string) => {
			setOpen(false);
			router.push(url);
		},
		[router],
	);

	const list = query.trim() ? hits : suggestHits;

	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActive((a) => Math.min(a + 1, list.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActive((a) => Math.max(a - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (list[active]) go(list[active].url);
			else if (query.trim()) go(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	const renderRow = (hit: AlgoliaPostHit, i: number) => (
		<li key={hit.objectID}>
			<Link
				id={`sp-hit-${i}`}
				href={hit.url}
				onClick={close}
				onMouseEnter={() => setActive(i)}
				aria-selected={i === active}
				className={`block rounded-lg px-4 py-2.5 transition-colors ${
					i === active
						? 'bg-zinc-100 dark:bg-zinc-800'
						: 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
				<span
					className="mt-0.5 block line-clamp-1 text-xs text-zinc-500 [&_em]:not-italic [&_em]:text-accent-text"
					dangerouslySetInnerHTML={{
						__html:
							hit._snippetResult?.content?.value ??
							hit._snippetResult?.excerpt?.value ??
							hit.excerpt,
					}}
				/>
			</Link>
		</li>
	);

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
				className="sp-backdrop absolute inset-0 cursor-default bg-zinc-900/40 backdrop-blur-sm"
			/>

			{/* パネル */}
			<div className="sp-panel relative mt-[10vh] flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
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
					<button
						type="button"
						onClick={close}
						aria-label={t('kbdClose')}
						className="shrink-0 cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				{/* 本体 */}
				<div className="max-h-[65vh] overflow-y-auto p-2">
					{!ALGOLIA_CONFIGURED ? (
						<p className="px-4 py-6 text-sm text-zinc-500">{t('notConfigured')}</p>
					) : query.trim() ? (
						loading ? (
							<p className="px-4 py-6 text-sm text-zinc-500">{t('searching')}</p>
						) : hits.length === 0 ? (
							<p className="px-4 py-6 text-sm text-zinc-500">{t('noResults')}</p>
						) : (
							<ul className="py-2">{hits.map(renderRow)}</ul>
						)
					) : (
						<div className="pb-2">
							{popularTopics.length > 0 && (
								<div className="px-4 pt-4">
									<p className="text-[11px] font-medium uppercase tracking-widest text-accent-text">
										{t('popularTopics')}
									</p>
									<div className="mt-2 flex flex-wrap gap-2">
										{popularTopics.map((name) => (
											<button
												key={name}
												type="button"
												onClick={() => go(`/search?topic=${encodeURIComponent(name)}`)}
												className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
											>
												{name}
											</button>
										))}
									</div>
								</div>
							)}
							{suggestHits.length > 0 && (
								<div className="pt-4">
									<p className="px-4 text-[11px] font-medium uppercase tracking-widest text-accent-text">
										{t('suggested')}
									</p>
									<ul className="mt-2">{suggestHits.map(renderRow)}</ul>
								</div>
							)}
							{!loading && popularTopics.length === 0 && suggestHits.length === 0 && (
								<p className="px-4 py-6 text-sm text-zinc-500">{t('enterKeyword')}</p>
							)}
						</div>
					)}
				</div>

				{/* フッター: キーボードヒント＋すべての結果へ */}
				<div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
					<div className="hidden items-center gap-3 text-[11px] text-zinc-400 sm:flex">
						<span className="inline-flex items-center gap-1">
							<kbd className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-700">↑↓</kbd>
							{t('kbdMove')}
						</span>
						<span className="inline-flex items-center gap-1">
							<kbd className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-700">↵</kbd>
							{t('kbdSelect')}
						</span>
						<span className="inline-flex items-center gap-1">
							<kbd className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-700">esc</kbd>
							{t('kbdClose')}
						</span>
					</div>
					{query.trim() && (
						<button
							type="button"
							onClick={() => go(`/search?q=${encodeURIComponent(query)}`)}
							className="ml-auto shrink-0 cursor-pointer text-sm text-accent-text underline-offset-2 transition-colors hover:underline"
						>
							{t('seeAllResults')} →
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
