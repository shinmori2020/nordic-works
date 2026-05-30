/**
 * ニュースレター新規購読の運営宛通知メール。
 *
 * 配信リスト管理を Resend Audiences へ移行する場合は、このメールを
 * 「リストへの追加結果通知」に置き換える想定。
 */

import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from '@react-email/components';

interface Props {
	email: string;
	subscribedAt: string;
}

export function NewsletterNoticeEmail({ email, subscribedAt }: Props) {
	return (
		<Html>
			<Head />
			<Preview>{`新規購読者: ${email}`}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>新規ニュースレター購読</Heading>
					<Text style={paragraph}>
						<strong>メール:</strong> {email}
					</Text>
					<Text style={paragraph}>
						<strong>受付日時:</strong> {subscribedAt}
					</Text>
					<Text style={footer}>
						Nordic Works — ニュースレター登録通知
					</Text>
				</Container>
			</Body>
		</Html>
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
	maxWidth: 480,
	margin: '0 auto',
	padding: '32px',
	borderRadius: 8,
};
const h1: React.CSSProperties = { color: '#18181b', fontSize: 18, margin: 0 };
const paragraph: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.7,
	margin: '12px 0',
};
const footer: React.CSSProperties = {
	color: '#a1a1aa',
	fontSize: 11,
	marginTop: 24,
};
