// Smoke test for the container at http://localhost:3000. No keys, no .env.
// Checks the main screen, the 251TTF014 demo (RED with its CDSCO source line),
// the language switch, and saving to the cabinet.
import { chromium } from "playwright";

const URL = process.env.APP_URL || "http://localhost:3000/";
const results = [];
const check = (name, ok, extra = "") => { results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " :: " + extra : ""}`); return ok; };

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 400, height: 860 } })).newPage();
const body = () => page.locator("body").innerText();
let failed = false;
try {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  failed = !check("main screen loads with no keys", (await body()).includes("दवा जाँचें"));
  await page.getByTestId("welcome-next").click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
  if (await page.getByTestId("first-run-ok").isVisible().catch(() => false)) await page.getByTestId("first-run-ok").click();

  await page.getByTestId("demo-btn").first().click();
  await page.waitForTimeout(1500);
  let t = await body();
  failed = !check("demo 251TTF014 gives RED (NSQ) with CDSCO source line",
    t.includes("मानक गुणवत्ता से कम (NSQ)") && t.includes("सरकारी डेटा जाँचा गया")) || failed;

  await page.getByRole("button", { name: "दवा पेटी में रखें" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "माँ", exact: true }).evaluate((e) => e.click());
  await page.getByRole("button", { name: "सहेजें", exact: true }).evaluate((e) => e.click());
  await page.waitForTimeout(700);
  await page.locator("button", { hasText: /^पेटी$/ }).last().evaluate((e) => e.click());
  await page.waitForTimeout(900);
  t = await body();
  failed = !check("save to cabinet", /Telmisartan|251TTF014/.test(t) && !t.includes("पहली दवा जोड़ें")) || failed;

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.getByTestId("lang-button").click({ timeout: 5000 });
  await page.waitForTimeout(800);
  await page.getByTestId("lang-en").evaluate((e) => e.click());
  await page.waitForTimeout(900);
  t = await body();
  failed = !check("language switch to English", t.includes("Check a medicine") && t.includes("Works offline")) || failed;
} catch (e) {
  failed = true;
  results.push("FAIL exception :: " + e.message.split("\n")[0]);
} finally {
  await browser.close();
}
console.log(results.join("\n"));
process.exit(failed ? 1 : 0);
