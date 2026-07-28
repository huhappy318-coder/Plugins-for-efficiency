# ClipNest maintenance notes

## Product contract

ClipNest is a local clipboard-history extension. It captures only user copy events, stores a maximum of 50 entries per category, and makes no network request. Do not claim cloud sync, Firefox store support, clipboard monitoring outside copy events, or image-byte storage.

## Source of truth

- Product source: `clipnest/`
- Chrome/Edge entry: `clipnest/manifest.json`
- Firefox temporary-load entry: `clipnest/manifest.firefox.json`
- Regression checks: `clipnest/tests/*.test.mjs`

## Verification

```bash
cd clipnest
npm test
node --check popup.js
node --check content.js
node --check background.js
```

Test both manifests in the browser before releasing. Confirm the popup works under the extension's CSP, a right-click on an image stores nothing, and a message acknowledgement arrives only after storage persistence completes.

## Data handling

- Never add analytics, external storage, or network requests without a new explicit product contract.
- Treat captured text, URLs, and image references as sensitive local data.
- Keep only the committed icons; do not add user images, exports, or `node_modules` to Git.
