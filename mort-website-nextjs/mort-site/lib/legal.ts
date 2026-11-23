/**
 * Single source for the Terms preview page.
 *
 * ⚠️  UNCONFIRMED. Before this goes public, confirm these strings against the
 * counsel-approved build in the mortapp/Mort repo (Vercel only shows V3 as the
 * counsel-approved build; the V5 string below came from the design file):
 *   - `version`  (document version + effective date)
 *   - `live`     (the "does not currently process real-world Task payments" line)
 * The 16 section bodies are intentionally stubs that link to the full text.
 * Do NOT hand-copy legal text into this repo.
 */
export const LEGAL = {
  version:
    "Version MORT-LEGAL-2026-V5 · Effective November 10, 2026 · United States / Indiana",
  liveTitle: "What’s live today",
  live: "The MORT marketplace is open, and identity verification is available through MORT’s document review process. MORT does not currently process real-world Task payments, and these Terms do not promise payment processing, background screening, insurance, or safety guarantees.",
  fullTextUrl: "https://mortapp.org/legal/terms",
};

export const TERMS_SECTIONS = [
  "Agreement, scope, and definitions",
  "Eligibility, accounts, and consent",
  "Tasks, safety, and conduct",
  "MORT’s current and future features",
  "Fees, payments, and payment features",
  "Minor payee, payout structure, and payee identity",
  "Tax information and reporting",
  "Complaints, support, and legal claims",
  "Reconciliation and transaction records",
  "Privacy, messages, and records",
  "User content and intellectual property",
  "Disclaimers and limits",
  "Indemnity and enforcement",
  "Service interruption and termination",
  "Changes and state availability",
  "General terms and acceptance",
];
