const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const errors = [];
const warnings = [];
const seen = new Map();

function toDisplay(filePath) {
  return filePath.split(path.sep).join('/');
}

function stripQueryAndHash(value) {
  return value.split('#')[0].split('?')[0];
}

function extractCatalogEntries(source) {
  const entries = [];
  const regex = /\[\s*'([^']+)'\s*,\s*'([^']+\.html)'/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    entries.push({ title: match[1], href: match[2] });
  }
  return entries;
}

function extractRedirectTarget(source) {
  const meta = source.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i);
  if (meta) return stripQueryAndHash(meta[1].trim());

  const script = source.match(/location\.replace\(['"]([^'"]+)['"]\)/i);
  if (script) return stripQueryAndHash(script[1].trim());

  return null;
}

const catalogEntries = extractCatalogEntries(html);

for (const entry of catalogEntries) {
  if (seen.has(entry.href)) {
    warnings.push(`Duplicate catalog href: ${entry.href} (${seen.get(entry.href)} / ${entry.title})`);
  } else {
    seen.set(entry.href, entry.title);
  }

  const targetPath = path.join(root, entry.href);
  if (!fs.existsSync(targetPath)) {
    errors.push(`Missing catalog target: ${entry.href} (${entry.title})`);
  }
}

function auditRedirectFiles(directory, label) {
  if (!fs.existsSync(directory)) return 0;

  let count = 0;
  const htmlFiles = fs.readdirSync(directory)
    .filter((name) => name.endsWith('.html') && !(directory === root && name === 'index.html'));

  for (const file of htmlFiles) {
    const filePath = path.join(directory, file);
    const source = fs.readFileSync(filePath, 'utf8');
    const target = extractRedirectTarget(source);
    if (!target) continue;

    count += 1;
    const resolvedTarget = path.resolve(directory, target);
    if (!resolvedTarget.startsWith(root + path.sep)) {
      errors.push(`Redirect escapes repo root: ${toDisplay(path.relative(root, filePath))} -> ${target}`);
      continue;
    }

    if (!fs.existsSync(resolvedTarget)) {
      errors.push(`Missing redirect target: ${toDisplay(path.relative(root, filePath))} -> ${target}`);
      continue;
    }

    const targetFromRoot = toDisplay(path.relative(root, resolvedTarget));
    const catalogUsesTarget = catalogEntries.some((entry) => entry.href === targetFromRoot);
    if (!catalogUsesTarget) {
      warnings.push(`${label} redirect target is not listed in catalog: ${toDisplay(path.relative(root, filePath))} -> ${target}`);
    }
  }

  return count;
}

const rootRedirectCount = auditRedirectFiles(root, 'Root');
const archiveRedirectCount = auditRedirectFiles(path.join(root, 'Archive'), 'Archive');
const redirectCount = rootRedirectCount + archiveRedirectCount;

if (errors.length || warnings.length) {
  for (const warning of warnings) console.warn(`WARN: ${warning}`);
  for (const error of errors) console.error(`ERROR: ${error}`);
}

if (errors.length) {
  process.exit(1);
}

console.log(`Catalog links OK: ${catalogEntries.length} exams checked, ${redirectCount} redirects checked, 0 missing.`);
