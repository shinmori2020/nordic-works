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
import {
	getFeaturedImage,
	stripHtml,
	formatDate,
	getTerms,
	BLUR_DATA_URL,
} from '@/lib/utils';
import { localizeTermName } from '@/lib/taxonomy';
import { ArticleCard } from '@/components/media/ArticleCard';
import { FeatureCard } from '@/components/media/FeatureCard';
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

/**
 * トップページのセクション見出し（eyebrow + タイトル + 任意の「すべて見る」）。
 * 短いアクセント罫線を添えて編集的なリズムを出す。TOP専用。
 */
function SectionHeading({
	label,
	title,
	viewAllHref,
	viewAllText,
}: {
	label: string;
	title: string;
	viewAllHref?: string;
	viewAllText?: string;
}) {
	return (
		<div className="mb-10 flex items-end justify-between gap-4">
			<div>
				<div className="mb-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
				<p className="text-xs uppercase tracking-widest text-accent-text">{label}</p>
				<h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
					{title}
				</h2>
			</div>
			{viewAllHref && (
				<Link
					href={viewAllHref}
					className="shrink-0 text-sm font-medium text-accent-text transition-colors hover:underline"
				>
					{viewAllText}
				</Link>
			)}
		</div>
	);
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const dateLocale = locale === 'en' ? 'en' : 'ja';

	const t = await getTranslations('home');
	const [posts, features, services] = await Promise.all([
		getPosts(),
		getFeatures(),
		getServices(),
	]);

	// ヒーロー右側で1記事を大きく見せ、最新記事はその次の記事から並べる（重複回避）。
	const heroPost = posts[0];
	const heroImage = heroPost ? getFeaturedImage(heroPost) : null;
	// 最新記事は「リード1本 + ヘッドラインのリスト」の非対称レイアウトで見せる。
	const leadPost = posts[1];
	const listPosts = posts.slice(2, 6);
	const featuredItems = features.slice(0, 2);
	const serviceItems = services.slice(0, 3);

	// アプローチ帯（テキスト主体）。動的キーを避けて配列に展開。
	const approachItems = [
		{ title: t('approach.p1Title'), body: t('approach.p1Body') },
		{ title: t('approach.p2Title'), body: t('approach.p2Body') },
		{ title: t('approach.p3Title'), body: t('approach.p3Body') },
	];

	return (
		<div className="font-brand">
			{/* ヒーロー: 左にコピー、右に注目記事カード（lg以上で2カラム） */}
			<section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-[1500px] px-6 py-20 sm:py-28">
					<div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
						{/* 左: コピー */}
						<div className="lg:w-[660px] lg:shrink">
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
								className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:w-[440px] lg:shrink-0 dark:border-zinc-800 dark:bg-zinc-950"
							>
								<div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
									{heroImage && (
										<Image
											src={heroImage.source_url}
											alt={heroImage.alt_text || heroPost.title.rendered}
											fill
											sizes="(max-width: 1024px) 100vw, 440px"
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

			{/* 最新記事: リード1本を大きく + 残りをヘッドラインのリストで（非対称レイアウト） */}
			<section className="mx-auto max-w-6xl px-6 py-16">
				<SectionHeading
					label={t('latestArticles.label')}
					title={t('latestArticles.title')}
					viewAllHref="/articles"
					viewAllText={t('latestArticles.viewAll')}
				/>
				{!leadPost ? (
					<p className="text-sm text-zinc-500">{t('emptyArticles')}</p>
				) : (
					<div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
						{/* リード記事 */}
						<Reveal>
							<ArticleCard post={leadPost} />
						</Reveal>

						{/* ヘッドラインのリスト */}
						<ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
							{listPosts.map((post) => {
								const topic = getTerms(post, 'topic')[0];
								return (
									<li key={post.id}>
										<Link
											href={`/articles/${post.slug}`}
											className="group block py-4 first:pt-0"
										>
											{topic && (
												<p className="text-xs uppercase tracking-wide text-accent-text">
													{localizeTermName(topic.name, locale)}
												</p>
											)}
											<h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100">
												{post.title.rendered}
											</h3>
											<time
												dateTime={post.date}
												className="mt-1 block text-xs text-zinc-400"
											>
												{formatDate(post.date, dateLocale)}
											</time>
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</section>

			{/* アプローチ: テキスト主体の帯で画像の連続にリズムを作る */}
			<section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<SectionHeading label={t('approach.label')} title={t('approach.title')} />
					<div className="grid gap-10 sm:grid-cols-3">
						{approachItems.map((item, i) => (
							<div key={i}>
								<div className="h-0.5 w-8 rounded-full bg-accent" aria-hidden="true" />
								<h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
									{item.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 注目の特集 */}
			{featuredItems.length > 0 && (
				<section className="border-t border-zinc-200 dark:border-zinc-800">
					<div className="mx-auto max-w-6xl px-6 py-20">
						<SectionHeading
							label={t('featuresPreview.label')}
							title={t('featuresPreview.title')}
						/>
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

			{/* サービス紹介: 番号付きの行レイアウトでカードグリッドと差別化 */}
			<section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<SectionHeading
						label={t('servicesPreview.label')}
						title={t('servicesPreview.title')}
						viewAllHref="/services"
						viewAllText={t('latestArticles.viewAll')}
					/>
					{serviceItems.length === 0 ? (
						<p className="text-sm text-zinc-500">{t('servicesPreview.empty')}</p>
					) : (
						<ul className="border-t border-zinc-200 dark:border-zinc-800">
							{serviceItems.map((service, i) => (
								<li
									key={service.id}
									className="border-b border-zinc-200 dark:border-zinc-800"
								>
									<Link
										href={`/services/${service.slug}`}
										className="group flex items-center gap-5 py-6 sm:gap-8"
									>
										<span className="text-2xl font-semibold tabular-nums text-accent-text sm:text-3xl">
											{String(i + 1).padStart(2, '0')}
										</span>
										<div className="min-w-0 flex-1">
											<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
												{service.title.rendered}
											</h3>
											{service.acf?.subtitle && (
												<p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
													{service.acf.subtitle}
												</p>
											)}
										</div>
										<span
											aria-hidden="true"
											className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1"
										>
											→
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
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
