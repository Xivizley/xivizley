/**
 * Cloudflare Turnstile Server-Side Validation Helper
 * Reference: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[] | undefined;
  challengeTs?: string | undefined;
  hostname?: string | undefined;
}

export async function verifyTurnstileToken(token?: string, ip?: string): Promise<TurnstileVerifyResult> {
  const rawSecretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '';

  if (!rawSecretKey || rawSecretKey.trim() === '') {
    return { success: true };
  }

  const secretKey = rawSecretKey.trim();
  const cleanToken = token?.trim();

  if (!cleanToken) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', cleanToken);
    if (ip && ip !== '127.0.0.1') {
      params.append('remoteip', ip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
      challenge_ts?: string;
      hostname?: string;
    };

    if (!data.success) {
      console.warn('[Turnstile] Cloudflare rejected token:', data['error-codes']);
    }

    return {
      success: !!data.success,
      errorCodes: data['error-codes'],
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error('[Turnstile] Verification request failed:', error);
    return { success: false, errorCodes: ['verification-request-failed'] };
  }
}

