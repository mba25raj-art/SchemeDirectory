import { readFileSync } from 'node:fs';
import { Script, createContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!inline) throw new Error('Missing inline application script');
new Script(inline, { filename: 'index.html' });
for (const file of ['translations-kn.js', 'dashboard.js']) {
  if (!html.includes(`src="${file}"`)) throw new Error(`Missing ${file} script reference`);
  new Script(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), { filename: file });
}

const dataSource = inline.slice(inline.indexOf('const schemes = ['), inline.indexOf('const sectors='));
const context = createContext({});
const { schemes, schemeSummaries } = new Script(`${dataSource}\n({schemes,schemeSummaries})`).runInContext(context);
if (schemes.length === 0) throw new Error('No schemes available');
const translated = readFileSync(new URL('../translations-kn.js', import.meta.url), 'utf8');
const { knUi, knSectors, knMinistries, knSchemes } =
  new Script(`${translated}\n({knUi,knSectors,knMinistries,knSchemes})`).runInContext(createContext({}));
const requiredTranslations = ['name', 'audience', 'beneficiary', 'benefit', 'criteria', 'date', 'type', 'summary'];
for (const sector of new Set(schemes.map(s=>s.sector))) {
  if (!knSectors[sector]) throw new Error(`Missing Kannada sector: ${sector}`);
}
for (const ministry of new Set(schemes.map(s=>s.ministry))) {
  if (!knMinistries[ministry]) throw new Error(`Missing Kannada department: ${ministry}`);
}
for (const [key,value] of Object.entries(knUi)) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Empty Kannada UI label: ${key}`);
}

const officialDomains = ['gov.in', 'nic.in', 'maandhan.in'];
const isOfficial = (raw) => {
  const url = new URL(raw);
  return url.protocol === 'https:' && officialDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
};
for (const scheme of schemes) {
  for (const key of ['name', 'level', 'sector', 'ministry', 'beneficiary', 'benefit', 'criteria', 'date', 'source', 'type']) {
    if (typeof scheme[key] !== 'string' || !scheme[key].trim()) throw new Error(`${scheme.name || 'Unnamed scheme'}: missing ${key}`);
  }
  if (!schemeSummaries[scheme.name]) throw new Error(`${scheme.name}: missing summary`);
  for (const key of ['source', 'action']) {
    if (scheme[key] && !isOfficial(scheme[key])) throw new Error(`${scheme.name}: non-official ${key} URL`);
  }
  if (scheme.action && !scheme.actionText) throw new Error(`${scheme.name}: missing action label`);
  if (scheme.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(scheme.deadline)) throw new Error(`${scheme.name}: invalid deadline`);
  const translation = knSchemes[scheme.name];
  if (!translation) throw new Error(`${scheme.name}: missing Kannada translation`);
  for (const key of [...requiredTranslations, ...(scheme.action ? ['actionText'] : []), ...(scheme.opened ? ['opened', 'verification'] : [])]) {
    if (typeof translation[key] !== 'string' || !translation[key].trim()) {
      throw new Error(`${scheme.name}: missing Kannada ${key}`);
    }
  }
}
console.log(`Validated ${schemes.length} bilingual schemes and their official links.`);
