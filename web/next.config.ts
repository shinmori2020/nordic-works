import type { NextConfig } from 'next';

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
	},
};

export default nextConfig;
