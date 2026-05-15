import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: '2024-12-18.acacia' as any, typescript: true })
  : null;

export function isStripeReady() {
  return !!stripe;
}

export function getPublicKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
}
