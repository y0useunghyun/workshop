// 뒷면 — 작업 4개 + 모은 자료 165개 인덱스. 데이터는 index-data.js (window.INDEX)
const BACK_TEXT = {
  ko: {
    works: '작업', archive: '모은 자료',
    cols: ['번호', '종류', '제목'],
    group: ['거침', '부드러움', '분류 없음'],
    type: { photo: '사진', video: '영상', youtube: '유튜브', link: '링크', text: '글' },
    untitled: '제목 없음',
  },
  en: {
    works: 'Works', archive: 'Archive',
    cols: ['No.', 'Type', 'Title'],
    group: ['Roughness', 'Softness', 'Unsorted'],
    type: { photo: 'Photo', video: 'Video', youtube: 'YouTube', link: 'Link', text: 'Text' },
    untitled: 'Untitled',
  },
};
const FLIP_MS = 350;
const ARROW = '<svg class="go" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8"/></svg>';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderBack(lang, works) {
  const t = BACK_TEXT[lang];
  const workRows = works.map((w, i) => `
    <li><a href="${w.href}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(w.name)}</span><span class="s">${w.sub}</span>${ARROW}</a></li>`).join('');

  const row = r => {
    const title = esc(r.title || t.untitled);
    const thumb = r.thumb ? `<img src="${r.thumb}" alt="" loading="lazy" decoding="async">` : '<i class="nothumb"></i>';
    let cell;
    if (r.type === 'text') cell = `<details><summary>${thumb}${title}</summary><p>${esc(r.text)}</p></details>`;
    else if (r.href) cell = `<a href="${esc(r.href)}" target="_blank" rel="noopener">${thumb}${title}</a>`;
    else cell = `<span>${thumb}${title}</span>`;
    return `<tr><td class="n">${String(r.n).padStart(3, '0')}</td><td class="ty">${t.type[r.type]}</td><td class="ti">${cell}</td></tr>`;
  };
  // 거침 → 부드러움 → 분류 없음 순으로 묶어서 나열
  const groups = [0, 1, null].map((g, i) => ({ name: t.group[i], list: INDEX.filter(r => r.g === g) })).filter(x => x.list.length);
  const head = `<thead><tr>${t.cols.map((c, i) => `<th class="${['n', 'ty', 'ti'][i]}">${c}</th>`).join('')}</tr></thead>`;
  const sections = groups.map(x => `
      <h3>${x.name} <small>${x.list.length}</small></h3>
      <table>${head}<tbody>${x.list.map(row).join('')}</tbody></table>`).join('');

  document.getElementById('back').innerHTML = `
    <div class="bk">
      <h2>${t.works} <small>${works.length}</small></h2>
      <ol class="works">${workRows}</ol>
      <h2>${t.archive} <small>${INDEX.length}</small></h2>
${sections}
    </div>`;
}

// 앞면 ↔ 뒷면 뒤집기: 반 바퀴 돌아 사라지고, 반대편이 반 바퀴 돌아 나옴
function flipTo(from, to, animate) {
  if (!animate) { from.hidden = true; to.hidden = false; return Promise.resolve(); }
  const turn = deg => ({ transform: `perspective(1600px) rotateY(${deg}deg)` });
  return from.animate([turn(0), turn(90)], { duration: FLIP_MS, easing: 'ease-in' }).finished.then(() => {
    from.hidden = true;
    to.hidden = false;
    return to.animate([turn(-90), turn(0)], { duration: FLIP_MS, easing: 'ease-out' }).finished;
  });
}
