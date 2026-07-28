import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = async (name) => readFile(new URL(name, root), 'utf8');

test('popup uses DOM listeners instead of CSP-blocked inline event attributes', async () => {
  const popup = await source('popup.js');

  assert.doesNotMatch(popup, /\sonclick=/i);
  assert.doesNotMatch(popup, /\sonload=/i);
  assert.doesNotMatch(popup, /\sonerror=/i);
  assert.match(popup, /addEventListener\(['"]click['"]/);
});

test('content script records image copies only from copy events, not right clicks', async () => {
  const content = await source('content.js');

  assert.doesNotMatch(content, /contextmenu/);
  assert.match(content, /document\.addEventListener\(['"]copy['"]/);
  assert.doesNotMatch(content, /document\.addEventListener\(['"]DOMContentLoaded['"]/);
});

test('background waits for storage persistence before acknowledging a message', async () => {
  const background = await source('background.js');

  assert.match(background, /await handleMessage\(type, data\)/);
  assert.match(background, /sendResponse\(\{ status: 'success' \}\)/);
});
