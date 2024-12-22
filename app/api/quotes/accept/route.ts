import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { sendAgreement } from "@/app/actions/agreements"
import { createInvoice, sendInvoice } from "@/app/actions/invoices"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const token = searchParams.get('token')

    if (!id || !token) {
      console.error('Missing parameters:', { id, token });
      return NextResponse.redirect(
        new URL(`/quote-accepted?id=${id}&error=Invalid request parameters`, request.url)
      )
    }

    const supabase = await createClient()

    // Verify the token matches the quote ID
    const expectedToken = Buffer.from(id).toString('base64')
    if (token !== expectedToken) {
      console.error('Token mismatch:', { token, expectedToken });
      return NextResponse.redirect(
        new URL(`/quote-accepted?id=${id}&error=Invalid token`, request.url)
      )
    }

    // Check if quote exists and is not already accepted
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq('id', id)
      .single()

    if (quoteError || !quote) {
      console.error('Quote fetch error:', quoteError);
      return NextResponse.redirect(
        new URL(`/quote-accepted?id=${id}&error=Quote not found`, request.url)
      )
    }

    if (quote.quote_status === 'ACCEPTED') {
      return NextResponse.redirect(
        new URL(`/quote-accepted?id=${id}`, request.url)
      )
    }

    // Update quote status to accepted
    const { error: updateError } = await supabase
      .from("quotes")
      .update({ quote_status: 'ACCEPTED' })
      .eq('id', id)

    if (updateError) {
      console.error('Quote update error:', updateError);
      return NextResponse.redirect(
        new URL(`/quote-accepted?id=${id}&error=Failed to update quote status`, request.url)
      )
    }

    const agreementData = {
      quote_id: id,
      notes: quote.notes,
      agreement_status: 'DRAFT'
    };

    console.log('Creating agreement with data:', agreementData);

    // Create agreement
    const { data: agreement, error: agreementError } = await supabase
      .from("agreements")
      .insert(agreementData)
      .select()
      .single()

    if (agreementError || !agreement) {
      console.error('Agreement creation error:', agreementError);
      return NextResponse.redirect(
        new URL(`/quote-accepted?id=${id}&error=Failed to create agreement: ${agreementError?.message}`, request.url)
      )
    }

    console.log('Agreement created:', agreement);

    // Try to send agreement
    try {
      const sendResult = await sendAgreement(agreement.id)
      if (!sendResult.success) {
        console.error('Agreement send error:', sendResult.error);
        return NextResponse.redirect(
          new URL(`/quote-accepted?id=${id}&error=Failed to send agreement: ${sendResult.error}`, request.url)
        )
      }
    } catch (error) {
      console.error('Error sending agreement:', error);
      // Don't redirect here, continue with invoice if applicable
    }

    // Create and send setup fee invoice if applicable
    if (quote.setup_fee && quote.setup_fee > 0) {
      try {
        // First create the invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            agreement_id: agreement.id,
            invoice_type: 'SETUP',
            amount: quote.setup_fee,
            paid: false,
            payment_date: null,
          })
          .select()
          .single()

        if (invoice && !invoiceError) {
          // Then send it
          await sendInvoice(invoice.id)
        } else {
          console.error('Invoice creation error:', invoiceError);
        }
      } catch (error) {
        console.error('Error sending invoice:', error);
        // Don't redirect here, the main flow succeeded
      }
    }

    return NextResponse.redirect(
      new URL(`/quote-accepted?id=${id}`, request.url)
    )

  } catch (error) {
    console.error('Error accepting quote:', error);
    const id = request.nextUrl.searchParams.get('id')
    return NextResponse.redirect(
      new URL(`/quote-accepted?id=${id}&error=An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`, request.url)
    )
  }
} 