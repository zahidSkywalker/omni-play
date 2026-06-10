const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageBreak, LevelFormat, TableOfContents,
} = require("docx");
const fs = require("fs");

const P = {
  primary: "0A1628", body: "1A2B40", secondary: "5B6B7D",
  accent: "3B82F6", surface: "F4F8FC",
  coverBg: "0F1B2D", coverAccent: "3B82F6",
  white: "FFFFFF", lightGray: "94A3B8",
};
const c = (h) => h.replace("#", "");
const NB = { style: BorderStyle.NONE, size: 0, color: P.white };
const noB = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const FNT = "Noto Sans Bengali";
const EF = "Calibri";

function h1(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 480, after: 200, line: 312 },
    children: [new TextRun({ text: t, bold: true, size: 32, font: { ascii: EF, cs: FNT }, color: c(P.primary) })] });
}
function h2(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text: t, bold: true, size: 26, font: { ascii: EF, cs: FNT }, color: c(P.primary) })] });
}
function bd(t) {
  return new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 480 }, spacing: { after: 120, line: 312 },
    children: [new TextRun({ text: t, size: 22, font: { ascii: EF, cs: FNT }, color: c(P.body) })] });
}
function bi(t) {
  return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 312 },
    children: [new TextRun({ text: t, size: 22, font: { ascii: EF, cs: FNT }, color: c(P.body) })] });
}
function bl(t) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 80, line: 312 },
    children: [new TextRun({ text: "\u2022 " + t, size: 22, font: { ascii: EF, cs: FNT }, color: c(P.body) })] });
}
function cb(t) {
  return new Paragraph({ spacing: { before: 80, after: 80, line: 280 }, indent: { left: 480 },
    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
    children: [new TextRun({ text: t, size: 20, font: { ascii: "Courier New", cs: FNT }, color: "334155" })] });
}

const coverChildren = [
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ height: { value: 16838, rule: "exact" }, verticalAlign: "top", children: [
      new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: P.coverBg }, borders: noB,
        margins: { top: 0, bottom: 0, left: 1200, right: 1200 },
        children: [
          new Paragraph({ spacing: { before: 4200 }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: "ফেসবুক পেজ ও মেসেঞ্জার", bold: true, size: 48, font: { ascii: EF, cs: FNT }, color: P.white })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
            new TextRun({ text: "অটোমেশন গাইড", bold: true, size: 44, font: { ascii: EF, cs: FNT }, color: P.white })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [
            new TextRun({ text: "নিজে নিজে সম্পূর্ণ বাংলা প্রবৃত্তি", size: 24, font: { ascii: EF, cs: FNT }, color: P.lightGray })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.coverAccent, space: 12 } }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 200 }, children: [
            new TextRun({ text: "Diana AI", size: 22, font: { ascii: EF }, color: P.coverAccent })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: "মে ২০২৬", size: 20, font: { ascii: EF, cs: FNT }, color: P.lightGray })] }),
        ]
      })
    ]})
  ]})
];

const bodyChildren = [
  new TableOfContents("সূচিপত্র", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: [
    new TextRun({ text: "নোট: সূচিপত্র আপডেট করতে ডান ক্লিক করুন > টেবিল ক্লিক > ফিল্ড আপডেট",
      italics: true, size: 18, font: { ascii: EF, cs: FNT }, color: P.secondary })] }),
  new Paragraph({ children: [new PageBreak()] }),

  // === অধ্যায় ১ ===
  h1("অধ্যায় ১: ফেসবুক অটোমেশন কী"),

  bd("আজকের ডিজিটাল যুগে ফেসবুক এমন একটি শক্তিশালী মাধ্যম যে কোটি কোটি ব্যবহারকারী এবং বিজনেস মালিকের জন্য এটি একটি অপরিহার্য মাধ্যমে পরিণত হয়েছে। প্রতিদিন লাখ লাখ মানুষ ফেসবুক ব্যবহার করে এবং বিজনেসগুলো এই প্ল্যাটফর্মকে কাজে লাগায়। ফেসবুক পেজ অটোমেশন মানে হলো, আপনি আপনার পেজে স্বয়ংক্রিয়ভাবে পোস্ট করতে পারবেন, মেসেঞ্জারে কাস্টমারের মেসেজের অটো-রিপ্লাই সেটআপ করতে পারবেন, এবং কমেন্ট মডারেশন করতে পারবেন।"),

  bd("এই গাইডে আমরা প্রতিটি ধাপে ধাপে জানবো কীভাবে আপনি নিজে আপনার ফেসবুক পেজ এবং মেসেঞ্জার অটোমেট করতে পারবেন। প্রোগ্রামিং জ্ঞান না থাকলেও কোনো সমস্যা নেই\u2014 অনেক নো-কোড অটোমেশন টুল ব্যবহার করে সহজেই এই কাজ করতে পারবেন। এছাড়াও দেখাবো কীভাবে Diana AI আপনার হয়ে এই কাজগুলো করতে পারে।"),

  h2("এই গাইডে যা যা থাকবে"),
  bl("ফেসবুক পেজে স্বয়ংক্রিয়ভাবে পোস্ট করার পদ্ধতি"),
  bl("মেসেঞ্জারে অটো-রিপ্লাই চ্যাটবোট সেটআপ করা"),
  bl("নির্দিষ্ট সময়ে পোস্ট শেডিউল করা"),
  bl("কমেন্ট মডারেশন ও রিপ্লাই করা"),
  bl("Diana AI দিয়ে সম্পূর্ণ অটোমেশন সেটআপ"),

  // === অধ্যায় ২ ===
  h1("অধ্যায় ২: প্রস্তুতি \u2014 কী কী লাগবে"),

  bd("ফেসবুক অটোমেশন শুরু করার পূর্বে কিছু স্থাপিত জিনিস মিটিয়ে নেওয়া প্রয়োজন। নিচের জিনিসগুলো আপনার লাগবে:"),

  h2("১. একটি ফেসবুক পেজ"),
  bd("যদি আপনার ফেসবুক পেজ না থাকে, তবে প্রথমে facebook.com/pages/create এ গিয়ে একটি পেজ তৈরি করুন। পেজ তৈরির সময় আপনার বিজনেসের নাম, ক্যাটাগরি, এবং একটি প্রোফাইল ছবি যোগ করতে হবে। পেজটি যতটুকু প্রফেশনাল হবে, অটোমেশনের ক্ষমতাও ততটুকু বেশি হবে। একটি সম্পূর্ণ পেজ তৈরি করুন, লোগো যোগ করুন, এবং পেজে কিছু প্রাথমিক পোস্ট করুন যাতে ফেসবুক কোনো সন্দেহ না করে পেজটি ভেরিফাই করে রাখে।"),

  h2("২. মেটা ডেভেলপার অ্যাকাউন্ট"),
  bd("অটোমেশনের জন্য একটি মেটা ডেভেলপার অ্যাকাউন্ট অপরিহার্য। এটি আপনার ফেসবুক অ্যাকাউন্ট দিয়ে লগইন করে তৈরি করা যায়। অ্যাকাউন্ট তৈরির পর আপনি অ্যাপ তৈরি করতে পারবেন, যেখান থেকে আপনি পেজ অ্যাক্সেস টোকেন পাবেন। এটি সম্পূর্ণ ফ্রি\u2014 কোনো কার্ড লাগে না, তবে কার্ড দিয়ে ভেরিফাই করলে বেশি ফিচার পাওয়া যায়।"),

  h2("৩. পেজ অ্যাক্সেস টোকেন"),
  bd("পেজ অ্যাক্সেস টোকেন হলো আপনার পেজ ম্যানেজ করার একটি বিশেষ কী (Key)। এই টোকেন দিয়ে আপনি API এর মাধ্যমে পেজে পোস্ট করতে, মেসেজ পড়তে, এবং বিভিন্ন কার্যকলাপ সম্পাদনা করতে পারবেন। টোকেন সাধারণত ৬০ দিন পর্যন্ত বৈধ থাকে, তাই সময়মতো এটি রিফ্রেশ করতে ভুলবেন না। গুরুত্বপূর্ণ: সুরক্ষার জন্য টোকেনটি কখনো পাবলিকভাবে শেয়ার করবেন না।"),

  // === অধ্যায় ৩ ===
  h1("অধ্যায় ৩: মেটা ডেভেলপার সেটআপ"),

  h2("ধাপ ১: মেটা ডেভেলপার অ্যাকাউন্ট তৈরি"),
  bi("১. developers.facebook.com এ যান এবং আপনার ফেসবুক অ্যাকাউন্ট দিয়ে লগইন করুন"),
  bi("২. ড্যাশবোর্ড থেকে \"My Apps\" এ ক্লিক করে \"Create App\" নির্বাচন করুন"),
  bi("৩. অ্যাপ টাইপ \"Business\" সিলেক্ট করুন এবং অ্যাপের নাম দিন"),
  bi("৪. Security Check সম্পূর্ণ করুন"),

  h2("ধাপ ২: প্রোডাক্ট যোগ করা"),
  bd("অ্যাপ তৈরির পর বাম পাশে নিচের প্রোডাক্টগুলো যোগ করুন:"),
  bl("Pages \u2014 পেজ ম্যানেজমেন্ট ও পোস্টিং"),
  bl("Messenger \u2014 মেসেঞ্জার চ্যাটবোট"),
  bl("Marketing API \u2014 অটোমেটেড মার্কেটিং"),

  h2("ধাপ ৩: পারমিশন ও টোকেন"),
  bd("প্রোডাক্ট যোগ করার পর App Review পেজ থেকে প্রয়োজনীয় পারমিশনগুলো রিকোয়েস্ট করুন। পেজের ডেটা পড়তে, মেসেজ পাঠাতে, এবং কমেন্ট মডারেট করতে যে পারমিশনগুলো লাগে সেগুলো সক্রিয় করুন।"),

  h2("ধাপ ৪: পেজ অ্যাক্সেস টোকেন তৈরি"),
  bi("১. Graph API Explorer এ যান (developers.facebook.com/tools/explorer/)"),
  bi("২. ড্রপডাউন মেনু থেকে আপনার পেজ সিলেক্ট করুন"),
  bi("৩. User Token থেকে Page Token এ রূপান্তর করুন"),
  bi("৪. টোকেনটি নিরাপদ জায়গায় সংরক্ষণ করুন"),

  // === অধ্যায় ৪ ===
  h1("অধ্যায় ৪: ফেসবুক পেজ অটোমেশন"),

  h2("পোস্ট স্বয়ংক্রিয়ভাবে প্রকাশ"),
  bd("ফেসবুক Graph API ব্যবহার করে পেজে টেক্সট, ছবি, ভিডিও, এবং লিঙ্ক পোস্ট করা যায়। নিচে একটি সহজ API কলের উদাহরণ দেওয়া হলো:"),
  cb("POST /{page-id}/feed"),
  cb('Message: { message: "Your post text", link: "https://..." }'),
  bd("এগুলি ব্যবহার করে আপনি আপনার পেজে যেকোনো কন্টেন্ট পোস্ট করতে পারবেন। টেক্সট পোস্ট, ছবি সহ পোস্ট, লিঙ্ক শেয়ার পোস্ট\u2014 সব কিছই API দিয়ে সম্ভব। এছাড়াও Facebook Business Suite ব্যবহার করে শেডিউল পোস্ট করা যায়, যেখানে আপনি আগে থেকে পোস্ট শেডিউল করতে পারবেন।"),

  h2("শেডিউল পোস্টিং"),
  bd("প্রতিদিন নির্দিষ্ট সময়ে পোস্ট করা অটোমেশনের সবচেয়ে জনপ্রিয় দিক। আপনি Python এর schedule লাইব্রেরি, Cron Job, বা GitHub Actions ব্যবহার করে পোস্ট শেডিউল করতে পারবেন। যেমন: প্রতি সকাল ১০ টায় একটি মোটিভেশনাল পোস্ট করা, বা প্রতি শুক্রবার টিপস পোস্ট করা। এটা করলে আপনার ফলোয়ার ধীরে ধীরে বৃদ্ধি পাবে।"),

  h2("কমেন্ট মডারেশন"),
  bd("কমেন্টে স্বয়ংক্রিয়ভাবে রিপ্লাই দেওয়া কাস্টমার সার্ভিসের জন্য জরুরি। আপনি Graph API দিয়ে কমেন্টগুলো পড়তে পারবেন এবং স্বয়ংক্রিয়ভাবে রিপ্লাই করতে পারবেন। যেমন: যদি কেউ লিখে \"Good service!\" তাহলে অটো রিপ্লাই হবে \"ধন্যবাদ! আমরা কৃতজ্ঞ যে আপনার ভালো অভিজ্ঞতা হয়েছে।\" কিংবা কোনো নেগেটিভ কমেন্ট থাকলে অটো মেসেজ পাঠিয়ে সাপোর্টে রেফার করা যায়।"),

  // === অধ্যায় ৫ ===
  h1("অধ্যায় ৫: মেসেঞ্জার অটোমেশন"),

  h2("ওয়েবহুক সেটআপ"),
  bd("মেসেঞ্জার বট সেটআপ করার জন্য প্রথমে একটি ওয়েবহুক লাগবে। এটি এমন একটি URL যেখানে Facebook মেসেজ ইভেন্টগুলো পাঠাবে এবং আপনার সার্ভার সেই ইভেন্ট প্রসেস করে রিপ্লাই পাঠিয়ে দেবে। ওয়েবহুক সেটআপের জন্য আপনার সার্ভারকে ইন্টারনেট থেকে অ্যাক্সেসযোগ্য হতে হবে, এবং SSL সার্টিফিকেট (HTTPS) সহ হোস্টিং লাগতে হবে।"),
  bi("১. Heroku, Render, Vercel, বা Railway এ একটি ফ্রি সার্ভার ডিপ্লয় করুন"),
  bi("২. Express.js বা Flask দিয়ে একটি webhook endpoint তৈরি করুন"),
  bi("৩. Meta ডেভেলপার ড্যাশবোর্ড থেকে webhook URL যোগ করুন"),
  bi("৪. Verify Token সেটআপ করুন এবং webhook সাবস্ক্রিপশন সম্পূর্ণ করুন"),

  h2("অটো-রিপ্লাই সিস্টেম"),
  bd("মেসেঞ্জার বটের মূল কাজ হলো অটো-রিপ্লাই। কোনো কাস্টমার মেসেজ পাঠালে ফেসবুক একটি ইভেন্ট পাঠায়, আপনার সার্ভার সেই ইভেন্ট প্রসেস করে, রিপ্লাই মেসেজ তৈরি করে, এবং Facebook API দিয়ে সেটা পাঠায়। সাধারণ অটো-রিপ্লাই সিস্টেমে থাকে কিছু প্রিডিফাইন্ড রেসপন্স, যেমন ধন্যবাদ জানানো, বিজনেস আওয়ার বলা, বা কাস্টমারকে সাপোর্ট টিমে রেফার করা।"),
  bd("অটো-রিপ্লাই সিস্টেম তৈরির জন্য নিচের কোডগুলো লিখতে হবে: webhook endpoint, message receiver, response generator, এবং message sender। এছাড়াও আপনি AI ব্যবহার করে স্মার্ট চ্যাটবোট তৈরি করতে পারবেন, যেখানে কাস্টমারের প্রশ্ন বুঝতে পারবে এবং সঠিক উত্তর দেওয়া যাবে।"),

  h2("মেনু-ভিত্তিক অটোমেশন"),
  bd("মেনু-ভিত্তিক অটোমেশন হলো কাস্টমারদের থেকে কিছু কমান্ড পাঠিয়ে সেগুলো স্বয়ংক্রিয়ভাবে প্রসেস করা। যেমন: কাস্টমার \"১\" লিখে প্রাইস লিস্ট পেতে চাইলে, \"মেনু\" লিখে সেবার তালিকা দেখতে পাবে, আর \"হ্যালো\" লিখে সাপোর্টে কথা পাবে। মেনু সেটআপের জন্য অবশ্যই একটি ডিফল্ট রিপ্লাই সেট করতে হবে, যাতে কাস্টমার কোনো কমান্ড না দিলেও রিপ্লাই পায়।"),

  // === অধ্যায় ৬ ===
  h1("অধ্যায় ৬: কোডিং ছাড়া \u2014 নো-কোড টুলস"),

  bd("প্রোগ্রামিং জ্ঞান না থাকলেও অনেক নো-কোড টুল ব্যবহার করে সহজেই ফেসবুক অটোমেশন সেটআপ করা যায়। এগুলো সম্পূর্ণ ফ্রি এবং ব্যবহার করতে সহজ, তবে কাস্টমাইজ অপশন কম থাকে।"),

  h2("ManyChat"),
  bd("ManyChat হলো সবচেয়ে জনপ্রিয় Facebook Messenger অটোমেশন টুল। এটি ড্র্যাগ-অ্যান্ড-ড্রপ ইন্টারফেস প্রদান করে, যেখানে আপনি ভিজুয়ালি ফ্লো তৈরি করে অটো-রিপ্লাই সিস্টেম বানাতে পারবেন। ManyChat এর ফ্রি প্ল্যানে ১০০০ কন্ট্যাক্ট পর্যন্ত সুবিধা পাবেন। এটি বিজনেস মালিকদের জন্য সবচেয়ে উপযোগী।"),

  h2("Chatfuel"),
  bd("Chatfuel আরও একটি জনপ্রিয় মেসেঞ্জার বট বিল্ডার। এটি AI-চালিত চ্যাটবোট সুবিধা প্রদান করে, যার মাধ্যমে কাস্টমারের প্রশ্ন বুঝে উত্তর দেয়। এছাড়াও এটি ই-কমার্স, CRM, এবং Google Sheets এর সাথে ইন্টিগ্রেশন সাপোর্ট করে। কার্যক্ষমতার বিচারে বিজনেসের জন্য Chatfuel একটি চমৎকার পছন্দ।"),

  h2("Facebook Business Suite"),
  bd("Facebook নিজেই একটি ফ্রি টুল প্রদান করে যার নাম Facebook Business Suite। এটি দিয়ে আপনি আপনার পেজ ও মেসেঞ্জার এক জায়গা থেকে ম্যানেজ করতে পারবেন, শেডিউল পোস্ট করতে পারবেন, ইনসাইট দেখতে পারবেন, এবং কমেন্টগুলো পড়তে পারবেন। এটা কোনো টেকনিকাল জ্ঞানের প্রয়োজন ছাড়াই সরাসরি ড্যাশবোর্ড থেকে ব্যবহার করা যায়।"),

  // === অধ্যায় ৭ ===
  h1("অধ্যায় ৭: কোড দিয়ে অটোমেশন \u2014 Python"),

  bd("Python এর facebook-business SDK ব্যবহার করে ফেসবুক API এর সব ফিচার অ্যাক্সেস করা যায়। প্রথমে SDK ইনস্টল করুন:"),
  cb("pip install facebook-business"),
  bd("এরপর একটি সহজ কোডের উদাহরণ:"),
  cb("from facebook_business.adobjects import Page"),
  cb("from facebook_business.api import FacebookAdsApi"),
  cb(""),
  cb("FacebookAdsApi.init(access_token='YOUR_PAGE_TOKEN')"),
  cb("page = Page('YOUR_PAGE_ID')"),
  cb("page.feed.post(message='স্বাগতম!')"),
  bd("এছাড়াও আপনি Python এর requests লাইব্রেরি ব্যবহার করে সরাসরি API কল করতে পারবেন। এটা অনেক বেশি কাস্টমাইজেবল এবং ফ্রি হোস্টিংয়ে রাখতে পারবেন। Node.js, PHP, এবং Go দিয়েও Facebook Graph API ব্যবহার করা যায়।"),

  // === অধ্যায় ৮ ===
  h1("অধ্যায় ৮: Diana AI দিয়ে অটোমেশন"),

  h2("Diana কী কী করতে পারে"),
  bd("Diana AI একটি AI অ্যাসিস্ট্যান্ট যে আপনার হয়ে ফেসবুক পেজ অটোমেশন সেটআপ করতে পারে। আপনার প্রোগ্রামিং জ্ঞান না থাকলেও, Diana সম্পূর্ণ সিস্টেম বানাতে পারে। Diana নিচের কাজগুলো করতে পারে:"),
  bl("মেটা ডেভেলপার অ্যাকাউন্ট সেটআপ করা"),
  bl("ওয়েবহুক সেটআপ করা"),
  bl("মেসেঞ্জার বট তৈরি করা"),
  bl("অটো-রিপ্লাই সিস্টেম কোড করা"),
  bl("Vercel বা Railway এ ডিপ্লয় করা"),
  bl("Cron Job সেটআপ করে শেডিউল পোস্টিং"),

  h2("Diana কে কী কী দিতে হবে"),
  bd("Diana কে ফেসবুক অটোমেশন করতে চাইলে নিচের তথ্যগুলো প্রদান করুন:"),
  bi("১. ফেসবুক পেজের নাম বা ID"),
  bi("২. মেটা ডেভেলপার অ্যাপ ID"),
  bi("৩. পেজ অ্যাক্সেস টোকেন (৬০ দিনের মেয়াদে)"),
  bi("৪. ওয়েবহুক Verify Token"),
  bi("৫. অটোমেশনের ধরন: কী কী অটোমেট করতে চান"),
  bd("এই তথ্যগুলো Diana কে দিলে কিছু মিনিটে কোড লিখে সম্পূর্ণ অটোমেশন সিস্টেম তৈরি করে দেবে। Discord এ Diana কে মেনশন করে গাইড করে কাজ করতে পারবেন।"),

  // === অধ্যায় ৯ ===
  h1("অধ্যায় ৯: নিরাপত্তা ও পরামর্শ"),

  h2("নিরাপত্তার জন্য কিছু পয়েন্ট"),
  bl("টোকেন কখনো পাবলিকভাবে শেয়ার করবেন না"),
  bl("App Secret সবসময় সার্ভার-সাইড রাখুন, ক্লায়েন্ট-সাইড কখনো না"),
  bl("পারমিশন শুধুমাত্র যা প্রয়োজন ততটুকুই সেট করুন"),
  bl("Rate Limit মেনে রাখুন \u2014 Facebook API তে ২০০ কল/ঘন্টা সীমা"),
  bl("টোকেন রিফ্রেশ ব্যবস্থা রাখুন"),

  h2("ফেসবুক পলিসি মেনে রাখুন"),
  bd("Facebook এর Platform Policy মেনে রাখা জরুরি। কাস্টমারের মেসেজের প্রতি ২৪ ঘন্টার মধ্যে রিপ্লাই দেওয়া বাধ্যতামূলক। স্প্যাম মেসেজ পাঠানো যাবে না। অটো-রিপ্লাইতে সবসময় স্পষ্ট করে জানাতে হবে যে এটি কোনো মেশিন বা বট পাঠাচ্ছে কিনা, এবং কাস্টমার সহজেই মানুষের সাথে কথা বলতে পারবে।"),

  h2("মেসেজিং লিমিট মেনে রাখুন"),
  bd("অটোমেশনের সবচেয়ে গুরুত্বপূর্ণ অংশ হলো মেসেজিং লিমিট সম্মান করা। গড়ে ১৫ মিনিটের মধ্যে রিপ্লাই দিন। রাত ১০ টার পর্যন্ত অটোমেশন সীমিত রাখুন। সবসময় বিজনেস টোন মেইনটেইন করুন, যাতে কোনো সমস্যা হলে দ্রুত ব্যবস্থা নেওয়া যায়।"),

  // === অধ্যায় ১০ ===
  h1("অধ্যায় ১০: শেষ কথা"),

  bd("ফেসবুক পেজ এবং মেসেঞ্জার অটোমেশন আজকের ডিজিটাল মার্কেটিংয়ের জন্য একটি অপরিহার্য অস্ত্র। আপনার কোনো বিজনেস অটোমেট করতে পারবেন, কেবল সঠিক টুল ব্যবহার করতে হবে। আপনার কাছে যেকোনো টুল ব্যবহার করে শুরু করুন এবং ধীরে ধীরে উন্নতি করুন।"),

  bd("এই গাইডে আমরা মেটা ডেভেলপার সেটআপ, Graph API, ওয়েবহুক কনফিগারেশন, মেসেঞ্জার বট, অটো-রিপ্লাই, নো-কোড টুল, Python SDK, এবং Diana AI দিয়ে অটোমেশন সেটআপ সম্পর্কে বিস্তারিত আলোচনা করেছি। যেকোনো প্রশ্ন থাকলে Discord এ Diana কে মেনশন করুন। আমরা সবসময় সাহায্য করতে প্রস্তুত।"),
];

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: { ascii: EF, cs: FNT }, size: 22, color: c(P.body) },
        paragraph: { spacing: { line: 312 } } },
      heading1: { run: { font: { ascii: EF, cs: FNT }, size: 32, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 480, after: 200, line: 312 } } },
      heading2: { run: { font: { ascii: EF, cs: FNT }, size: 26, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } } },
    },
  },
  sections: [
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: coverChildren },
    { properties: { page: { size: { width: 11906, height: 16838 },
        margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } },
      headers: { default: new Header({ children: [
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: "ফেসবুক অটোমেশন গাইড", size: 16, font: { ascii: EF, cs: FNT }, color: P.secondary }) ] }) ] }) },
      footers: { default: new Footer({ children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary }) ] }) ] }) },
      children: bodyChildren },
  ],
});

const OUT = "/home/z/my-project/download/fb-automation-guide-bangla.docx";
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("OK:", OUT); });
