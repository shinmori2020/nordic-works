/**
 * トップページ — /
 *
 * ヒーロー、最新記事、注目特集、サービス紹介、採用・お問い合わせ導線で構成する
 * コーポレート + メディアのランディングページ。
 *
 * すべての可視テキストは next-intl の翻訳キー経由で出力する。
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPosts, getFeatures, getServices } from '@/lib/wordpress';
import { Link } from '@/i18n/navigation';
import { localeAlternates } from '@/lib/site';
import { getFeaturedImage, stripHtml, BLUR_DATA_URL } from '@/lib/utils';
import { ArticleCard } from '@/components/media/ArticleCard';
import { FeatureCard } from '@/components/media/FeatureCard';
import { ServiceCard } from '@/components/corporate/ServiceCard';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/common/Button';

// ISR: 1時間ごとに再生成（docs/06-features.md の方針）
export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'home' });
	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		alternates: localeAlternates('/'),
	};
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('home');
	const [posts, features, services] = await Promise.all([
		getPosts(),
		getFeatures(),
		getServices(),
	]);

	// ヒーロー右側で1記事を大きく見せ、最新記事グリッドはその次の記事から並べる（重複回避）。
	const heroPost = posts[0];
	const heroImage = heroPost ? getFeaturedImage(heroPost) : null;
	const latestPosts = posts.slice(1, 7);
	const featuredItems = features.slice(0, 2);
	const serviceItems = services.slice(0, 3);

	return (
		<div className="font-brand">
			{/* ヒーロー: 左にコピー、右に注目記事カード（lg以上で2カラム） */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-[1500px] px-6 py-20 sm:py-28">
					<div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
						{/* 左: コピー */}
						<div className="lg:col-span-7">
							<p className="text-sm font-medium uppercase tracking-widest text-accent-text">
								{t('hero.label')}
							</p>
							<h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl sm:leading-tight">
								{t('hero.title')}
							</h1>
							<p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
								{t('hero.description')}
							</p>
							<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
								<Button href="/services" variant="primary">
									{t('hero.ctaService')}
								</Button>
								<Button href="/articles" variant="secondary">
									{t('hero.ctaInsights')}
								</Button>
							</div>
						</div>

						{/* 右: 注目記事カード */}
						{heroPost && (
							<Link
								href={`/articles/${heroPost.slug}`}
								className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:col-span-5 lg:ml-auto lg:w-full lg:max-w-lg dark:border-zinc-800 dark:bg-zinc-950"
							>
								<div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
									{heroImage && (
										<Image
											src={heroImage.source_url}
											alt={heroImage.alt_text || heroPost.title.rendered}
											fill
											sizes="(max-width: 1024px) 100vw, 512px"
											placeholder="blur"
											blurDataURL={BLUR_DATA_URL}
											className="object-cover transition-transform duration-300 group-hover:scale-105"
											priority
										/>
									)}
								</div>
								<div className="p-6">
									<p className="text-xs uppercase tracking-widest text-accent-text">
										{t('hero.featuredLabel')}
									</p>
									<h2 className="mt-2 text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-500">
										{heroPost.title.rendered}
									</h2>
									<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
										{stripHtml(heroPost.excerpt.rendered)}
									</p>
								</div>
							</Link>
						)}
					</div>
				</div>
			</section>

			{/* 最新記事 */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<div className="mb-8 flex items-baseline justify-between">
					<div>
						<p className="text-xs uppercase tracking-widest text-accent-text">
							{t('latestArticles.label')}
						</p>
						<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('latestArticles.title')}
						</h2>
					</div>
					<Link
						href="/articles"
						className="text-sm font-medium text-accent-text transition-colors hover:underline"
					>
						{t('latestArticles.viewAll')}
					</Link>
				</div>
				{latestPosts.length === 0 ? (
					<p className="text-sm text-zinc-500">{t('emptyArticles')}</p>
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
				<section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="mx-auto max-w-6xl px-6 py-20">
						<div className="mb-8">
							<p className="text-xs uppercase tracking-widest text-accent-text">
								{t('featuresPreview.label')}
							</p>
							<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
								{t('featuresPreview.title')}
							</h2>
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
						<p className="text-xs uppercase tracking-widest text-accent-text">
							{t('servicesPreview.label')}
						</p>
						<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('servicesPreview.title')}
						</h2>
					</div>
					<Link
						href="/services"
						className="text-sm font-medium text-accent-text transition-colors hover:underline"
					>
						{t('latestArticles.viewAll')}
					</Link>
				</div>
				{serviceItems.length === 0 ? (
					<p className="text-sm text-zinc-500">{t('servicesPreview.empty')}</p>
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
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-accent-text">
							Careers
						</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('careersCta.title')}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{t('careersCta.description')}
						</p>
						<span className="mt-4 inline-block text-sm font-medium text-accent-text group-hover:underline">
							{t('careersCta.link')}
						</span>
					</Link>
					<Link
						href="/contact"
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-accent-text">
							Contact
						</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('contactCta.title')}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{t('contactCta.description')}
						</p>
						<span className="mt-4 inline-block text-sm font-medium text-accent-text group-hover:underline">
							{t('contactCta.link')}
						</span>
					</Link>
				</div>
			</section>
		</div>
	);
}
