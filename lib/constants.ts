export const LEAD_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  QUOTED: 'QUOTED',
  WON: 'WON',
  LOST: 'LOST',
} as const

export const MOBILITY_TYPES = {
  WHEELCHAIR: 'Wheelchair',
  WALKER: 'Walker',
  SCOOTER: 'Scooter',
  OTHER: 'Other',
} as const

export const TIMELINE_OPTIONS = {
  IMMEDIATE: 'IMMEDIATE',
  THIS_WEEK: 'THIS_WEEK',
  THIS_MONTH: 'THIS_MONTH',
  NEXT_MONTH: 'NEXT_MONTH',
  FLEXIBLE: 'FLEXIBLE',
} as const

export const RENTAL_DURATION = {
  SHORT_TERM: 'SHORT_TERM',
  LONG_TERM: 'LONG_TERM',
  PERMANENT: 'PERMANENT',
} as const

export const QUOTE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export const QUOTE_VALID_DURATION = {
  THREE_DAYS: '3_DAYS',
  ONE_WEEK: '1_WEEK',
  ONE_MONTH: '1_MONTH',
} as const

export const QUOTE_VALID_DURATION_LABELS: Record<keyof typeof QUOTE_VALID_DURATION, string> = {
  THREE_DAYS: '3 Days',
  ONE_WEEK: '1 Week',
  ONE_MONTH: '1 Month',
} as const

export const RENTAL_TYPE = {
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING',
} as const

export const RENTAL_TYPE_LABELS: Record<keyof typeof RENTAL_TYPE, string> = {
  ONE_TIME: 'One-Time Rental',
  RECURRING: 'Recurring Rental',
} as const

export const AGREEMENT_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  SIGNED: 'SIGNED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const

export const AGREEMENT_STATUS_LABELS: Record<keyof typeof AGREEMENT_STATUS, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent for Signature',
  SIGNED: 'Signed',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
} as const

export const INVOICE_TYPE = {
  SETUP: 'SETUP',
  RENTAL: 'RENTAL',
  REMOVAL: 'REMOVAL',
} as const

export const INVOICE_TYPE_LABELS: Record<keyof typeof INVOICE_TYPE, string> = {
  SETUP: 'Setup Fee',
  RENTAL: 'Rental Payment',
  REMOVAL: 'Removal Fee',
} as const

export const INVOICE_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export const INVOICE_STATUS_LABELS: Record<keyof typeof INVOICE_STATUS, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
} as const

export const SUBSCRIPTION_STATUS = {
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
} as const

export const SUBSCRIPTION_STATUS_LABELS: Record<keyof typeof SUBSCRIPTION_STATUS, string> = {
  INCOMPLETE: 'Incomplete',
  INCOMPLETE_EXPIRED: 'Expired',
  TRIALING: 'Trial',
  ACTIVE: 'Active',
  PAST_DUE: 'Past Due',
  CANCELED: 'Canceled',
  UNPAID: 'Unpaid',
} as const

export const PAYMENT_METHOD_TYPE = {
  CARD: 'card',
  BANK_ACCOUNT: 'bank_account',
} as const

export const PAYMENT_METHOD_TYPE_LABELS: Record<keyof typeof PAYMENT_METHOD_TYPE, string> = {
  CARD: 'Credit/Debit Card',
  BANK_ACCOUNT: 'Bank Account',
} as const
  