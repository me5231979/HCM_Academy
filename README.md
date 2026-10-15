# HCM Academy

The landing page for Vanderbilt's HCM Academy: what Human Capital Management is,
a "find your course" task picker, and the six learning areas with their courses.

Built with the Vanderbilt FLH course builder pattern, matching Working Smarter
(`me5231979/Course_Library`, `learn/index.html`): same tokens, theme scopes,
nav, hero, manifesto, Chancellor's charge, concept blocks, bridges, flip cards,
router, closing CTA, and footer. One self-contained HTML file, no framework,
no build step, no backend. Fonts and lockups live in `assets/`.

## Structure

| Section | Anchor | Notes |
| --- | --- | --- |
| Hero: the role of HCM | `#top` | What HCM is, Bloom's-verb outcomes for the series |
| Belief | `#start` | Manifesto creed |
| Chancellor's charge | `#mission` | Required in every course; two slots adapted for HCM |
| What HCM is | `#role` | Four jobs, eight-term flip-card vocabulary, six-area lifecycle |
| Find your course | `#find` | Ten-task router that points to an area or sub-course |
| 01 Recruitment & Hiring | `#recruiting` | |
| 02 Payroll & Timecards | `#payroll` | Sub: Compensation Management `#compensation` |
| 03 Onboarding, Offboarding, Transfers & Managing Positions | `#positions` | Subs: `#position-updates`, `#assignment-changes`, `#offboarding` |
| 04 Leave Management | `#leave` | |
| 05 Costing Management | `#costing` | |
| 06 Student Hiring and Assignment Changes | `#students` | |

## Adding a course when it ships

Each course card carries an "In development" status and a commented-out link.
When a course is live:

1. Build it in `courses/<slug>/index.html` with the vu-course-builder skill.
2. In `index.html`, find the card (search the slug, e.g. `courses/leave-management/`).
3. Replace the `<span class="c-status">…</span>` with the commented `<a class="btn btn-primary btn-sm" …>Start course</a>` and remove the comment.

Planned slugs: `recruitment-hiring`, `payroll-timecards`, `compensation-management`,
`onboarding-positions`, `position-updates`, `assignment-changes`, `offboarding`,
`leave-management`, `costing-management`, `student-hiring`.

## Open placeholders

Search `[EDIT]` in `index.html`: system name (Oracle HCM Cloud assumed), hero
audience line, contact address.

## Accessibility and brand gate

Last run 2026-10-15:

- axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA plus best practice): 0 violations at 1440x900 and at 320px.
- No horizontal scroll at 320px. Console clean.
- Keyboard: skip link, every control reachable, mobile menu moves focus in and returns it on Escape, in-page links move focus to the target heading, router result announced through a live region.
- Reduced motion stops the marquee and smooth scrolling.
- Palette: approved Vanderbilt colors only. Oak (#946E24) measures 4.19:1 on Cream, so cream sections set labels in black and keep gold for ticks and rules.
- Zero em or en dashes.

## Publishing

GitHub Pages: Settings, Pages, Deploy from a branch, pick the branch and `/ (root)`.
The site then lives at `https://me5231979.github.io/HCM_Academy-/`.

An internal training prototype, not an official Vanderbilt University site.
