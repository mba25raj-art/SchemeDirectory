# Scheme Directory

A static directory of selected central and Karnataka government schemes in education, agriculture, labour, rural development and MSME. The public dashboard is `index.html` at the repository root and links only to government-operated sources.

## Publishing

GitHub Pages is configured to publish from the `main` branch at `/(root)`. Each push to `main` automatically rebuilds the public site. The `.github/workflows/pages.yml` workflow validates records; GitHub's branch-based Pages build publishes the HTML. Run `node scripts/check-site.mjs` before committing.

## Weekly source review

The recurring review runs from ChatGPT Work. For each record, check the linked official scheme page, guidelines, current announcement and application route. Update eligibility, benefit, dates and URLs only when an official source clearly supports the change. Do not infer a new window from an old notice. If sources conflict or a link is unavailable, preserve the last verified record and flag it for review. Commit only when `index.html` changed; GitHub Pages then republishes the new commit.

The directory is a guide, not a government service or eligibility decision. Application rules and windows should be confirmed on the official linked source.
