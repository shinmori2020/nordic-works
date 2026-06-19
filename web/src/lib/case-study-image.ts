/**
 * 導入事例（case_study）の表示画像を解決する。
 *
 * 事例にはアイキャッチ画像が設定されていない（featured_media: 0）ため、
 * スラッグごとに同梱の北欧風景画像を割り当てる。アイキャッチがある場合は
 * それを優先。getFeaturedImage と同じ形（source_url / alt_text）を返すので、
 * 既存の <Image> 描画にそのまま差し込める。
 */
import { getFeaturedImage } from '@/lib/utils';
import type { WPCaseStudy } from '@/types/wordpress';

const BASE = '/wp-uploads/2026/05';

/** スラッグ → 割り当て画像（同梱メディア）。 */
const CASE_STUDY_IMAGES: Record<string, string> = {
	'fintech-remote-diagnosis': `${BASE}/900-5.jpg`,
	'consulting-firm-okr-rollout': `${BASE}/900-25.jpg`,
	'global-manufacturer-hybrid-onboarding': `${BASE}/900-15.jpg`,
	'saas-startup-retention-turnaround': `${BASE}/900-40.jpg`,
	'saas-scaleup-eng-org-redesign': `${BASE}/900-8.jpg`,
	'healthcare-hybrid-1on1-redesign': `${BASE}/900-12.jpg`,
	'manufacturer-frontline-voice-system': `${BASE}/900-18.jpg`,
	'insurance-psych-safety-rollout': `${BASE}/900-22.jpg`,
	'service-multisite-manager-enablement': `${BASE}/900-30.jpg`,
	'ecommerce-remote-async-culture': `${BASE}/900-36.jpg`,
};

export function caseStudyImage(
	cs: WPCaseStudy,
): { source_url: string; alt_text: string } | null {
	const featured = getFeaturedImage(cs);
	if (featured?.source_url) return featured;
	const url = CASE_STUDY_IMAGES[cs.slug];
	return url ? { source_url: url, alt_text: '' } : null;
}
