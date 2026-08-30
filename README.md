# Khai Nguyen — Portfolio

A static personal portfolio site. Plain HTML, CSS, and JavaScript — no build step,
no framework, no dependencies beyond Google Fonts.

```
portfolio/
├── index.html
├── style.css
├── script.js
├── Khai_Nguyen_Resume.pdf
└── README.md
```

## Before you publish

One placeholder still needs your attention in `index.html`:

- **LinkedIn** — currently points to `https://www.linkedin.com/feed/`, which is
  just the logged-in feed, not a personal profile page. Replace it with your
  profile URL (it looks like `linkedin.com/in/your-name`) so it goes somewhere
  useful for someone who isn't logged into your LinkedIn account.
- **Email** — currently set to `nguyen.tank@northeastern.edu` (fixed from a comma
  typo in the resume). Double check this is correct.

GitHub, live demo, and source links are all wired up to your real repos:
- Emberdeep → `github.com/Khaaii1/dungeon-game` / `khaaii1.github.io/dungeon-game/`
- Rubik's Cube Speed Timer → `github.com/Khaaii1/rubik-cube-timer` / `khaaii1.github.io/rubik-cube-timer/`
- Reaction Time Game → `github.com/Khaaii1/reaction-time-game` / `khaaii1.github.io/reaction-time-game/`
- **Resume file** — your resume PDF is already in the repo as `Khai_Nguyen_Resume.pdf`;
  swap in a newer version any time by replacing that file (keep the same name, or
  update the `href` in the hero section).
- **Project screenshots** — the three project previews currently use small live
  canvas animations instead of static images, so there's nothing required here.
  If you'd rather show real screenshots or GIFs, add the image files to the repo
  and swap the `<canvas>` elements for `<img>` tags in `index.html`.

## Customizing

- **Colors, fonts, spacing** — all defined as CSS custom properties at the top of
  `style.css` (the `:root` block). Change a value there and it updates
  everywhere.
- **Adding a project** — copy one of the `<article class="project project-card">`
  blocks in the Projects section and edit the text, tags, and links.
- **Nav sections** — the nav links and section `id`s in `index.html` must match
  (e.g. `href="#projects"` ↔ `<section id="projects">`).

## Deploying to GitHub Pages

1. Create a new GitHub repository (or use an existing one).
2. Push these files to the repository root (or to a `/docs` folder — your choice).
3. In the repo, go to **Settings → Pages**.
4. Under **Source**, choose the branch and folder you pushed to (e.g. `main` / `/root`).
5. Save. GitHub will give you a URL like `https://your-username.github.io/repo-name/`
   within a minute or two.

If you want the site at `https://your-username.github.io` directly (no repo name
in the URL), name the repository `your-username.github.io`.

## Accessibility & performance notes

- Respects `prefers-reduced-motion` — animations and the canvas demos become
  static for users who have that setting on.
- Keyboard-navigable nav and buttons, with a visible focus style and a
  "skip to content" link for screen reader / keyboard users.
- All canvas demos are decorative (`aria-hidden="true"`) and don't carry
  meaningful content, so nothing is lost for assistive tech.
