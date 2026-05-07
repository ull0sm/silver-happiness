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

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as TurnstileServiceResponse;

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