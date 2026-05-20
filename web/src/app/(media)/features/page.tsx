/**
 * 特集一覧ページ — /features
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getFeatures } from '@/lib/wordpress';
import { FeatureCard } from '@/components/media/FeatureCard';

// ISR: 特集は記事より更新頻度が高いため1時間
export const revalidate = 3600;

export const metadata: Metadata = {
	title: '特集一覧',
	description:
		'Nordic Works が複数の記事をテーマ別にまとめた特集の一覧。',
	alternates: { canonical: '/features' },
};

export default async function FeaturesPage() {
	const features = await getFeatures();

	return (
		<main className="mx-auto max-w-4xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
				>
					← ホーム
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">Features</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900">特集一覧</h1>
				<p className="mt-2 text-sm text-zinc-600">{features.length} 件の特集</p>
			</header>

			{features.length === 0 ? (
				<p className="text-sm text-red-600">
					⚠️ 特集を取得できませんでした。Local の WordPress が起動しているか確認してください。
				</p>
			) : (
				<div className="space-y-12">
					{features.map((feature) => (
						<FeatureCard key={feature.id} feature={feature} />
					))}
				</div>
			)}
		</main>
	);
}
