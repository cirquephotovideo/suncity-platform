import { cookies } from 'next/headers';

export const AGE_COOKIE = 'sc_age_ok';
export const AGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export async function isAgeConfirmed(): Promise<boolean> {
  const c = await cookies();
  return c.get(AGE_COOKIE)?.value === '1';
}
