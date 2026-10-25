// 뒷면(인덱스) — 작업 4개 + 모은 자료 165개. 데이터는 index-data.js (window.INDEX)
// 자료 줄을 누르면 목록이 두 칸으로 갈라지며 오른쪽에 크게 보임 (폰은 아래에서 올라옴)
const BACK_TEXT = {
  ko: {
    works: '작업', archive: '모은 자료',
    cols: ['번호', '종류', '제목'],
    group: ['거침', '부드러움'],
    type: { photo: '사진', video: '영상', youtube: '유튜브', link: '링크', text: '글' },
    untitled: '제목 없음', open: '원본 열기', close: '닫기',
  },
  en: {
    works: 'Works', archive: 'Archive',
    cols: ['No.', 'Type', 'Title'],
    group: ['Roughness', 'Softness'],
    type: { photo: 'Photo', video: 'Video', youtube: 'YouTube', link: 'Link', text: 'Text' },
    untitled: 'Untitled', open: 'Open original', close: 'Close',
  },
};
const FLIP_MS = 350;
const ARROW = '<svg class="go" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8"/></svg>';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const no = n => String(n).padStart(3, '0');

let backLang = 'ko';
let openN = null;   // 지금 크게 보는 자료 번호

function renderBack(lang, works) {
  backLang = lang;
  const t = BACK_TEXT[lang];
  const workRows = works.map((w, i) => `
    <li><a href="${w.href}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(w.name)}</span><span class="s">${w.sub}</span>${ARROW}</a></li>`).join('');

  const rows = INDEX.map(r => {
    const thumb = r.thumb ? `<img src="${r.thumb}" alt="" loading="lazy" decoding="async">` : '<i class="nothumb"></i>';
    return `<tr data-n="${r.n}"><td class="n">${no(r.n)}</td><td class="ty">${t.type[r.type]}</td>
      <td class="ti"><button type="button" aria-controls="view">${thumb}<span>${esc(r.title || t.untitled)}</span></button></td></tr>`;
  }).join('');

  document.getElementById('back').innerHTML = `
    <div class="bk">
      <h2>${t.works} <small>${works.length}</small></h2>
      <ol class="works">${workRows}</ol>
      <h2>${t.archive} <small>${INDEX.length}</small></h2>
      <div class="arch">
        <table>
          <thead><tr>${t.cols.map((c, i) => `<th class="${['n', 'ty', 'ti'][i]}">${c}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <aside id="view" aria-live="polite"></aside>
      </div>
    </div>`;

  document.querySelector('#back tbody').addEventListener('click', e => {
    const tr = e.target.closest('tr[data-n]');
    if (tr) showItem(+tr.dataset.n === openN ? null : +tr.dataset.n);
  });
  showItem(openN);
}

// 오른쪽(폰은 아래) 보기 칸 — n이 null이면 닫음
function showItem(n) {
  openN = n;
  const t = BACK_TEXT[backLang];
  const arch = document.querySelector('#back .arch');
  const view = document.getElementById('view');
  document.querySelectorAll('#back tr.on').forEach(tr => tr.classList.remove('on'));
  arch.classList.toggle('open', n != null);
  if (n == null) { view.replaceChildren(); return; }

  const r = INDEX[n - 1];
  document.querySelector(`#back tr[data-n="${n}"]`).classList.add('on');
  // 컴퓨터: 목록 칸을 화면 맨 위로 올려 보기 칸이 화면 안에 다 들어오게
  const back = document.getElementById('back');
  if (innerWidth >= 700 && back.scrollTop < arch.offsetTop) back.scrollTo({ top: arch.offsetTop, behavior: 'smooth' });
  let media = '';
  if (r.type === 'youtube') media = `<iframe src="https://www.youtube-nocookie.com/embed/${r.yt}" title="${esc(r.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  else if (r.type === 'video') media = `<video src="${r.full}" controls autoplay muted loop playsinline></video>`;
  else if (r.full) media = `<img src="${r.full}" alt="${esc(r.title)}">`;
  const meta = `${no(r.n)} · ${t.type[r.type]}${r.g == null ? '' : ' · ' + t.group[r.g]}`;
  const link = r.type === 'link' || r.type === 'youtube' ? `<a class="open" href="${esc(r.href)}" target="_blank" rel="noopener">${t.open} ${ARROW}</a>` : '';

  view.innerHTML = `
    <div class="v-in">
      <button type="button" class="x" aria-label="${t.close}">✕</button>
      ${media ? `<div class="media ${r.type}">${media}</div>` : ''}
      <p class="meta">${meta}</p>
      <h4>${esc(r.title || t.untitled)}</h4>
      ${r.text ? `<p class="txt">${esc(r.text)}</p>` : ''}
      ${link}
    </div>`;
  view.querySelector('.x').addEventListener('click', () => showItem(null));
}

addEventListener('keydown', e => { if (e.key === 'Escape' && openN != null) showItem(null); });

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
