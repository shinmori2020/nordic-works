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
	// topic
	マネジメント: 'Management',
	心理的安全性: 'Psychological Safety',
	リモートワーク: 'Remote Work',
	'1on1': '1-on-1',
	組織デザイン: 'Organization Design',
	カルチャー: 'Culture',
	北欧の働き方: 'Nordic Ways of Working',
	採用戦略: 'Hiring Strategy',
	// industry
	コンサルティング: 'Consulting',
	サービス業: 'Service Industry',
	'医療・ヘルスケア': 'Healthcare',
	'小売・ec': 'Retail & E-commerce',
	製造業: 'Manufacturing',
	'金融・保険': 'Finance & Insurance',
	// reading-level
	上級: 'Advanced',
	中級: 'Intermediate',
	初級: 'Beginner',
};

/** EN ロケール時、辞書にあれば英語名を返す。それ以外は元の名称をそのまま返す。 */
export function localizeTermName(name: string, locale: string): string {
	return locale === 'en' ? (TERM_EN[name] ?? name) : name;
}

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/**
 * URL 用の ASCII スラッグ対応表（デコード済み slug → 英字 slug）。
 * WordPress の日本語 slug をそのまま使うと URL が `%E7%B5%84…` になり共有しづらいため、
 * フロント側で英字 slug に差し替える。対応表に無い slug（既に英数字）はそのまま使う。
 * 用語を追加した場合はここに1行足す。
 */
const TERM_SLUG_ASCII: Record<string, string> = {
	// topic
	マネジメント: 'management',
	心理的安全性: 'psychological-safety',
	リモートワーク: 'remote-work',
	組織デザイン: 'organization-design',
	カルチャー: 'culture',
	北欧の働き方: 'nordic-ways',
	採用戦略: 'hiring-strategy',
	// industry
	コンサルティング: 'consulting',
	サービス業: 'service-industry',
	'医療・ヘルスケア': 'healthcare',
	'小売・ec': 'retail-ec',
	製造業: 'manufacturing',
	'金融・保険': 'finance-insurance',
	// reading-level
	上級: 'advanced',
	中級: 'intermediate',
	初級: 'beginner',
};

/** タームの URL 用 ASCII スラッグを返す（対応表に無ければデコード済み slug）。 */
export function termSlug(term: WPTerm): string {
	const decoded = safeDecode(term.slug);
	return TERM_SLUG_ASCII[decoded] ?? decoded;
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
