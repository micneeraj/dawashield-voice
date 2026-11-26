// Speech to text with the browser Web Speech API. hi-IN / en-IN, plus pa-IN,
// gu-IN, mr-IN, kn-IN, ta-IN for the online regional languages. With the Hindi
// language pack installed Chrome recognises Hindi on the device, offline.
import { LANG_NAMES, type AppLang } from "./i18n";

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  processLocally?: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type SRCtor = { new (): SR; available?: (o: object) => Promise<string> };

const G = (typeof self === "undefined" ? {} : self) as unknown;
const Ctor = (G as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }).SpeechRecognition ||
  (G as { webkitSpeechRecognition?: SRCtor }).webkitSpeechRecognition;

export const speechSupported = !!Ctor;

export interface Listener {
  stop(): void;
}

/** Can this browser recognise speech in this language? Hides the mic when not. */
export async function speechLangSupported(lang: AppLang): Promise<boolean> {
  if (!Ctor) return false;
  if (lang === "hi" || lang === "en") return true;
  // Newer Chrome can report per-language availability; older versions just try.
  if (typeof Ctor.available === "function") {
    try { return (await Ctor.available({ langs: [LANG_NAMES[lang].bcp], processLocally: false })) !== "unavailable"; } catch { return true; }
  }
  return true;
}

export async function listen(
  lang: AppLang,
  onText: (text: string, final: boolean) => void,
  onEnd: (finalText: string, error?: string) => void,
): Promise<Listener | null> {
  if (!Ctor) {
    onEnd("", "unsupported");
    return null;
  }
  const code = LANG_NAMES[lang].bcp;
  const rec = new Ctor();
  rec.lang = code;
  rec.interimResults = true;
  rec.continuous = false;
  // Prefer on-device recognition when the language pack is present.
  // Skipped under automated browsers: headless Chromium crashes the page when
  // SpeechRecognition.available({ processLocally: true }) is called (found in QA).
  const automated = typeof navigator !== "undefined" && navigator.webdriver === true;
  if (!automated && "processLocally" in rec && typeof Ctor.available === "function") {
    try {
      const st = await Ctor.available({ langs: [code], processLocally: true });
      if (st === "available") rec.processLocally = true;
    } catch {
      /* use default */
    }
  }
  let text = "";
  let err: string | undefined;
  rec.onresult = (e) => {
    let t = "";
    let final = false;
    for (let i = 0; i < e.results.length; i++) {
      t += e.results[i][0].transcript;
      final = e.results[i].isFinal;
    }
    text = t;
    onText(t, final);
  };
  rec.onerror = (e) => {
    err = e.error;
  };
  rec.onend = () => onEnd(text.trim(), text ? undefined : err || "no-speech");
  try {
    rec.start();
  } catch {
    onEnd("", "start-failed");
    return null;
  }
  return { stop: () => rec.stop() };
}

/** Pure: browser recognition errors that mean "this browser can't do it here",
 *  so we switch to recording + cloud transcript. Mic-permission and silence are not. */
export function browserFailed(err: string): boolean {
  return ["unsupported", "start-failed", "service-not-allowed", "network", "language-not-supported"].includes(err);
}
