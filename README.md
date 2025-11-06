# Nexhivra — Single Page Website (Static)

A clean, modern, and responsive single‑page website for Nexhivra (website development agency). Built with HTML + TailwindCSS (CDN) + AOS, with smooth interactions via a small `script.js`.

## Tech Stack
- TailwindCSS via CDN
- AOS (Animate On Scroll)
- Fonts: Poppins, Inter
- Form handling: FormSubmit

## Getting Started
1. Open `index.html` in your browser. No build step required.
2. Replace the contact form email in `index.html`:
   - Find `action="https://formsubmit.co/your@email.com"` and set your email.
   - Optional hidden inputs supported by FormSubmit (e.g., `_next`, `_subject`).

## Deploy
- Netlify: Drag‑and‑drop the folder in Netlify dashboard or run `netlify deploy` (if using CLI).
- GitHub Pages: Commit and push, then enable Pages for the repo. Use the root folder.

## Structure
- `index.html` — All sections: Header/Hero, Services, Why Choose, Pricing, FAQ, Contact, Footer
- `script.js` — AOS init, sticky navbar, smooth scroll, FAQ accordion, back‑to‑top

## Customization
- Colors are defined in Tailwind config block inside `index.html` (charcoal, grayx, paleblue, beige).
- Typography classes use `font-poppins` for headings and `font-inter` for body.
- Update content in each section directly in `index.html`.

## Accessibility & Performance
- Semantic HTML and descriptive labels
- Targets Lighthouse 90+; keep images optimized and avoid heavy third‑party scripts

## Breakpoints Tested
- 360px, 768px, 1024px, 1440px (mobile‑first grid and spacing)

## Notes
- Back‑to‑top button appears after scrolling ~400px
- Sticky navbar applies blur + shadow when scrolling
- FAQ items expand/collapse with smooth icon rotation

## License
This project is provided as‑is for Nexhivra. You may adapt and deploy for your agency website.
