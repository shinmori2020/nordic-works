/**
 * 採用情報一覧ページ — /careers
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getCareers } from '@/lib/wordpress';
import { CareerCard } from '@/components/corporate/CareerCard';

// ISR: 採用情報は更新頻度が低いため24時間
export const revalidate = 86400;

export const metadata: Metadata = {
	title: '採用情報',
	description:
		'Nordic Works の採用情報。北欧式の組織づくりを一緒に広めるメンバーを募集しています。',
	alternates: { canonical: '/careers' },
};

export default async function CareersPage() {
	const careers = await getCareers();

	return (
		<main className="mx-auto max-w-5xl px-6 py-12">
			<header className="mb-10">
				<Link
					href="/"
					className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
				>
					← ホーム
				</Link>
				<p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">Careers</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">採用情報</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					現在 {careers.length} 件のポジションを募集中です。
				</p>
			</header>

			{careers.length === 0 ? (
				<p className="text-sm text-red-600">
					⚠️ 採用情報を取得できませんでした。Local の WordPress が起動しているか確認してください。
				</p>
			) : (
				<div className="grid gap-6 sm:grid-cols-2">
					{careers.map((career) => (
						<CareerCard key={career.id} career={career} />
					))}
				</div>
			)}
		</main>
	);
}
