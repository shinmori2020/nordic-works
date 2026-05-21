/**
 * トップページ — /
 *
 * ヒーロー、最新記事、注目特集、サービス紹介、採用・お問い合わせ導線で構成する
 * コーポレート + メディアのランディングページ。
 */

import Link from 'next/link';
import { getPosts, getFeatures, getServices } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';
import { FeatureCard } from '@/components/media/FeatureCard';
import { ServiceCard } from '@/components/corporate/ServiceCard';
import { Reveal } from '@/components/common/Reveal';

// ISR: 1時間ごとに再生成（docs/06-features.md の方針）
export const revalidate = 3600;

export default async function Home() {
	const [posts, features, services] = await Promise.all([
		getPosts(),
		getFeatures(),
		getServices(),
	]);

	const latestPosts = posts.slice(0, 6);
	const featuredItems = features.slice(0, 2);
	const serviceItems = services.slice(0, 3);

	return (
		<>
			{/* ヒーロー */}
			<section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
					<p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
						Nordic ways of working
					</p>
					<h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl sm:leading-tight">
						働き方を、北欧の知恵で設計する。
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						リモートワーク、心理的安全性、組織デザイン。Nordic Works は、データと北欧の組織文化をもとに、これからの働き方を支援する B2B SaaS 企業です。
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href="/services"
							className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
						>
							サービスを見る
						</Link>
						<Link
							href="/articles"
							className="rounded-md border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-white dark:hover:bg-zinc-900"
						>
							Insights を読む
						</Link>
					</div>
				</div>
			</section>

			{/* 最新記事 */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<div className="mb-8 flex items-baseline justify-between">
					<div>
						<p className="text-xs uppercase tracking-widest text-zinc-500">Insights</p>
						<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">最新の記事</h2>
					</div>
					<Link
						href="/articles"
						className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						すべて見る →
					</Link>
				</div>
				{latestPosts.length === 0 ? (
					<p className="text-sm text-zinc-500">記事がまだありません。</p>
				) : (
					<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{latestPosts.map((post, i) => (
							<Reveal key={post.id} delay={(i % 3) * 0.06}>
								<ArticleCard post={post} />
							</Reveal>
						))}
					</div>
				)}
			</section>

			{/* 注目の特集 */}
			{featuredItems.length > 0 && (
				<section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
					<div className="mx-auto max-w-6xl px-6 py-16">
						<div className="mb-8">
							<p className="text-xs uppercase tracking-widest text-zinc-500">Features</p>
							<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">注目の特集</h2>
						</div>
						<div className="grid gap-10">
							{featuredItems.map((feature) => (
								<Reveal key={feature.id}>
									<FeatureCard feature={feature} />
								</Reveal>
							))}
						</div>
					</div>
				</section>
			)}

			{/* サービス紹介 */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<div className="mb-8 flex items-baseline justify-between">
					<div>
						<p className="text-xs uppercase tracking-widest text-zinc-500">Services</p>
						<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">サービス</h2>
					</div>
					<Link
						href="/services"
						className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						すべて見る →
					</Link>
				</div>
				{serviceItems.length === 0 ? (
					<p className="text-sm text-zinc-500">サービスがまだありません。</p>
				) : (
					<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{serviceItems.map((service, i) => (
							<Reveal key={service.id} delay={(i % 3) * 0.06}>
								<ServiceCard service={service} />
							</Reveal>
						))}
					</div>
				)}
			</section>

			{/* 採用・お問い合わせ導線 */}
			<section className="border-t border-zinc-200 dark:border-zinc-800">
				<div className="mx-auto grid max-w-6xl gap-px bg-zinc-200 sm:grid-cols-2 dark:bg-zinc-800">
					<Link
						href="/careers"
						className="group bg-white dark:bg-zinc-950 p-10 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">Careers</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							一緒に働きませんか
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							北欧式の組織づくりを共に推進するメンバーを募集しています。
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 dark:text-zinc-100 group-hover:underline">
							採用情報を見る →
						</span>
					</Link>
					<Link
						href="/contact"
						className="group bg-white dark:bg-zinc-950 p-10 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							お問い合わせ
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							サービス導入のご相談・取材のご依頼はこちらから。
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 dark:text-zinc-100 group-hover:underline">
							お問い合わせフォームへ →
						</span>
					</Link>
				</div>
			</section>
		</>
	);
}
