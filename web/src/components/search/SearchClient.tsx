/**
 * 検索ページ本体（Client Component）。
 *
 * 入力 → デバウンス → Algolia 検索 → 結果リスト + ファセット絞り込み。
 * URL の ?q= を初期値にし、入力変更時は URL も更新（リロード/共有可能）。
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
	algoliaClient,
	ALGOLIA_CONFIGURED,
	ALGOLIA_INDEX_NAME,
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
							indexName: ALGOLIA_INDEX_NAME,
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
	}, [query, facetTopic, facetIndustry]);

	const topicEntries = useMemo(
		() => Object.entries(data.facets.topics).sort((a, b) => b[1] - a[1]),
		[data.facets.topics],
	);
	const industryEntries = useMemo(
		() => Object.entries(data.facets.industries).sort((a, b) => b[1] - a[1]),
		[data.facets.industries],
	);

	if (!ALGOLIA_CONFIGURED) {
		return (
			<p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
				{t('notConfigured')}
			</p>
		);
	}

	return (
		<div>
			{/* 検索入力 */}
			<input
				type="search"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={t('placeholder')}
				className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				autoFocus
			/>

			<p className="mt-3 text-sm text-zinc-500">
				{loading
					? t('searching')
					: query
						? t('hitCount', { count: data.nbHits, ms: data.processingTime })
						: t('enterKeyword')}
			</p>

			{/* ファセット（横並びチップ） */}
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

			{/* 結果リスト */}
			<ul className="mt-8 space-y-6">
				{data.hits.map((hit) => (
					<li
						key={hit.objectID}
						className="border-b border-zinc-200 pb-6 last:border-0 dark:border-zinc-800"
					>
						<Link href={hit.url} className="group block">
							{hit.topics && hit.topics.length > 0 && (
								<p className="text-xs uppercase tracking-wide text-zinc-500">
									{hit.topics[0]}
								</p>
							)}
							<h3
								className="mt-1 font-semibold text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100"
								dangerouslySetInnerHTML={{
									__html: hit._highlightResult?.title?.value ?? hit.title,
								}}
							/>
							<p
								className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
								dangerouslySetInnerHTML={{
									__html:
										hit._snippetResult?.content?.value ??
										hit._snippetResult?.excerpt?.value ??
										hit.excerpt,
								}}
							/>
						</Link>
					</li>
				))}
			</ul>

			{query && !loading && data.hits.length === 0 && (
				<p className="mt-6 text-sm text-zinc-500">
					{t('noResults')}
				</p>
			)}
		</div>
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
			<span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
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
								? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
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
