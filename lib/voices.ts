// Ready-made ElevenLabs voices for people who'd rather not record themselves.
// These are ElevenLabs "default" voices, which they keep available long-term.

export type PresetKey = "warmWoman" | "brightWoman" | "britishWoman" | "friendlyMan" | "deepMan" | "grandpa";

export const PRESET_VOICES: { key: PresetKey; id: string }[] = [
  { key: "warmWoman", id: "XrExE9yKIg1WjnnlVkGX" }, // Matilda
  { key: "brightWoman", id: "FGY2WhTYpPnrIDTdsKH5" }, // Laura
  { key: "britishWoman", id: "pFZP5JQG7iQjIQuC4Bku" }, // Lily
  { key: "friendlyMan", id: "cjVigY5qzO86Huf0OWal" }, // Eric
  { key: "deepMan", id: "nPczCjzI2devNBz1zQrb" }, // Brian
  { key: "grandpa", id: "pqHfZKP75CvOlQylNhV4" }, // Bill
];

export const isPresetVoice = (id: unknown): id is string => PRESET_VOICES.some((v) => v.id === id);
