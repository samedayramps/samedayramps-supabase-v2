"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { type Tables } from "@/types/database.types"
import { eSignaturesClient } from '@/lib/esignatures'
import { sendInvoice } from '@/app/actions/invoices'
import { 
  type CreateDocumentOptions, 
  type DocumentResponse,
  type WebhookPayload 
} from '@/lib/esignatures'

export async function deleteAgreement(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('agreements')
      .delete()
      .match({ id })

    if (error) throw error

    revalidatePath('/agreements')
  } catch (error) {
    console.error('Error deleting agreement:', error)
    throw new Error('Failed to delete agreement')
  }
}

type AgreementData = {
  quote_id: string;
  customer_id: string;
  address_id: string;
  agreement_status: string;
  notes?: any;
}

export async function createAgreement(data: AgreementData) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('agreements')
      .insert(data)

    if (error) throw error

    revalidatePath('/agreements')
    return { success: true }
  } catch (error) {
    console.error('Error creating agreement:', error)
    return { error: 'Failed to create agreement' }
  }
}

export async function updateAgreement(id: string, data: AgreementData): Promise<void> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('agreements')
      .update(data)
      .match({ id })

    if (error) throw error

    revalidatePath('/agreements')
    redirect('/agreements')
  } catch (error) {
    console.error('Error updating agreement:', error)
    throw new Error('Failed to update agreement')
  }
}

export async function sendAgreement(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Fetch the agreement with all necessary details
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .select(`
        *,
        quote:quotes!inner(
          monthly_rental_rate,
          setup_fee,
          rental_type,
          valid_until,
          lead:leads!inner(
            customer:customers!inner(
              first_name,
              last_name,
              email,
              phone,
              addresses(
                formatted_address,
                street_number,
                street_name,
                city,
                state,
                postal_code
              )
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (agreementError || !agreement) {
      throw new Error('Agreement not found')
    }

    // Check if agreement can be sent
    if (agreement.agreement_status === 'SIGNED' || 
        agreement.agreement_status === 'DECLINED' || 
        agreement.agreement_status === 'EXPIRED') {
      throw new Error(`Cannot send agreement in ${agreement.agreement_status.toLowerCase()} status`)
    }

    const customerEmail = agreement.quote?.lead?.customer?.email
    if (!customerEmail) {
      throw new Error('Customer email not found')
    }

    const customerName = `${agreement.quote?.lead?.customer?.first_name} ${agreement.quote?.lead?.customer?.last_name}`
    const customerPhone = agreement.quote?.lead?.customer?.phone
    
    // Get address components
    const address = agreement.quote?.lead?.customer?.addresses?.[0]
    if (!address) {
      throw new Error('Installation address not found')
    }

    // Format address
    const installAddress = address.formatted_address || [
      address.street_number,
      address.street_name,
      address.city,
      address.state,
      address.postal_code
    ].filter(Boolean).join(' ')

    const templateId = process.env.ESIGNATURES_TEMPLATE_ID
    if (!templateId) {
      throw new Error('ESIGNATURES_TEMPLATE_ID environment variable is not set')
    }

    // Create eSignatures.io document with proper error handling
    const documentRequest: CreateDocumentOptions = {
      template_id: templateId,
      title: `Rental Agreement - ${customerName}`,
      signers: [{
        name: customerName,
        email: customerEmail,
        phone: customerPhone || undefined,
      }],
      placeholder_fields: [
        {
          api_key: "customerName",
          value: customerName
        },
        {
          api_key: "customerEmail",
          value: customerEmail
        },
        {
          api_key: "customerPhone",
          value: customerPhone || ""
        },
        {
          api_key: "installAddress",
          value: installAddress
        },
        {
          api_key: "monthlyRate",
          value: agreement.quote?.monthly_rental_rate?.toString() || "0"
        },
        {
          api_key: "setupFee",
          value: agreement.quote?.setup_fee?.toString() || "0"
        },
        {
          api_key: "rentalType",
          value: agreement.quote?.rental_type || "ONE_TIME"
        },
        {
          api_key: "date",
          value: new Date().toLocaleDateString()
        }
      ],
      metadata: `agreementId:${agreement.id}`,
      custom_webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/esignatures`,
      expires_in_hours: "72", // 3 days expiry
    }

    const response = await eSignaturesClient.createDocument(documentRequest)

    if (!response?.data?.contract?.id) {
      throw new Error('Failed to create eSignatures document')
    }

    // Parse existing notes as object or create new object
    const existingNotes = typeof agreement.notes === 'object' ? agreement.notes : {}
    const updatedNotes = {
      ...existingNotes,
      documentId: response.data.contract.id,
      signPageUrl: response.data.contract.signers[0].sign_page_url
    }

    // Update agreement with document ID and status
    const { error: updateError } = await supabase
      .from('agreements')
      .update({ 
        agreement_status: 'SENT',
        notes: updatedNotes
      })
      .eq('id', id)

    if (updateError) throw updateError

    revalidatePath('/agreements')
    return { success: true }
  } catch (error) {
    console.error('Error sending agreement:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send agreement' 
    }
  }
}

// Update webhook handler to use proper types
export async function handleSignatureWebhook(
  payload: WebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    const { status, data } = payload
    const agreementId = data.contract.metadata?.split(':')?.[1]

    if (!agreementId) {
      throw new Error('Agreement ID not found in contract metadata')
    }

    let newStatus
    let additionalData: any = {}

    switch (status) {
      case 'contract-sent-to-signer':
        newStatus = 'SENT'
        break
      case 'signer-viewed-the-contract':
        newStatus = 'SENT'
        additionalData = {
          viewed_date: data.signer?.events?.find(e => e.event === 'contract_viewed')?.timestamp
        }
        break
      case 'signer-signed':
      case 'contract-signed':
        newStatus = 'SIGNED'
        additionalData = {
          signed_date: data.contract.finalized_at,
          contract_pdf_url: data.contract.contract_pdf_url
        }

        // Fetch agreement with quote details to get setup fee
        const { data: agreement, error: agreementError } = await supabase
          .from('agreements')
          .select(`
            *,
            quote:quotes(
              setup_fee
            )
          `)
          .eq('id', agreementId)
          .single()

        if (agreementError) {
          console.error('Error fetching agreement:', agreementError)
          break
        }

        // Create and send setup fee invoice if applicable
        if (agreement?.quote?.setup_fee && agreement.quote.setup_fee > 0) {
          try {
            // First create the invoice
            const { data: invoice, error: invoiceError } = await supabase
              .from('invoices')
              .insert({
                agreement_id: agreementId,
                invoice_type: 'SETUP',
                amount: agreement.quote.setup_fee,
                paid: false,
                payment_date: null,
              })
              .select()
              .single()

            if (invoice && !invoiceError) {
              // Then send it
              const sendResult = await sendInvoice(invoice.id)
              if (!sendResult.success) {
                console.error('Error sending setup fee invoice:', sendResult.error)
              }
            } else {
              console.error('Setup fee invoice creation error:', invoiceError)
            }
          } catch (error) {
            console.error('Error handling setup fee invoice:', error)
          }
        }
        break
      case 'signer-declined-the-signature':
        newStatus = 'DECLINED'
        break
      case 'contract-expired':
        newStatus = 'EXPIRED'
        break
      default:
        return { success: true } // Ignore other webhook events
    }

    // Get existing agreement data
    const { data: existingAgreement } = await supabase
      .from('agreements')
      .select('notes')
      .eq('id', agreementId)
      .single()

    // Parse existing notes or create new object
    const existingNotes = typeof existingAgreement?.notes === 'object' ? existingAgreement.notes : {}
    
    // Update agreement status and notes
    const { error: updateError } = await supabase
      .from('agreements')
      .update({ 
        agreement_status: newStatus,
        signed_date: additionalData.signed_date || null,
        notes: {
          ...existingNotes,
          ...additionalData,
          last_status_update: new Date().toISOString(),
          last_webhook_status: status
        }
      })
      .eq('id', agreementId)

    if (updateError) throw updateError

    revalidatePath('/agreements')
    return { success: true }
  } catch (error) {
    console.error('Error handling signature webhook:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to handle signature webhook' 
    }
  }
} 