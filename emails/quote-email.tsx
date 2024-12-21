import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';
import { formatCurrency } from '@/lib/utils';

interface QuoteEmailProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  installAddress: string;
  monthlyRate: number;
  setupFee: number;
  validUntil: string;
  rentalType: 'ONE_TIME' | 'RECURRING';
  notes?: string | null;
  quoteId: string;
}

export default function QuoteEmail({
  customerName,
  customerEmail,
  customerPhone,
  installAddress,
  monthlyRate,
  setupFee,
  validUntil,
  rentalType,
  notes,
  quoteId,
}: QuoteEmailProps) {
  // Create a simple token for quote acceptance (you should use a more secure method in production)
  const acceptToken = Buffer.from(quoteId).toString('base64')
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/accept?id=${quoteId}&token=${acceptToken}`

  return (
    <Html>
      <Head />
      <Preview>Your Quote from Same Day Ramps</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Quote for {customerName}
          </Heading>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Customer Information
            </Heading>
            <div style={detailsSection}>
              <Text style={text}>
                <strong>Name:</strong> {customerName}
              </Text>
              <Text style={text}>
                <strong>Email:</strong> {customerEmail}
              </Text>
              {customerPhone && (
                <Text style={text}>
                  <strong>Phone:</strong> {customerPhone}
                </Text>
              )}
              <Text style={text}>
                <strong>Installation Address:</strong> {installAddress}
              </Text>
            </div>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Quote Details
            </Heading>

            <div style={detailsSection}>
              <Text style={text}>
                <strong>Rental Type:</strong> {rentalType === 'ONE_TIME' ? 'One-Time Rental' : 'Recurring Rental'}
              </Text>
              <Text style={text}>
                <strong>{rentalType === 'ONE_TIME' ? 'Rental Rate' : 'Monthly Rate'}:</strong> {formatCurrency(monthlyRate)}
              </Text>
              <Text style={text}>
                <strong>Setup Fee:</strong> {formatCurrency(setupFee)}
              </Text>
              <Text style={text}>
                <strong>Valid Until:</strong> {new Date(validUntil).toLocaleDateString()}
              </Text>

              {notes && (
                <>
                  <Hr style={hr} />
                  <Text style={text}>
                    <strong>Additional Notes:</strong>
                  </Text>
                  <Text style={{ ...text, whiteSpace: 'pre-wrap' }}>
                    {notes}
                  </Text>
                </>
              )}
            </div>
          </Section>

          <Section style={actionSection}>
            <Button
              href={acceptUrl}
              style={acceptButton}
            >
              Accept Quote
            </Button>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              To accept this quote, click the button above or contact us at (555) 123-4567.
            </Text>
            <Text style={footerText}>
              Thank you for choosing Same Day Ramps!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 15px',
  padding: '0 0 10px',
  borderBottom: '2px solid #e5e5e5',
};

const h2 = {
  color: '#4a4a4a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '16px 0',
};

const section = {
  margin: '20px 0',
};

const detailsSection = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  margin: '10px 0',
};

const text = {
  color: '#3c3c3c',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '10px 0',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const footer = {
  marginTop: '30px',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const actionSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const acceptButton = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '16px 0',
} 