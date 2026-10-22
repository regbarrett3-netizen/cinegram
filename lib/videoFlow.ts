// Extra text for the 3-step AI video card flow, in six languages.
import type { Lang } from "./i18n";

export type VideoFlowText = {
  steps: [string, string, string];
  s1Title: string; occasionLabel: string; addScene: string;
  next: string; s2Title: string; make: string; s3Title: string;
  previewNote: string; pay: (name: string) => string;
  saveCopy: string; sendingNow: string;
};

export const VIDEO_FLOW: Record<Lang, VideoFlowText> = {
  en: {
    steps: ["Message", "Face & voice", "Preview & send"],
    s1Title: "Who's it for, and what will you say?", occasionLabel: "Occasion", addScene: "+ Add a scene (optional)",
    next: "Next: your face & voice", s2Title: "Add your face and voice", make: "Make my video card", s3Title: "Here's your video card",
    previewNote: "Preview. They'll get it without the watermark.", pay: (n) => `Pay $2.99 & send to ${n}`,
    saveCopy: "Save a copy for yourself", sendingNow: "Sending your video card…",
  },
  es: {
    steps: ["Mensaje", "Cara y voz", "Ver y enviar"],
    s1Title: "¿Para quién es y qué le dirás?", occasionLabel: "Ocasión", addScene: "+ Añadir una escena (opcional)",
    next: "Siguiente: tu cara y tu voz", s2Title: "Añade tu cara y tu voz", make: "Crear mi video", s3Title: "Aquí está tu video",
    previewNote: "Vista previa. Lo recibirá sin marca de agua.", pay: (n) => `Pagar 2,99 US$ y enviar a ${n}`,
    saveCopy: "Guardar una copia para ti", sendingNow: "Enviando tu video…",
  },
  fr: {
    steps: ["Message", "Visage et voix", "Aperçu et envoi"],
    s1Title: "Pour qui, et que vas-tu dire ?", occasionLabel: "Occasion", addScene: "+ Ajouter une scène (facultatif)",
    next: "Suivant : ton visage et ta voix", s2Title: "Ajoute ton visage et ta voix", make: "Créer ma carte vidéo", s3Title: "Voici ta carte vidéo",
    previewNote: "Aperçu. La carte reçue n'aura pas de filigrane.", pay: (n) => `Payer 2,99 $ US et envoyer à ${n}`,
    saveCopy: "Garder une copie pour toi", sendingNow: "Envoi de ta carte vidéo…",
  },
  pt: {
    steps: ["Mensagem", "Cara e voz", "Ver e enviar"],
    s1Title: "Para quem é, e o que vais dizer?", occasionLabel: "Ocasião", addScene: "+ Adicionar uma cena (opcional)",
    next: "Seguinte: a tua cara e voz", s2Title: "Adiciona a tua cara e a tua voz", make: "Criar o meu vídeo", s3Title: "Aqui está o teu vídeo",
    previewNote: "Pré-visualização. Vai recebê-lo sem marca de água.", pay: (n) => `Pagar 2,99 US$ e enviar a ${n}`,
    saveCopy: "Guardar uma cópia para ti", sendingNow: "A enviar o teu vídeo…",
  },
  zh: {
    steps: ["祝福语", "照片和声音", "预览并发送"],
    s1Title: "送给谁？想说什么？", occasionLabel: "场合", addScene: "+ 添加场景（可选）",
    next: "下一步：照片和声音", s2Title: "添加你的照片和声音", make: "生成我的视频贺卡", s3Title: "你的视频贺卡",
    previewNote: "预览。对方收到的版本没有水印。", pay: (n) => `支付 2.99 美元并发送给${n}`,
    saveCopy: "给自己保存一份", sendingNow: "正在发送视频贺卡…",
  },
  yue: {
    steps: ["祝福說話", "相片同聲音", "預覽同寄出"],
    s1Title: "寄俾邊個？想講咩？", occasionLabel: "場合", addScene: "+ 加個場景（可以唔填）",
    next: "下一步：相片同聲音", s2Title: "加你張相同你把聲", make: "整我張影片賀卡", s3Title: "你張影片賀卡",
    previewNote: "預覽。對方收到嘅版本冇水印。", pay: (n) => `俾 2.99 美元並寄俾${n}`,
    saveCopy: "幫自己留一份", sendingNow: "寄緊你張影片賀卡…",
  },
};
