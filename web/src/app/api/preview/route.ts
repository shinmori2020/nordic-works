/**
 * プレビュー有効化エンドポイント — /api/preview
 *
 * WordPress 管理画面の「プレビュー」ボタンから secret 付きで遷移してくる。
 * secret を検証し、draftMode を有効化して対象ページにリダイレクトする。
 */

import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

// 投稿タイプ → フロントのパス
const PATH_MAP: Record<string, (slug: string) => string> = {
	post: (slug) => `/articles/${slug}`,
	feature: (slug) => `/features/${slug}`,
	service: (slug) => `/services/${slug}`,
	career: (slug) => `/careers/${slug}`,
};

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;
	const secret = params.get('secret');
	const slug = params.get('slug');
	const type = params.get('type') ?? 'post';

	if (secret !== process.env.WORDPRESS_PREVIEW_SECRET) {
		return new Response('Invalid token', { status: 401 });
	}
	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	(await draftMode()).enable();

	const buildPath = PATH_MAP[type] ?? PATH_MAP.post;
	redirect(buildPath(slug));
}
