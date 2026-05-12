export type TurnstileAction = "login" | "support";

type TurnstileServiceResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string,
  expectedAction?: TurnstileAction,
  remoteIp?: string
): Promise<{ ok: true } | { ok: false; error: string; details?: string[] }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      ok: false,
      error: "Turnstile secret key is not configured.",
    };
  }
  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);

  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  let response: Response;
  try {
    response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch (err) {
    return { ok: false, error: "Network error while verifying Turnstile token." };
  }

  let data: TurnstileServiceResponse;
  try {
    data = (await response.json()) as TurnstileServiceResponse;
  } catch (err) {
    return { ok: false, error: "Invalid response from Turnstile service." };
  }

  if (!data.success) {
    return {
      ok: false,
      error: "Turnstile verification failed.",
      details: data["error-codes"],
    };
  }

  if (expectedAction && data.action !== expectedAction) {
    return {
      ok: false,
      error: "Turnstile action mismatch.",
    };
  }

  return { ok: true };
}