/**
 * お問い合わせ「運営宛通知」メールテンプレート。
 *
 * React Email で書くことで、JSX のままレンダリングして Resend に渡せる。
 * デザインは最小限・テキスト主体（メーラー間の互換性確保）。
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
	company?: string;
	message: string;
	receivedAt: string;
}

export function ContactNoticeEmail({
	name,
	email,
	company,
	message,
	receivedAt,
}: Props) {
	return (
		<Html>
			<Head />
			<Preview>{`${name} 様からお問い合わせ`}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>新しいお問い合わせ</Heading>
					<Text style={muted}>受付日時: {receivedAt}</Text>

					<Hr style={hr} />

					<Section>
						<Row label="お名前" value={name} />
						<Row label="メール" value={email} />
						{company && <Row label="会社名" value={company} />}
					</Section>

					<Hr style={hr} />

					<Heading as="h2" style={h2}>
						お問い合わせ内容
					</Heading>
					<Text style={messageStyle}>{message}</Text>

					<Hr style={hr} />

					<Text style={footer}>Nordic Works — お問い合わせフォーム自動通知</Text>
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
const h2: React.CSSProperties = { color: '#18181b', fontSize: 16, marginTop: 16 };
const muted: React.CSSProperties = { color: '#71717a', fontSize: 12, margin: '8px 0 0 0' };
const hr: React.CSSProperties = { borderColor: '#e4e4e7', margin: '20px 0' };
const row: React.CSSProperties = { color: '#27272a', fontSize: 14, margin: '4px 0' };
const messageStyle: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.7,
	whiteSpace: 'pre-wrap',
};
const footer: React.CSSProperties = { color: '#a1a1aa', fontSize: 11, marginTop: 16 };
