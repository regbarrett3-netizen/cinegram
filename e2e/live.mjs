// End-to-end check of the live site in a real (headless) phone browser.
// Walks the 1-2-3 send flow and the AI video flow up to Stripe checkout (never pays),
// saving a screenshot at each step and a results.json summary.
import { chromium, devices } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "https://cinegramcards.com";
const RUN_VIDEO = process.env.RUN_VIDEO !== "0";
const out = "e2e-out";
fs.mkdirSync(out, { recursive: true });
const results = [];
let n = 0;
const log = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "en-US" });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300)); });
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`));
const network = [];
page.on("response", async (r) => {
  const u = r.url();
  if (r.status() >= 400) network.push(`${r.status()} ${u.slice(0, 160)}`);
  if (u.includes("/api/status") || u.includes("/api/create")) {
    try { network.push(`${r.status()} ${u.replace(/^.*\/api/, "/api").slice(0, 80)} -> ${(await r.text()).slice(0, 300)}`); } catch { /* ignore */ }
  }
});
const shot = async (label) => { n++; await page.screenshot({ path: `${out}/${String(n).padStart(2, "0")}-${label}.png`, fullPage: false }); };
const alertText = async () => (await page.locator('[role="alert"]').allInnerTexts()).join(" | ");

async function step(name, fn) {
  try { await fn(); log(name, true); }
  catch (e) { await page.screenshot({ path: `${out}/FAIL-${name.replace(/\W+/g, "-")}.png`, fullPage: true }).catch(() => {}); log(name, false, `${String(e.message || e).split("\n")[0]} ${await alertText().catch(() => "")}`); throw e; }
}

// ---------- API smoke checks ----------
for (const path of ["/", "/video", "/cards", "/action"]) {
  const r = await ctx.request.get(BASE + path);
  log(`GET ${path}`, r.ok(), `status ${r.status()}`);
}
{
  const r = await ctx.request.get(BASE + "/api/voices");
  const body = await r.json().catch(() => ({}));
  const count = Object.keys(body.previews || {}).length;
  log("ElevenLabs voice previews load (/api/voices)", r.ok() && count > 0, `status ${r.status()}, ${count} voices ${body.error || ""}`);
}
{
  const f = new FormData();
  Object.entries({ kind: "quick", cardId: "nope", occasion: "birthday", toName: "A", fromName: "B", deliverBy: "text", toPhone: "" }).forEach(([k, v]) => f.append(k, v));
  const r = await ctx.request.post(BASE + "/api/order", { multipart: Object.fromEntries(f) });
  log("Order API rejects a bad card", r.status() === 400, `status ${r.status()}`);
}

// ---------- 1-2-3 send flow, text delivery, up to Stripe ----------
try {
  await step("Send flow: home page loads", async () => {
    await page.goto(`${BASE}/?lang=en`);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: /Birthday/ }).first().waitFor();
    await shot("send-1-occasion");
  });
  await step("Send flow: pick Birthday", async () => {
    await page.getByRole("button", { name: /Birthday/ }).first().click();
    await page.getByText("Who's it for?").waitFor();
  });
  await step("Send flow: names + Text or social", async () => {
    await page.getByLabel("Their name").fill("Test Lisa");
    await page.getByLabel("Your name").fill("Claude Test");
    await page.getByRole("radio", { name: /Text or social/ }).click();
    await page.getByLabel(/Their mobile number/).fill("(555) 123-4567");
    await shot("send-2-who");
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByText(/Pick a card for Test Lisa/).waitFor();
  });
  await step("Send flow: card list shows art cards", async () => {
    await page.waitForTimeout(2500);
    await shot("send-3-choose");
    await page.locator(".grid.grid-cols-2 button.tile").first().click();
    await page.getByText("Make it yours").waitFor();
  });
  await step("Send flow: preview + final-sale note", async () => {
    await page.waitForTimeout(2000);
    await page.getByText(/All sales are final/).first().waitFor();
    await page.getByText(/text or share the card with Test Lisa/).waitFor();
    await shot("send-4-preview");
  });
  await step("Send flow: Pay opens live Stripe checkout", async () => {
    await page.getByRole("button", { name: /Pay \$1\.99 & send to Test Lisa/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 });
    await page.waitForTimeout(4000);
    await shot("send-5-stripe");
    const txt = await page.locator("body").innerText();
    if (/sandbox|test mode/i.test(txt)) throw new Error("Stripe checkout is still in test/sandbox mode");
    if (!/All sales are final/i.test(txt)) throw new Error("Final-sale note missing on Stripe checkout");
  });
} catch { /* recorded */ }

// ---------- AI video flow, up to Stripe ----------
if (RUN_VIDEO) {
  try {
    await step("Video: step 1 loads", async () => {
      await page.goto(`${BASE}/video?lang=en`);
      await page.evaluate(() => sessionStorage.clear());
      await page.reload();
      await page.getByText("Who's it for, and what will you say?").waitFor();
      await shot("video-1-message");
    });
    await step("Video: fill step 1", async () => {
      await page.getByLabel("Their name").fill("Test Lisa");
      await page.getByLabel("Your name").fill("Claude Test");
      await page.getByRole("radio", { name: /Text or social/ }).click();
      await page.getByRole("button", { name: /Next: your face/ }).click();
      await page.getByText("Add your face and voice").waitFor();
    });
    await step("Video: selfie + preset voice + consent", async () => {
      await page.locator('input[type="file"][accept="image/*"]').setInputFiles("e2e/face.jpg");
      await page.locator("label img").first().waitFor({ timeout: 20000 });
      await page.getByRole("tab", { name: "Pick a voice" }).click();
      await page.locator('input[type="checkbox"]').check();
      await shot("video-2-face-voice");
      await page.getByRole("button", { name: "Make my video card" }).click();
    });
    await step("Video: renders (fal + ElevenLabs)", async () => {
      await page.waitForTimeout(8000);
      await shot("video-3-working");
      await Promise.race([
        page.getByText("Here's your video card").waitFor({ timeout: 11 * 60 * 1000 }),
        page.locator('[role="alert"]').waitFor({ timeout: 11 * 60 * 1000 }).then(async () => { throw new Error(await alertText()); }),
      ]);
      await page.waitForTimeout(4000);
      await shot("video-4-preview");
    });
    await step("Video: Pay opens live Stripe checkout", async () => {
      await page.getByRole("button", { name: /Pay \$2\.99 & send to Test Lisa/ }).click();
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 });
      await page.waitForTimeout(4000);
      await shot("video-5-stripe");
    });
  } catch { /* recorded */ }
}

fs.writeFileSync(`${out}/results.json`, JSON.stringify({ base: BASE, results, consoleErrors: consoleErrors.slice(0, 40), network: network.slice(-60) }, null, 2));
await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
