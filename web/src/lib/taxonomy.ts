/**
 * タクソノミー用語名のローカライズ。
 *
 * WordPress のタクソノミー用語（topic 等）はコンテンツ側の文字列で、
 * EN データでも名称が日本語のまま入っている。種類が少なく固定なので、
 * UI 側で「日本語名 → 英語名」の辞書を持ち、EN ロケール時のみ差し替える。
 *
 * 機械翻訳だと "1on1"・"北欧の働き方" 等が崩れやすいため手動管理する。
 * industry / reading-level など他タクソノミーを訳す場合もこの辞書に追記する。
 */
import { getTerms } from '@/lib/utils';
import type { WPPost, WPTerm } from '@/types/wordpress';

const TERM_EN: Record<string, string> = {
	マネジメント: 'Management',
	心理的安全性: 'Psychological Safety',
	リモートワーク: 'Remote Work',
	'1on1': '1-on-1',
	組織デザイン: 'Organization Design',
	カルチャー: 'Culture',
	北欧の働き方: 'Nordic Ways of Working',
	採用戦略: 'Hiring Strategy',
};

/** EN ロケール時、辞書にあれば英語名を返す。それ以外は元の名称をそのまま返す。 */
export function localizeTermName(name: string, locale: string): string {
	return locale === 'en' ? (TERM_EN[name] ?? name) : name;
}

/** 記事群から topic タクソノミーの用語を重複なく集める（出現順）。 */
export function collectTopics(posts: WPPost[]): WPTerm[] {
	const map = new Map<string, WPTerm>();
	for (const post of posts) {
		for (const term of getTerms(post, 'topic')) {
			if (!map.has(term.slug)) map.set(term.slug, term);
		}
	}
	return [...map.values()];
}
