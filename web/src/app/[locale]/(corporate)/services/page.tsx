/**
 * サービス一覧ページ — /services
 */

import type { Metadata } from 'next';
import { getServices } from '@/lib/wordpress';
import { ServiceCard } from '@/components/corporate/ServiceCard';

// ISR: サービスは更新頻度が低いため24時間（docs/06-features.md の方針）
export const revalidate = 86400;

export const metadata: Metadata = {
	title: 'サービス',
	description:
		'Nordic Works が提供する、北欧式の組織づくり・働き方改善を支援するサービス一覧。',
	alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
	const services = await getServices();

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-10">
				<p className="text-xs uppercase tracking-widest text-zinc-500">Services</p>
				<h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">サービス</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					北欧式の組織づくりを支援する {services.length} のサービス。
				</p>
			</header>

			{services.length === 0 ? (
				<p className="text-sm text-red-600">
					⚠️ サービスを取得できませんでした。Local の WordPress が起動しているか確認してください。
				</p>
			) : (
				<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
					{services.map((service) => (
						<ServiceCard key={service.id} service={service} />
					))}
				</div>
			)}
		</main>
	);
}
