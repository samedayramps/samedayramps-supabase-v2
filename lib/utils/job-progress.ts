import { type Tables } from "@/types/database.types"

export type JobProgressData = {
  lead?: Tables<"leads"> | null
  quote?: Tables<"quotes"> | null
  agreement?: Tables<"agreements"> | null
  installation?: Tables<"installations"> | null
  invoice?: Tables<"invoices"> | null
  customer: Tables<"customers">
}

type LeadStageDetails = {
  status: string
  timeline: string | null
}

type QuoteStageDetails = {
  monthlyRate: number
  setupFee: number
  validUntil: string | null
}

type AgreementStageDetails = {
  signedDate: string | null
}

type InstallationStageDetails = {
  installedBy: string | null
  installationDate: string | null
}

type InvoiceStageDetails = {
  amount: number
  paymentDate: string | null
}

type Stage<T> = {
  key: string
  label: string
  status: string
  isComplete: boolean
  variant: string
  details: T | null
}

type Stages = {
  lead: Stage<LeadStageDetails>
  quote: Stage<QuoteStageDetails>
  agreement: Stage<AgreementStageDetails>
  installation: Stage<InstallationStageDetails>
  invoice: Stage<InvoiceStageDetails>
}

export type JobProgress = {
  daysInProgress: number
  currentStage: keyof Stages
  nextAction: {
    label: string
    description: string
    href: string
  } | null
  stages: Stages
}

export function calculateJobProgress(data: JobProgressData): JobProgress {
  const { lead, quote, agreement, installation, invoice } = data

  // Calculate days in progress
  const startDate = lead?.created_at ? new Date(lead.created_at) : new Date()
  const daysInProgress = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Define stages and their statuses
  const stages: Stages = {
    lead: {
      key: 'lead',
      label: 'Lead',
      status: lead?.status || 'Not Started',
      isComplete: !!lead,
      variant: lead ? 'success' : 'outline',
      details: lead ? {
        status: lead.status,
        timeline: lead.timeline,
      } : null
    },
    quote: {
      key: 'quote',
      label: 'Quote',
      status: quote ? 'Quoted' : 'Not Started',
      isComplete: !!quote,
      variant: quote ? 'success' : 'outline',
      details: quote ? {
        monthlyRate: quote.monthly_rental_rate,
        setupFee: quote.setup_fee,
        validUntil: quote.valid_until,
      } : null
    },
    agreement: {
      key: 'agreement',
      label: 'Agreement',
      status: agreement ? 'Signed' : 'Not Started',
      isComplete: !!agreement,
      variant: agreement ? 'success' : 'outline',
      details: agreement ? {
        signedDate: agreement.signed_date,
      } : null
    },
    installation: {
      key: 'installation',
      label: 'Installation',
      status: installation ? 'Installed' : 'Not Started',
      isComplete: !!installation,
      variant: installation ? 'success' : 'outline',
      details: installation ? {
        installedBy: installation.installed_by,
        installationDate: installation.installation_date,
      } : null
    },
    invoice: {
      key: 'invoice',
      label: 'Invoice',
      status: invoice ? 'Paid' : 'Not Started',
      isComplete: !!invoice,
      variant: invoice ? 'success' : 'outline',
      details: invoice ? {
        amount: invoice.amount,
        paymentDate: invoice.payment_date,
      } : null
    },
  }

  // Determine current stage and next action
  let currentStage: keyof Stages = 'lead'
  let nextAction = null

  if (!lead) {
    currentStage = 'lead'
    nextAction = {
      label: 'Create Lead',
      description: 'Start by creating a new lead',
      href: '/leads/new',
    }
  } else if (!quote) {
    currentStage = 'quote'
    nextAction = {
      label: 'Create Quote',
      description: 'Create a quote for this lead',
      href: '/quotes/new',
    }
  } else if (!agreement) {
    currentStage = 'agreement'
    nextAction = {
      label: 'Create Agreement',
      description: 'Create an agreement based on the quote',
      href: '/agreements/new',
    }
  } else if (!installation) {
    currentStage = 'installation'
    nextAction = {
      label: 'Schedule Installation',
      description: 'Schedule the installation',
      href: '/installations/new',
    }
  } else if (!invoice) {
    currentStage = 'invoice'
    nextAction = {
      label: 'Create Invoice',
      description: 'Create an invoice for the installation',
      href: '/invoices/new',
    }
  }

  return {
    daysInProgress,
    currentStage,
    nextAction,
    stages,
  }
} 