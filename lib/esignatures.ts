// Types for eSignatures.io API
export interface CreateDocumentOptions {
  template_id: string;
  title: string;
  signers: Array<{
    name: string;
    email: string;
    phone?: string;
    company_name?: string;
    signing_order?: string;
    auto_sign?: "yes" | "no";
    redirect_url?: string;
  }>;
  placeholder_fields?: Array<{
    api_key: string;
    value: string;
  }>;
  metadata?: string;
  custom_webhook_url?: string;
  expires_in_hours?: string;
  test_mode?: boolean;
}

export interface DocumentResponse {
  status: string;
  data: {
    contract: {
      id: string;
      status: string;
      title: string;
      metadata?: Record<string, string>;
      source: string;
      test: string;
      signers: Array<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        company_name?: string;
        sign_page_url: string;
      }>;
    };
  };
}

// Webhook event types
export interface WebhookPayload {
  status: 'contract-sent-to-signer' | 'signer-viewed-the-contract' | 'signer-signed' | 
         'contract-signed' | 'signer-declined-the-signature' | 'contract-expired';
  secret_token: string;
  data: {
    contract: {
      id: string;
      title: string;
      metadata?: string;
      source: string;
      test: string;
      status: string;
      finalized_at?: string;
      contract_pdf_url?: string;
      expires_at?: string;
      custom_webhook_url?: string;
    };
    signer?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      company_name?: string;
      signing_order?: string;
      auto_sign?: string;
      redirect_url?: string;
      events?: Array<{
        event: string;
        timestamp: string;
        remote_ip?: string;
      }>;
      signer_field_values?: Record<string, any>;
    };
  };
}

// eSignatures client implementation
class ESignaturesClientImpl {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.ESIGNATURES_API_KEY;
    if (!apiKey) {
      throw new Error('ESIGNATURES_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://esignatures.com/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}?token=${this.apiKey}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async createDocument(options: CreateDocumentOptions): Promise<DocumentResponse> {
    // Always set test mode to true
    const payload = {
      ...options,
      test_mode: true,
    };

    return this.request<DocumentResponse>('/contracts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

// Export singleton instance
export const eSignaturesClient = new ESignaturesClientImpl(); 