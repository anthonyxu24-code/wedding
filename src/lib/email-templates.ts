const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const SHARED_STYLES = {
  wrapper: 'max-width:480px;margin:0 auto;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1c1c1c;',
  heading: 'font-size:28px;font-weight:700;text-align:center;margin:0 0 4px;color:#1c1c1c;',
  subheading: 'font-size:14px;text-align:center;color:#71717a;margin:0 0 28px;',
  detail: 'font-size:15px;text-align:center;color:#1c1c1c;margin:4px 0;',
  detailMuted: 'font-size:14px;text-align:center;color:#71717a;margin:4px 0;',
  primaryBtn: 'display:block;text-align:center;padding:14px 24px;background:#1c1c1c;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;margin:28px auto 16px;max-width:260px;',
  secondaryBtn: 'display:inline-block;text-align:center;padding:10px 20px;border:1px solid #e4e4e7;color:#71717a;font-size:13px;text-decoration:none;margin:6px 4px;',
  divider: 'border:none;border-top:1px solid #e4e4e7;margin:28px 0;',
  footer: 'font-size:12px;text-align:center;color:#a1a1aa;margin:24px 0 0;',
  coverImg: 'display:block;max-width:100%;height:auto;margin:0 auto 24px;',
};

function linkUrl(path: string, locale: string): string {
  return `${SITE_URL}${path}?lang=${locale}`;
}

interface InviteEmailData {
  guestName: string;
  locale: "en" | "zh";
  rsvpToken: string;
}

export function buildInviteEmail({ guestName, locale, rsvpToken }: InviteEmailData): { subject: string; html: string } {
  const isZh = locale === "zh";

  const subject = isZh
    ? "Cindy & Anthony 婚礼邀请"
    : "You're Invited — Cindy & Anthony's Wedding";

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;">
<div style="${SHARED_STYLES.wrapper}">

  <img src="${SITE_URL}/cover.png" alt="Cindy & Anthony" style="${SHARED_STYLES.coverImg}" width="480" />

  <h1 style="${SHARED_STYLES.heading}">Cindy & Anthony</h1>
  <p style="${SHARED_STYLES.subheading}">${isZh ? "诚邀您参加我们的婚礼" : "Request the pleasure of your company"}</p>

  <hr style="${SHARED_STYLES.divider}" />

  <p style="${SHARED_STYLES.detail}"><strong>${isZh ? "尊敬的" : "Dear"} ${guestName},</strong></p>
  <p style="${SHARED_STYLES.detailMuted}">${isZh
    ? "我们诚挚邀请您参加我们的婚礼。"
    : "We would be honoured to have you celebrate with us."}</p>

  <p style="${SHARED_STYLES.detail}"><strong>${isZh ? "2026年4月10日" : "April 10, 2026"}</strong></p>
  <p style="${SHARED_STYLES.detail}">${isZh ? "下午 3:00 – 8:30" : "3:00 PM – 8:30 PM"}</p>
  <p style="${SHARED_STYLES.detailMuted}">${isZh ? "京都四季酒店" : "Four Seasons Hotel Kyoto"}</p>
  <p style="font-size:12px;text-align:center;color:#a1a1aa;margin:2px 0;">445-3, Myohoin Maekawa-cho, Higashiyama-ku, Kyoto</p>

  <a href="${linkUrl("/", locale)}" style="${SHARED_STYLES.primaryBtn}" target="_blank">${isZh ? "查看邀请" : "View Invitation"}</a>

  <a href="${SITE_URL}/rsvp?token=${encodeURIComponent(rsvpToken)}" style="${SHARED_STYLES.primaryBtn}background:transparent;color:#1c1c1c;border:1px solid #1c1c1c;margin-top:0;" target="_blank">${isZh ? "立即回复" : "RSVP Now"}</a>

  <div style="text-align:center;padding:14px 20px;margin:20px auto;background:#f5f5f4;max-width:300px;">
    <p style="font-size:12px;color:#71717a;margin:0 0 4px;">${isZh ? "网站密码" : "Website Password"}</p>
    <p style="font-size:18px;font-weight:700;color:#1c1c1c;margin:0;letter-spacing:0.5px;">Hagabooga</p>
  </div>

  <hr style="${SHARED_STYLES.divider}" />

  <p style="font-size:13px;text-align:center;color:#71717a;margin:0 0 12px;">${isZh ? "了解更多" : "Explore"}</p>
  <div style="text-align:center;">
    <a href="${linkUrl("/details", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "着装与日程" : "Attire & Itinerary"}</a>
    <a href="${linkUrl("/location", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "地点与交通" : "Location & Travel"}</a>
    <a href="${linkUrl("/registry", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "礼品" : "Registry"}</a>
  </div>

  <hr style="${SHARED_STYLES.divider}" />
  <p style="${SHARED_STYLES.footer}">${isZh
    ? "Cindy & Anthony · 2026年4月10日 · 京都"
    : "Cindy & Anthony · April 10, 2026 · Kyoto"}</p>
</div>
</body>
</html>`;

  return { subject, html };
}

interface ConfirmationEmailData {
  guestName: string;
  locale: "en" | "zh";
  attending: boolean;
  guestCount: number;
  rsvpToken: string;
}

export function buildConfirmationEmail({ guestName, locale, attending, guestCount, rsvpToken }: ConfirmationEmailData): { subject: string; html: string } {
  const rsvpEditUrl = `${SITE_URL}/rsvp?token=${encodeURIComponent(rsvpToken)}`;

  const isZh = locale === "zh";

  const subject = isZh
    ? "感谢您的回复 — Cindy & Anthony"
    : "Thank You for Your RSVP — Cindy & Anthony";

  const attendingText = attending
    ? (isZh ? `✓ 出席 · ${guestCount} 位宾客` : `✓ Attending · ${guestCount} guest${guestCount > 1 ? "s" : ""}`)
    : (isZh ? "✗ 无法出席" : "✗ Unable to attend");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;">
<div style="${SHARED_STYLES.wrapper}">

  <h1 style="${SHARED_STYLES.heading}">Cindy & Anthony</h1>
  <p style="${SHARED_STYLES.subheading}">${isZh ? "感谢您的回复" : "Thank You for Your RSVP"}</p>

  <hr style="${SHARED_STYLES.divider}" />

  <p style="${SHARED_STYLES.detail}"><strong>${isZh ? "尊敬的" : "Dear"} ${guestName},</strong></p>
  <p style="${SHARED_STYLES.detailMuted}">${isZh
    ? "我们已收到您的回复，谢谢！"
    : "We've received your response — thank you!"}</p>

  <div style="text-align:center;padding:16px 0;margin:16px 0;background:#f5f5f4;font-size:15px;font-weight:600;color:#1c1c1c;">
    ${attendingText}
  </div>

  <a href="${rsvpEditUrl}" style="${SHARED_STYLES.primaryBtn}background:transparent;color:#1c1c1c;border:1px solid #1c1c1c;margin-top:0;margin-bottom:24px;" target="_blank">${isZh ? "修改我的回复" : "Edit Your Response"}</a>

  ${attending ? `
  <p style="${SHARED_STYLES.detail}"><strong>${isZh ? "2026年4月10日" : "April 10, 2026"}</strong></p>
  <p style="${SHARED_STYLES.detail}">${isZh ? "下午 3:00 – 8:30" : "3:00 PM – 8:30 PM"}</p>
  <p style="${SHARED_STYLES.detailMuted}">${isZh ? "京都四季酒店" : "Four Seasons Hotel Kyoto"}</p>

  <hr style="${SHARED_STYLES.divider}" />

  <p style="font-size:13px;text-align:center;color:#71717a;margin:0 0 12px;">${isZh ? "准备您的旅程" : "Prepare for your trip"}</p>
  <div style="text-align:center;">
    <a href="${linkUrl("/details", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "着装与日程" : "Attire & Itinerary"}</a>
    <a href="${linkUrl("/location", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "地点与交通" : "Location & Travel"}</a>
    <a href="${linkUrl("/registry", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "礼品" : "Registry"}</a>
  </div>
  ` : `
  <p style="${SHARED_STYLES.detailMuted}">${isZh
    ? "很遗憾您无法出席，感谢您的回复。"
    : "We're sorry you can't make it, but thank you for letting us know."}</p>
  `}

  <hr style="${SHARED_STYLES.divider}" />
  <p style="${SHARED_STYLES.footer}">${isZh
    ? "Cindy & Anthony · 2026年4月10日 · 京都"
    : "Cindy & Anthony · April 10, 2026 · Kyoto"}</p>
</div>
</body>
</html>`;

  return { subject, html };
}

interface ReminderEmailData {
  guestName: string;
  locale: "en" | "zh";
  daysUntil: number;
  rsvpToken: string;
}

export function buildReminderEmail({ guestName, locale, daysUntil, rsvpToken }: ReminderEmailData): { subject: string; html: string } {
  const isZh = locale === "zh";
  const rsvpEditUrl = `${SITE_URL}/rsvp?token=${encodeURIComponent(rsvpToken)}`;

  const subject = isZh
    ? `还有 ${daysUntil} 天 — Cindy & Anthony 婚礼提醒`
    : `${daysUntil} Days to Go — Cindy & Anthony's Wedding`;

  const countdownText = isZh
    ? `距离我们的婚礼还有 <strong>${daysUntil}</strong> 天！`
    : `Only <strong>${daysUntil} day${daysUntil > 1 ? "s" : ""}</strong> until our wedding!`;

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;">
<div style="${SHARED_STYLES.wrapper}">

  <h1 style="${SHARED_STYLES.heading}">Cindy & Anthony</h1>
  <p style="${SHARED_STYLES.subheading}">${isZh ? "婚礼提醒" : "Wedding Reminder"}</p>

  <hr style="${SHARED_STYLES.divider}" />

  <p style="${SHARED_STYLES.detail}"><strong>${isZh ? "尊敬的" : "Dear"} ${guestName},</strong></p>
  <p style="${SHARED_STYLES.detailMuted}">${countdownText}</p>

  <div style="text-align:center;padding:20px 0;margin:16px 0;background:#f5f5f4;font-size:32px;font-weight:700;color:#1c1c1c;">
    ${daysUntil}
    <span style="display:block;font-size:13px;font-weight:400;color:#71717a;margin-top:4px;">${isZh ? "天" : daysUntil > 1 ? "days to go" : "day to go"}</span>
  </div>

  <p style="${SHARED_STYLES.detail}"><strong>${isZh ? "2026年4月10日" : "April 10, 2026"}</strong></p>
  <p style="${SHARED_STYLES.detail}">${isZh ? "下午 3:00 – 8:30" : "3:00 PM – 8:30 PM"}</p>
  <p style="${SHARED_STYLES.detailMuted}">${isZh ? "京都四季酒店" : "Four Seasons Hotel Kyoto"}</p>
  <p style="font-size:12px;text-align:center;color:#a1a1aa;margin:2px 0;">445-3, Myohoin Maekawa-cho, Higashiyama-ku, Kyoto</p>

  <hr style="${SHARED_STYLES.divider}" />

  <p style="font-size:13px;text-align:center;color:#71717a;margin:0 0 12px;">${isZh ? "准备您的旅程" : "Prepare for your trip"}</p>
  <div style="text-align:center;">
    <a href="${linkUrl("/details", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "着装与日程" : "Attire & Itinerary"}</a>
    <a href="${linkUrl("/location", locale)}" style="${SHARED_STYLES.secondaryBtn}" target="_blank">${isZh ? "地点与交通" : "Location & Travel"}</a>
  </div>

  <a href="${rsvpEditUrl}" style="${SHARED_STYLES.primaryBtn}background:transparent;color:#1c1c1c;border:1px solid #1c1c1c;" target="_blank">${isZh ? "修改我的回复" : "Edit Your RSVP"}</a>

  <hr style="${SHARED_STYLES.divider}" />
  <p style="${SHARED_STYLES.footer}">${isZh
    ? "Cindy & Anthony · 2026年4月10日 · 京都"
    : "Cindy & Anthony · April 10, 2026 · Kyoto"}</p>
</div>
</body>
</html>`;

  return { subject, html };
}
