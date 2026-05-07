type TurnstileAction = "login" | "support";

type TurnstileVerifyResponse = {
  ok: boolean;
  error?: string;
};

export async function verifyTurnstileToken(token: string, expectedAction: TurnstileAction): Promise<TurnstileVerifyResponse> {
  try {
    const response = await fetch("/api/turnstile/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, expectedAction }),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error ?? "Turnstile verification failed.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Turnstile verification failed.",
    };
  }
}