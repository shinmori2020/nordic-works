/**
 * WordPress REST API response types.
 *
 * src/lib/wordpress.ts の取得関数が返すデータの型を集約管理する。
 * (CLAUDE.md の方針「型は src/types/wordpress.ts で集約管理」に準拠)
 */

// =============================================================================
// 基本型 / Primitives
// =============================================================================

/** WordPress の rendered フィールド (title / content / excerpt 等) */
export interface WPRendered {
	rendered: string;
}

/** 投稿ステータス */
export type WPPostStatus = 'publish' | 'draft' | 'pending' | 'private' | 'future';

// =============================================================================
// メディア・タクソノミー / Media & Taxonomy
// =============================================================================

/** メディア (アイキャッチ画像など) */
export interface WPMedia {
	id: number;
	source_url: string;
	alt_text: string;
	media_details: {
		width: number;
		height: number;
	};
}

/** タクソノミーターム (industry / topic / reading_level) */
export interface WPTerm {
	id: number;
	name: string;
	slug: string;
	taxonomy: string;
	count?: number;
}

/** WP デフォルトの投稿者 (WordPress ユーザー。CPT author_profile とは別物) */
export interface WPAuthorRef {
	id: number;
	name: string;
	slug: string;
}

/** _embed パラメータで埋め込まれる関連データ */
export interface WPEmbedded {
	'wp:featuredmedia'?: WPMedia[];
	'wp:term'?: WPTerm[][];
	author?: WPAuthorRef[];
}

// =============================================================================
// ACF リピーター sub-field 型
// =============================================================================

/** サービス: 機能リストの1項目 */
export interface ServiceFeature {
	title: string;
	description: string;
}

/** サービス: 料金プランの1項目 */
export interface PricingPlan {
	name: string;
	price: string;
	included_features: string;
}

/** サービス: FAQ の1項目 */
export interface FaqItem {
	question: string;
	answer: string;
}

/** サービス: 導入事例リンクの1項目 */
export interface CaseStudyLink {
	label: string;
	url: string;
}

/** 採用情報: スキル項目 (required_skills / preferred_skills 共通) */
export interface SkillItem {
	skill: string;
}

/** 採用情報: 待遇・福利厚生の1項目 */
export interface BenefitItem {
	item: string;
}

/** 採用情報: 雇用形態 (ACF select フィールドの値) */
export type PositionType = 'full_time' | 'contract' | 'freelance';

// =============================================================================
// ACF フィールドグループ型
//
// 注: ACF の post_object / relationship / image フィールドは、未設定時に
// WordPress が `false` を返すことがあるため、型に `| false` を含める。
// =============================================================================

/** 記事 (post) の ACF フィールド群 — group_nordic_post */
export interface PostAcf {
	author_profile?: WPAuthorProfile | number | false;
	reading_time?: number;
	featured_image_caption?: string;
	related_posts?: WPPost[] | false;
}

/** サービス (service) の ACF フィールド群 — group_nordic_service */
export interface ServiceAcf {
	subtitle?: string;
	hero_image?: WPMedia | false;
	features?: ServiceFeature[] | false;
	pricing_plans?: PricingPlan[] | false;
	faq?: FaqItem[] | false;
	case_study_links?: CaseStudyLink[] | false;
	cta_text?: string;
	cta_url?: string;
}

/** 採用情報 (career) の ACF フィールド群 — group_nordic_career */
export interface CareerAcf {
	position_type?: PositionType;
	location?: string;
	salary_range?: string;
	required_skills?: SkillItem[] | false;
	preferred_skills?: SkillItem[] | false;
	benefits?: BenefitItem[] | false;
	application_url?: string;
}

/** 特集 (feature) の ACF フィールド群 — group_nordic_feature */
export interface FeatureAcf {
	cover_image?: WPMedia | false;
	lead_text?: string;
	related_articles?: WPPost[] | false;
	published_period_start?: string;
	published_period_end?: string;
}

/** 著者プロフィール (author_profile) の ACF フィールド群 — group_nordic_author_profile */
export interface AuthorProfileAcf {
	photo?: WPMedia | false;
	position?: string;
	bio?: string;
	twitter_url?: string;
	linkedin_url?: string;
	website_url?: string;
}

// =============================================================================
// エンティティ型 (カスタム投稿タイプ)
// =============================================================================

/** 全 CPT 共通のベースフィールド */
export interface WPEntityBase {
	id: number;
	slug: string;
	date: string;
	modified?: string;
	status?: WPPostStatus;
	title: WPRendered;
	content: WPRendered;
	_embedded?: WPEmbedded;
}

/** 通常記事 (post) */
export interface WPPost extends WPEntityBase {
	excerpt: WPRendered;
	acf?: PostAcf;
}

/** サービス (CPT: service) */
export interface WPService extends WPEntityBase {
	acf?: ServiceAcf;
}

/** 採用情報 (CPT: career) */
export interface WPCareer extends WPEntityBase {
	acf?: CareerAcf;
}

/** 特集 (CPT: feature) */
export interface WPFeature extends WPEntityBase {
	acf?: FeatureAcf;
}

/** 著者プロフィール (CPT: author_profile) */
export interface WPAuthorProfile extends WPEntityBase {
	acf?: AuthorProfileAcf;
}

/** CPT エンティティのユニオン (汎用処理で使う) */
export type WPEntity = WPPost | WPService | WPCareer | WPFeature | WPAuthorProfile;

// =============================================================================
// Next.js App Router ルート型
//
// Next.js 15+ では params / searchParams が Promise になっている点に注意。
// =============================================================================

/** 動的ルート [slug] の page.tsx が受け取る props 型 */
export interface SlugPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/** generateStaticParams が返す要素の型 */
export interface SlugParam {
	slug: string;
}
