# TenJ Lab website

A simple, self-contained website for the TenJ Lab (UCLA School of Nursing).
No build tools, no frameworks — just HTML and CSS you can edit directly.

## Files

```
tenjlab-site/
├── index.html         ← Home / About
├── team.html          ← Team members
├── news.html          ← Lab News
├── publications.html  ← Publications
├── projects.html      ← Current Projects
├── contact.html       ← Contact + form
├── css/styles.css     ← All colors & styling (edit here once, applies everywhere)
├── js/main.js         ← Mobile menu toggle
└── images/            ← Put team photos / logo here
```

## How to preview locally

Just double-click any `.html` file to open it in your browser. That's it.

(Or, for a more realistic preview, run a tiny local server from this folder:
`python3 -m http.server` then visit `http://localhost:8000`.)

## How to edit content

- **Text:** open the relevant `.html` file and edit the words between the tags.
- **Add a publication:** in `publications.html`, copy one `<li class="pub">…</li>`
  block and change the details. Newest goes at the top.
- **Add a news post:** in `news.html`, copy one `<article class="news-item">…</article>` block.
- **Add a team member:** in `team.html`, copy one `<div class="person card">…</div>` block.
- **Change colors:** edit the variables at the top of `css/styles.css` (`:root { … }`).

## Adding real photos

1. Drop image files into the `images/` folder (e.g. `images/dante.jpg`).
2. In `team.html`, replace a placeholder:
   ```html
   <div class="person__photo person__photo--placeholder">DT</div>
   ```
   with:
   ```html
   <img class="person__photo" src="images/dante.jpg" alt="Dante Anthony Tolentino" />
   ```

## The contact form

A static site can't send email on its own. The form in `contact.html` is wired
for [Formspree](https://formspree.io) (free tier):
1. Create a free form at formspree.io.
2. Replace `YOUR_FORM_ID` in `contact.html` with the ID they give you.
Until then, the `tenjlab@sonnet.ucla.edu` email link works for everything.

## How to publish (pick one — all free)

- **GitHub Pages:** create a repo, upload these files, enable Pages. Can point
  your `tenjlab.org` domain at it.
- **Netlify / Cloudflare Pages:** drag-and-drop this folder onto their dashboard.
- **Keep Wix:** you can also just use this as a local draft/working copy and copy
  text into Wix by hand.

> Note: Wix does not allow importing an external site, so "publishing" means
> hosting these files somewhere other than Wix and (optionally) pointing the
> tenjlab.org domain there.

## Content note

The original site duplicated Paul Boy's bio under Rey Paolo Roca III; that bio is
marked "Bio coming soon" in `team.html` — replace it with Rey's real bio.
