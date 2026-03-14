"use client";

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";

export const ADDRESS =
  "445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan";
const DATE_EN = "April 10, 2026";
const TIME_EN = "2:00 PM – 8:30 PM";
const DATE_ZH = "2026年4月10日";
const TIME_ZH = "下午2:00 – 8:30";

export type Locale = "en" | "zh";

export const t: Record<Locale, Record<string, string>> = {
  en: {
    venue: "Four Seasons Hotel Kyoto",
    rsvp: "RSVP",
    registry: "Registry",
    details: "Details",
    location: "Location",
    yourName: "Your name",
    email: "Email",
    attending: "Attending",
    yes: "Yes",
    no: "No",
    numberOfGuests: "Number of guests (including yourself)",
    namesOfOtherGuests: "Names of other guests",
    onePerLine: "One per line",
    message: "Message",
    submit: "Submit",
    sending: "Sending…",
    thankYou: "Thank you.",
    receivedResponse: "We've received your response.",
    registryIntro:
      "Your presence is our greatest gift. Should you wish to give, we welcome a contribution toward our honeymoon or a gift from the links below.",
    contribute: "Contribute",
    contributeCard: "Pay with Card",
    contributeNotSet: "Contribute (link not set)",
    alipay: "Contribute via Alipay",
    alipayNotSet: "Alipay (link not set)",
    venmo: "Venmo",
    giftAmount: "Gift amount",
    giftAmountRequired: "Please enter an amount",
    processing: "Processing…",
    giftRegistry: "Gift registry",
    footer: "Cindy & Anthony · April 10, 2026 · Kyoto",
    home: "Home",
    back: "Back",
    alreadyRsvped: "I've already RSVP'd",
    countdownDays: "Days",
    countdownHours: "Hours",
    countdownMinutes: "Min",
    countdownSeconds: "Sec",
    mailingAddress: "Mailing address",
    mailingAddressPlaceholder: "Street, city, state, zip",
    rsvpTokenRequired: "RSVP Link Required",
    rsvpTokenInstructions: "Please use the RSVP link from your invitation email to access this page.",
    sendVerifyCode: "Send Verification Code",
    verifyCodeSent: "We sent a 6-digit code to",
    verifyCodePlaceholder: "Enter 6-digit code",
    verifyCode: "Verify",
    verifyCodeInvalid: "Invalid code. Please try again.",
    resendCode: "Resend code",
    checkSpam: "Don't see it? Check your spam folder.",
    rsvpUpdated: "Your RSVP has been updated.",
    rsvpUpdateNote: "You've already responded. You can update your RSVP below.",
    updateRsvp: "Update RSVP",
    editResponse: "Edit my response",
    arriveEarly: "Please arrive by 2:00 PM to be directed to the chapel",
    reviewAndSubmit: "Review & Submit",
    reviewBeforeSubmit: "Please review your details before submitting.",
    confirmSubmit: "Confirm",

    // Details page — Attire
    attireTitle: "Dress Code",
    attireSubtitle: "Business Formal",
    attireMenLabel: "Gentlemen",
    attireMen: "Dark suit with trousers, white dress shirt, and a tie or bow tie of your choice.",
    attireWomenLabel: "Ladies",
    attireWomen: "Formal cocktail dress or elegant evening attire.",

    // Details page — Itinerary
    itineraryTitle: "Wedding Day",
    ceremony: "Ceremony",
    cocktailHour: "Cocktail Hour",
    dinnerReception: "Dinner & Reception",
    sendOff: "Send-off",

    // Location page — Venue
    venueTitle: "The Venue",
    venueDescription:
      "Four Seasons Hotel Kyoto is located in the Higashiyama area, close to temples, shrines, and the Gion neighbourhood. About 10 minutes from downtown Kyoto.",
    getDirections: "Get Directions",

    // Location page — Getting There
    gettingThereTitle: "Getting There",
    fromTokyo: "From Tokyo",
    fromTokyoDesc:
      "Take the Shinkansen (Nozomi) to Kyoto Station — about 2 hours 15 minutes, trains every 10 minutes, around ¥14,000. From Kyoto Station, the hotel is about 8 minutes by taxi.",
    fromKansai: "From Kansai Airport (Osaka)",
    fromKansaiDesc:
      "Take the JR Haruka Express to Kyoto Station — about 75 minutes. From Kyoto Station, the hotel is about 8 minutes by taxi. Private transfers can also be arranged through the hotel.",

    // Location page — Where to Stay
    whereToStayTitle: "Where to Stay",
    stayVenue: "Four Seasons Hotel Kyoto",
    stayVenueDesc: "The venue itself — convenient if you'd like to be on-site.",
    stayKyotoStation: "Near Kyoto Station",
    stayKyotoStationDesc:
      "Many options at different price points. The venue is about 8 minutes by taxi from the station.",
    stayGuesthouses: "Guesthouses in Higashiyama / Gion",
    stayGuesthousesDesc:
      "Walkable to the venue and great for exploring Kyoto.",
    stayOsaka: "Staying in Osaka",
    stayOsakaDesc:
      "Osaka has a wider range of affordable hotels, especially around Namba, Shinsaibashi, or Umeda. The JR train from Osaka Station to Kyoto Station takes about 30 minutes and costs around ¥580 (~$4). A good option if you're also planning to explore Osaka during your trip.",
  },
  zh: {
    venue: "京都四季酒店",
    rsvp: "回复",
    registry: "礼品",
    details: "详情",
    location: "地点",
    yourName: "您的姓名",
    email: "电子邮箱",
    attending: "是否出席",
    yes: "是",
    no: "否",
    numberOfGuests: "宾客人数（包括您自己）",
    namesOfOtherGuests: "其他宾客姓名",
    onePerLine: "每行一位",
    message: "留言",
    submit: "提交",
    sending: "提交中…",
    thankYou: "谢谢您。",
    receivedResponse: "我们已收到您的回复。",
    registryIntro:
      "您的莅临是我们最好的礼物。若您想送上一份心意，欢迎以礼金或以下礼品链接的方式表达。",
    contribute: "礼金",
    contributeCard: "银行卡支付",
    contributeNotSet: "礼金（未设置链接）",
    alipay: "通过支付宝送礼",
    alipayNotSet: "支付宝（未设置链接）",
    venmo: "Venmo 转账",
    giftAmount: "礼金金额",
    giftAmountRequired: "请输入金额",
    processing: "处理中…",
    giftRegistry: "礼品登记",
    footer: "Cindy & Anthony · 2026年4月10日 · 京都",
    home: "首页",
    back: "返回",
    alreadyRsvped: "我已经回复过了",
    countdownDays: "天",
    countdownHours: "时",
    countdownMinutes: "分",
    countdownSeconds: "秒",
    mailingAddress: "邮寄地址",
    mailingAddressPlaceholder: "街道、城市、省份、邮编",
    rsvpTokenRequired: "需要回复链接",
    rsvpTokenInstructions: "请使用邀请邮件中的回复链接访问此页面。",
    sendVerifyCode: "发送验证码",
    verifyCodeSent: "我们已将6位验证码发送至",
    verifyCodePlaceholder: "输入6位验证码",
    verifyCode: "验证",
    verifyCodeInvalid: "验证码无效，请重试。",
    resendCode: "重新发送",
    checkSpam: "没收到？请检查垃圾邮件文件夹。",
    rsvpUpdated: "您的回复已更新。",
    rsvpUpdateNote: "您已提交过回复，可以在下方更新。",
    updateRsvp: "更新回复",
    editResponse: "修改我的回复",
    arriveEarly: "请于下午2:00前到达，届时将有人引导您前往教堂",
    reviewAndSubmit: "确认并提交",
    reviewBeforeSubmit: "请确认以下信息无误后提交。",
    confirmSubmit: "确认提交",

    // Details page — Attire
    attireTitle: "着装要求",
    attireSubtitle: "商务正装",
    attireMenLabel: "先生",
    attireMen: "深色西装搭配长裤、白色衬衫，领带或领结随意搭配。",
    attireWomenLabel: "女士",
    attireWomen: "正式晚礼服或优雅的晚宴着装。",

    // Details page — Itinerary
    itineraryTitle: "婚礼日程",
    ceremony: "婚礼仪式",
    cocktailHour: "鸡尾酒时间",
    dinnerReception: "晚宴",
    sendOff: "送别",

    // Location page — Venue
    venueTitle: "婚礼场地",
    venueDescription:
      "京都四季酒店位于东山区，靠近寺庙、神社和祇园。距京都市中心约10分钟。",
    getDirections: "获取路线",

    // Location page — Getting There
    gettingThereTitle: "交通指南",
    fromTokyo: "从东京出发",
    fromTokyoDesc:
      "乘坐新干线（Nozomi）到京都站，约2小时15分钟，每10分钟一班，约¥14,000。从京都站乘出租车约8分钟到达酒店。",
    fromKansai: "从关西机场（大阪）出发",
    fromKansaiDesc:
      "乘坐JR Haruka特快到京都站，约75分钟。从京都站乘出租车约8分钟到达酒店。也可通过酒店安排接送服务。",

    // Location page — Where to Stay
    whereToStayTitle: "住宿推荐",
    stayVenue: "京都四季酒店",
    stayVenueDesc: "婚礼场地本身，方便就近入住。",
    stayKyotoStation: "京都站附近",
    stayKyotoStationDesc:
      "不同价位选择丰富，距会场出租车约8分钟。",
    stayGuesthouses: "东山/祇园民宿",
    stayGuesthousesDesc:
      "步行可达会场，方便探索京都。",
    stayOsaka: "住在大阪",
    stayOsakaDesc:
      "大阪有更多经济实惠的酒店选择，尤其是难波、心斋桥和梅田一带。从大阪站到京都站乘坐JR约30分钟，票价约¥580（约$4）。如果行程中还想逛逛大阪，这是个不错的选择。",
  },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  lang: Record<string, string>;
  date: string;
  time: string;
  address: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "zh" || urlLang === "en") {
      setLocaleRaw(urlLang);
      try { localStorage.setItem("locale", urlLang); } catch {}
    } else {
      try {
        const saved = localStorage.getItem("locale");
        if (saved === "zh" || saved === "en") setLocaleRaw(saved);
      } catch {}
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleRaw(l);
    try { localStorage.setItem("locale", l); } catch {}
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      lang: t[locale],
      date: locale === "zh" ? DATE_ZH : DATE_EN,
      time: locale === "zh" ? TIME_ZH : TIME_EN,
      address: ADDRESS,
    }),
    [locale]
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
