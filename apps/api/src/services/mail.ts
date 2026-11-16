import type { Env } from "../env";

export interface Mailer {
  send(to: string, subject: string, text: string): Promise<void>;
}

export function createMailer(env: Env): Mailer {
  if (env.MAIL_PROVIDER === "resend") {
    if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY gerekli");
    return {
      async send(to, subject, text) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from: env.MAIL_FROM, to, subject, text }),
        });
        if (!res.ok) throw new Error(`Resend hata: ${res.status} ${await res.text()}`);
      },
    };
  }
  return {
    async send(to, subject, text) {
      console.log(`[mail→${to}] ${subject}\n${text}`);
    },
  };
}
