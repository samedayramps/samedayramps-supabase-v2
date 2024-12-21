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
  metadata?: Record<string, string>;
  custom_webhook_url?: string;
  expires_in_hours?: string;
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
  status: string;
  secret_token: string;
  data: {
    contract: {
      id: string;
      title: string;
      metadata?: Record<string, string>;
      source: string;
      test: string;
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
    this.baseUrl = 'https://api.esignatures.io/api';
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
    return this.request<DocumentResponse>('/contracts', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
}

// Export singleton instance
export const eSignaturesClient = new ESignaturesClientImpl(); 