import { NextRequest, NextResponse } from "next/server"
import { handleSignatureWebhook } from "@/app/actions/agreements"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Verify webhook signature if eSignatures.io provides one
    // const signature = request.headers.get('x-esignatures-signature')
    // if (!verifyWebhookSignature(signature, payload)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const result = await handleSignatureWebhook(payload)
    
    if (!result.success) {
      console.error('Webhook handling failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 