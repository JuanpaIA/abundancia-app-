import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.toLowerCase().trim())
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sendMetaPurchase(email: string, value: number, currency: string, planType: string) {
  const pixelId = Deno.env.get('META_PIXEL_ID')
  const accessToken = Deno.env.get('META_ACCESS_TOKEN')
  if (!pixelId || !accessToken || !email) return

  const hashedEmail = await sha256(email)

  await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: 'https://luumina.pro',
        action_source: 'website',
        user_data: {
          em: [hashedEmail],
        },
        custom_data: {
          currency: currency.toUpperCase(),
          value,
          content_name: planType === 'annual' ? 'Plan Anual' : 'Plan Mensual',
          content_type: 'product',
        },
      }],
    }),
  })
}

Deno.serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!sig || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const userId = session.metadata?.supabase_user_id
      const planType = session.metadata?.plan_type ?? 'monthly'

      if (userId) {
        const today = new Date().toISOString().split('T')[0]

        // Obtener email del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single()

        // Actualizar suscripción
        await supabase.from('profiles').update({
          subscription_status: 'active',
          plan_type: planType,
          stripe_customer_id: session.customer as string,
          plan_start_date: today,
        }).eq('id', userId)

        // Enviar evento Purchase a Meta CAPI
        const email = session.customer_email || profile?.email || ''
        const value = (session.amount_total ?? 0) / 100
        const currency = session.currency ?? 'usd'
        await sendMetaPurchase(email, value, currency, planType)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const status = sub.status === 'active' ? 'active' : 'inactive'
      await supabase.from('profiles')
        .update({ subscription_status: status })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
