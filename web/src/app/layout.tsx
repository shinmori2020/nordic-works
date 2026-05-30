import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { draftMode } from 'next/headers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PreviewBanner } from '@/components/common/PreviewBanner';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { CookieConsent } from '@/components/common/CookieConsent';
import { ServiceWorkerRegister } from '@/components/common/ServiceWorkerRegister';
import {
	SITE_URL,
	SITE_NAME,
	SITE_DESCRIPTION,
	SITE_LOCALE,
} from '@/lib/site';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const DEFAULT_TITLE = `${SITE_NAME} — 北欧式の働き方・組織設計を支援する`;

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: DEFAULT_TITLE,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	alternates: {
		canonical: '/',
	},
	// PWA: ホーム画面追加・スプラッシュ表示用のアプリ名
	applicationName: SITE_NAME,
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: SITE_NAME,
	},
	openGraph: {
		type: 'website',
		locale: SITE_LOCALE,
		siteName: SITE_NAME,
		title: DEFAULT_TITLE,
		description: SITE_DESCRIPTION,
		url: '/',
	},
	twitter: {
		card: 'summary_large_image',
		title: DEFAULT_TITLE,
		description: SITE_DESCRIPTION,
	},
};

// PWA: ブラウザUIのテーマ色（manifest.theme_color と整合させる）
export const viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#09090b' },
	],
};

/** 組織情報の構造化データ（schema.org Organization） */
const organizationJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: SITE_NAME,
	url: SITE_URL,
	description: SITE_DESCRIPTION,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { isEnabled: isPreview } = await draftMode();

	return (
		<html
			lang="ja"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col bg-white dark:bg-zinc-950">
				<script
					type="application/ld+json"
					// 内製の静的JSONで XSS リスクなし
					dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
				/>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{isPreview && <PreviewBanner />}
					<Header />
					<div className="flex-1">{children}</div>
					<Footer />
					<CookieConsent />
				</ThemeProvider>
				{/* PWA Service Worker。本番環境でのみ登録。 */}
				<ServiceWorkerRegister />
				{/* Vercel Web Analytics / Speed Insights。
				    本番環境（Vercel デプロイ時）でのみ計測が走り、開発時は no-op。 */}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
