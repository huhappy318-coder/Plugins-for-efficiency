import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('both extension manifests reference committed entries and avoid unused clipboard-read access', async () => {
  const [chromeManifest, firefoxManifest] = await Promise.all([
    readFile(new URL('manifest.json', root), 'utf8').then(JSON.parse),
    readFile(new URL('manifest.firefox.json', root), 'utf8').then(JSON.parse),
  ]);
  const files = [
    chromeManifest.background.service_worker,
    chromeManifest.action.default_popup,
    ...chromeManifest.content_scripts.flatMap((entry) => entry.js),
    ...firefoxManifest.background.scripts,
    firefoxManifest.browser_action.default_popup,
    ...firefoxManifest.content_scripts.flatMap((entry) => entry.js),
  ];

  await Promise.all(files.map((file) => access(new URL(file, root))));
  assert.ok(!firefoxManifest.permissions.includes('clipboardRead'));
});
