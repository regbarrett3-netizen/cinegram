// Halloween action cards: names and greetings in all six languages (no canvas code, safe for the server).
import type { Lang } from "../i18n";

export const HALLOWEEN_IDS = ["dragon", "pumpkins", "skeletons", "monster", "witch", "graveyard", "vampire"] as const;
export type HalloweenId = (typeof HALLOWEEN_IDS)[number];
export const isHalloweenId = (x: unknown): x is HalloweenId => HALLOWEEN_IDS.includes(x as HalloweenId);

/** Halloween special price, per card. */
export const HALLOWEEN_PRICE_CENTS = 99;

/** The Halloween occasion is offered from October 1 until the end of November 2 (local time). */
export function halloweenInSeason(now = new Date()): boolean {
  const m = now.getMonth(), d = now.getDate();
  return m === 9 || (m === 10 && d <= 2);
}

/** Moment used for the still thumbnail (seconds). */
export const HALLOWEEN_POSTER_T: Record<HalloweenId, number> = {
  dragon: 6.6, pumpkins: 3.1, skeletons: 3.4, monster: 3.2, witch: 2.6, graveyard: 3, vampire: 2.4,
};

type T = { name: string; h: string; m: string };

export const HALLOWEEN_TEXT: Record<Lang, Record<HalloweenId, T>> = {
  en: {
    dragon: { name: "Dragon Fire", h: "Happy Halloween", m: "A dragon flew all this way just to write you this. Have a fiery one!" },
    pumpkins: { name: "Pumpkin Choir", h: "Happy Halloween!", m: "We pumpkins rehearsed all year for this. Hope it gives you chills." },
    skeletons: { name: "Skeleton Disco", h: "No Body Dances Like Us", m: "Shake your bones tonight. Happy Halloween!" },
    monster: { name: "Under the Bed", h: "Checked Under Your Bed", m: "Good news: the only monster down there just wants to say hi. Happy Halloween!" },
    witch: { name: "Broom Donuts", h: "You're Spook-tacular", m: "Flying by to wish you a wickedly fun Halloween." },
    graveyard: { name: "Graveyard Rave", h: "The Dead Are Partying", m: "And you're on the guest list. Happy Halloween!" },
    vampire: { name: "Vampire Selfie", h: "Took a Selfie for You", m: "It didn't come out. Happy Halloween anyway!" },
  },
  es: {
    dragon: { name: "Fuego de dragón", h: "Feliz Halloween", m: "Un dragón voló hasta aquí solo para escribirte esto. ¡Que sea un Halloween ardiente!" },
    pumpkins: { name: "Coro de calabazas", h: "¡Feliz Halloween!", m: "Las calabazas ensayamos todo el año para esto. Que te dé escalofríos." },
    skeletons: { name: "Disco de esqueletos", h: "Nadie baila como nosotros", m: "Mueve el esqueleto esta noche. ¡Feliz Halloween!" },
    monster: { name: "Debajo de la cama", h: "Revisé debajo de tu cama", m: "Buenas noticias: el único monstruo ahí abajo solo quiere saludarte. ¡Feliz Halloween!" },
    witch: { name: "Escoba acrobática", h: "Un hechizo para ti", m: "Paso volando para desearte un Halloween embrujadamente divertido." },
    graveyard: { name: "Fiesta en el cementerio", h: "Los muertos están de fiesta", m: "Y tú estás en la lista. ¡Feliz Halloween!" },
    vampire: { name: "Selfi de vampiro", h: "Me tomé una selfi para ti", m: "No salí en la foto. ¡Feliz Halloween de todos modos!" },
  },
  fr: {
    dragon: { name: "Feu de dragon", h: "Joyeux Halloween", m: "Un dragon a volé jusqu'ici rien que pour t'écrire ça. Passe un Halloween flamboyant !" },
    pumpkins: { name: "Chorale de citrouilles", h: "Joyeux Halloween !", m: "Nous, les citrouilles, avons répété toute l'année. Frissons garantis." },
    skeletons: { name: "Disco des squelettes", h: "Personne ne danse comme nous", m: "Secoue tes os ce soir. Joyeux Halloween !" },
    monster: { name: "Sous le lit", h: "J'ai vérifié sous ton lit", m: "Bonne nouvelle : le seul monstre là-dessous veut juste te dire bonjour. Joyeux Halloween !" },
    witch: { name: "Balai acrobatique", h: "Un sort rien que pour toi", m: "Je passe en vol te souhaiter un Halloween ensorcelant." },
    graveyard: { name: "Fête au cimetière", h: "Les morts font la fête", m: "Et tu es sur la liste. Joyeux Halloween !" },
    vampire: { name: "Selfie de vampire", h: "Un selfie rien que pour toi", m: "Je n'apparais pas sur la photo. Joyeux Halloween quand même !" },
  },
  pt: {
    dragon: { name: "Fogo de dragão", h: "Feliz Halloween", m: "Um dragão voou até aqui só para te escrever isto. Tem um Halloween escaldante!" },
    pumpkins: { name: "Coro de abóboras", h: "Feliz Halloween!", m: "Nós, as abóboras, ensaiámos o ano todo para isto. Arrepios garantidos." },
    skeletons: { name: "Discoteca de esqueletos", h: "Ninguém dança como nós", m: "Abana o esqueleto esta noite. Feliz Halloween!" },
    monster: { name: "Debaixo da cama", h: "Vi debaixo da tua cama", m: "Boa notícia: o único monstro lá em baixo só quer dizer olá. Feliz Halloween!" },
    witch: { name: "Vassoura acrobática", h: "Um feitiço só para ti", m: "Passo a voar para te desejar um Halloween enfeitiçado." },
    graveyard: { name: "Festa no cemitério", h: "Os mortos estão em festa", m: "E tu estás na lista. Feliz Halloween!" },
    vampire: { name: "Selfie de vampiro", h: "Tirei uma selfie para ti", m: "Não apareci na foto. Feliz Halloween na mesma!" },
  },
  zh: {
    dragon: { name: "喷火巨龙", h: "万圣节快乐", m: "一条巨龙飞了这么远，只为给你写下这句话。祝你万圣节火力全开！" },
    pumpkins: { name: "南瓜合唱团", h: "万圣节快乐！", m: "我们南瓜排练了一整年，就为了这一刻。" },
    skeletons: { name: "骷髅迪斯科", h: "没人比我们更会跳", m: "今晚一起摇起来吧。万圣节快乐！" },
    monster: { name: "床底下", h: "帮你看过床底下了", m: "好消息：床底下的小怪兽只是想跟你打个招呼。万圣节快乐！" },
    witch: { name: "扫帚漂移", h: "给你施个快乐魔法", m: "飞过来祝你有个超好玩的万圣节。" },
    graveyard: { name: "墓地派对", h: "幽灵们在开派对", m: "你也在邀请名单上。万圣节快乐！" },
    vampire: { name: "吸血鬼自拍", h: "给你拍了张自拍", m: "可惜我拍不出来。还是祝你万圣节快乐！" },
  },
  yue: {
    dragon: { name: "噴火巨龍", h: "萬聖節快樂", m: "一條巨龍飛咗咁遠，就係為咗寫呢句俾你。祝你萬聖節火力全開！" },
    pumpkins: { name: "南瓜合唱團", h: "萬聖節快樂！", m: "我哋班南瓜練咗成年，就係為咗呢一刻。" },
    skeletons: { name: "骷髏的士高", h: "冇人跳得好過我哋", m: "今晚一齊郁身郁勢啦。萬聖節快樂！" },
    monster: { name: "床底下", h: "幫你睇過床底喇", m: "好消息：床底隻小怪獸只係想同你打個招呼。萬聖節快樂！" },
    witch: { name: "掃把漂移", h: "同你施個開心魔法", m: "飛過嚟祝你有個超好玩嘅萬聖節。" },
    graveyard: { name: "墳場派對", h: "啲鬼喺度開派對", m: "你都喺邀請名單入面。萬聖節快樂！" },
    vampire: { name: "吸血鬼自拍", h: "幫你影咗張自拍", m: "可惜我影唔出嚟。都係祝你萬聖節快樂！" },
  },
};
