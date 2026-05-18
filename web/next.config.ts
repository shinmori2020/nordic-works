import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
	images: {
		// Next.js Image で外部ドメインの画像を扱うには明示的な許可が必要。
		// Local の WordPress メディアライブラリ画像を読み込めるようにする。
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'nordic-works.local',
				pathname: '/wp-content/uploads/**',
			},
		],
		// Next.js 16 は SSRF 対策として、プライベートIP（127.0.0.1 等）に解決される
		// ドメインの画像最適化をデフォルトで拒否する。nordic-works.local は Local に
		// より 127.0.0.1 にマップされるため、開発時のみ許可する。
		// 本番では画像は静的ファイル化される（docs/09）ため false のままで安全。
		dangerouslyAllowLocalIP: isDev,
	},
};

export default nextConfig;
