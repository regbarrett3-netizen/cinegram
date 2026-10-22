// Text for sending a card by text message (safe for browser and server), in six languages.
// The sender's own phone sends the text, so there is no SMS service or per-message cost.
import type { Lang } from "./i18n";

export type DeliverBy = "email" | "text";

export type TextSendUI = {
  howLabel: string; byEmail: string; byText: string;
  toPhone: string; toPhonePh: string; phoneInvalid: string;
  willText: (name: string) => string;
  readyTitle: (name: string) => string; readyBody: string;
  textIt: (name: string) => string; shareIt: string; copyLink: string; copied: string;
  smsBody: (from: string, link: string) => string;
};

export const TEXT_UI: Record<Lang, TextSendUI> = {
  en: {
    howLabel: "How should we send it?", byEmail: "Email", byText: "Text message",
    toPhone: "Their mobile number", toPhonePh: "(555) 123-4567", phoneInvalid: "Please enter a valid mobile number.",
    willText: (n) => `Right after payment, you'll text the card to ${n} from your phone.`,
    readyTitle: (n) => `Your card for ${n} is ready!`, readyBody: "Tap below to text it. Your Messages app opens with the card link filled in, so just hit send.",
    textIt: (n) => `Text it to ${n}`, shareIt: "Share another way", copyLink: "Copy card link", copied: "Link copied!",
    smsBody: (f, l) => `${f} sent you a Cinegram card 💌 Open it here: ${l}`,
  },
  es: {
    howLabel: "¿Cómo la enviamos?", byEmail: "Correo", byText: "Mensaje de texto",
    toPhone: "Su número de móvil", toPhonePh: "(555) 123-4567", phoneInvalid: "Escribe un número de móvil válido.",
    willText: (n) => `Después del pago, enviarás la tarjeta a ${n} por mensaje desde tu teléfono.`,
    readyTitle: (n) => `¡Tu tarjeta para ${n} está lista!`, readyBody: "Toca abajo para enviarla. Se abrirá Mensajes con el enlace de la tarjeta; solo pulsa enviar.",
    textIt: (n) => `Enviársela a ${n}`, shareIt: "Compartir de otra forma", copyLink: "Copiar enlace", copied: "¡Enlace copiado!",
    smsBody: (f, l) => `${f} te envió una tarjeta de Cinegram 💌 Ábrela aquí: ${l}`,
  },
  fr: {
    howLabel: "Comment l'envoyer ?", byEmail: "E-mail", byText: "SMS",
    toPhone: "Son numéro de portable", toPhonePh: "06 12 34 56 78", phoneInvalid: "Saisis un numéro de portable valide.",
    willText: (n) => `Juste après le paiement, tu enverras la carte à ${n} par SMS depuis ton téléphone.`,
    readyTitle: (n) => `Ta carte pour ${n} est prête !`, readyBody: "Touche ci-dessous pour l'envoyer. Messages s'ouvre avec le lien de la carte : il suffit d'appuyer sur envoyer.",
    textIt: (n) => `L'envoyer à ${n}`, shareIt: "Partager autrement", copyLink: "Copier le lien", copied: "Lien copié !",
    smsBody: (f, l) => `${f} t'a envoyé une carte Cinegram 💌 Ouvre-la ici : ${l}`,
  },
  pt: {
    howLabel: "Como queres enviar?", byEmail: "E-mail", byText: "Mensagem (SMS)",
    toPhone: "O número de telemóvel", toPhonePh: "912 345 678", phoneInvalid: "Escreve um número de telemóvel válido.",
    willText: (n) => `Logo após o pagamento, envias o cartão a ${n} por mensagem a partir do teu telemóvel.`,
    readyTitle: (n) => `O teu cartão para ${n} está pronto!`, readyBody: "Toca abaixo para o enviar. As Mensagens abrem com o link do cartão; é só carregar em enviar.",
    textIt: (n) => `Enviar a ${n}`, shareIt: "Partilhar de outra forma", copyLink: "Copiar link", copied: "Link copiado!",
    smsBody: (f, l) => `${f} enviou-te um cartão Cinegram 💌 Abre aqui: ${l}`,
  },
  zh: {
    howLabel: "怎么发送？", byEmail: "邮件", byText: "短信",
    toPhone: "对方的手机号", toPhonePh: "138 0000 0000", phoneInvalid: "请输入有效的手机号。",
    willText: (n) => `付款后，你可以直接用自己的手机把贺卡短信发给${n}。`,
    readyTitle: (n) => `给${n}的贺卡准备好了！`, readyBody: "点击下方按钮，短信应用会自动填好贺卡链接，按发送即可。",
    textIt: (n) => `发短信给${n}`, shareIt: "用其他方式分享", copyLink: "复制贺卡链接", copied: "链接已复制！",
    smsBody: (f, l) => `${f} 给你寄了一张 Cinegram 贺卡 💌 点这里打开：${l}`,
  },
  yue: {
    howLabel: "點樣寄？", byEmail: "電郵", byText: "短訊",
    toPhone: "對方手機號碼", toPhonePh: "9123 4567", phoneInvalid: "請輸入有效嘅手機號碼。",
    willText: (n) => `俾錢之後，你可以用自己部手機將賀卡短訊寄俾${n}。`,
    readyTitle: (n) => `寄俾${n}嘅賀卡準備好喇！`, readyBody: "撳下面個掣，短訊程式會自動填好賀卡連結，撳傳送就得。",
    textIt: (n) => `短訊寄俾${n}`, shareIt: "用其他方法分享", copyLink: "複製賀卡連結", copied: "已複製連結！",
    smsBody: (f, l) => `${f} 寄咗張 Cinegram 賀卡俾你 💌 喺呢度打開：${l}`,
  },
};

/** Loose phone check: 7–15 digits, allowing spaces, dashes, dots, brackets and a leading +. */
export function isPhone(v: string): boolean {
  if (!/^\+?[\d\s().-]+$/.test(v.trim())) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/** Tidy a phone number for an sms: link (digits, keeping a leading +). */
export function cleanPhone(v: string): string {
  const t = v.trim();
  return (t.startsWith("+") ? "+" : "") + t.replace(/\D/g, "");
}

/** sms: link that opens Messages with the number and text filled in. "?&body=" works on both iPhone and Android. */
export function smsHref(phone: string, body: string): string {
  return `sms:${cleanPhone(phone)}?&body=${encodeURIComponent(body)}`;
}
