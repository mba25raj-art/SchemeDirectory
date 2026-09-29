# Scheme Directory

A static directory of selected central and Karnataka government schemes in education, agriculture, labour, rural development and MSME. The public site is generated from `dist/index.html` and links only to government-operated sources.

## Publishing

Enable **Settings → Pages → Build and deployment → GitHub Actions** in the GitHub repository. The `pages.yml` workflow checks the records and publishes `dist/` on each push to `main`. The repository must allow GitHub Actions and Pages deployments.

## Weekly source review

The recurring review runs from ChatGPT Work once the GitHub repository is connected and its schedule is created. For each record, check the linked official scheme page, guidelines, current announcement and application route. Update eligibility, benefit, dates and URLs only when an official source clearly supports the change. Do not infer a new window from an old notice. If sources conflict or a link is unavailable, preserve the last verified record and flag it for review. Run `node scripts/check-site.mjs` before committing. Commit only when the dashboard data changed; GitHub Pages then republishes the new commit.

The directory is a guide, not a government service or eligibility decision. Application rules and windows should be confirmed on the official linked source.
