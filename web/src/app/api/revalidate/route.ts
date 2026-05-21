/**
 * On-demand Revalidation エンドポイント — /api/revalidate
 *
 * WordPress の save_post / transition_post_status フックから POST される。
 * secret を検証し、投稿タイプに応じたタグ・パスのキャッシュを再検証する。
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

// 投稿タイプ → 再検証するパス
const PATH_MAP: Record<string, (slug: string) => string[]> = {
	post: (slug) => [`/articles/${slug}`, '/articles', '/'],
	feature: (slug) => [`/features/${slug}`, '/features', '/'],
	service: (slug) => [`/services/${slug}`, '/services'],
	career: (slug) => [`/careers/${slug}`, '/careers'],
	author_profile: (slug) => [`/authors/${slug}`, '/authors'],
};

// 投稿タイプ → 再検証するキャッシュタグ
const TAG_MAP: Record<string, (slug: string) => string[]> = {
	post: (slug) => ['posts', `post-${slug}`],
	feature: (slug) => ['features', `feature-${slug}`],
	service: (slug) => ['services', `service-${slug}`],
	career: (slug) => ['careers', `career-${slug}`],
	author_profile: (slug) => ['authors', `author-${slug}`],
};

export async function POST(request: NextRequest) {
	const secret = request.headers.get('x-revalidate-secret');
	if (secret !== process.env.REVALIDATE_SECRET) {
		return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
	}

	try {
		const { postType, slug } = (await request.json()) as {
			postType?: string;
			slug?: string;
		};

		if (!postType || !slug) {
			return NextResponse.json(
				{ message: 'Missing postType or slug' },
				{ status: 400 },
			);
		}

		const paths = PATH_MAP[postType]?.(slug) ?? [];
		const tags = TAG_MAP[postType]?.(slug) ?? [];

		// Next.js 16: revalidateTag は第2引数（cache profile）が必須。
		// 'max' で即時パージ相当（旧 revalidateTag(tag) の挙動）。
		for (const path of paths) revalidatePath(path);
		for (const tag of tags) revalidateTag(tag, 'max');

		return NextResponse.json({ revalidated: true, postType, slug, paths, tags });
	} catch (error) {
		return NextResponse.json(
			{ message: 'Error revalidating', error: String(error) },
			{ status: 500 },
		);
	}
}
