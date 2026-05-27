/**
 * 検索ページ本体（Client Component）。
 *
 * 入力 → デバウンス → Algolia 検索 → 結果リスト + ファセット絞り込み。
 * URL の ?q= を初期値にし、入力変更時は URL も更新（リロード/共有可能）。
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
				Algolia の環境変数が未設定です。
			</p>
		);
	}

	return (
		<div className="grid gap-8 lg:grid-cols-[1fr_240px]">
			{/* メイン: 入力 + 結果 */}
			<div>
				<div className="relative">
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="記事を検索（例: 心理的安全性、リモートワーク）"
						className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						autoFocus
					/>
				</div>

				<p className="mt-3 text-sm text-zinc-500">
					{loading
						? '検索中…'
						: query
							? `${data.nbHits} 件ヒット（${data.processingTime} ms）`
							: 'キーワードを入力してください'}
				</p>

				<ul className="mt-6 space-y-6">
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
						該当する記事は見つかりませんでした。
					</p>
				)}
			</div>

			{/* サイドバー: ファセット */}
			<aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
				<FacetGroup
					label="トピック"
					entries={topicEntries}
					selected={facetTopic}
					onChange={setFacetTopic}
				/>
				<FacetGroup
					label="業界"
					entries={industryEntries}
					selected={facetIndustry}
					onChange={setFacetIndustry}
				/>
			</aside>
		</div>
	);
}

function FacetGroup({
	label,
	entries,
	selected,
	onChange,
}: {
	label: string;
	entries: [string, number][];
	selected: string | null;
	onChange: (v: string | null) => void;
}) {
	if (entries.length === 0) return null;
	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
				{label}
			</p>
			<ul className="mt-2 space-y-1">
				{entries.map(([name, count]) => {
					const active = name === selected;
					return (
						<li key={name}>
							<button
								type="button"
								onClick={() => onChange(active ? null : name)}
								className={`flex w-full items-center justify-between rounded px-2 py-1 text-sm transition-colors ${
									active
										? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
										: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
								}`}
							>
								<span>{name}</span>
								<span className="text-xs opacity-70">{count}</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
