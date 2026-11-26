# Submission text (Devpost) and video correction

Figures come from the published files: `public/data/meta.json`, `src/content/eval-population.json`, `src/content/eval-results.json`, and the reconciliation in `docs/RECONCILIATION.md`. Figures as of 25 November 2026.

## Devpost text

**DawaShield** checks a medicine strip against the Indian government's own list of drug quality alerts, on the phone, in Hindi or English.

- **Official data:** 4,488 CDSCO records, alert months October 2024 to October 2026 (latest: October 2026). Records come from the official portal and monthly PDFs through a daily pipeline. Historical records are kept, and the pipeline will not publish if a published record would vanish without a documented, evidenced correction.
- **Completeness:** of the 4,488 records, 4,477 have a printed batch number. Each was queried with its own batch, medicine and company, and all 4,477 came out RED. The other 11 have no printed batch (for example "Not Mention"). They cannot be tested for an exact match, so they are reported separately. None of them came out RED: 10 AMBER and 1 GREY.
- **False alarms:** for 2,000 synthetic batches absent from the dataset, with companies absent from it, the app returned GREY (no alert invented). Seed 20261125, reproducible.
- **Robustness:** a 728-case stress set in 16 groups. The author wrote these cases and their expected labels from 55 hand-verified records, so they measure consistent, safe behaviour under stress, not accuracy on unseen data. 0 false REDs, 0 false GREYs, every colour correct.
- **Speech:** 60 generated Hindi and English transcripts that imitate real speech-recognition output. They are not recordings of real speakers. 98.3% correct at first guess, 100% within three.
- **Freshness:** the app shows the latest covered alert month, when the dataset last changed, and the last successful source check.
- **Hybrid AI, implemented:** cloud reading and explanation through Firebase AI Logic with Gemini 3.5 Flash. Offline checking is deterministic code with no model. On-device Gemini Nano is used offline only where the browser reports it available, and the app says so when it is not.
- **Hybrid AI, verified at runtime:** offline deterministic check (RED, zero network requests while offline). **Verified on a real iPhone** (mobile data, 25 Nov 2026): cloud explanation for 251TTF014 with the Cloud badge, Pantosec strip read at 95–99% confidence, and the Punjabi voice check labelled "Gemini Flash · Cloud". **Not verified:** an accurate on-device Gemini Nano photo reading (one desktop Chrome attempt showed "On this device" but returned 0% confidence fields), and the automated laptop retest of the cloud explanation (pending). Photo reading accuracy is not measured across a labelled set. See `docs/HYBRID-AI.md`.
- **Privacy:** the full list and your cabinet are stored on the phone. Only devices that opt in to push store anything in Firestore: a push token, language, and each saved medicine's batch, company and expiry month. Names, phone numbers and contacts stay on the phone. Strip photos, voice clips, speech transcripts and record text are sent to Gemini when online, and medicine names are included in those requests. See `docs/PRIVACY.md`.
- **Not verified:** push alerts with the app or browser fully closed, on a real Android phone or iPhone. Photo accuracy: no labelled strip photos yet, so photo reading is **not measured**.
- **Limitations:**
  - Two possible reprints are kept as separate records (see `docs/RECONCILIATION.md`).
  - **Known safety coverage limitation:** one spurious alert (Besto-Cof DRY COUGH FORMULA, SDTL Raipur, September 2025) has no batch number and its manufacturer is listed as "Under Investigation". The official source gives the app no identifier to match against. Searching its name without a batch and a company returns GREY, which is not proof that the medicine is safe. It is a coverage gap caused by missing source identifiers.
  - Speech and stress-set results are not measures of accuracy on real people or on unseen cases.

## Demo video: outdated numbers and a dated correction

The video cannot be edited from this repository. The on-screen figures below come from the demo scripts in `scripts/demo/` (not committed). Check the video itself against this list before posting.

| Claim in the video or earlier text | Status now |
|---|---|
| "428 cases" in the matching evaluation | Now 728 cases. The stress set grew from 428 to 728 after 300 cases were added. |
| "Checked against 4,158 official CDSCO records" | Now 4,488 records (alert months Oct 2024 to Oct 2026). |
| "CDSCO flags 330 drug samples as not of standard quality in September 2026" (news card) | **Verified.** The official portal's September 2026 NSQ table has 330 rows (42 CDSCO Labs, 288 State Labs), plus one spurious entry. The wording traces to an All India Radio report of 23 October 2026 (newsonair.gov.in), with the same figure in other outlets. The card credits All India Radio, which is accurate. |
| Speech cases described as "real" Hindi transcripts | They are generated transcripts that imitate real speech-recognition output. |
| Any statement that push works with the app closed | **NOT VERIFIED** on real devices. |
| Any statement that cloud Gemini explanation works in this release | **Verified on a real iPhone** (mobile data, 25 Nov 2026). The automated laptop retest is pending. |

### YouTube description correction (dated)

> **Correction, 25 November 2026:** Some figures in this video's description and on our submission page are out of date. The dataset now holds 4,488 official CDSCO records, covering alert months October 2024 to October 2026 (it was 4,158). The matching stress set has 728 cases (it was described as 428). Those 728 cases were written by the author from hand-verified records, so they measure consistent behaviour under stress, not accuracy on unseen data. The speech tests are 60 generated transcripts, not recordings of real speakers. Push alerts with the app fully closed have not been tested on real phones. Full details: https://github.com/micneeraj/dawashield-voice/blob/master/docs/SUBMISSION.md
