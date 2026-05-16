/**
 * 暫定トップページ (Week 3 Task 5 動作確認用)
 *
 * WordPress 接続関数群 (src/lib/wordpress.ts) が動作することを目視確認するための画面。
 * Week 4 でちゃんとしたトップページに置き換える。
 */

import Link from 'next/link';
import {
	getPosts,
	getServices,
	getCareers,
	getFeatures,
	getAuthors,
	getIndustries,
	getTopics,
	getReadingLevels,
} from '@/lib/wordpress';

export const revalidate = 3600;

export default async function Home() {
	// 並列で全エンドポイントを叩く
	const [posts, services, careers, features, authors, industries, topics, readingLevels] =
		await Promise.all([
			getPosts(),
			getServices(),
			getCareers(),
			getFeatures(),
			getAuthors(),
			getIndustries(),
			getTopics(),
			getReadingLevels(),
		]);

	return (
		<main className="max-w-3xl mx-auto px-6 py-12 font-sans">
			<header className="mb-12 border-b border-zinc-200 pb-6">
				<p className="text-xs uppercase tracking-widest text-zinc-500">
					Week 3 / Task 5 — Data Flow Verification
				</p>
				<h1 className="text-3xl font-semibold mt-2 text-zinc-900">
					Nordic Works — WP API Connection Test
				</h1>
				<p className="mt-2 text-sm text-zinc-600">
					このページは <code className="bg-zinc-100 px-1 rounded">src/lib/wordpress.ts</code>{' '}
					の動作確認用です。Week 4 で本物のトップページに置き換わります。
				</p>
				<Link
					href="/articles"
					className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
				>
					記事一覧ページを見る →
				</Link>
			</header>

			<section className="mb-12">
				<h2 className="text-xl font-semibold mb-4 text-zinc-900">取得件数サマリ</h2>
				<table className="w-full text-sm">
					<tbody>
						<TableRow label="記事 (post)" count={posts.length} expected={13} />
						<TableRow label="サービス (service)" count={services.length} expected={3} />
						<TableRow label="採用情報 (career)" count={careers.length} expected={2} />
						<TableRow label="特集 (feature)" count={features.length} expected={2} />
						<TableRow label="著者 (author_profile)" count={authors.length} expected={3} />
						<TableRow
							label="業界タクソノミー (industry)"
							count={industries.length}
							expected={6}
						/>
						<TableRow
							label="トピックタクソノミー (topic)"
							count={topics.length}
							expected={8}
						/>
						<TableRow
							label="読者レベル (reading_level)"
							count={readingLevels.length}
							expected={3}
						/>
					</tbody>
				</table>
			</section>

			<section className="mb-12">
				<h2 className="text-xl font-semibold mb-4 text-zinc-900">投稿された記事一覧</h2>
				{posts.length === 0 ? (
					<p className="text-red-600 text-sm">
						⚠️ 記事が取得できませんでした。Local の WordPress が起動しているか、
						<code className="bg-zinc-100 px-1 rounded">WORDPRESS_API_URL</code> の設定を確認してください。
					</p>
				) : (
					<ol className="space-y-2">
						{posts.map((post) => (
							<li
								key={post.id}
								className="flex items-baseline gap-3 text-sm text-zinc-700"
							>
								<span className="text-zinc-400 tabular-nums shrink-0">
									#{String(post.id).padStart(3, '0')}
								</span>
								<span className="font-medium text-zinc-900">{post.title.rendered}</span>
								<span className="text-zinc-400 text-xs ml-auto shrink-0">
									{post.acf?.reading_time ? `${post.acf.reading_time}分` : '—'}
								</span>
							</li>
						))}
					</ol>
				)}
			</section>

			<section>
				<h2 className="text-xl font-semibold mb-4 text-zinc-900">サービス・採用・特集</h2>
				<div className="grid grid-cols-3 gap-4">
					<ListBlock title="Services" items={services.map((s) => s.title.rendered)} />
					<ListBlock title="Careers" items={careers.map((c) => c.title.rendered)} />
					<ListBlock title="Features" items={features.map((f) => f.title.rendered)} />
				</div>
			</section>

			<footer className="mt-16 pt-6 border-t border-zinc-200 text-xs text-zinc-500">
				<p>
					Source:{' '}
					<code className="bg-zinc-100 px-1 rounded">
						{process.env.WORDPRESS_API_URL ?? '(unset)'}
					</code>
				</p>
				<p className="mt-1">
					Data source mode:{' '}
					<code className="bg-zinc-100 px-1 rounded">
						{process.env.DATA_SOURCE ?? '(unset, defaults to api)'}
					</code>
				</p>
			</footer>
		</main>
	);
}

function TableRow({
	label,
	count,
	expected,
}: {
	label: string;
	count: number;
	expected: number;
}) {
	const ok = count >= expected;
	return (
		<tr className="border-b border-zinc-100">
			<td className="py-2 text-zinc-700">{label}</td>
			<td className="py-2 text-right tabular-nums font-medium text-zinc-900">{count}</td>
			<td className="py-2 text-right text-zinc-400 text-xs">期待値: {expected}</td>
			<td className="py-2 text-right">
				<span className={ok ? 'text-green-600' : 'text-amber-600'}>{ok ? '✓' : '⚠'}</span>
			</td>
		</tr>
	);
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
	return (
		<div>
			<h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{title}</h3>
			<ul className="space-y-1 text-sm text-zinc-700">
				{items.length === 0 ? (
					<li className="text-zinc-400">なし</li>
				) : (
					items.map((label, i) => (
						<li key={i} className="leading-snug">
							{label}
						</li>
					))
				)}
			</ul>
		</div>
	);
}
