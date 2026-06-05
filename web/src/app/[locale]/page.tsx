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
import {
	getPosts,
	getFeatures,
	getServices,
	getCaseStudies,
	getAuthors,
} from '@/lib/wordpress';
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
import { caseStudyImage } from '@/lib/case-study-image';
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
	const [posts, features, services, caseStudies, authors] = await Promise.all([
		getPosts(),
		getFeatures(),
		getServices(),
		getCaseStudies(),
		getAuthors(),
	]);

	// 最新記事は「大フィーチャー1本 + カードグリッド」で見せる（案A）。
	const leadPost = posts[0];
	const leadImage = leadPost ? getFeaturedImage(leadPost) : null;
	const leadTopic = leadPost ? getTerms(leadPost, 'topic')[0] : undefined;
	const gridPosts = posts.slice(1, 4);
	const featuredItems = features.slice(0, 2);
	const caseItems = caseStudies.slice(0, 3);
	const serviceItems = services.slice(0, 3);
	const authorItems = authors.slice(0, 6);

	// アプローチ帯（テキスト主体）。動的キーを避けて配列に展開。
	const approachItems = [
		{ title: t('approach.p1Title'), body: t('approach.p1Body') },
		{ title: t('approach.p2Title'), body: t('approach.p2Body') },
		{ title: t('approach.p3Title'), body: t('approach.p3Body') },
	];

	return (
		<div className="font-brand">
			{/* ヒーロー: コピー＋オーロラ風アニメ背景（北欧モチーフ） */}
			<section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
				{/* 背景シーン: 水面の流れる波（横波3層）＋光の反射 */}
				<div aria-hidden="true" className="hero-scene">
					<svg
						className="waves text-accent-text"
						viewBox="0 0 1200 800"
						preserveAspectRatio="none"
						fill="none"
					>
						<g className="wave wave-3">
							<path d="M-480 420 q120 -42 240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 L1680 800 L-480 800 Z" />
						</g>
						<g className="wave wave-2">
							<path d="M-480 540 q120 -28 240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 L1680 800 L-480 800 Z" />
						</g>
						<g className="wave wave-1">
							<path d="M-480 660 q120 -34 240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 L1680 800 L-480 800 Z" />
						</g>
					</svg>
					<div className="spot" />
				</div>
				{/* 可読性: テキスト側（左）を地色で落ち着かせ、右にオーロラを見せる */}
				<div
					aria-hidden="true"
					className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/40 to-transparent dark:from-zinc-900 dark:via-zinc-900/40"
				/>
				<div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-center px-6 py-28 sm:min-h-[78vh] sm:py-36">
					<p className="text-sm font-medium uppercase tracking-widest text-accent-text">
						{t('hero.label')}
					</p>
					<h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl sm:leading-tight">
						{t('hero.title')}
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
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
			</section>

			{/* 最新記事: 大フィーチャー1本 + カードグリッド（案A） */}
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
					<>
						{/* 大フィーチャー（リード記事） */}
						<Reveal>
							<Link href={`/articles/${leadPost.slug}`} className="group block">
								<div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:aspect-[21/9]">
									{leadImage && (
										<Image
											src={leadImage.source_url}
											alt={leadImage.alt_text || leadPost.title.rendered}
											fill
											sizes="(max-width: 1152px) 100vw, 1152px"
											placeholder="blur"
											blurDataURL={BLUR_DATA_URL}
											className="object-cover transition-transform duration-300 group-hover:scale-105"
											priority
										/>
									)}
								</div>
								<div className="mt-5">
									{leadTopic && (
										<p className="text-xs uppercase tracking-wide text-accent-text">
											{localizeTermName(leadTopic.name, locale)}
										</p>
									)}
									<h3 className="mt-1 text-2xl font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100 sm:text-3xl">
										{leadPost.title.rendered}
									</h3>
									<p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
										{stripHtml(leadPost.excerpt.rendered)}
									</p>
									<time
										dateTime={leadPost.date}
										className="mt-2 block text-xs text-zinc-400"
									>
										{formatDate(leadPost.date, dateLocale)}
									</time>
								</div>
							</Link>
						</Reveal>

						{/* 残りの記事グリッド（一覧） */}
						{gridPosts.length > 0 && (
							<div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
								{gridPosts.map((post, i) => (
									<Reveal key={post.id} delay={(i % 3) * 0.06}>
										<ArticleCard post={post} />
									</Reveal>
								))}
							</div>
						)}
					</>
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

			{/* 導入事例（実績） */}
			{caseItems.length > 0 && (
				<section className="border-t border-zinc-200 dark:border-zinc-800">
					<div className="mx-auto max-w-6xl px-6 py-20">
						<SectionHeading
							label={t('caseStudiesPreview.label')}
							title={t('caseStudiesPreview.title')}
							viewAllHref="/case-studies"
							viewAllText={t('latestArticles.viewAll')}
						/>
						<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
							{caseItems.map((cs, i) => {
								const image = caseStudyImage(cs);
								return (
									<Reveal key={cs.id} delay={(i % 3) * 0.06}>
										<Link
											href={`/case-studies/${cs.slug}`}
											className="group block h-full overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
										>
											<div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
												{image ? (
													<Image
														src={image.source_url}
														alt={image.alt_text || stripHtml(cs.title.rendered)}
														fill
														sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
														placeholder="blur"
														blurDataURL={BLUR_DATA_URL}
														className="object-cover transition-transform duration-300 group-hover:scale-105"
													/>
												) : (
													<div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-950">
														<span className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
															Nordic Works
														</span>
													</div>
												)}
											</div>
											<div className="p-5">
												{cs.acf?.client_name && (
													<p className="text-xs uppercase tracking-wide text-accent-text">
														{cs.acf.client_name}
													</p>
												)}
												<h3 className="mt-2 font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100">
													{cs.title.rendered}
												</h3>
												{cs.acf?.subtitle && (
													<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
														{cs.acf.subtitle}
													</p>
												)}
											</div>
										</Link>
									</Reveal>
								);
							})}
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

			{/* 採用・お問い合わせ導線（北欧の写真を背景に、暗幕＋白文字） */}
			<section className="relative overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
				{/* 背景画像（帯全体） */}
				<Image
					src="/wp-uploads/2026/05/900-30.jpg"
					alt=""
					aria-hidden="true"
					fill
					sizes="100vw"
					className="object-cover"
				/>
				<div aria-hidden="true" className="absolute inset-0 bg-zinc-950/75" />

				{/* 2つの導線（透過パネル） */}
				<div className="relative grid sm:grid-cols-2 sm:divide-x sm:divide-white/15">
					<Link
						href="/careers"
						className="group flex flex-col items-center justify-center p-10 transition-colors hover:bg-white/5 sm:p-12 lg:p-20"
					>
						<div className="text-left">
							<p className="text-xs uppercase tracking-widest text-white/75">
								Careers
							</p>
							<h3 className="mt-2 text-xl font-semibold text-white">
								{t('careersCta.title')}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-zinc-100">
								{t('careersCta.description')}
							</p>
							<span className="mt-4 inline-block text-sm font-medium text-white group-hover:underline">
								{t('careersCta.link')}
							</span>
						</div>
					</Link>
					<Link
						href="/contact"
						className="group flex flex-col items-center justify-center p-10 transition-colors hover:bg-white/5 sm:p-12 lg:p-20"
					>
						<div className="text-left">
							<p className="text-xs uppercase tracking-widest text-white/75">
								Contact
							</p>
							<h3 className="mt-2 text-xl font-semibold text-white">
								{t('contactCta.title')}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-zinc-100">
								{t('contactCta.description')}
							</p>
							<span className="mt-4 inline-block text-sm font-medium text-white group-hover:underline">
								{t('contactCta.link')}
							</span>
						</div>
					</Link>
				</div>
			</section>

			{/* 執筆陣 */}
			{authorItems.length > 0 && (
				<section className="border-t border-zinc-200 dark:border-zinc-800">
					<div className="mx-auto max-w-6xl px-6 py-20">
						<SectionHeading
							label={t('authorsPreview.label')}
							title={t('authorsPreview.title')}
							viewAllHref="/authors"
							viewAllText={t('latestArticles.viewAll')}
						/>
						<ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
							{authorItems.map((author) => {
								const photo = getFeaturedImage(author);
								return (
									<li key={author.id}>
										<Link
											href={`/authors/${author.slug}`}
											className="group flex flex-col items-center text-center"
										>
											<div className="relative h-20 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
												{photo ? (
													<Image
														src={photo.source_url}
														alt={photo.alt_text || author.title.rendered}
														fill
														sizes="80px"
														className="object-cover"
													/>
												) : (
													<div className="flex h-full items-center justify-center text-[10px] text-zinc-300 dark:text-zinc-600">
														No Photo
													</div>
												)}
											</div>
											<p className="mt-3 text-sm font-medium text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100">
												{author.title.rendered}
											</p>
											{author.acf?.position && (
												<p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
													{author.acf.position}
												</p>
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				</section>
			)}
		</div>
	);
}
