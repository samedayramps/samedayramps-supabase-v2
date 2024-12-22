import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import { formatCurrency } from '@/lib/utils';

interface InvoiceEmailProps {
  customerName: string;
  amount: number;
  invoiceType: 'SETUP' | 'RENTAL' | 'REMOVAL';
  isRecurring: boolean;
  paymentUrl: string;
}

export default function InvoiceEmail({
  customerName,
  amount,
  invoiceType,
  isRecurring,
  paymentUrl,
}: InvoiceEmailProps) {
  const previewText = `Payment Required - ${formatCurrency(amount)}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Required</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            {invoiceType === 'SETUP' ? 'Your setup fee' :
             invoiceType === 'RENTAL' ? (isRecurring ? 'Your monthly rental payment' : 'Your one-time rental payment') :
             invoiceType === 'REMOVAL' ? 'Your removal fee' :
             'Your payment'} of {formatCurrency(amount)} is now ready for processing.
          </Text>

          {isRecurring ? (
            <Text style={text}>
              Please click the link below to set up your monthly rental payment. This will be charged automatically each month.
            </Text>
          ) : (
            <Text style={text}>
              Please click the link below to complete your payment.
            </Text>
          )}

          <Link href={paymentUrl} style={button}>
            {isRecurring ? 'Set Up Monthly Payment' : 'Make Payment'}
          </Link>

          <Text style={text}>
            If you have any questions, please don't hesitate to contact us.
          </Text>

          <Text style={footer}>
            Best regards,<br />
            Same Day Ramps Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '16px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '100%',
  margin: '24px auto',
  maxWidth: '240px',
  padding: '16px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0 0',
}; 