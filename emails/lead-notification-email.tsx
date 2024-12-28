import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
} from '@react-email/components'

interface LeadNotificationEmailProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  installAddress: string
  timeline: string
  notes: string
  leadId: string
}

export function LeadNotificationEmail({
  customerName,
  customerEmail,
  customerPhone,
  installAddress,
  timeline,
  notes,
  leadId,
}: LeadNotificationEmailProps) {
  const previewText = `New lead from ${customerName}`
  const leadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/leads/${leadId}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            New Lead Notification
          </Heading>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Customer Information
            </Heading>
            <Text style={text}>
              <strong>Name:</strong> {customerName}
            </Text>
            <Text style={text}>
              <strong>Email:</strong> {customerEmail}
            </Text>
            <Text style={text}>
              <strong>Phone:</strong> {customerPhone}
            </Text>
            <Text style={text}>
              <strong>Installation Address:</strong> {installAddress}
            </Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Lead Details
            </Heading>
            <Text style={text}>
              <strong>Timeline:</strong> {timeline}
            </Text>
            <Text style={text}>
              <strong>Notes:</strong> {notes}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={{
                ...button,
                padding: '12px 20px',
              }}
              href={leadUrl}
            >
              View Lead Details
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '5px',
  margin: '20px',
}

const text = {
  margin: '8px 0',
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: 'fit-content',
  margin: '0 auto',
}

const buttonContainer = {
  padding: '24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  margin: '30px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px',
} 