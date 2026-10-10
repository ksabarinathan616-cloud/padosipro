# Research notes — what is verified and what is not

## Sources actually used
1. Founder partner slides (3 screenshots, slide 20 of 44, dated 9 Oct 2026): partner names, service, area, status
   (Agreed / Collaborating), and the affiliate platform list. Treated as project information, not proof of live operation.
2. Padosi Pro Brand Guidance PDF (designed by Ram Nagapuri, 11/03/2026): colours, typography, logo rules.

## NOT done in this pass
- **No live research of vendor websites or apps was performed.** No vendor prices, packages, terms, coverage or booking
  requirements have been collected, so none are shown. Every partner displays "Price on request",
  "Availability to be confirmed", and "Details not publicly confirmed".
- Official website URLs for a few partners (Portea, Snabbit, Porter, Shadowfax, MyGate, SpringVerify, Presolv360) and for the
  affiliate platforms were filled in from general knowledge and have **not** been re-checked. All other partners say "Official website to be added".
- Affiliate links point to each platform's homepage. No Cuelinks / tracking IDs are used. Cuelinks itself is a network, so it is not listed as a provider.
- No ratings, reviews, badges, response times or guarantees exist anywhere in the UI.
- Founder-slide commercial notes (e.g. a 10% referral for Care247, settlement model) are deliberately not shown to customers.

## Suggested next step
Go vendor by vendor: confirm the official site, public price or "starting from", cities served, and booking prerequisites,
then fill the optional fields in `src/data/vendors.ts` with a `source` URL for each.
