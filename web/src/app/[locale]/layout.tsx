/**
 * ロケール別レイアウト — /[locale]/...
 *
 * 役割:
 * - URL パスの locale を検証（不正なら notFound）
 * - setRequestLocale で next-intl の静的化を有効化
 * - **NextIntlClientProvider をここで張る**（params の locale を確実に渡す）
 *   ＋ i18n に依存する共通要素（Header / Footer / 各プロバイダー）を配置
 *
 * ルート app/layout.tsx は [locale] の外側のため正しい locale を取得できない。
 * よって i18n 依存のものはすべてこの層に置く。
 */

import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PreviewBanner } from '@/components/common/PreviewBanner';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { CookieConsent } from '@/components/common/CookieConsent';
import { SkipLink } from '@/components/common/SkipLink';
import { HtmlLang } from '@/components/common/HtmlLang';
import { SearchPalette } from '@/components/search/SearchPalette';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	// next-intl の静的化（generateStaticParams 対応）のために必須
	setRequestLocale(locale);

	const { isEnabled: isPreview } = await draftMode();
	const messages = await getMessages();

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<HtmlLang />
				<SkipLink />
				{isPreview && <PreviewBanner />}
				<Header />
				<SearchPalette />
				{/* スキップリンクの着地点。各ページ側が <main> ランドマークを持つため、
				    ここは main をネストさせず div + tabIndex=-1 にする。 */}
				<div
					id="main-content"
					tabIndex={-1}
					className="flex-1 focus:outline-none"
				>
					{children}
				</div>
				<Footer />
				<CookieConsent />
			</ThemeProvider>
		</NextIntlClientProvider>
	);
}
