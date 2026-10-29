import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

function withPublishedSite(check) {
  const workflow = readFileSync(join(root, '.github/workflows/pages.yml'), 'utf8');
  const step = workflow.match(/      - name: Prepare static site\r?\n        run: \|\r?\n((?:          [^\n]*(?:\n|$))+)/);
  assert.ok(step, 'Exercise the actual Pages packaging step');
  const commands = step[1].trimEnd().split(/\r?\n/).map(line => line.slice(10)).join('\n');
  const temp = mkdtempSync(join(tmpdir(), 'field-pages-artifact-'));
  try {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (entry.isFile()) copyFileSync(join(root, entry.name), join(temp, entry.name));
    }
    cpSync(join(root, 'experiments'), join(temp, 'experiments'), { recursive: true });
    const shell = process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : 'bash';
    execFileSync(shell, ['--noprofile', '--norc', '-c', commands], {
      cwd: temp, env: { ...process.env, BASH_ENV: '' }, stdio: 'pipe',
    });
    check(join(temp, '_site'));
  } finally {
    assert.equal(dirname(resolve(temp)), resolve(tmpdir()));
    assert.ok(basename(temp).startsWith('field-pages-artifact-'));
    rmSync(temp, { recursive: true, force: true });
  }
}

function assertGuideLinksResolve(site) {
  for (const name of ['README.md', 'README.en.md']) {
    const text = readFileSync(join(site, name), 'utf8');
    for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#')) continue;
      const target = resolve(site, decodeURIComponent(href.split(/[?#]/)[0]));
      assert.ok(target.startsWith(`${resolve(site)}${sep}`), `${name}: link stays in the published site`);
      assert.ok(existsSync(target), `${name}: missing published link ${href}`);
    }
  }
}

function assertEntryAssetsResolve(site) {
  const html = readFileSync(join(site, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/<(?:link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)]
    .map(([, href]) => href)
    .filter(href => !/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#'));
  assert.ok(refs.includes('style.css'), 'the entry page links its stylesheet');
  assert.ok(refs.includes('app.js'), 'the entry page loads its application module');
  for (const href of refs) {
    const target = resolve(site, decodeURIComponent(href.split(/[?#]/)[0]));
    assert.ok(target.startsWith(`${resolve(site)}${sep}`), `entry asset stays in the published site: ${href}`);
    assert.ok(existsSync(target), `missing published entry asset ${href}`);
  }
  const app = readFileSync(join(site, 'app.js'), 'utf8');
  for (const [, href] of app.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g)) {
    const target = resolve(site, href);
    assert.ok(target.startsWith(`${resolve(site)}${sep}`), `module import stays in the published site: ${href}`);
    assert.ok(existsSync(target), `missing published module import ${href}`);
  }
}

test('the Pages artifact serves both guides and their local documentation links', () => {
  withPublishedSite(site => {
    assertGuideLinksResolve(site);
    assert.equal(readFileSync(join(site, 'README.en.md'), 'utf8'), readFileSync(join(root, 'README.en.md'), 'utf8'));
  });
});

test('a package missing the linked technical guide is rejected', () => {
  withPublishedSite(site => {
    const target = resolve(site, 'README.en.md');
    assert.equal(dirname(target), resolve(site));
    rmSync(target);
    assert.throws(() => assertGuideLinksResolve(site), /missing published link README\.en\.md/);
  });
});

test('the Pages artifact contains the entry stylesheet, script and module imports', () => {
  withPublishedSite(assertEntryAssetsResolve);
});

test('a package without the entry stylesheet is rejected', () => {
  withPublishedSite(site => {
    rmSync(join(site, 'style.css'));
    assert.throws(() => assertEntryAssetsResolve(site), /missing published entry asset style\.css/);
  });
});
