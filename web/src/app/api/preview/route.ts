/**
 * プレビュー有効化エンドポイント — /api/preview
 *
 * WordPress 管理画面の「プレビュー」ボタンから secret 付きで遷移してくる。
 * secret を検証し、draftMode を有効化して対象ページにリダイレクトする。
 *
 * 受け取るクエリ:
 *   - secret : 必須。`.env.local` の WORDPRESS_PREVIEW_SECRET と一致すること。
 *   - type   : 投稿タイプ（post / feature / service / career / author_profile）
 *   - slug   : 推奨。空の場合は id から WP REST で解決する。
 *   - id     : slug が空のときのフォールバック。
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
	author_profile: (slug) => `/authors/${slug}`,
};

// 投稿タイプ → REST のエンドポイント名
const REST_BASE: Record<string, string> = {
	post: 'posts',
	feature: 'feature',
	service: 'service',
	career: 'career',
	author_profile: 'author_profile',
};

/** id から slug を解決する（認証付き）。失敗時は null。 */
async function resolveSlugById(type: string, id: number): Promise<string | null> {
	const apiUrl = process.env.WORDPRESS_API_URL;
	const user = process.env.WP_USERNAME;
	const pass = process.env.WP_APPLICATION_PASSWORD;
	const base = REST_BASE[type];
	if (!apiUrl || !user || !pass || !base) return null;
	const token = Buffer.from(`${user}:${pass}`).toString('base64');
	try {
		const res = await fetch(`${apiUrl}/wp/v2/${base}/${id}?context=edit`, {
			headers: { Authorization: `Basic ${token}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const post = (await res.json()) as { slug?: string };
		return post.slug && post.slug.length > 0 ? post.slug : null;
	} catch {
		return null;
	}
}

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;
	const secret = params.get('secret');
	let slug = params.get('slug') ?? '';
	const idStr = params.get('id');
	const type = params.get('type') ?? 'post';

	if (secret !== process.env.WORDPRESS_PREVIEW_SECRET) {
		return new Response('Invalid token', { status: 401 });
	}

	// slug が空なら id から WP に問い合わせて取得
	if (!slug && idStr) {
		const id = Number.parseInt(idStr, 10);
		if (Number.isFinite(id) && id > 0) {
			const resolved = await resolveSlugById(type, id);
			if (resolved) slug = resolved;
		}
	}

	if (!slug) {
		return new Response(
			'Missing slug. Save the post once so it gets a slug, then try again.',
			{ status: 400 },
		);
	}

	(await draftMode()).enable();

	const buildPath = PATH_MAP[type] ?? PATH_MAP.post;
	redirect(buildPath(slug));
}
