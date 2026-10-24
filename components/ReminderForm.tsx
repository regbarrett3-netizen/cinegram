"use client";

import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { GROWTH } from "../lib/growthText";
import { SITE } from "../lib/siteText";
import { isEmail } from "../lib/emailCheck";
import type { Lang } from "../lib/i18n";

const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** "Never miss Mom's birthday": saves a yearly reminder, emailed a week before. */
export function ReminderForm({ lang, toName }: { lang: Lang; toName: string }) {
  const g = GROWTH[lang];
  const [email, setEmail] = useState("");
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isEmail(email.trim())) return setError(SITE[lang].emailInvalid);
    if (!month || !day) return setError(g.remindSub);
    setBusy(true);
    try {
      const res = await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), toName, month, day, lang }) });
      const d = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) throw new Error(d.error || SITE[lang].error);
      setDone(true);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  if (done) {
    return <p role="status" className="notice flex items-center justify-center gap-2 text-left"><Check className="h-5 w-5 shrink-0" /> {g.remindDone(toName)}</p>;
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-left space-y-3">
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div>
          <p className="font-bold">{g.remindTitle(toName)}</p>
          <p className="text-sm text-white/60">{g.remindSub}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="label">{g.remindMonth}</span>
          <select className="field" value={month} onChange={(e) => { const m = Number(e.target.value); setMonth(m); if (day > (DAYS[m - 1] || 31)) setDay(0); }}>
            <option value={0}>—</option>
            {g.months.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
          </select>
        </label>
        <label className="block"><span className="label">{g.remindDay}</span>
          <select className="field" value={day} onChange={(e) => setDay(Number(e.target.value))}>
            <option value={0}>—</option>
            {Array.from({ length: month ? DAYS[month - 1] : 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>
        </label>
      </div>
      <label className="block"><span className="label">{g.remindEmail}</span>
        <input className="field" type="email" inputMode="email" autoCapitalize="off" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p role="alert" className="alert">{error}</p>}
      <button type="submit" disabled={busy} className="btn-secondary">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <BellRing className="h-5 w-5" />} {g.remindBtn}</button>
      <p className="text-center text-xs text-white/40">{g.remindNote}</p>
    </form>
  );
}
