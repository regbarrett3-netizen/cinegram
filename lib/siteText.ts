// Text for the site header, the 1-2-3 send flow and the recipient page, in six languages.
import type { Lang } from "./i18n";

export type SiteText = {
  nav: { send: string; browse: string; action: string; video: string };
  heroTitle: string; heroSub: string;
  steps: [string, string, string];
  s1Title: string;
  s2Title: string; toName: string; toNamePh: string; toEmail: string; toEmailPh: string; fromName: string; fromNamePh: string;
  next: string; back: string; change: string;
  s3Title: (name: string) => string;
  actionTitle: string; actionSub: string; artTitle: string; artSub: string; videoTitle: string; videoSub: string; videoCta: string;
  personalize: string; addPhoto: string; changePhoto: string; removePhoto: string; uploading: string;
  pay: (price: string, name: string) => string; willEmail: (email: string) => string; previewNote: string;
  checking: string; sending: string; sentTitle: (name: string) => string; sentBody: (email: string) => string;
  viewCard: string; another: string; notSent: string; retry: string; cancelled: string;
  emailInvalid: string; namesNeeded: string; error: string; secure: string;
  // recipient page
  rFrom: (name: string) => string; rTap: string; rDownload: string; rSound: string; rMake: string; rSaving: string;
  // AI video page
  vSendTo: (name: string) => string; vSent: (email: string) => string; vEmailLabel: string;
};

export const SITE: Record<Lang, SiteText> = {
  en: {
    nav: { send: "Send a card", browse: "Browse", action: "Action cards", video: "AI video" },
    heroTitle: "A beautiful card, sent in 1-2-3", heroSub: "Original art, animated cards with music, or a video in your own voice, emailed for you.",
    steps: ["Occasion", "Who it's for", "Choose a card"],
    s1Title: "What's the occasion?",
    s2Title: "Who's it for?", toName: "Their name", toNamePh: "e.g. Maria", toEmail: "Their email", toEmailPh: "name@example.com", fromName: "Your name", fromNamePh: "So they know it's from you",
    next: "Next", back: "Back", change: "Change",
    s3Title: (n) => `Pick a card for ${n}`,
    actionTitle: "Action cards", actionSub: "Animated, with original music · $2.99", artTitle: "Art cards", artSub: "Original illustrations · $1.99", videoTitle: "AI video card", videoSub: "Your face and voice say the message · $2.99", videoCta: "Make a video card",
    personalize: "Make it yours", addPhoto: "Add a photo (optional)", changePhoto: "Change photo", removePhoto: "Remove photo", uploading: "Adding your photo…",
    pay: (p, n) => `Pay ${p} & send to ${n}`, willEmail: (e) => `We'll email it to ${e} right after payment.`, previewNote: "Preview. The watermark is removed on the card they receive.",
    checking: "Confirming your payment…", sending: "Sending your card…", sentTitle: (n) => `Sent to ${n}!`, sentBody: (e) => `Your card is on its way to ${e}.`,
    viewCard: "See the card they'll get", another: "Send another card", notSent: "Your payment went through, but the email didn't send.", retry: "Try sending again", cancelled: "Checkout was cancelled. Your card is still here.",
    emailInvalid: "Please enter a valid email address.", namesNeeded: "Please add both names.", error: "Something went wrong. Please try again.", secure: "Secure checkout by Stripe",
    rFrom: (n) => `${n} sent you a card`, rTap: "Tap to open", rDownload: "Save to your phone", rSound: "Sound on", rMake: "Send a card back", rSaving: "Preparing…",
    vSendTo: (n) => `Email it to ${n}`, vSent: (e) => `Sent to ${e}!`, vEmailLabel: "Their email",
  },
  es: {
    nav: { send: "Enviar tarjeta", browse: "Explorar", action: "Tarjetas en acción", video: "Video IA" },
    heroTitle: "Una tarjeta preciosa, en 1-2-3", heroSub: "Arte original, tarjetas animadas con música o un video con tu propia voz, enviados por correo.",
    steps: ["Ocasión", "Para quién", "Elige tarjeta"],
    s1Title: "¿Cuál es la ocasión?",
    s2Title: "¿Para quién es?", toName: "Su nombre", toNamePh: "p. ej. María", toEmail: "Su correo", toEmailPh: "nombre@ejemplo.com", fromName: "Tu nombre", fromNamePh: "Para que sepa que es tuya",
    next: "Siguiente", back: "Atrás", change: "Cambiar",
    s3Title: (n) => `Elige una tarjeta para ${n}`,
    actionTitle: "Tarjetas en acción", actionSub: "Animadas, con música original · 2,99 US$", artTitle: "Tarjetas ilustradas", artSub: "Ilustraciones originales · 1,99 US$", videoTitle: "Videotarjeta con IA", videoSub: "Tu cara y tu voz dicen el mensaje · 2,99 US$", videoCta: "Crear videotarjeta",
    personalize: "Hazla tuya", addPhoto: "Añade una foto (opcional)", changePhoto: "Cambiar foto", removePhoto: "Quitar foto", uploading: "Añadiendo tu foto…",
    pay: (p, n) => `Pagar ${p} y enviar a ${n}`, willEmail: (e) => `La enviaremos a ${e} justo después del pago.`, previewNote: "Vista previa. La tarjeta que reciba no tendrá marca de agua.",
    checking: "Confirmando tu pago…", sending: "Enviando tu tarjeta…", sentTitle: (n) => `¡Enviada a ${n}!`, sentBody: (e) => `Tu tarjeta va de camino a ${e}.`,
    viewCard: "Ver la tarjeta que recibirá", another: "Enviar otra tarjeta", notSent: "El pago se completó, pero el correo no se envió.", retry: "Intentar enviar de nuevo", cancelled: "Se canceló el pago. Tu tarjeta sigue aquí.",
    emailInvalid: "Escribe un correo válido.", namesNeeded: "Añade ambos nombres.", error: "Algo salió mal. Inténtalo de nuevo.", secure: "Pago seguro con Stripe",
    rFrom: (n) => `${n} te envió una tarjeta`, rTap: "Toca para abrir", rDownload: "Guardar en tu teléfono", rSound: "Activar sonido", rMake: "Enviar una tarjeta de vuelta", rSaving: "Preparando…",
    vSendTo: (n) => `Enviarla a ${n}`, vSent: (e) => `¡Enviada a ${e}!`, vEmailLabel: "Su correo",
  },
  fr: {
    nav: { send: "Envoyer", browse: "Parcourir", action: "Cartes animées", video: "Vidéo IA" },
    heroTitle: "Une belle carte, envoyée en 1-2-3", heroSub: "Art original, cartes animées en musique ou vidéo avec ta propre voix, envoyées par e-mail.",
    steps: ["Occasion", "Pour qui", "Choisir"],
    s1Title: "Quelle est l'occasion ?",
    s2Title: "Pour qui est-ce ?", toName: "Son prénom", toNamePh: "ex. Marie", toEmail: "Son e-mail", toEmailPh: "nom@exemple.com", fromName: "Ton prénom", fromNamePh: "Pour qu'on sache que c'est de toi",
    next: "Suivant", back: "Retour", change: "Modifier",
    s3Title: (n) => `Choisis une carte pour ${n}`,
    actionTitle: "Cartes animées", actionSub: "Animées, avec musique originale · 2,99 $ US", artTitle: "Cartes illustrées", artSub: "Illustrations originales · 1,99 $ US", videoTitle: "Carte vidéo IA", videoSub: "Ton visage et ta voix disent le message · 2,99 $ US", videoCta: "Créer une carte vidéo",
    personalize: "Personnalise-la", addPhoto: "Ajoute une photo (facultatif)", changePhoto: "Changer la photo", removePhoto: "Retirer la photo", uploading: "Ajout de ta photo…",
    pay: (p, n) => `Payer ${p} et envoyer à ${n}`, willEmail: (e) => `Nous l'enverrons à ${e} juste après le paiement.`, previewNote: "Aperçu. La carte reçue n'aura pas de filigrane.",
    checking: "Confirmation du paiement…", sending: "Envoi de ta carte…", sentTitle: (n) => `Envoyée à ${n} !`, sentBody: (e) => `Ta carte est en route vers ${e}.`,
    viewCard: "Voir la carte reçue", another: "Envoyer une autre carte", notSent: "Le paiement est passé, mais l'e-mail n'est pas parti.", retry: "Réessayer l'envoi", cancelled: "Paiement annulé. Ta carte est toujours là.",
    emailInvalid: "Saisis une adresse e-mail valide.", namesNeeded: "Ajoute les deux prénoms.", error: "Un problème est survenu. Réessaie.", secure: "Paiement sécurisé par Stripe",
    rFrom: (n) => `${n} t'a envoyé une carte`, rTap: "Touche pour ouvrir", rDownload: "Enregistrer sur ton téléphone", rSound: "Activer le son", rMake: "Envoyer une carte en retour", rSaving: "Préparation…",
    vSendTo: (n) => `L'envoyer à ${n}`, vSent: (e) => `Envoyée à ${e} !`, vEmailLabel: "Son e-mail",
  },
  pt: {
    nav: { send: "Enviar cartão", browse: "Explorar", action: "Cartões animados", video: "Vídeo IA" },
    heroTitle: "Um cartão lindo, enviado em 1-2-3", heroSub: "Arte original, cartões animados com música ou um vídeo com a tua própria voz, enviados por e-mail.",
    steps: ["Ocasião", "Para quem", "Escolher"],
    s1Title: "Qual é a ocasião?",
    s2Title: "Para quem é?", toName: "O nome", toNamePh: "ex. Maria", toEmail: "O e-mail", toEmailPh: "nome@exemplo.com", fromName: "O teu nome", fromNamePh: "Para saber que é teu",
    next: "Seguinte", back: "Voltar", change: "Alterar",
    s3Title: (n) => `Escolhe um cartão para ${n}`,
    actionTitle: "Cartões animados", actionSub: "Animados, com música original · 2,99 USD", artTitle: "Cartões ilustrados", artSub: "Ilustrações originais · 1,99 USD", videoTitle: "Cartão em vídeo IA", videoSub: "O teu rosto e a tua voz dizem a mensagem · 2,99 USD", videoCta: "Criar cartão em vídeo",
    personalize: "Torna-o teu", addPhoto: "Adiciona uma foto (opcional)", changePhoto: "Mudar foto", removePhoto: "Remover foto", uploading: "A adicionar a tua foto…",
    pay: (p, n) => `Pagar ${p} e enviar a ${n}`, willEmail: (e) => `Vamos enviá-lo para ${e} logo após o pagamento.`, previewNote: "Pré-visualização. O cartão recebido não terá marca de água.",
    checking: "A confirmar o pagamento…", sending: "A enviar o teu cartão…", sentTitle: (n) => `Enviado a ${n}!`, sentBody: (e) => `O teu cartão vai a caminho de ${e}.`,
    viewCard: "Ver o cartão que vai receber", another: "Enviar outro cartão", notSent: "O pagamento foi feito, mas o e-mail não foi enviado.", retry: "Tentar enviar de novo", cancelled: "O pagamento foi cancelado. O teu cartão continua aqui.",
    emailInvalid: "Escreve um e-mail válido.", namesNeeded: "Adiciona os dois nomes.", error: "Algo correu mal. Tenta outra vez.", secure: "Pagamento seguro com Stripe",
    rFrom: (n) => `${n} enviou-te um cartão`, rTap: "Toca para abrir", rDownload: "Guardar no telemóvel", rSound: "Ligar o som", rMake: "Enviar um cartão de volta", rSaving: "A preparar…",
    vSendTo: (n) => `Enviar a ${n}`, vSent: (e) => `Enviado para ${e}!`, vEmailLabel: "O e-mail",
  },
  zh: {
    nav: { send: "寄贺卡", browse: "浏览", action: "动态贺卡", video: "AI 视频" },
    heroTitle: "三步寄出一张美丽的贺卡", heroSub: "原创插画、配乐动态贺卡，或用你自己声音的视频，我们替你用邮件寄出。",
    steps: ["场合", "送给谁", "选贺卡"],
    s1Title: "是什么场合？",
    s2Title: "送给谁？", toName: "对方的名字", toNamePh: "例如：小雅", toEmail: "对方的邮箱", toEmailPh: "name@example.com", fromName: "你的名字", fromNamePh: "让对方知道是你寄的",
    next: "下一步", back: "返回", change: "更改",
    s3Title: (n) => `为${n}选一张贺卡`,
    actionTitle: "动态贺卡", actionSub: "会动，配原创音乐 · 2.99 美元", artTitle: "插画贺卡", artSub: "原创插画 · 1.99 美元", videoTitle: "AI 视频贺卡", videoSub: "用你的脸和声音说出祝福 · 2.99 美元", videoCta: "制作视频贺卡",
    personalize: "加点心意", addPhoto: "添加一张照片（可选）", changePhoto: "更换照片", removePhoto: "移除照片", uploading: "正在添加照片……",
    pay: (p, n) => `支付 ${p} 并寄给${n}`, willEmail: (e) => `付款后我们会立即寄到 ${e}。`, previewNote: "这是预览，对方收到的贺卡没有水印。",
    checking: "正在确认付款……", sending: "正在寄出贺卡……", sentTitle: (n) => `已寄给${n}！`, sentBody: (e) => `你的贺卡正在寄往 ${e}。`,
    viewCard: "看看对方收到的贺卡", another: "再寄一张", notSent: "付款已成功，但邮件没有寄出。", retry: "重新寄送", cancelled: "付款已取消，你的贺卡还在这里。",
    emailInvalid: "请输入有效的邮箱地址。", namesNeeded: "请填写双方的名字。", error: "出了点问题，请重试。", secure: "Stripe 安全支付",
    rFrom: (n) => `${n}给你寄了一张贺卡`, rTap: "点击打开", rDownload: "保存到手机", rSound: "打开声音", rMake: "回寄一张贺卡", rSaving: "准备中……",
    vSendTo: (n) => `用邮件寄给${n}`, vSent: (e) => `已寄到 ${e}！`, vEmailLabel: "对方的邮箱",
  },
  yue: {
    nav: { send: "寄賀卡", browse: "瀏覽", action: "動態賀卡", video: "AI 影片" },
    heroTitle: "三步寄出一張靚賀卡", heroSub: "原創插畫、有音樂嘅動態賀卡，或者用你把聲嘅影片，我哋幫你用電郵寄出。",
    steps: ["場合", "送俾邊個", "揀賀卡"],
    s1Title: "係咩場合？",
    s2Title: "送俾邊個？", toName: "對方個名", toNamePh: "例如：阿詩", toEmail: "對方電郵", toEmailPh: "name@example.com", fromName: "你個名", fromNamePh: "等對方知道係你寄嘅",
    next: "下一步", back: "返回", change: "更改",
    s3Title: (n) => `幫${n}揀張賀卡`,
    actionTitle: "動態賀卡", actionSub: "識郁，配原創音樂 · 2.99 美元", artTitle: "插畫賀卡", artSub: "原創插畫 · 1.99 美元", videoTitle: "AI 影片賀卡", videoSub: "用你嘅樣同聲講出祝福 · 2.99 美元", videoCta: "整影片賀卡",
    personalize: "加啲心意", addPhoto: "加張相（可選）", changePhoto: "換相", removePhoto: "移除相", uploading: "加緊你張相……",
    pay: (p, n) => `付 ${p} 寄俾${n}`, willEmail: (e) => `付款後我哋會即刻寄去 ${e}。`, previewNote: "呢個係預覽，對方收到嘅賀卡冇水印。",
    checking: "確認緊付款……", sending: "寄緊你張賀卡……", sentTitle: (n) => `已經寄咗俾${n}！`, sentBody: (e) => `你張賀卡寄緊去 ${e}。`,
    viewCard: "睇吓對方收到嘅賀卡", another: "再寄一張", notSent: "付款成功，但電郵寄唔出。", retry: "再寄一次", cancelled: "付款取消咗，你張賀卡仲喺度。",
    emailInvalid: "請輸入有效嘅電郵。", namesNeeded: "請填埋雙方個名。", error: "出咗啲問題，請再試。", secure: "Stripe 安全付款",
    rFrom: (n) => `${n}寄咗張賀卡俾你`, rTap: "撳一下打開", rDownload: "儲存落手機", rSound: "開聲", rMake: "回寄一張賀卡", rSaving: "準備緊……",
    vSendTo: (n) => `用電郵寄俾${n}`, vSent: (e) => `已寄去 ${e}！`, vEmailLabel: "對方電郵",
  },
};
