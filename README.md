# PatchPulse

PatchPulse is a single-page React application that turns the [National Vulnerability Database (NVD) API](https://nvd.nist.gov/developers/vulnerabilities) into a live triage dashboard. Security teams can see newly published CVEs, filter them by keyword, severity, and publish date, open a detail view with patch guidance, and track each vulnerability on a team watchlist from "To Do" to "Patched."

## Features (MVP)

- Email and password sign-in with protected routes and an admin-only area (role-based authorization)
- Live feed of CVEs published in the last 24 hours, 72 hours, or 7 days
- Browse page with debounced keyword search (sent to the NVD), severity checkboxes, sorting, and pagination
- Dynamic CVE detail page with CVSS data, CWE weaknesses, and a "How to Patch" section built from references tagged `Patch` or `Vendor Advisory`
- Watchlist with remediation status, due date, and (for admins) assignee; persisted to `localStorage`
- Admin page for assigning CVEs to analysts and seeing each analyst's workload
- Mobile-first responsive layout, with loading and error states for every API request

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # run the Vitest suite once
npm run test:watch
npm run lint
npm run build
```

### Demo accounts

There is no backend yet, so sign-in checks against built-in demo accounts. The password for every account is `patchpulse`.

| Email                    | Role    |
| ------------------------ | ------- |
| `analyst@patchpulse.dev` | Analyst |
| `sam@patchpulse.dev`     | Analyst |
| `admin@patchpulse.dev`   | Admin   |

## Routes

| Path            | Type    | Access        |
| --------------- | ------- | ------------- |
| `/login`        | static  | public        |
| `/dashboard`    | static  | authenticated |
| `/cves`         | static  | authenticated |
| `/cves/:cveId`  | dynamic | authenticated |
| `/watchlist`    | static  | authenticated |
| `/admin`        | static  | admin only    |
| `*`             | 404     | public        |

## Project structure

```
src/
  components/   Reusable UI: Header, NavBar, Layout, Card, CveCard, FilterPanel, ProtectedRoute, ...
  pages/        One component per route
  contexts/     React Context objects and their providers (Auth, CveData, Watchlist)
  hooks/        useAuth, useWatchlist, useCveData, useCveFeed, useDebounce
  utils/        NVD API service, CVE formatting, filtering, validation, storage helpers
  test/         Vitest setup, fixtures, and render helpers
  __tests__/    Unit and integration tests
```

## State management

- **Local state (`useState`)**: login form fields and errors, Browse filters and current page, the mobile menu toggle, and the Watchlist status filter.
- **`AuthContext`**: the signed-in user, token, `login()`, and `logout()`. Persisted to `localStorage` so a refresh keeps the session.
- **`CveDataContext`**: a cache of NVD responses keyed by time window and keyword, plus a CVE-by-ID map. The Dashboard and Browse pages share a single request, and the detail page reads from the cache before falling back to a `cveId` lookup. Cached entries live for 5 minutes, and duplicate in-flight requests are collapsed.
- **`WatchlistContext`**: saved CVEs with remediation status, assignee, and due date, managed by an immutable reducer. The navbar badge, Watchlist page, detail page, and Admin page all read from it.

## NVD API notes

- Endpoint: `GET https://services.nvd.nist.gov/rest/json/cves/2.0`
- Without an API key the NVD allows 5 requests per 30 seconds. PatchPulse caches responses and shows a clear "rate limit reached" message with a retry button if the limit is hit.
- The NVD returns results oldest-first, so when a time window has more than 200 CVEs the app requests the last page to show the newest ones.
