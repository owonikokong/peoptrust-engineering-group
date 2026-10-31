# PeopTrust Engineering Group

PeopTrust Engineering Group is an engineering services and skilled-labour
marketplace in Nigeria. Founded in 2021 and bootstrapped, PeopTrust connects
employers with capable engineering professionals while delivering reliable
technical services, equipment sourcing and project support across civil,
mechanical, electrical and environmental engineering, project management and
industrial maintenance.

**Live site:** https://engisource-nigeria.vercel.app

## Tech stack

- [Next.js](https://nextjs.org) (App Router, JavaScript) with React
- Plain CSS (`app/globals.css`) — no CSS framework
- Hosted and deployed on [Vercel](https://vercel.com)

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

To create a production build:

```bash
npm run build
npm run start
```

## Structure

```
app/
  layout.js        Shared header, navigation and footer
  globals.css      Site-wide styles (green/navy palette)
  page.js          Home page
  services/        Services page
  projects/        Projects page
  about/           About page
  contact/         Contact page
lib/
  data.js          Services and projects content used across pages
```

## Note on this source

This source was rebuilt in October 2026 to match the live site, so that the
code behind the deployed website is preserved in version control. Page content
(services, projects, stats and contact details) mirrors what is published at
the live URL above.
