// Action Cards: short animated cards sold as a video download ($2.99).
import type { Lang } from "../i18n";

export const ACTION_PRICE_CENTS = 299;

export const ACTION_IDS = [
  "balloons", "roses", "doves", "lanterns", "fireworks", "hearts", "butterflies", "petals",
  "confetti", "champagne", "candles", "shooting", "snow", "sunflowers", "dandelion", "gift",
] as const;
export type ActionId = (typeof ACTION_IDS)[number];
export const isActionId = (x: unknown): x is ActionId => ACTION_IDS.includes(x as ActionId);

/** Moment used for the still thumbnail (seconds). */
export const POSTER_T: Record<ActionId, number> = {
  balloons: 2.6, roses: 5.2, doves: 2.4, lanterns: 5, fireworks: 4.7, hearts: 5, butterflies: 3.2, petals: 6.2,
  confetti: 1.9, champagne: 2, candles: 5, shooting: 6.4, snow: 5, sunflowers: 5.6, dandelion: 3.8, gift: 2.4,
};

type T = { name: string; h: string; m: string };
type L<X> = Record<Lang, X>;

export const ACTION_TEXT: L<Record<ActionId, T>> = {
  en: {
    balloons: { name: "Balloon Release", h: "Let It Fly", m: "Sending a sky full of wishes your way. May every one of them come true." },
    roses: { name: "A Dozen Roses", h: "A Dozen Roses for You", m: "Twelve roses, one for every reason my heart belongs to you." },
    doves: { name: "Dove Release", h: "Peace and Love", m: "May peace, love and gentle blessings fill all your days." },
    lanterns: { name: "Sky Lanterns", h: "Wishes Taking Flight", m: "Every light carries a wish for you. Watch them rise." },
    fireworks: { name: "Fireworks", h: "Let's Celebrate!", m: "You deserve a sky full of fireworks. Congratulations!" },
    hearts: { name: "Floating Hearts", h: "My Heart Is Yours", m: "Every beat, every day, all of it for you." },
    butterflies: { name: "Butterfly Release", h: "Spread Your Wings", m: "May beautiful new beginnings flutter into your life." },
    petals: { name: "Rose Petal Heart", h: "Love in Bloom", m: "Every petal falls into place when I'm with you." },
    confetti: { name: "Confetti Pop", h: "Hooray!", m: "Pop the confetti. This moment is all about you!" },
    champagne: { name: "Champagne Toast", h: "Cheers!", m: "Here's to you, and to every reason we have to celebrate." },
    candles: { name: "Birthday Candles", h: "Make a Wish", m: "Every candle glows just for you. Happy birthday!" },
    shooting: { name: "Wish Upon a Star", h: "Wish Upon a Star", m: "I used my wish on you. May all of yours come true." },
    snow: { name: "First Snow", h: "Warm Winter Wishes", m: "May your home glow bright and your heart stay warm this season." },
    sunflowers: { name: "Sunflowers Bloom", h: "Good Morning, Sunshine", m: "Watching you grow and shine makes every day brighter." },
    dandelion: { name: "Dandelion Wishes", h: "Thinking of You", m: "Every wish I make lately drifts your way." },
    gift: { name: "Surprise Gift", h: "A Surprise for You", m: "Some gifts come in boxes. The best one is you." },
  },
  es: {
    balloons: { name: "Globos al cielo", h: "Que vuele alto", m: "Te envío un cielo lleno de deseos. Que todos se cumplan." },
    roses: { name: "Una docena de rosas", h: "Doce rosas para ti", m: "Doce rosas, una por cada razón por la que mi corazón es tuyo." },
    doves: { name: "Palomas al vuelo", h: "Paz y amor", m: "Que la paz, el amor y las bendiciones llenen todos tus días." },
    lanterns: { name: "Farolillos al cielo", h: "Deseos que vuelan", m: "Cada luz lleva un deseo para ti. Míralos subir." },
    fireworks: { name: "Fuegos artificiales", h: "¡A celebrar!", m: "Te mereces un cielo lleno de fuegos artificiales. ¡Felicidades!" },
    hearts: { name: "Corazones flotantes", h: "Mi corazón es tuyo", m: "Cada latido, cada día, todo para ti." },
    butterflies: { name: "Mariposas libres", h: "Despliega tus alas", m: "Que hermosos comienzos lleguen revoloteando a tu vida." },
    petals: { name: "Corazón de pétalos", h: "Amor en flor", m: "Cada pétalo encuentra su lugar cuando estoy contigo." },
    confetti: { name: "Lluvia de confeti", h: "¡Hurra!", m: "Que vuele el confeti. ¡Este momento es todo tuyo!" },
    champagne: { name: "Brindis con cava", h: "¡Salud!", m: "Por ti, y por todos los motivos que tenemos para celebrar." },
    candles: { name: "Velas de cumpleaños", h: "Pide un deseo", m: "Cada vela brilla solo para ti. ¡Feliz cumpleaños!" },
    shooting: { name: "Estrella fugaz", h: "Pide un deseo a una estrella", m: "Gasté mi deseo en ti. Que todos los tuyos se cumplan." },
    snow: { name: "Primera nevada", h: "Cálidos deseos de invierno", m: "Que tu hogar brille y tu corazón se mantenga cálido esta temporada." },
    sunflowers: { name: "Girasoles en flor", h: "Buenos días, solecito", m: "Verte crecer y brillar hace cada día más luminoso." },
    dandelion: { name: "Deseos al viento", h: "Pienso en ti", m: "Últimamente, cada deseo que pido vuela hacia ti." },
    gift: { name: "Regalo sorpresa", h: "Una sorpresa para ti", m: "Algunos regalos vienen en cajas. El mejor eres tú." },
  },
  fr: {
    balloons: { name: "Lâcher de ballons", h: "Envole-toi", m: "Je t'envoie un ciel rempli de vœux. Que chacun se réalise." },
    roses: { name: "Une douzaine de roses", h: "Douze roses pour toi", m: "Douze roses, une pour chaque raison pour laquelle mon cœur t'appartient." },
    doves: { name: "Envol de colombes", h: "Paix et amour", m: "Que la paix, l'amour et de douces bénédictions remplissent tes jours." },
    lanterns: { name: "Lanternes célestes", h: "Des vœux qui s'envolent", m: "Chaque lumière porte un vœu pour toi. Regarde-les monter." },
    fireworks: { name: "Feu d'artifice", h: "On fête ça !", m: "Tu mérites un ciel rempli de feux d'artifice. Félicitations !" },
    hearts: { name: "Cœurs qui s'envolent", h: "Mon cœur est à toi", m: "Chaque battement, chaque jour, tout est pour toi." },
    butterflies: { name: "Envol de papillons", h: "Déploie tes ailes", m: "Que de beaux nouveaux départs viennent voleter dans ta vie." },
    petals: { name: "Cœur de pétales", h: "L'amour en fleurs", m: "Chaque pétale trouve sa place quand je suis avec toi." },
    confetti: { name: "Pluie de confettis", h: "Hourra !", m: "Lance les confettis. Ce moment est tout pour toi !" },
    champagne: { name: "Toast au champagne", h: "Santé !", m: "À toi, et à toutes les raisons que nous avons de célébrer." },
    candles: { name: "Bougies d'anniversaire", h: "Fais un vœu", m: "Chaque bougie brille rien que pour toi. Joyeux anniversaire !" },
    shooting: { name: "Étoile filante", h: "Fais un vœu", m: "J'ai fait mon vœu pour toi. Que tous les tiens se réalisent." },
    snow: { name: "Première neige", h: "Chaleureux vœux d'hiver", m: "Que ta maison brille et que ton cœur reste au chaud cette saison." },
    sunflowers: { name: "Tournesols en fleurs", h: "Bonjour, rayon de soleil", m: "Te voir grandir et briller rend chaque jour plus lumineux." },
    dandelion: { name: "Vœux de pissenlit", h: "Je pense à toi", m: "Ces temps-ci, chaque vœu que je fais s'envole vers toi." },
    gift: { name: "Cadeau surprise", h: "Une surprise pour toi", m: "Certains cadeaux arrivent dans des boîtes. Le plus beau, c'est toi." },
  },
  pt: {
    balloons: { name: "Largada de balões", h: "Deixa voar", m: "Envio-te um céu cheio de desejos. Que todos se realizem." },
    roses: { name: "Uma dúzia de rosas", h: "Doze rosas para ti", m: "Doze rosas, uma por cada razão pela qual o meu coração é teu." },
    doves: { name: "Largada de pombas", h: "Paz e amor", m: "Que a paz, o amor e as bênçãos encham todos os teus dias." },
    lanterns: { name: "Lanternas no céu", h: "Desejos a voar", m: "Cada luz leva um desejo para ti. Vê-as subir." },
    fireworks: { name: "Fogo de artifício", h: "Vamos celebrar!", m: "Mereces um céu cheio de fogo de artifício. Parabéns!" },
    hearts: { name: "Corações a flutuar", h: "O meu coração é teu", m: "Cada batida, todos os dias, tudo para ti." },
    butterflies: { name: "Largada de borboletas", h: "Abre as asas", m: "Que lindos recomeços venham esvoaçar na tua vida." },
    petals: { name: "Coração de pétalas", h: "Amor em flor", m: "Cada pétala encontra o seu lugar quando estou contigo." },
    confetti: { name: "Chuva de confetes", h: "Viva!", m: "Que voem os confetes. Este momento é todo teu!" },
    champagne: { name: "Brinde com espumante", h: "Saúde!", m: "A ti, e a todos os motivos que temos para celebrar." },
    candles: { name: "Velas de aniversário", h: "Pede um desejo", m: "Cada vela brilha só para ti. Feliz aniversário!" },
    shooting: { name: "Estrela cadente", h: "Pede um desejo a uma estrela", m: "Usei o meu desejo em ti. Que todos os teus se realizem." },
    snow: { name: "Primeira neve", h: "Votos calorosos de inverno", m: "Que a tua casa brilhe e o teu coração se mantenha quente nesta época." },
    sunflowers: { name: "Girassóis em flor", h: "Bom dia, raio de sol", m: "Ver-te crescer e brilhar torna cada dia mais luminoso." },
    dandelion: { name: "Desejos ao vento", h: "Penso em ti", m: "Ultimamente, cada desejo que peço voa na tua direção." },
    gift: { name: "Presente surpresa", h: "Uma surpresa para ti", m: "Há presentes que vêm em caixas. O melhor és tu." },
  },
  zh: {
    balloons: { name: "放飞气球", h: "让它飞吧", m: "送你满天的祝福，愿每一个都能实现。" },
    roses: { name: "一打玫瑰", h: "十二朵玫瑰送给你", m: "十二朵玫瑰，每一朵都是我爱你的理由。" },
    doves: { name: "放飞白鸽", h: "和平与爱", m: "愿平安、爱和温柔的祝福充满你的每一天。" },
    lanterns: { name: "放天灯", h: "心愿起飞", m: "每一盏灯都载着给你的心愿，看它们慢慢升起。" },
    fireworks: { name: "烟花", h: "一起庆祝吧！", m: "你值得满天的烟花。恭喜你！" },
    hearts: { name: "飘浮的爱心", h: "我的心属于你", m: "每一次心跳，每一天，全都为了你。" },
    butterflies: { name: "放飞蝴蝶", h: "展开翅膀", m: "愿美好的新开始翩翩飞进你的生活。" },
    petals: { name: "花瓣爱心", h: "爱意绽放", m: "和你在一起，每一片花瓣都落在了对的地方。" },
    confetti: { name: "彩纸飞扬", h: "万岁！", m: "撒彩纸吧，这一刻属于你！" },
    champagne: { name: "香槟干杯", h: "干杯！", m: "敬你，也敬我们所有值得庆祝的理由。" },
    candles: { name: "生日蜡烛", h: "许个愿吧", m: "每一根蜡烛都只为你闪亮。生日快乐！" },
    shooting: { name: "对流星许愿", h: "对流星许愿", m: "我把心愿许给了你，愿你的心愿全都实现。" },
    snow: { name: "初雪", h: "温暖的冬日祝福", m: "愿这个季节你的家灯火明亮，心里一直温暖。" },
    sunflowers: { name: "向日葵盛开", h: "早安，我的阳光", m: "看着你成长、发光，每一天都更加明亮。" },
    dandelion: { name: "蒲公英心愿", h: "想念你", m: "最近我许的每一个愿望，都飘向了你。" },
    gift: { name: "惊喜礼物", h: "给你的惊喜", m: "有些礼物装在盒子里，而最好的礼物是你。" },
  },
  yue: {
    balloons: { name: "放氣球", h: "等佢飛啦", m: "送你成個天空嘅祝福，願每一個都成真。" },
    roses: { name: "一打玫瑰", h: "十二朵玫瑰送俾你", m: "十二朵玫瑰，每一朵都係我愛你嘅理由。" },
    doves: { name: "放白鴿", h: "和平與愛", m: "願平安、愛同溫柔嘅祝福充滿你每一日。" },
    lanterns: { name: "放天燈", h: "心願起飛", m: "每一盞燈都載住俾你嘅心願，睇住佢哋慢慢升起。" },
    fireworks: { name: "煙花", h: "一齊慶祝啦！", m: "你值得成個天空嘅煙花。恭喜你！" },
    hearts: { name: "飄浮心心", h: "我個心屬於你", m: "每一下心跳，每一日，全部都係為你。" },
    butterflies: { name: "放蝴蝶", h: "展開翅膀", m: "願美好嘅新開始飛入你嘅生活。" },
    petals: { name: "花瓣心心", h: "愛意綻放", m: "同你一齊，每一塊花瓣都落喺啱嘅位置。" },
    confetti: { name: "彩紙飛揚", h: "萬歲！", m: "撒彩紙啦，呢一刻屬於你！" },
    champagne: { name: "香檳乾杯", h: "乾杯！", m: "敬你，亦敬我哋所有值得慶祝嘅理由。" },
    candles: { name: "生日蠟燭", h: "許個願啦", m: "每一枝蠟燭都淨係為你而閃。生日快樂！" },
    shooting: { name: "對流星許願", h: "對流星許願", m: "我將個願許咗俾你，願你嘅心願全部成真。" },
    snow: { name: "初雪", h: "溫暖嘅冬日祝福", m: "願呢個季節你屋企燈火通明，個心一直暖笠笠。" },
    sunflowers: { name: "向日葵開花", h: "早晨，我嘅陽光", m: "睇住你成長、發光，每一日都更光亮。" },
    dandelion: { name: "蒲公英心願", h: "掛住你", m: "最近我許嘅每一個願，都飄咗去你嗰度。" },
    gift: { name: "驚喜禮物", h: "俾你嘅驚喜", m: "有啲禮物係裝喺盒入面，而最好嘅禮物就係你。" },
  },
};

type Ui = {
  title: string; tagline: string; price: string; pick: string; quickCards: string; promo: string; videoNote: string;
  buy: string; previewNote: string; watermark: string; checking: string; paidTitle: string;
  make: string; making: (pct: number) => string; download: string; share: string; again: string;
  noVideo: string; cancelled: string; notPaid: string; error: string; close: string;
  soundOn: string; soundOff: string; musicNote: string;
};

export const ACTION_UI: L<Ui> = {
  en: {
    title: "Action Cards", tagline: "Animated cards that come to life. Download as a video to send anywhere.", price: "$2.99", pick: "Tap a card to watch it", quickCards: "← Quick Cards", promo: "Action Cards — animated video cards, $2.99 →", videoNote: "8-second video",
    buy: "Buy video card — $2.99", previewNote: "Preview. Buy to download the video without the watermark.", watermark: "PREVIEW", checking: "Checking your payment…", paidTitle: "Thank you! Your action card is ready.",
    make: "Create my video", making: (p) => `Creating your video… ${p}%`, download: "Download video", share: "Share video", again: "Make it again",
    noVideo: "This browser can't record video. Please open this page in Safari or Chrome.", cancelled: "Checkout was cancelled. Your card is still here.", notPaid: "We couldn't confirm that payment. If you were charged, contact us with your receipt.", error: "Something went wrong. Please try again.", close: "Close", soundOn: "Turn sound on", soundOff: "Mute", musicNote: "With original music",
  },
  es: {
    title: "Tarjetas en acción", tagline: "Tarjetas animadas que cobran vida. Descárgalas en video para enviarlas a donde quieras.", price: "2,99 US$", pick: "Toca una tarjeta para verla", quickCards: "← Tarjetas rápidas", promo: "Tarjetas en acción: videotarjetas animadas, 2,99 US$ →", videoNote: "Video de 8 segundos",
    buy: "Comprar videotarjeta — 2,99 US$", previewNote: "Vista previa. Cómprala para descargar el video sin marca de agua.", watermark: "VISTA PREVIA", checking: "Verificando tu pago…", paidTitle: "¡Gracias! Tu tarjeta en acción está lista.",
    make: "Crear mi video", making: (p) => `Creando tu video… ${p}%`, download: "Descargar video", share: "Compartir video", again: "Crearlo de nuevo",
    noVideo: "Este navegador no puede grabar video. Abre esta página en Safari o Chrome.", cancelled: "Se canceló el pago. Tu tarjeta sigue aquí.", notPaid: "No pudimos confirmar el pago. Si se te cobró, contáctanos con tu recibo.", error: "Algo salió mal. Inténtalo de nuevo.", close: "Cerrar", soundOn: "Activar sonido", soundOff: "Silenciar", musicNote: "Con música original",
  },
  fr: {
    title: "Cartes animées", tagline: "Des cartes qui prennent vie. Télécharge-les en vidéo pour les envoyer partout.", price: "2,99 $ US", pick: "Touche une carte pour la regarder", quickCards: "← Cartes express", promo: "Cartes animées : cartes vidéo, 2,99 $ US →", videoNote: "Vidéo de 8 secondes",
    buy: "Acheter la carte vidéo — 2,99 $ US", previewNote: "Aperçu. Achète-la pour télécharger la vidéo sans filigrane.", watermark: "APERÇU", checking: "Vérification du paiement…", paidTitle: "Merci ! Ta carte animée est prête.",
    make: "Créer ma vidéo", making: (p) => `Création de ta vidéo… ${p} %`, download: "Télécharger la vidéo", share: "Partager la vidéo", again: "Recommencer",
    noVideo: "Ce navigateur ne peut pas enregistrer de vidéo. Ouvre cette page dans Safari ou Chrome.", cancelled: "Paiement annulé. Ta carte est toujours là.", notPaid: "Nous n'avons pas pu confirmer le paiement. Si tu as été débité, contacte-nous avec ton reçu.", error: "Un problème est survenu. Réessaie.", close: "Fermer", soundOn: "Activer le son", soundOff: "Couper le son", musicNote: "Avec musique originale",
  },
  pt: {
    title: "Cartões animados", tagline: "Cartões que ganham vida. Descarrega em vídeo para enviar para qualquer lado.", price: "2,99 USD", pick: "Toca num cartão para o ver", quickCards: "← Cartões rápidos", promo: "Cartões animados: cartões em vídeo, 2,99 USD →", videoNote: "Vídeo de 8 segundos",
    buy: "Comprar cartão em vídeo — 2,99 USD", previewNote: "Pré-visualização. Compra para descarregar o vídeo sem marca de água.", watermark: "PRÉ-VISUALIZAÇÃO", checking: "A verificar o pagamento…", paidTitle: "Obrigado! O teu cartão animado está pronto.",
    make: "Criar o meu vídeo", making: (p) => `A criar o teu vídeo… ${p}%`, download: "Descarregar vídeo", share: "Partilhar vídeo", again: "Criar de novo",
    noVideo: "Este navegador não consegue gravar vídeo. Abre esta página no Safari ou no Chrome.", cancelled: "O pagamento foi cancelado. O teu cartão continua aqui.", notPaid: "Não conseguimos confirmar o pagamento. Se foste cobrado, contacta-nos com o recibo.", error: "Algo correu mal. Tenta outra vez.", close: "Fechar", soundOn: "Ligar o som", soundOff: "Silenciar", musicNote: "Com música original",
  },
  zh: {
    title: "动态贺卡", tagline: "会动起来的贺卡，可下载成视频随处发送。", price: "2.99 美元", pick: "点击贺卡即可观看", quickCards: "← 快速贺卡", promo: "动态贺卡：动画视频贺卡，2.99 美元 →", videoNote: "8 秒视频",
    buy: "购买视频贺卡 — 2.99 美元", previewNote: "这是预览。购买后即可下载无水印的视频。", watermark: "预览", checking: "正在确认付款……", paidTitle: "谢谢！你的动态贺卡已准备好。",
    make: "生成我的视频", making: (p) => `正在生成视频……${p}%`, download: "下载视频", share: "分享视频", again: "重新生成",
    noVideo: "这个浏览器无法录制视频，请用 Safari 或 Chrome 打开此页面。", cancelled: "付款已取消，你的贺卡还在这里。", notPaid: "我们无法确认这笔付款。如果已扣款，请带上收据联系我们。", error: "出了点问题，请重试。", close: "关闭", soundOn: "打开声音", soundOff: "静音", musicNote: "配原创音乐",
  },
  yue: {
    title: "動態賀卡", tagline: "識郁嘅賀卡，可以下載做影片隨處send。", price: "2.99 美元", pick: "撳一張賀卡就可以睇", quickCards: "← 快速賀卡", promo: "動態賀卡：動畫影片賀卡，2.99 美元 →", videoNote: "8 秒影片",
    buy: "買影片賀卡 — 2.99 美元", previewNote: "呢個係預覽。買咗就可以下載冇水印嘅影片。", watermark: "預覽", checking: "確認緊付款……", paidTitle: "多謝！你張動態賀卡整好喇。",
    make: "整我嘅影片", making: (p) => `整緊你嘅影片……${p}%`, download: "下載影片", share: "分享影片", again: "再整一次",
    noVideo: "呢個瀏覽器錄唔到影片，請用 Safari 或者 Chrome 開呢頁。", cancelled: "付款取消咗，你張賀卡仲喺度。", notPaid: "我哋確認唔到呢筆付款。如果已經扣咗錢，請帶埋收據聯絡我哋。", error: "出咗啲問題，請再試。", close: "關閉", soundOn: "開聲", soundOff: "靜音", musicNote: "配原創音樂",
  },
};
