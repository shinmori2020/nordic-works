/**
 * トップページ — /
 *
 * ヒーロー、最新記事、注目特集、サービス紹介、採用・お問い合わせ導線で構成する
 * コーポレート + メディアのランディングページ。
 *
 * すべての可視テキストは next-intl の翻訳キー経由で出力する。
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPosts, getFeatures, getServices } from '@/lib/wordpress';
import { Link } from '@/i18n/navigation';
import { ArticleCard } from '@/components/media/ArticleCard';
import { FeatureCard } from '@/components/media/FeatureCard';
import { ServiceCard } from '@/components/corporate/ServiceCard';
import { Reveal } from '@/components/common/Reveal';

// ISR: 1時間ごとに再生成（docs/06-features.md の方針）
export const revalidate = 3600;

/**
 * 社会的証明の数値。架空企業のため値は設定値。
 * value は言語非依存（数字・記号）、ラベルは翻訳キーで出す。
 */
const STATS = [
	{ value: '50+', key: 'clients' as const },
	{ value: '-32%', key: 'retention' as const },
	{ value: '4.6', key: 'satisfaction' as const },
	{ value: '8', key: 'industries' as const },
];

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

	const latestPosts = posts.slice(0, 6);
	const featuredItems = features.slice(0, 2);
	const serviceItems = services.slice(0, 3);

	return (
		<>
			{/* ヒーロー */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
					<p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
						{t('hero.label')}
					</p>
					<h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl sm:leading-tight">
						{t('hero.title')}
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
						{t('hero.description')}
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href="/services"
							className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
						>
							{t('hero.ctaService')}
						</Link>
						<Link
							href="/articles"
							className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
						>
							{t('hero.ctaInsights')}
						</Link>
					</div>
				</div>
			</section>

			{/* 社会的証明（実績の数字）。ヒーロー直後に置いて信頼を即提示する。
			    濃色背景で前後セクションとメリハリをつける。 */}
			<section className="bg-zinc-900 dark:bg-zinc-950">
				<div className="mx-auto max-w-6xl px-6 py-14">
					<div className="mb-8">
						<p className="text-xs uppercase tracking-widest text-zinc-400">
							{t('stats.label')}
						</p>
						<h2 className="mt-1 text-2xl font-semibold text-white">
							{t('stats.title')}
						</h2>
					</div>
					<dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
						{STATS.map((stat) => (
							<div key={stat.key}>
								<dt className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
									{stat.value}
								</dt>
								<dd className="mt-2 text-sm text-zinc-400">
									{t(`stats.${stat.key}`)}
								</dd>
							</div>
						))}
					</dl>
					<p className="mt-8 text-xs text-zinc-500">{t('stats.note')}</p>
				</div>
			</section>

			{/* 最新記事 */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<div className="mb-8 flex items-baseline justify-between">
					<div>
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							{t('latestArticles.label')}
						</p>
						<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('latestArticles.title')}
						</h2>
					</div>
					<Link
						href="/articles"
						className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
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
					<div className="mx-auto max-w-6xl px-6 py-16">
						<div className="mb-8">
							<p className="text-xs uppercase tracking-widest text-zinc-500">
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
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							{t('servicesPreview.label')}
						</p>
						<h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('servicesPreview.title')}
						</h2>
					</div>
					<Link
						href="/services"
						className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
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
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							Careers
						</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('careersCta.title')}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{t('careersCta.description')}
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 group-hover:underline dark:text-zinc-100">
							{t('careersCta.link')}
						</span>
					</Link>
					<Link
						href="/contact"
						className="group bg-white p-10 transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
					>
						<p className="text-xs uppercase tracking-widest text-zinc-500">
							Contact
						</p>
						<h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							{t('contactCta.title')}
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{t('contactCta.description')}
						</p>
						<span className="mt-4 inline-block text-sm text-zinc-900 group-hover:underline dark:text-zinc-100">
							{t('contactCta.link')}
						</span>
					</Link>
				</div>
			</section>
		</>
	);
}
