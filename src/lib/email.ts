// ─── Learn Tech with Zahid — Email Utility via AgentMail ───────────
// Sends email notifications using the AgentMail REST API.
// Non-blocking: callers should use .catch() to avoid blocking the response.

const AGENTMAIL_BASE_URL = "https://api.agentmail.to/v1";
const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY || "";
const AGENTMAIL_INBOX = process.env.AGENTMAIL_INBOX || "diana-ai@agentmail.to";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via AgentMail REST API.
 * Returns true on success, false on failure.
 */
export async function sendNotification({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!AGENTMAIL_API_KEY) {
    console.warn("[Email] AGENTMAIL_API_KEY not set — skipping email notification");
    return false;
  }

  try {
    const res = await fetch(`${AGENTMAIL_BASE_URL}/emails/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AGENTMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: AGENTMAIL_INBOX,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Email] AgentMail API error (${res.status}): ${errorText}`);
      return false;
    }

    console.log(`[Email] Notification sent to ${to}: "${subject}"`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send notification:", error);
    return false;
  }
}

/**
 * Sends a formatted notification about a new exam.
 * Uses a fixed notification recipient (AGENTMAIL_INBOX or configurable).
 */
export async function notifyNewExam(examTitle: string, examSlug: string): Promise<void> {
  const notificationTo = process.env.NOTIFICATION_EMAIL || AGENTMAIL_INBOX;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learn-tech-with-zahid.vercel.app";

  const subject = `📢 New Exam Published: ${examTitle}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #f5f5f5; margin: 0; padding: 40px 20px; }
    .container { max-width: 480px; margin: 0 auto; }
    .card { background: rgba(26, 26, 46, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    h1 { font-size: 22px; margin: 0 0 8px; color: #f5f5f5; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; }
    .btn:hover { opacity: 0.9; }
    .footer { color: #64748b; font-size: 12px; text-align: center; margin-top: 32px; }
    .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <span class="badge">New Exam</span>
      <h1>${examTitle}</h1>
      <p>A new exam has been published on Learn Tech with Zahid. Check it out and share it with students!</p>
      <div class="divider"></div>
      <a href="${appUrl}/exam/${examSlug}" class="btn">View Exam →</a>
    </div>
    <p class="footer">Learn Tech with Zahid — Automated notification. Do not reply.</p>
  </div>
</body>
</html>
  `.trim();

  await sendNotification({ to: notificationTo, subject, html });
}
