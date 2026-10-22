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
  socialLabel: string; whatsapp: string; postFacebook: string; postX: string; instagram: string; instagramHint: string;
  postText: (to: string) => string;
};

export const TEXT_UI: Record<Lang, TextSendUI> = {
  en: {
    howLabel: "How should we send it?", byEmail: "Email", byText: "Text or social",
    toPhone: "Their mobile number (optional for social)", toPhonePh: "(555) 123-4567", phoneInvalid: "Please enter a valid mobile number.",
    willText: (n) => `Right after payment, you'll text or share the card with ${n} from your phone.`,
    readyTitle: (n) => `Your card for ${n} is ready!`, readyBody: "Tap below to text it. Your Messages app opens with the card link filled in, so just hit send.",
    textIt: (n) => `Text it to ${n}`, shareIt: "Share another way", copyLink: "Copy card link", copied: "Link copied!",
    smsBody: (f, l) => `${f} sent you a Cinegram card 💌 Open it here: ${l}`,
    socialLabel: "Or share it on", whatsapp: "WhatsApp", postFacebook: "Post on Facebook", postX: "Post on X", instagram: "Instagram & more", instagramHint: "Link copied. Paste it in an Instagram message.",
    postText: (t) => `A little something for ${t} 💌`,
  },
  es: {
    howLabel: "¿Cómo la enviamos?", byEmail: "Correo", byText: "Texto o redes",
    toPhone: "Su móvil (opcional para redes)", toPhonePh: "(555) 123-4567", phoneInvalid: "Escribe un número de móvil válido.",
    willText: (n) => `Después del pago, enviarás o compartirás la tarjeta con ${n} desde tu teléfono.`,
    readyTitle: (n) => `¡Tu tarjeta para ${n} está lista!`, readyBody: "Toca abajo para enviarla. Se abrirá Mensajes con el enlace de la tarjeta; solo pulsa enviar.",
    textIt: (n) => `Enviársela a ${n}`, shareIt: "Compartir de otra forma", copyLink: "Copiar enlace", copied: "¡Enlace copiado!",
    smsBody: (f, l) => `${f} te envió una tarjeta de Cinegram 💌 Ábrela aquí: ${l}`,
    socialLabel: "O compártela en", whatsapp: "WhatsApp", postFacebook: "Publicar en Facebook", postX: "Publicar en X", instagram: "Instagram y más", instagramHint: "Enlace copiado. Pégalo en un mensaje de Instagram.",
    postText: (t) => `Un detalle para ${t} 💌`,
  },
  fr: {
    howLabel: "Comment l'envoyer ?", byEmail: "E-mail", byText: "SMS ou réseaux",
    toPhone: "Son portable (facultatif pour les réseaux)", toPhonePh: "06 12 34 56 78", phoneInvalid: "Saisis un numéro de portable valide.",
    willText: (n) => `Juste après le paiement, tu enverras ou partageras la carte avec ${n} depuis ton téléphone.`,
    readyTitle: (n) => `Ta carte pour ${n} est prête !`, readyBody: "Touche ci-dessous pour l'envoyer. Messages s'ouvre avec le lien de la carte : il suffit d'appuyer sur envoyer.",
    textIt: (n) => `L'envoyer à ${n}`, shareIt: "Partager autrement", copyLink: "Copier le lien", copied: "Lien copié !",
    smsBody: (f, l) => `${f} t'a envoyé une carte Cinegram 💌 Ouvre-la ici : ${l}`,
    socialLabel: "Ou partage-la sur", whatsapp: "WhatsApp", postFacebook: "Publier sur Facebook", postX: "Publier sur X", instagram: "Instagram et plus", instagramHint: "Lien copié. Colle-le dans un message Instagram.",
    postText: (t) => `Une petite attention pour ${t} 💌`,
  },
  pt: {
    howLabel: "Como queres enviar?", byEmail: "E-mail", byText: "Mensagem ou redes",
    toPhone: "O telemóvel (opcional para redes)", toPhonePh: "912 345 678", phoneInvalid: "Escreve um número de telemóvel válido.",
    willText: (n) => `Logo após o pagamento, envias ou partilhas o cartão com ${n} a partir do teu telemóvel.`,
    readyTitle: (n) => `O teu cartão para ${n} está pronto!`, readyBody: "Toca abaixo para o enviar. As Mensagens abrem com o link do cartão; é só carregar em enviar.",
    textIt: (n) => `Enviar a ${n}`, shareIt: "Partilhar de outra forma", copyLink: "Copiar link", copied: "Link copiado!",
    smsBody: (f, l) => `${f} enviou-te um cartão Cinegram 💌 Abre aqui: ${l}`,
    socialLabel: "Ou partilha no", whatsapp: "WhatsApp", postFacebook: "Publicar no Facebook", postX: "Publicar no X", instagram: "Instagram e mais", instagramHint: "Link copiado. Cola-o numa mensagem do Instagram.",
    postText: (t) => `Uma lembrança para ${t} 💌`,
  },
  zh: {
    howLabel: "怎么发送？", byEmail: "邮件", byText: "短信或社交平台",
    toPhone: "对方的手机号（分享到社交平台可不填）", toPhonePh: "138 0000 0000", phoneInvalid: "请输入有效的手机号。",
    willText: (n) => `付款后，你可以用自己的手机把贺卡发短信或分享给${n}。`,
    readyTitle: (n) => `给${n}的贺卡准备好了！`, readyBody: "点击下方按钮，短信应用会自动填好贺卡链接，按发送即可。",
    textIt: (n) => `发短信给${n}`, shareIt: "用其他方式分享", copyLink: "复制贺卡链接", copied: "链接已复制！",
    smsBody: (f, l) => `${f} 给你寄了一张 Cinegram 贺卡 💌 点这里打开：${l}`,
    socialLabel: "或分享到", whatsapp: "WhatsApp", postFacebook: "发到 Facebook", postX: "发到 X", instagram: "Instagram 等", instagramHint: "链接已复制，可粘贴到 Instagram 私信。",
    postText: (t) => `送给${t}的一份心意 💌`,
  },
  yue: {
    howLabel: "點樣寄？", byEmail: "電郵", byText: "短訊或社交平台",
    toPhone: "對方手機號碼（分享到社交平台可以唔填）", toPhonePh: "9123 4567", phoneInvalid: "請輸入有效嘅手機號碼。",
    willText: (n) => `俾錢之後，你可以用自己部手機將賀卡短訊或者分享俾${n}。`,
    readyTitle: (n) => `寄俾${n}嘅賀卡準備好喇！`, readyBody: "撳下面個掣，短訊程式會自動填好賀卡連結，撳傳送就得。",
    textIt: (n) => `短訊寄俾${n}`, shareIt: "用其他方法分享", copyLink: "複製賀卡連結", copied: "已複製連結！",
    smsBody: (f, l) => `${f} 寄咗張 Cinegram 賀卡俾你 💌 喺呢度打開：${l}`,
    socialLabel: "或者分享到", whatsapp: "WhatsApp", postFacebook: "貼上 Facebook", postX: "貼上 X", instagram: "Instagram 等", instagramHint: "已複製連結，可以貼落 Instagram 訊息。",
    postText: (t) => `送俾${t}嘅小心意 💌`,
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

/** Share links for social apps. Facebook and X posts are public; WhatsApp goes to a chat the sender picks. */
export const shareLinks = {
  whatsapp: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  facebook: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  x: (text: string, url: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
};
