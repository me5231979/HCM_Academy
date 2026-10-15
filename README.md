# HCM Academy

The landing page for Vanderbilt's HCM Academy: what Human Capital Management is,
a "find your course" task picker, and the six learning areas with their courses.

Built with the Vanderbilt FLH course builder pattern, matching Working Smarter
(`me5231979/Course_Library`, `learn/index.html`): same colors, type, header,
hero, and footer. One self-contained HTML file, no framework,
no build step, no backend. Fonts and lockups live in `assets/`.

## Structure

Kept deliberately short:

1. **Hero**: what an HCM is (people embedded in the business who own the people work for their area) and what the Academy is for: learn, share, meet, get answers.
2. **Choose a topic**: six cards, one per area, each listing its course and sub-course links.
3. **Footer**: contact and accessibility statement.

## Adding a course when it ships

Each course line shows "Coming soon". When a course is live, replace that
`<span class="soon">Coming soon</span>` with `<a href="courses/<slug>/">Open</a>`.

## Open placeholders

Search `[EDIT]` in `index.html`: contact address.

## Accessibility and brand gate

Last run 2026-10-15:

- axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA plus best practice): 0 violations at 1440x900 and at 320px.
- No horizontal scroll at 320px. Console clean.
- Keyboard: skip link works, every link reachable with visible focus.
- Reduced motion turns off smooth scrolling.
- Palette: approved Vanderbilt colors only. Oak (#946E24) measures 4.19:1 on Cream, so cream sections set labels in black and keep gold for ticks and rules.
- Zero em or en dashes.

## Publishing

GitHub Pages: Settings, Pages, Deploy from a branch, pick the branch and `/ (root)`.
The site then lives at `https://me5231979.github.io/HCM_Academy/`.

An internal training prototype, not an official Vanderbilt University site.
