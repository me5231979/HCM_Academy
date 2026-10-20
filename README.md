# HCM Academy

The landing page for Vanderbilt's HCM Academy: what the HCM role is, what the
Academy is for, and the topics with their courses.

Built with the Vanderbilt FLH course builder pattern, matching Working Smarter
(`me5231979/Course_Library`, `learn/index.html`): same colors, type, header,
hero, and footer. One self-contained HTML file, no framework,
no build step, no backend. Fonts and lockups live in `assets/`.

## Structure

Kept deliberately short:

1. **Hero**: what an HCM is (people embedded in the business who own the people work for their area) and what the Academy is for: learn, share, meet, get answers.
2. **Choose a topic**: a progress panel, a search box that searches every topic, and a row of horizontal topic tabs (built from the cards, so a new card gets a tab automatically; its `data-short` attribute is the tab label, and each tab shows its completed/total count). One topic shows at a time, full width, with training topics and job aids side by side. There are eight topics (Start Here plus seven topic areas). Each card, or each subsection in it (Compensation Management; Position Management, Assignment Changes, Offboarding), lists its Training topics (clickable, count toward completion) and a collapsible Job aids & resources list (reference only).
   Below the cards, "Help for every topic" lists the resource types planned across all topics.
3. **Footer**: contact and accessibility statement.

## Assessments and completion (mock-up)

- **Pre-assessment** pops up on the first visit: one placeholder question per topic, not graded, and it lists the topics to start with.
- **Course completion**: every course line is a button; clicking it toggles a green check circle (mock-up stand-in for finishing the real course).
- **Final assessment** opens automatically once every course is complete (also from the progress panel). 90% or higher marks HCM Academy complete; below that offers a retake. Pass mark: `PASS` in the last script.
- **Demo controls** in the progress panel: Mark all complete, Reset demo.
- Progress is saved only in this browser (`localStorage` keys `hcm-pre`, `hcm-done`, `hcm-final`); nothing is sent anywhere.
- To add real questions, replace `buildQs` placeholder text with a question bank per topic.

## Adding a course when it ships

Each course line shows "Coming soon". When a course is live, replace that
`<span class="soon">Coming soon</span>` with `<a href="courses/<slug>/">Open</a>`.

## Contact

pcb@vanderbilt.edu

## Accessibility and brand gate

Last run 2026-10-20:

- axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA plus best practice): 0 violations at 1440x900 and at 320px.
- No horizontal scroll at 320px. Console clean.
- Keyboard: skip link works, every control reachable with visible focus; topic tabs follow the ARIA tabs pattern (arrow keys, Home, End).
- Reduced motion turns off smooth scrolling.
- Palette: approved Vanderbilt colors only. Oak (#946E24) measures 4.19:1 on Cream, so cream sections set labels in black and keep gold for ticks and rules.
- Zero em or en dashes.

## Publishing

GitHub Pages: Settings, Pages, Deploy from a branch, pick the branch and `/ (root)`.
The site then lives at `https://me5231979.github.io/HCM_Academy/`.

An internal training prototype, not an official Vanderbilt University site.
