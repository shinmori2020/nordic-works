/**
 * 採用応募の人事宛通知メール。
 *
 * 応募内容の全フィールドを順に並べる。
 * Resend 経由で送信、React Email でレンダリング、インラインスタイル。
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
	phone: string;
	currentCompany?: string;
	availableFrom?: string;
	motivation: string;
	experience?: string;
	careerTitle: string;
	submittedAt: string;
}

export function ApplicationNoticeEmail({
	name,
	email,
	phone,
	currentCompany,
	availableFrom,
	motivation,
	experience,
	careerTitle,
	submittedAt,
}: Props) {
	return (
		<Html>
			<Head />
			<Preview>{`${name} 様より応募: ${careerTitle}`}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={h1}>新しい応募</Heading>
					<Text style={muted}>受付日時: {submittedAt}</Text>

					<Hr style={hr} />

					<Section>
						<Heading as="h2" style={h2}>
							応募ポジション
						</Heading>
						<Text style={highlight}>{careerTitle}</Text>
					</Section>

					<Hr style={hr} />

					<Section>
						<Heading as="h2" style={h2}>
							応募者情報
						</Heading>
						<Row label="お名前" value={name} />
						<Row label="メール" value={email} />
						<Row label="電話番号" value={phone} />
						{currentCompany && <Row label="現職" value={currentCompany} />}
						{availableFrom && <Row label="入社可能時期" value={availableFrom} />}
					</Section>

					<Hr style={hr} />

					<Section>
						<Heading as="h2" style={h2}>
							志望動機
						</Heading>
						<Text style={multiline}>{motivation}</Text>
					</Section>

					{experience && (
						<>
							<Hr style={hr} />
							<Section>
								<Heading as="h2" style={h2}>
									職務経歴の概要
								</Heading>
								<Text style={multiline}>{experience}</Text>
							</Section>
						</>
					)}

					<Hr style={hr} />

					<Text style={footer}>
						Nordic Works — 採用応募フォーム自動通知
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<Text style={row}>
			<strong style={{ display: 'inline-block', minWidth: 100 }}>{label}</strong>
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
	maxWidth: 600,
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
const multiline: React.CSSProperties = {
	color: '#27272a',
	fontSize: 14,
	lineHeight: 1.7,
	whiteSpace: 'pre-wrap',
	margin: '8px 0',
};
const footer: React.CSSProperties = {
	color: '#a1a1aa',
	fontSize: 11,
	marginTop: 16,
};
