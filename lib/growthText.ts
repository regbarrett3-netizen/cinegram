// Text for the Halloween special, replying with a card, and birthday reminders, in six languages.
import type { Lang } from "./i18n";

type G = {
  heroTitle: string;
  heroSub: string;
  heroCta: string;
  halloweenBadge: string;
  halloweenSub: string;
  replyBtn: string;
  replyFreeNote: string;
  replyingTo: (name: string) => string;
  replyHidden: (name: string) => string;
  replyFreeChip: string;
  sendFree: (name: string) => string;
  replySent: (name: string) => string;
  remindTitle: (name: string) => string;
  remindSub: string;
  remindEmail: string;
  remindMonth: string;
  remindDay: string;
  remindBtn: string;
  remindDone: (name: string) => string;
  remindNote: string;
  months: string[];
};

export const GROWTH: Record<Lang, G> = {
  en: {
    heroTitle: "Halloween Card Special: $0.99", heroSub: "A dragon writes your greeting in fire, pumpkins sing, skeletons dance. Animated cards with original music, emailed for you. Until November 2.", heroCta: "Send a Halloween card",
    halloweenBadge: "Halloween special · $0.99", halloweenSub: "Animated, with original music · $0.99 until Nov 2",
    replyBtn: "Reply with a card", replyFreeNote: "Your first reply is free.",
    replyingTo: (n) => `Replying to ${n}`, replyHidden: (n) => `We'll deliver it straight to ${n}. You don't need their email.`,
    replyFreeChip: "Free reply", sendFree: (n) => `Send to ${n} free`, replySent: (n) => `${n} will get your card by email.`,
    remindTitle: (n) => `Never miss ${n}'s birthday`, remindSub: "We'll email you a week before, so there's time to send a card.",
    remindEmail: "Your email", remindMonth: "Month", remindDay: "Day", remindBtn: "Remind me",
    remindDone: (n) => `Done. We'll remind you a week before ${n}'s birthday.`, remindNote: "One email a year. Unsubscribe any time.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  es: {
    heroTitle: "Especial de Halloween: 0,99 US$", heroSub: "Un dragón escribe tu saludo con fuego, las calabazas cantan y los esqueletos bailan. Tarjetas animadas con música original, enviadas por correo. Hasta el 2 de noviembre.", heroCta: "Enviar una tarjeta de Halloween",
    halloweenBadge: "Especial de Halloween · 0,99 US$", halloweenSub: "Animadas, con música original · 0,99 US$ hasta el 2 de nov.",
    replyBtn: "Responder con una tarjeta", replyFreeNote: "Tu primera respuesta es gratis.",
    replyingTo: (n) => `Respondiendo a ${n}`, replyHidden: (n) => `Se la entregamos directamente a ${n}. No necesitas su correo.`,
    replyFreeChip: "Respuesta gratis", sendFree: (n) => `Enviar a ${n} gratis`, replySent: (n) => `${n} recibirá tu tarjeta por correo.`,
    remindTitle: (n) => `No te pierdas el cumpleaños de ${n}`, remindSub: "Te escribiremos una semana antes, para que tengas tiempo de enviar una tarjeta.",
    remindEmail: "Tu correo", remindMonth: "Mes", remindDay: "Día", remindBtn: "Recuérdamelo",
    remindDone: (n) => `Listo. Te avisaremos una semana antes del cumpleaños de ${n}.`, remindNote: "Un correo al año. Puedes darte de baja cuando quieras.",
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  },
  fr: {
    heroTitle: "Spécial Halloween : 0,99 $ US", heroSub: "Un dragon écrit ton message en flammes, les citrouilles chantent, les squelettes dansent. Cartes animées avec musique originale, envoyées par e-mail. Jusqu'au 2 novembre.", heroCta: "Envoyer une carte d'Halloween",
    halloweenBadge: "Spécial Halloween · 0,99 $ US", halloweenSub: "Animées, avec musique originale · 0,99 $ US jusqu'au 2 nov.",
    replyBtn: "Répondre avec une carte", replyFreeNote: "Ta première réponse est gratuite.",
    replyingTo: (n) => `Réponse à ${n}`, replyHidden: (n) => `Nous la livrons directement à ${n}. Pas besoin de son e-mail.`,
    replyFreeChip: "Réponse gratuite", sendFree: (n) => `Envoyer à ${n} gratuitement`, replySent: (n) => `${n} recevra ta carte par e-mail.`,
    remindTitle: (n) => `N'oublie plus l'anniversaire de ${n}`, remindSub: "Nous t'écrirons une semaine avant, pour avoir le temps d'envoyer une carte.",
    remindEmail: "Ton e-mail", remindMonth: "Mois", remindDay: "Jour", remindBtn: "Me le rappeler",
    remindDone: (n) => `C'est noté. Nous te le rappellerons une semaine avant l'anniversaire de ${n}.`, remindNote: "Un e-mail par an. Désinscription à tout moment.",
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  },
  pt: {
    heroTitle: "Especial Halloween: 0,99 USD", heroSub: "Um dragão escreve a tua mensagem com fogo, as abóboras cantam e os esqueletos dançam. Cartões animados com música original, enviados por e-mail. Até 2 de novembro.", heroCta: "Enviar um cartão de Halloween",
    halloweenBadge: "Especial Halloween · 0,99 USD", halloweenSub: "Animados, com música original · 0,99 USD até 2 de nov.",
    replyBtn: "Responder com um cartão", replyFreeNote: "A tua primeira resposta é grátis.",
    replyingTo: (n) => `A responder a ${n}`, replyHidden: (n) => `Entregamo-lo diretamente a ${n}. Não precisas do e-mail.`,
    replyFreeChip: "Resposta grátis", sendFree: (n) => `Enviar a ${n} grátis`, replySent: (n) => `${n} vai receber o teu cartão por e-mail.`,
    remindTitle: (n) => `Nunca te esqueças do aniversário de ${n}`, remindSub: "Enviamos-te um e-mail uma semana antes, para teres tempo de mandar um cartão.",
    remindEmail: "O teu e-mail", remindMonth: "Mês", remindDay: "Dia", remindBtn: "Lembrar-me",
    remindDone: (n) => `Feito. Vamos lembrar-te uma semana antes do aniversário de ${n}.`, remindNote: "Um e-mail por ano. Cancela quando quiseres.",
    months: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  },
  zh: {
    heroTitle: "万圣节贺卡特惠：0.99 美元", heroSub: "巨龙用火焰写出你的祝福，南瓜唱歌，骷髅跳舞。配原创音乐的动态贺卡，我们替你用邮件寄出。11 月 2 日截止。", heroCta: "寄一张万圣节贺卡",
    halloweenBadge: "万圣节特惠 · 0.99 美元", halloweenSub: "会动，配原创音乐 · 11 月 2 日前 0.99 美元",
    replyBtn: "回一张贺卡", replyFreeNote: "第一次回卡免费。",
    replyingTo: (n) => `回复${n}`, replyHidden: (n) => `我们会直接送到${n}手上，你不需要对方的邮箱。`,
    replyFreeChip: "免费回卡", sendFree: (n) => `免费寄给${n}`, replySent: (n) => `${n}会通过邮件收到你的贺卡。`,
    remindTitle: (n) => `别再错过${n}的生日`, remindSub: "我们会提前一周发邮件提醒你，让你有时间寄贺卡。",
    remindEmail: "你的邮箱", remindMonth: "月", remindDay: "日", remindBtn: "提醒我",
    remindDone: (n) => `好了。我们会在${n}生日前一周提醒你。`, remindNote: "每年一封邮件，随时可以退订。",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  },
  yue: {
    heroTitle: "萬聖節賀卡特價：0.99 美元", heroSub: "巨龍用火寫出你嘅祝福，南瓜唱歌，骷髏跳舞。配原創音樂嘅動態賀卡，我哋幫你用電郵寄出。11 月 2 日截止。", heroCta: "寄一張萬聖節賀卡",
    halloweenBadge: "萬聖節特價 · 0.99 美元", halloweenSub: "識郁，配原創音樂 · 11 月 2 日前 0.99 美元",
    replyBtn: "回一張賀卡", replyFreeNote: "第一次回卡免費。",
    replyingTo: (n) => `回覆${n}`, replyHidden: (n) => `我哋會直接送到${n}手上，你唔使知佢個電郵。`,
    replyFreeChip: "免費回卡", sendFree: (n) => `免費寄俾${n}`, replySent: (n) => `${n}會用電郵收到你張賀卡。`,
    remindTitle: (n) => `唔好再錯過${n}生日`, remindSub: "我哋會提早一個禮拜電郵提你，等你有時間寄賀卡。",
    remindEmail: "你嘅電郵", remindMonth: "月", remindDay: "日", remindBtn: "提我",
    remindDone: (n) => `搞掂。我哋會喺${n}生日前一個禮拜提你。`, remindNote: "每年一封電郵，隨時可以退訂。",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  },
};
