import { type Tables } from "@/types/database.types"
import { 
  LEAD_STATUS, 
  QUOTE_STATUS, 
  AGREEMENT_STATUS, 
  INVOICE_STATUS 
} from "@/lib/constants"

export type JobStage = {
  key: string
  label: string
  description: string
  status: string | null
  date: string | null
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
  isComplete: boolean
  isInProgress: boolean
  details?: Record<string, any>
}

export type JobProgressData = {
  stages: JobStage[]
  currentStage: number
  isComplete: boolean
  daysInProgress: number
  nextAction?: {
    label: string
    description: string
    href?: string
  }
}

export function calculateJobProgress(data: {
  lead?: Tables<"leads"> | null
  quote?: Tables<"quotes"> | null
  agreement?: Tables<"agreements"> | null
  installation?: Tables<"installations"> | null
  invoice?: Tables<"invoices"> | null
}): JobProgressData {
  const { lead, quote, agreement, installation, invoice } = data
  const stages: JobStage[] = []
  let currentStage = 0
  let isComplete = false

  // Lead Stage
  stages.push({
    key: 'lead',
    label: 'Lead',
    description: getLeadDescription(lead?.status),
    status: lead?.status || null,
    date: lead?.created_at || null,
    variant: getLeadVariant(lead?.status),
    isComplete: isLeadComplete(lead?.status),
    isInProgress: isLeadInProgress(lead?.status),
    details: lead ? {
      mobilityType: lead.mobility_type,
      timeline: lead.timeline,
      rentalDuration: lead.rental_duration
    } : undefined
  })

  // Quote Stage
  stages.push({
    key: 'quote',
    label: 'Quote',
    description: getQuoteDescription(quote?.quote_status),
    status: quote?.quote_status || null,
    date: quote?.created_at || null,
    variant: getQuoteVariant(quote?.quote_status),
    isComplete: isQuoteComplete(quote?.quote_status),
    isInProgress: isQuoteInProgress(quote?.quote_status),
    details: quote ? {
      monthlyRate: quote.monthly_rental_rate,
      setupFee: quote.setup_fee,
      validUntil: quote.valid_until
    } : undefined
  })

  // Agreement Stage
  stages.push({
    key: 'agreement',
    label: 'Agreement',
    description: getAgreementDescription(agreement?.agreement_status),
    status: agreement?.agreement_status || null,
    date: agreement?.created_at || null,
    variant: getAgreementVariant(agreement?.agreement_status),
    isComplete: isAgreementComplete(agreement?.agreement_status),
    isInProgress: isAgreementInProgress(agreement?.agreement_status),
    details: agreement ? {
      signedDate: agreement.signed_date
    } : undefined
  })

  // Installation Stage
  stages.push({
    key: 'installation',
    label: 'Installation',
    description: getInstallationDescription(installation),
    status: installation?.sign_off ? 'COMPLETED' : installation ? 'IN_PROGRESS' : null,
    date: installation?.installation_date || null,
    variant: getInstallationVariant(installation),
    isComplete: !!installation?.sign_off,
    isInProgress: !!installation && !installation.sign_off,
    details: installation ? {
      installedBy: installation.installed_by,
      signOff: installation.sign_off
    } : undefined
  })

  // Invoice Stage
  stages.push({
    key: 'invoice',
    label: 'Invoice',
    description: getInvoiceDescription(invoice?.invoice_status),
    status: invoice?.invoice_status || null,
    date: invoice?.created_at || null,
    variant: getInvoiceVariant(invoice?.invoice_status),
    isComplete: isInvoiceComplete(invoice?.invoice_status),
    isInProgress: isInvoiceInProgress(invoice?.invoice_status),
    details: invoice ? {
      amount: invoice.amount,
      paymentDate: invoice.payment_date,
      invoiceType: invoice.invoice_type
    } : undefined
  })

  // Calculate current stage and completion
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].isComplete) {
      isComplete = i === stages.length - 1
      break
    }
    if (stages[i].isInProgress) {
      currentStage = i
      break
    }
  }

  // Calculate days in progress
  const startDate = lead?.created_at ? new Date(lead.created_at) : new Date()
  const daysInProgress = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Determine next action
  const nextAction = getNextAction(stages, currentStage)

  return {
    stages,
    currentStage,
    isComplete,
    daysInProgress,
    nextAction
  }
}

// Helper functions for status checks and descriptions
function isLeadComplete(status: string | null | undefined): boolean {
  return status === LEAD_STATUS.WON || status === LEAD_STATUS.LOST
}

function isLeadInProgress(status: string | null | undefined): boolean {
  return Boolean(status && !isLeadComplete(status))
}

function isQuoteComplete(status: string | null | undefined): boolean {
  return status === QUOTE_STATUS.ACCEPTED || status === QUOTE_STATUS.REJECTED
}

function isQuoteInProgress(status: string | null | undefined): boolean {
  return Boolean(status && !isQuoteComplete(status))
}

function isAgreementComplete(status: string | null | undefined): boolean {
  return status === AGREEMENT_STATUS.SIGNED || status === AGREEMENT_STATUS.DECLINED
}

function isAgreementInProgress(status: string | null | undefined): boolean {
  return Boolean(status && !isAgreementComplete(status))
}

function isInvoiceComplete(status: string | null | undefined): boolean {
  return status === INVOICE_STATUS.PAID || status === INVOICE_STATUS.REFUNDED
}

function isInvoiceInProgress(status: string | null | undefined): boolean {
  return Boolean(status && !isInvoiceComplete(status))
}

// Variant helper functions
function getLeadVariant(status: string | null | undefined): JobStage['variant'] {
  if (!status) return 'outline'
  switch (status) {
    case LEAD_STATUS.WON: return 'success'
    case LEAD_STATUS.LOST: return 'destructive'
    case LEAD_STATUS.QUOTED: return 'warning'
    default: return 'default'
  }
}

function getQuoteVariant(status: string | null | undefined): JobStage['variant'] {
  if (!status) return 'outline'
  switch (status) {
    case QUOTE_STATUS.ACCEPTED: return 'success'
    case QUOTE_STATUS.REJECTED: return 'destructive'
    case QUOTE_STATUS.SENT: return 'warning'
    default: return 'default'
  }
}

function getAgreementVariant(status: string | null | undefined): JobStage['variant'] {
  if (!status) return 'outline'
  switch (status) {
    case AGREEMENT_STATUS.SIGNED: return 'success'
    case AGREEMENT_STATUS.DECLINED: return 'destructive'
    case AGREEMENT_STATUS.SENT: return 'warning'
    default: return 'default'
  }
}

function getInstallationVariant(installation: Tables<"installations"> | null | undefined): JobStage['variant'] {
  if (!installation) return 'outline'
  return installation.sign_off ? 'success' : 'warning'
}

function getInvoiceVariant(status: string | null | undefined): JobStage['variant'] {
  if (!status) return 'outline'
  switch (status) {
    case INVOICE_STATUS.PAID: return 'success'
    case INVOICE_STATUS.FAILED: return 'destructive'
    case INVOICE_STATUS.PROCESSING: return 'warning'
    default: return 'default'
  }
}

// Description helper functions
function getLeadDescription(status: string | null | undefined): string {
  if (!status) return 'No lead created'
  switch (status) {
    case LEAD_STATUS.NEW: return 'New lead received'
    case LEAD_STATUS.CONTACTED: return 'Customer contacted'
    case LEAD_STATUS.QUALIFIED: return 'Lead qualified'
    case LEAD_STATUS.QUOTED: return 'Quote prepared'
    case LEAD_STATUS.WON: return 'Lead converted'
    case LEAD_STATUS.LOST: return 'Lead lost'
    default: return 'Lead in progress'
  }
}

function getQuoteDescription(status: string | null | undefined): string {
  if (!status) return 'No quote created'
  switch (status) {
    case QUOTE_STATUS.DRAFT: return 'Quote drafted'
    case QUOTE_STATUS.SENT: return 'Quote sent to customer'
    case QUOTE_STATUS.ACCEPTED: return 'Quote accepted'
    case QUOTE_STATUS.REJECTED: return 'Quote rejected'
    default: return 'Quote in progress'
  }
}

function getAgreementDescription(status: string | null | undefined): string {
  if (!status) return 'No agreement created'
  switch (status) {
    case AGREEMENT_STATUS.DRAFT: return 'Agreement drafted'
    case AGREEMENT_STATUS.SENT: return 'Awaiting signature'
    case AGREEMENT_STATUS.SIGNED: return 'Agreement signed'
    case AGREEMENT_STATUS.DECLINED: return 'Agreement declined'
    case AGREEMENT_STATUS.EXPIRED: return 'Agreement expired'
    default: return 'Agreement in progress'
  }
}

function getInstallationDescription(installation: Tables<"installations"> | null | undefined): string {
  if (!installation) return 'No installation scheduled'
  if (installation.sign_off) return 'Installation completed'
  return 'Installation in progress'
}

function getInvoiceDescription(status: string | null | undefined): string {
  if (!status) return 'No invoice created'
  switch (status) {
    case INVOICE_STATUS.PENDING: return 'Payment pending'
    case INVOICE_STATUS.PROCESSING: return 'Payment processing'
    case INVOICE_STATUS.PAID: return 'Payment received'
    case INVOICE_STATUS.FAILED: return 'Payment failed'
    case INVOICE_STATUS.REFUNDED: return 'Payment refunded'
    default: return 'Invoice in progress'
  }
}

function getNextAction(stages: JobStage[], currentStage: number): JobProgressData['nextAction'] {
  const stage = stages[currentStage]
  if (!stage) return undefined

  switch (stage.key) {
    case 'lead':
      if (!stage.status) return {
        label: 'Create Lead',
        description: 'Start by creating a new lead',
        href: '/leads/new'
      }
      if (stage.status === LEAD_STATUS.NEW) return {
        label: 'Contact Customer',
        description: 'Reach out to the customer to discuss their needs'
      }
      if (stage.status === LEAD_STATUS.QUALIFIED) return {
        label: 'Create Quote',
        description: 'Prepare a quote for the customer',
        href: '/quotes/new'
      }
      break

    case 'quote':
      if (!stage.status) return {
        label: 'Create Quote',
        description: 'Prepare a quote for the customer',
        href: '/quotes/new'
      }
      if (stage.status === QUOTE_STATUS.DRAFT) return {
        label: 'Send Quote',
        description: 'Send the quote to the customer for review'
      }
      break

    case 'agreement':
      if (!stage.status) return {
        label: 'Create Agreement',
        description: 'Prepare the rental agreement',
        href: '/agreements/new'
      }
      if (stage.status === AGREEMENT_STATUS.DRAFT) return {
        label: 'Send Agreement',
        description: 'Send the agreement for signature'
      }
      break

    case 'installation':
      if (!stage.status) return {
        label: 'Schedule Installation',
        description: 'Schedule the ramp installation',
        href: '/installations/new'
      }
      break

    case 'invoice':
      if (!stage.status) return {
        label: 'Create Invoice',
        description: 'Generate the invoice',
        href: '/invoices/new'
      }
      if (stage.status === INVOICE_STATUS.PENDING) return {
        label: 'Send Payment Link',
        description: 'Send the payment link to the customer'
      }
      break
  }

  return undefined
} 