export const LEAD_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  UNQUALIFIED: 'UNQUALIFIED',
  QUOTED: 'QUOTED',
  WON: 'WON',
  LOST: 'LOST',
} as const

export const TIMELINE = {
  ASAP: 'ASAP',
  THIS_WEEK: 'THIS_WEEK',
  THIS_MONTH: 'THIS_MONTH',
  FLEXIBLE: 'FLEXIBLE',
} as const

export const AGREEMENT_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  SIGNED: 'SIGNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const INVOICE_TYPE = {
  SETUP: 'SETUP',
  RECURRING: 'RECURRING',
  ONE_TIME: 'ONE_TIME',
} as const

export const RENTAL_TYPE = {
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING',
} as const

export const RENTAL_TYPE_LABELS = {
  ONE_TIME: 'One-Time Rental',
  RECURRING: 'Recurring Rental',
} as const

export const QUOTE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export const SUBSCRIPTION_STATUS_LABELS = {
  ACTIVE: 'Active',
  PAST_DUE: 'Past Due',
  CANCELED: 'Canceled',
  INCOMPLETE: 'Incomplete',
  INCOMPLETE_EXPIRED: 'Expired',
  TRIALING: 'Trial',
  UNPAID: 'Unpaid',
} as const
  