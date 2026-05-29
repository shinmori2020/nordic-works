/**
 * 資料請求の運営宛通知メール。
 *
 * ContactNoticeEmail と同じ設計方針：
 * - React Email でレンダリング、Resend に渡す
 * - スタイルはインライン（メーラー互換性確保）
 * - テキスト主体
 */

import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components';

interface Props {
	name: string;
	email: string;
	company: string;
	role?: string;
	whitepaperTitle: string;
	requestedAt: string;
}

export function WhitepaperNoticeEmail({
	name,
	email,
	company,
	role,
	whitepaperTitle,
	requestedAt,
}: Props) {
	return (
		<Html>
			<Head />
			<Preview>{`${name} 様より資料請求: ${whitepaperTitle}`}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>新しい資料請求</Heading>
					<Text style={muted}>受付日時: {requestedAt}</Text>

					<Hr style={hr} />

					<Section>
						<Heading as="h2" style={h2}>
							対象資料
						</Heading>
						<Text style={highlight}>{whitepaperTitle}</Text>
					</Section>

					<Hr style={hr} />

					<Section>
						<Heading as="h2" style={h2}>
							申込者情報
						</Heading>
						<Row label="お名前" value={name} />
						<Row label="メール" value={email} />
						<Row label="会社名" value={company} />
						{role && <Row label="役職" value={role} />}
					</Section>

					<Hr style={hr} />

					<Text style={footer}>
						Nordic Works — 資料請求フォーム自動通知
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<Text style={row}>
			<strong style={{ display: 'inline-block', minWidth: 80 }}>{label}</strong>
			{value}
		</Text>
	);
}

const body: React.CSSProperties = {
	backgroundColor: '#f4f4f5',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
	margin: 0,
	padding: '24px 0',
};
const container: React.CSSProperties = {
	backgroundColor: '#ffffff',
	maxWidth: 560,
	margin: '0 auto',
	padding: '32px',
	borderRadius: 8,
};
const h1: React.CSSProperties = { color: '#18181b', fontSize: 20, margin: 0 };
const h2: React.CSSProperties = { color: '#18181b', fontSize: 14, marginTop: 12 };
const muted: React.CSSProperties = {
	color: '#71717a',
	fontSize: 12,
	margin: '8px 0 0 0',
};
const highlight: React.CSSProperties = {
	color: '#18181b',
	fontSize: 16,
	fontWeight: 600,
	margin: '8px 0 0 0',
};
const hr: React.CSSProperties = { borderColor: '#e4e4e7', margin: '20px 0' };
const row: React.CSSProperties = { color: '#27272a', fontSize: 14, margin: '4px 0' };
const footer: React.CSSProperties = {
	color: '#a1a1aa',
	fontSize: 11,
	marginTop: 16,
};
