# Applicant Assessment Report Integrator

A Next.js, TypeScript, and Tailwind dashboard that combines **existing** résumé-screening assessments with reviewed 16Personalities results. It does not rescore résumés, change rankings, recommend hiring decisions, or infer personality from résumés.

## Run locally

Requires Node.js 24.x and npm. Use the existing checkout; no Git worktree is needed.

```sh
npm ci
cp .env.example .env.local
# Optionally set OPENAI_API_KEY in .env.local (server-only).
npm run dev
```

Open the development server on port 3000. Without an API key, the complete manual import, matching, and PDF export workflow works. AI extraction requires outbound HTTPS to `api.openai.com`, a valid server-side key, and access to the configured model (default `gpt-4.1-mini`). Restart the server after changing environment variables. Never put a key in a `NEXT_PUBLIC_` variable or commit `.env.local`.

```sh
npm test                # domain, API, and PDF tests
npm run typecheck
npm run build
npm start               # production server after building
npm run test:e2e        # Chromium workflow tests; see below
```

Browser tests use `/usr/bin/chromium` when available. Otherwise run `npx playwright install chromium`; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another browser installation. The test runner starts its own Next.js development server on port 3100.

## Workflow

1. Import a valid, unencrypted screening PDF (up to 12 MB). AI transcribes applicant names, original score strings, rank strings, assessment wording, and source quotations. Any layout can be submitted, but extraction quality varies. Image-only PDFs require a vision-capable PDF model. No sample screening PDF is bundled.
2. **Compare every entry to the original PDF** using the source link. Correct transcription errors or add applicants manually. Preserve source order, spelling, scales, ties, and missing values (`Not stated`). Confirm the import to lock the source fields. Replacing an import clears earlier personality matches; closing the review leaves the existing project intact.
3. Bulk upload up to 100 PNG, JPEG, or WebP screenshots per batch (8 MB each). They are processed sequentially with per-file failures. Unclear types remain blank. Exact, unique name matches only preselect a candidate; they never confirm a match.
4. Review the original screenshot, visible evidence, type, optional A/T variant, and selected applicant. Manually confirm each match. Duplicate confirmed matches are blocked. Reopen a match to correct it.
5. Download individual or consolidated PDFs. Only confirmed personality matches appear; unmatched applicants show a pending result. Original score and rank strings retain their source order and are never sorted by personality.

Exports include integration pages **followed by the complete original screening PDF**, without modifying its pages. Individual exports therefore also contain the other applicants present in the source PDF; review recipients before sharing. The generated summary uses standard PDF fonts; unsupported Unicode characters are rendered as `?`, while the attached original pages retain their original appearance. Arbitrary layouts and long documents require careful human review; AI extraction is a transcription aid, not a source of truth.

## Storage and privacy

Documents, screenshot images, applicant records, and confirmations are saved in this browser's IndexedDB. They are not synced across devices or users. Clearing site data removes the workspace; use **Storage & privacy → Delete local workspace** to remove it deliberately. Large batches may exceed browser storage quotas; save errors are displayed. Report export runs in the browser.

With a configured key, PDF imports and screenshots go through the Next.js server to OpenAI for extraction. Requests use `store: false`; provider retention policies still apply. The application does not log documents or return provider error bodies. No key is sent to the browser. The local workspace is not encrypted and must be used on a trusted device.

This is a single-user development application, with no login, tenant isolation, audit log, or server database. **Do not expose it publicly with an API key** without adding authentication, access control, request rate limits, and organization-specific data policies. The same-origin guard is not authentication. Hosting platforms may enforce smaller request-size or execution-time limits; the provided local Node.js workflow supports the application limits.

## Code map

- `app/page.tsx`: dashboard, reviewed import, bulk uploads, confirmation, IndexedDB storage.
- `app/api/extract/route.ts`: server-only Responses API calls with strict output schemas and validation.
- `lib/model.ts`: source schemas, exact-name suggestions, confirmation invariants.
- `lib/pdf.ts`: local PDF composition and original-source attachment.
- `tests/`: integrity, extraction route, and PDF tests.
- `e2e/`: browser workflow including manual fallback, persistence, confirmation, and exports.

## Verification limits

Automated AI route tests use mocked provider responses. A real OpenAI request needs your key and network access and is not covered by those tests. Manual review remains required even after successful AI extraction. There is no automated suitability evaluation or hiring recommendation.

## Deploy on Vercel

1. Import `ivylieve1997/applicant-assessment-system` into Vercel and select the `main` branch. Use the repository root (not `app/`) as the Root Directory and the **Next.js** framework preset. Node.js **24.x** is pinned in `package.json` and `.nvmrc`. Use `npm ci` to install and `npm run build` to build (the scripts explicitly select Webpack for consistent cloud builds); keep the default Next.js output settings.
2. In Vercel Project Settings → Environment Variables, optionally add **OPENAI_API_KEY** as a sensitive, server-only variable for the deployment environments that need AI. Set **OPENAI_MODEL** to `gpt-4.1-mini` or another model supporting vision, PDF inputs, and structured Responses API output. No `NEXT_PUBLIC_` key is needed. Do not upload `.env.local` or put secrets in `vercel.json`. Redeploy after changing environment variables. Missing credentials leave manual entry available.
3. Enable **Deployment Protection for every deployment you will use with the API key**, including production if it is accessible. Available protection depends on your Vercel plan. If your plan cannot protect production, use a protected preview for private testing or add application authentication and rate limiting before enabling a key on public production. This application is currently single-user; it has no application login or server-side user isolation.
4. Deploy and check the dashboard. Import a non-sensitive test PDF, review and confirm its unchanged score/rank fields, upload a test screenshot, confirm the match, and download both report types. Test a real extraction only after configuring your key; mocked tests do not establish provider authorization or model access.

### Vercel runtime and upload limits

The extraction route explicitly uses the **Node.js** runtime and declares `maxDuration = 120` seconds. Its upstream timeout is 110 seconds. Ensure the selected plan supports that function duration. It uses native `fetch` only; there is no server-side PDF parser, headless browser, Poppler, canvas, or native binary requirement. `pdf-lib` validates source PDFs and generates exports entirely in the browser. Playwright and Chromium are development test tools and do not run during the deployment build.

Vercel Functions impose a [4.5 MB request/response payload limit](https://vercel.com/docs/functions/limitations#request-body-size). To allow for base64 and JSON overhead, AI extraction is limited to **3 MiB per input file**, with a 4.3 MB server request budget. The browser checks the size before sending. Larger files can still be imported locally (PDFs up to 12 MB, screenshots up to 8 MB) using manual transcription and review; they are not sent to the extraction route. Bulk screenshots are sent as separate sequential requests. PDF exports are local downloads and do not pass through a Vercel Function.

Browser-local data belongs to the deployed origin: preview and production URLs have separate IndexedDB workspaces. There is no shared database or cross-device persistence. No applicant uploads, reports, or API keys are required in Git or the deployment bundle.
