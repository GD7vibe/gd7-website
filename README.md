# GD7 Ltd website

Static site: plain HTML, CSS and JavaScript. No build step.

## Run locally
    npx serve .
or open `index.html` directly (the 3D viewer check needs a server).

## Deploy to Vercel
1. Put this folder in a GitHub repo (or run `vercel` from inside the folder).
2. Vercel -> Add New Project -> import the repo. Framework preset: **Other**. No build command, output directory blank.
3. Project -> Settings -> Domains. Add all four:
   - `www.gd7.co.uk` (set as primary)
   - `gd7.co.uk`
   - `www.gd7.co`
   - `gd7.co`
4. Set DNS at your registrar to the exact values Vercel shows for each domain (apex A record, `www` CNAME).
5. `vercel.json` already 301-redirects `gd7.co.uk`, `gd7.co` and `www.gd7.co` to `https://www.gd7.co.uk`.

## Add your content
- **Project photos:** put images in `assets/projects/`, then on a project card in `index.html` add `data-img="assets/projects/yourfile.webp"`.
- **Project videos:** upload to YouTube (unlisted is fine), then add `data-video="YOUTUBE_ID"` to the card.
- **3D model:** export SketchUp -> glTF/GLB, save as `assets/models/monopile-extraction.glb`. The viewer appears automatically.
- **Replace placeholders:** search `index.html` for `[ADD]` (company number, registered office) and `info@gd7.co.uk` (your real email).
- Edit each card's `data-desc` with real scope and outcomes.

## Before publishing
- Get written client clearance (EON and others) for any project name, image or detail.
- Show only what your patent attorney has cleared for the monopile extraction system. The page shows a generic concept animation only.
- The "Illustrative comparison" bars in the UXO tab are not data. Replace or remove them.
- Contact form opens the visitor's email app. For a hosted form, use Formspree or a Vercel function later.
