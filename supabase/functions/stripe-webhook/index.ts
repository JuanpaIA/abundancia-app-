import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

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
      const planType = session.metadata?.plan_type
      if (userId) {
        const today = new Date().toISOString().split('T')[0]
        await supabase.from('profiles').update({
          subscription_status: 'active',
          plan_type: planType ?? 'monthly',
          stripe_customer_id: session.customer as string,
          plan_start_date: today,
        }).eq('id', userId)
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
