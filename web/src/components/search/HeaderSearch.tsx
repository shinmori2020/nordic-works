/**
 * ヘッダー内インライン検索（Client Component）。
 *
 * 平常時は虫眼鏡アイコンのみで、ヘッダー幅を占有しない。
 * 押す（または ⌘/Ctrl+K）とナビが隠れ、その場で入力欄が横に伸びる（策2a）。
 * 入力に応じてヘッダー直下に即時検索の候補ドロップダウンを表示（Algolia）。
 *   - ↑↓ で候補移動 / Enter で遷移 / Esc・✕・外側クリックで閉じる
 *   - 空入力時は「人気のトピック」＋「おすすめの記事」
 *   - Enter（候補未選択）や「すべての結果を見る」で /search へ
 *
 * 開閉状態は Header が保持し、ナビの表示切替と連動させる。
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
const SUGGEST_HITS = 5;

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function HeaderSearch({ open, setOpen }: Props) {
	const t = useTranslations('searchPage');
	const tNav = useTranslations('nav');
	const locale = useLocale();
	const indexName = indexNameForLocale(locale);
	const router = useRouter();

	const [query, setQuery] = useState('');
	const [hits, setHits] = useState<AlgoliaPostHit[]>([]);
	const [suggestHits, setSuggestHits] = useState<AlgoliaPostHit[]>([]);
	const [popularTopics, setPopularTopics] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [active, setActive] = useState(0);

	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// 起動: ⌘/Ctrl+K トグル
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setOpen(!open);
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, setOpen]);

	// 開いたら入力にフォーカス。閉じたら状態リセット。
	useEffect(() => {
		if (open) {
			inputRef.current?.focus();
		} else {
			setQuery('');
			setHits([]);
			setActive(0);
		}
	}, [open]);

	// 外側クリックで閉じる
	useEffect(() => {
		if (!open) return;
		function onDown(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener('mousedown', onDown);
		return () => document.removeEventListener('mousedown', onDown);
	}, [open, setOpen]);

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

	// キーボード選択中の候補を表示領域へスクロール
	useEffect(() => {
		if (!open) return;
		document.getElementById(`hs-hit-${active}`)?.scrollIntoView({ block: 'nearest' });
	}, [active, open]);

	const close = useCallback(() => setOpen(false), [setOpen]);
	const go = useCallback(
		(url: string) => {
			setOpen(false);
			router.push(url);
		},
		[router, setOpen],
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
				id={`hs-hit-${i}`}
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

	// 閉じている時はアイコンボタンのみ（幅を占有しない）
	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={tNav('openSearch')}
				className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
					<path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
				</svg>
			</button>
		);
	}

	return (
		<div ref={rootRef} className="relative flex-1" onKeyDown={onKeyDown}>
			{/* 入力欄（ナビ位置にその場で展開） */}
			<div className="flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
				<svg
					aria-hidden="true"
					viewBox="0 0 20 20"
					fill="none"
					className="h-4 w-4 shrink-0 text-zinc-400"
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
					aria-label={t('title')}
					className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
				/>
				<button
					type="button"
					onClick={close}
					aria-label={t('kbdClose')}
					className="shrink-0 cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
				>
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
					</svg>
				</button>
			</div>

			{/* 候補ドロップダウン（ヘッダー直下） */}
			<div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
				<div className="max-h-[70vh] overflow-y-auto p-2">
					{!ALGOLIA_CONFIGURED ? (
						<p className="px-4 py-6 text-sm text-zinc-500">{t('notConfigured')}</p>
					) : query.trim() ? (
						loading ? (
							<p className="px-4 py-6 text-sm text-zinc-500">{t('searching')}</p>
						) : hits.length === 0 ? (
							<p className="px-4 py-6 text-sm text-zinc-500">{t('noResults')}</p>
						) : (
							<ul className="py-1">{hits.map(renderRow)}</ul>
						)
					) : (
						<div className="pb-1">
							{popularTopics.length > 0 && (
								<div className="px-4 pt-3">
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
								<div className="pt-3">
									<p className="px-4 text-[11px] font-medium uppercase tracking-widest text-accent-text">
										{t('suggested')}
									</p>
									<ul className="mt-1">{suggestHits.map(renderRow)}</ul>
								</div>
							)}
							{!loading && popularTopics.length === 0 && suggestHits.length === 0 && (
								<p className="px-4 py-6 text-sm text-zinc-500">{t('enterKeyword')}</p>
							)}
						</div>
					)}
				</div>

				{/* フッター: すべての結果へ */}
				{query.trim() && (
					<div className="flex items-center justify-end border-t border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
						<button
							type="button"
							onClick={() => go(`/search?q=${encodeURIComponent(query)}`)}
							className="cursor-pointer text-sm text-accent-text underline-offset-2 transition-colors hover:underline"
						>
							{t('seeAllResults')} →
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
