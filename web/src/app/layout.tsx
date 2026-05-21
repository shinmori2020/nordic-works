import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ThemeProvider } from '@/components/common/ThemeProvider';
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

/** 組織情報の構造化データ（schema.org Organization） */
const organizationJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: SITE_NAME,
	url: SITE_URL,
	description: SITE_DESCRIPTION,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
					<Header />
					<div className="flex-1">{children}</div>
					<Footer />
				</ThemeProvider>
			</body>
		</html>
	);
}
