# ClipNest

ClipNest is a local browser extension that records copied text, copied URLs, and copied image references. It retains up to 50 items in each category and lets the user copy, open, delete, or clear those local records from the popup.

## Scope and privacy

- Data is stored only in `storage.local` for the installed browser profile.
- The extension does not upload, sync, or inspect the system clipboard outside explicit copy events.
- An image reference is stored only when the copy event originates on an image element; opening a context menu does not record anything.
- Stored image entries contain a source URL and page URL, not image bytes.

## Install for development

### Chrome or Edge

1. Open `chrome://extensions/` or `edge://extensions/`.
2. Enable Developer mode.
3. Select **Load unpacked** and choose this `clipnest/` directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Choose `manifest.firefox.json` from this directory.

Firefox support is for temporary local loading; it is not a store-release claim.

## Verify

Node.js 20+ is sufficient; this extension has no runtime npm dependencies.

```bash
npm test
node --check popup.js
node --check content.js
node --check background.js
```

Then load the extension and manually verify: copying text, copying a URL, copying an image through the browser copy command, reopening the popup, deleting an item, and clearing history.

## Files

- `popup.js` — CSP-safe popup rendering and controls.
- `content.js` — explicit copy-event capture.
- `background.js` — deduplicated local persistence and retention limit.
- `manifest*.json` — Chrome/Edge MV3 and Firefox temporary-load entries.
- `icons/` — committed extension icons.
