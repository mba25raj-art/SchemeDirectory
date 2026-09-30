// Rendering and filtering for the static, bilingual directory.
const enUi = {
  title:'Scheme Directory', subtitle:'Central and Karnataka government schemes',
  toKannada:'ಕನ್ನಡದಲ್ಲಿ ನೋಡಿ', toEnglish:'View in English',
  all:'All', central:'Central', karnataka:'Karnataka', both:'Both governments',
  browseSector:'Browse by sector', browseGovernment:'Browse by government',
  note:'“Beneficiaries” means the intended audience here. This pilot does not show people served, because comparable constituency-level counts have not been verified.',
  directory:'Scheme directory', selectedRecords:'selected records',
  search:'Search scheme, criteria or department', searchLabel:'Search schemes',
  departmentFilter:'Filter by department', dateFilter:'Filter by application date',
  allDepartments:'All departments', departments:'Departments', allDates:'All date statuses',
  datePublished:'Date published', dateUnknown:'Date not confirmed', windowClosed:'Window closed',
  guidance:'Criteria are a short guide. Read the linked official rules and current notice before applying. A registration link may require sign-in or additional selection.',
  beneficiaries:'Who can benefit', benefits:'What they receive', criteria:'Key eligibility criteria', summary:'Scheme summary',
  applicationDate:'Application date', opened:'Opened', instituteCheck:'Institute check until',
  empty:'No schemes match these filters. Try a broader search.',
  footer:'This independent directory links only to government websites. It does not accept applications. Application windows and scheme rules can change; confirm them on the linked government portal before acting.',
  selectedSchemes:'Selected schemes', sectorsDetail:'Across five focus sectors', centralSchemes:'Central schemes', centralDetail:'Applicable subject to eligibility', stateSchemes:'Karnataka schemes', stateDetail:'State sources', publishedDates:'Published applicant dates', datesDetail:'Verified application window',
  renewalOnly:'Renewal only'
};
let language = 'en', sector = 'All', level = 'All';
try { language = localStorage.getItem('scheme-directory-language') === 'kn' ? 'kn' : 'en'; } catch (_) {}
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ui = key => (language === 'kn' ? knUi : enUi)[key];
const displaySector = value => language === 'kn' ? (knSectors[value] || value) : value;
const displayLevel = value => value === 'Central' ? ui('central') : ui('karnataka');
const displayMinistry = value => language === 'kn' ? (knMinistries[value] || value) : value;
const tr = (scheme, key) => language === 'kn' ? (knSchemes[scheme.name]?.[key] || scheme[key] || '') : (scheme[key] || '');
const summaryOf = scheme => language === 'kn' ? (knSchemes[scheme.name]?.summary || schemeSummaries[scheme.name] || '') : (schemeSummaries[scheme.name] || '');
function statusOf(s) {
  if (!s.deadline) return { text:ui('dateUnknown'), cls:'unknown' };
  return new Date(s.deadline + 'T23:59:59+05:30') >= new Date()
    ? { text:ui('datePublished'), cls:'open' } : { text:ui('windowClosed'), cls:'unknown' };
}
function renderStatic() {
  document.documentElement.lang = language;
  document.title = language === 'kn' ? `${ui('title')} | ಕರ್ನಾಟಕ` : 'Scheme Directory | Karnataka';
  $('meta[name="description"]').content = language === 'kn'
    ? 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮೂಲಗಳ ಆಧಾರಿತ ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಕೇಂದ್ರ.'
    : 'Official-source directory of selected central and Karnataka government schemes.';
  for (const [id,key] of Object.entries({siteTitle:'title',siteSubtitle:'subtitle',browseSector:'browseSector',browseGovernment:'browseGovernment',beneficiaryNote:'note',directoryTitle:'directory',guidance:'guidance',footer:'footer'})) {
    $('#'+id).textContent = ui(key);
  }
  const toggle = $('#languageToggle');
  toggle.textContent = language === 'kn' ? ui('toEnglish') : ui('toKannada');
  toggle.setAttribute('aria-pressed', String(language === 'kn'));
  $('#mobileTabs').setAttribute('aria-label', ui('browseSector'));
  $('#query').placeholder = ui('search');
  $('#query').setAttribute('aria-label', ui('searchLabel'));
  $('#ministry').setAttribute('aria-label', ui('departmentFilter'));
  $('#status').setAttribute('aria-label', ui('dateFilter'));
  const currentMinistry = $('#ministry').value;
  const ministries = [...new Set(schemes.map(s=>s.ministry))].sort();
  $('#ministry').innerHTML = `<option value="all">${esc(ui('allDepartments'))}</option><optgroup label="${esc(ui('departments'))}">${ministries.map(m=>`<option value="${esc(m)}">${esc(displayMinistry(m))}</option>`).join('')}</optgroup>`;
  $('#ministry').value = currentMinistry || 'all';
  const currentStatus = $('#status').value;
  $('#status').innerHTML = `<option value="all">${esc(ui('allDates'))}</option><option value="dated">${esc(ui('datePublished'))}</option><option value="undated">${esc(ui('dateUnknown'))}</option>`;
  $('#status').value = currentStatus || 'all';
  $('#stats').innerHTML = [
    ['selectedSchemes', schemes.length, 'sectorsDetail'],
    ['centralSchemes', schemes.filter(s=>s.level==='Central').length, 'centralDetail'],
    ['stateSchemes', schemes.filter(s=>s.level==='Karnataka').length, 'stateDetail'],
    ['publishedDates', schemes.filter(s=>s.deadline).length, 'datesDetail']
  ].map(([label,count,detail])=>`<div class="stat"><span>${esc(ui(label))}</span><b>${count}</b><small>${esc(ui(detail))}</small></div>`).join('');
}
function drawNav() {
  const counts = value => schemes.filter(s=>value==='All'||s.sector===value).length;
  $('#audienceNav').innerHTML = sectors.map(value=>`<button type="button" data-sector="${esc(value)}" class="${value===sector?'active':''}"><span>${esc(displaySector(value))}</span><em>${counts(value)}</em></button>`).join('');
  $('#mobileTabs').innerHTML = sectors.map(value=>`<button type="button" data-sector="${esc(value)}" class="${value===sector?'active':''}">${esc(displaySector(value))}</button>`).join('');
  $('#levelNav').innerHTML = ['All','Central','Karnataka'].map(value=>`<button type="button" data-l="${value}" class="${value===level?'active':''}"><span>${esc(value==='All'?ui('both'):displayLevel(value))}</span><em>${value==='All'?schemes.length:schemes.filter(s=>s.level===value).length}</em></button>`).join('');
}
function draw() {
  drawNav();
  const q = $('#query').value.trim().toLocaleLowerCase(), ministry = $('#ministry').value, dateFilter = $('#status').value;
  const filtered = schemes.filter(s => {
    const translated = knSchemes[s.name] || {};
    const search = [s.name,s.sector,s.audience,s.ministry,s.beneficiary,s.benefit,s.criteria,
      schemeSummaries[s.name],translated.name,translated.audience,translated.beneficiary,
      translated.benefit,translated.criteria,translated.summary,knSectors[s.sector],knMinistries[s.ministry]]
      .filter(Boolean).join(' ').toLocaleLowerCase();
    return (sector==='All'||s.sector===sector)&&(level==='All'||s.level===level)
      &&(ministry==='all'||s.ministry===ministry)
      &&(dateFilter==='all'||(dateFilter==='dated'?!!s.deadline:!s.deadline))&&search.includes(q);
  });
  $('#count').textContent = language === 'kn'
    ? `${schemes.length}ರಲ್ಲಿ ${filtered.length} ${ui('selectedRecords')}`
    : `${filtered.length} of ${schemes.length} ${ui('selectedRecords')}`;
  const expanded = new Set([...document.querySelectorAll('.scheme-details[open]')].map(el=>el.dataset.name));
  $('#rows').innerHTML = filtered.length ? filtered.map(s=>{
    const st = statusOf(s);
    const qualifier = s.dateQualifier ? (language==='kn' && s.dateQualifier==='Renewal only' ? ui('renewalOnly') : s.dateQualifier) : '';
    return `<article class="card"><div><div class="eyebrow"><span class="pill ${s.level==='Karnataka'?'state':''}">${esc(displayLevel(s.level))}</span><span class="pill">${esc(displaySector(s.sector))}</span><span class="pill ${st.cls}">${esc(st.text)}</span>${qualifier?`<span class="pill">${esc(qualifier)}</span>`:''}</div><h4>${esc(tr(s,'name'))}</h4><div class="field"><span class="field-label">${esc(ui('beneficiaries'))}</span><div class="field-value">${esc(tr(s,'beneficiary'))}</div></div><div class="field"><span class="field-label">${esc(ui('benefits'))}</span><div class="field-value">${esc(tr(s,'benefit'))}</div></div><div class="field"><span class="field-label">${esc(ui('criteria'))}</span><div class="field-value">${esc(tr(s,'criteria'))}</div></div><details class="scheme-details" data-name="${esc(s.name)}" ${expanded.has(s.name)?'open':''}><summary>${esc(ui('summary'))}</summary><p>${esc(summaryOf(s))}</p></details><div class="agency">${esc(displayMinistry(s.ministry))} · ${esc(tr(s,'audience'))}</div></div><div class="meta"><span class="label">${esc(ui('applicationDate'))}</span><span class="${s.deadline?'deadline':'muted'}">${esc(tr(s,'date'))}</span>${s.opened?`<span class="muted">${esc(ui('opened'))} ${esc(tr(s,'opened'))}</span><span class="muted">${esc(ui('instituteCheck'))} ${esc(tr(s,'verification'))}</span>`:''}<div class="links">${s.action?`<a href="${esc(s.action)}" target="_blank" rel="noopener noreferrer">${esc(tr(s,'actionText'))} ↗</a>`:''}<a href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">${esc(tr(s,'type'))} ↗</a></div></div></article>`;
  }).join('') : `<div class="empty">${esc(ui('empty'))}</div>`;
}
$('#languageToggle').addEventListener('click',()=>{
  language = language === 'en' ? 'kn' : 'en';
  try { localStorage.setItem('scheme-directory-language', language); } catch (_) {}
  renderStatic(); draw();
});
document.addEventListener('click', e=>{
  const category = e.target.closest('[data-sector]'), government = e.target.closest('[data-l]');
  if (category) { sector = category.dataset.sector; draw(); }
  if (government) { level = government.dataset.l; draw(); }
});
['query','ministry','status'].forEach(id=>$('#'+id).addEventListener(id==='query'?'input':'change',draw));
renderStatic(); draw();
