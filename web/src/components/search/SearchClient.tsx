/**
 * 検索ページ本体（Client Component）。
 *
 * 入力 → デバウンス → Algolia 検索 → 結果リスト + ファセット絞り込み。
 * URL の ?q= を初期値にし、入力変更時は URL も更新（リロード/共有可能）。
 *
 * UI: 検索アイコン＋クリアボタン付き入力、読込中スケルトン、未入力時の
 *     「おすすめの記事」＋人気トピック（ファセット）、一致語のハイライト装飾、
 *     条件をまとめて解除する「すべてクリア」。
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
// useRouter / Link は locale 対応版を使う。
// next/navigation の useRouter だと replace 先に /en プレフィックスが付かず、
// EN で検索ページを開いた直後に JA URL へ書き換わってしまう。
import { Link, useRouter } from '@/i18n/navigation';
import { Skeleton } from '@/components/common/Skeleton';
import {
	algoliaClient,
	ALGOLIA_CONFIGURED,
	indexNameForLocale,
	type AlgoliaPostHit,
} from '@/lib/algolia';

interface FacetCounts {
	topics: Record<string, number>;
	industries: Record<string, number>;
}

interface SearchResponse {
	hits: AlgoliaPostHit[];
	nbHits: number;
	facets: FacetCounts;
	processingTime: number;
}

const EMPTY: SearchResponse = {
	hits: [],
	nbHits: 0,
	facets: { topics: {}, industries: {} },
	processingTime: 0,
};

export function SearchClient({ initialQuery }: { initialQuery: string }) {
	const t = useTranslations('searchPage');
	const locale = useLocale();
	const indexName = indexNameForLocale(locale);
	const router = useRouter();
	const params = useSearchParams();
	const [query, setQuery] = useState(initialQuery);
	const [facetTopic, setFacetTopic] = useState<string | null>(
		params.get('topic'),
	);
	const [facetIndustry, setFacetIndustry] = useState<string | null>(
		params.get('industry'),
	);
	const [data, setData] = useState<SearchResponse>(EMPTY);
	const [loading, setLoading] = useState(false);

	// クエリの ?q= URL 反映（デバウンス）
	useEffect(() => {
		const t = setTimeout(() => {
			const sp = new URLSearchParams();
			if (query) sp.set('q', query);
			if (facetTopic) sp.set('topic', facetTopic);
			if (facetIndustry) sp.set('industry', facetIndustry);
			router.replace(`/search${sp.toString() ? `?${sp}` : ''}`, { scroll: false });
		}, 200);
		return () => clearTimeout(t);
	}, [query, facetTopic, facetIndustry, router]);

	// 実検索（デバウンス）
	useEffect(() => {
		const client = algoliaClient;
		if (!client) return;
		const t = setTimeout(async () => {
			setLoading(true);
			const facetFilters: string[][] = [];
			if (facetTopic) facetFilters.push([`topics:${facetTopic}`]);
			if (facetIndustry) facetFilters.push([`industries:${facetIndustry}`]);
			try {
				// v5 lite クライアントは search() のみ。requests に複数まとめられる
				const res = await client.search({
					requests: [
						{
							indexName,
							query,
							facets: ['topics', 'industries'],
							facetFilters,
							hitsPerPage: 20,
						},
					],
				});
				const first = (res.results ?? [])[0] as
					| {
							hits?: AlgoliaPostHit[];
							nbHits?: number;
							facets?: Record<string, Record<string, number>>;
							processingTimeMS?: number;
					  }
					| undefined;
				setData({
					hits: first?.hits ?? [],
					nbHits: first?.nbHits ?? 0,
					facets: {
						topics: first?.facets?.topics ?? {},
						industries: first?.facets?.industries ?? {},
					},
					processingTime: first?.processingTimeMS ?? 0,
				});
			} catch (err) {
				console.error('[algolia]', err);
				setData(EMPTY);
			} finally {
				setLoading(false);
			}
		}, 150);
		return () => clearTimeout(t);
	}, [query, facetTopic, facetIndustry, indexName]);

	const topicEntries = useMemo(
		() => Object.entries(data.facets.topics).sort((a, b) => b[1] - a[1]),
		[data.facets.topics],
	);
	const industryEntries = useMemo(
		() => Object.entries(data.facets.industries).sort((a, b) => b[1] - a[1]),
		[data.facets.industries],
	);

	const hasFilters = Boolean(query || facetTopic || facetIndustry);
	const isEmpty = !hasFilters;

	function clearAll() {
		setQuery('');
		setFacetTopic(null);
		setFacetIndustry(null);
	}

	if (!ALGOLIA_CONFIGURED) {
		return (
			<p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
				{t('notConfigured')}
			</p>
		);
	}

	return (
		<div>
			{/* 検索入力（アイコン＋クリア） */}
			<div className="relative">
				<svg
					aria-hidden="true"
					viewBox="0 0 20 20"
					fill="none"
					className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
				>
					<circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
					<path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
				</svg>
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={t('placeholder')}
					className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 pl-11 pr-10 text-base text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					autoFocus
				/>
				{query && (
					<button
						type="button"
						onClick={() => setQuery('')}
						aria-label={t('clear')}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				)}
			</div>

			{/* ステータス＋すべてクリア */}
			<div className="mt-3 flex items-center justify-between gap-3">
				<p className="text-sm text-zinc-500">
					{loading
						? t('searching')
						: query
							? t('hitCount', { count: data.nbHits, ms: data.processingTime })
							: t('enterKeyword')}
				</p>
				{hasFilters && (
					<button
						type="button"
						onClick={clearAll}
						className="shrink-0 text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
					>
						{t('clearAll')}
					</button>
				)}
			</div>

			{/* ファセット（横並びチップ＝人気トピック/業界） */}
			<div className="mt-6 space-y-3">
				<FacetChips
					label={t('facetTopic')}
					entries={topicEntries}
					selected={facetTopic}
					onChange={setFacetTopic}
					clearLabel={t('clear')}
					clearAria={t('clearAria', { label: t('facetTopic') })}
				/>
				<FacetChips
					label={t('facetIndustry')}
					entries={industryEntries}
					selected={facetIndustry}
					onChange={setFacetIndustry}
					clearLabel={t('clear')}
					clearAria={t('clearAria', { label: t('facetIndustry') })}
				/>
			</div>

			{/* 本体: 読込中=スケルトン / 未入力=おすすめ / それ以外=結果 */}
			{loading ? (
				<SkeletonRows />
			) : isEmpty ? (
				<section className="mt-8">
					<h2 className="text-xs font-medium uppercase tracking-widest text-accent-text">
						{t('suggested')}
					</h2>
					<ul className="mt-4 space-y-6">
						{data.hits.slice(0, 6).map((hit) => (
							<HitItem key={hit.objectID} hit={hit} />
						))}
					</ul>
				</section>
			) : (
				<>
					<ul className="mt-8 space-y-6">
						{data.hits.map((hit) => (
							<HitItem key={hit.objectID} hit={hit} />
						))}
					</ul>
					{query && data.hits.length === 0 && (
						<p className="mt-6 text-sm text-zinc-500">{t('noResults')}</p>
					)}
				</>
			)}
		</div>
	);
}

/** 検索結果1件（タイトル/抜粋に一致語ハイライトの装飾を適用）。 */
function HitItem({ hit }: { hit: AlgoliaPostHit }) {
	return (
		<li className="border-b border-zinc-200 pb-6 last:border-0 dark:border-zinc-800">
			<Link href={hit.url} className="group block">
				{hit.topics && hit.topics.length > 0 && (
					<p className="text-xs uppercase tracking-wide text-zinc-500">{hit.topics[0]}</p>
				)}
				<h3
					className="mt-1 font-semibold text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100 [&_em]:not-italic [&_em]:text-accent-text"
					dangerouslySetInnerHTML={{
						__html: hit._highlightResult?.title?.value ?? hit.title,
					}}
				/>
				<p
					className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 [&_em]:font-medium [&_em]:not-italic [&_em]:text-accent-text"
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
}

/** 読込中のプレースホルダー（結果リストの形に合わせた骨組み）。 */
function SkeletonRows() {
	return (
		<ul className="mt-8 space-y-6" aria-hidden="true">
			{Array.from({ length: 5 }).map((_, i) => (
				<li
					key={i}
					className="border-b border-zinc-200 pb-6 last:border-0 dark:border-zinc-800"
				>
					<Skeleton className="h-3 w-20" />
					<Skeleton className="mt-2 h-5 w-3/4" />
					<Skeleton className="mt-2 h-4 w-full" />
					<Skeleton className="mt-1 h-4 w-5/6" />
				</li>
			))}
		</ul>
	);
}

/** 横並び型のファセット選択UI（ラベル + チップ列 + クリアボタン） */
function FacetChips({
	label,
	entries,
	selected,
	onChange,
	clearLabel,
	clearAria,
}: {
	label: string;
	entries: [string, number][];
	selected: string | null;
	onChange: (v: string | null) => void;
	clearLabel: string;
	clearAria: string;
}) {
	if (entries.length === 0 && !selected) return null;
	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-xs font-medium uppercase tracking-widest text-accent-text">
				{label}
			</span>
			{entries.map(([name, count]) => {
				const active = name === selected;
				return (
					<button
						key={name}
						type="button"
						onClick={() => onChange(active ? null : name)}
						className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
							active
								? 'border-accent bg-accent text-white'
								: 'border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900'
						}`}
					>
						<span>{name}</span>
						<span className={`text-[10px] ${active ? 'opacity-80' : 'text-zinc-500'}`}>
							{count}
						</span>
					</button>
				);
			})}
			{selected && (
				<button
					type="button"
					onClick={() => onChange(null)}
					aria-label={clearAria}
					className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
				>
					<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M4 4l8 8M12 4l-8 8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
					<span>{clearLabel}</span>
				</button>
			)}
		</div>
	);
}
