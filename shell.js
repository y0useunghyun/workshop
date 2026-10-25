// 워크숍 공통 틀 — 홈·롤/띠·직조·큐브가 모두 이 파일을 불러씀 (약속처럼 같은 헤더·같은 종이)
// 헤더(왼쪽 제목 = 홈으로, 오른쪽 버튼 하나) + 글 종이(오른쪽 위, 한 칸 띄움, EN/KO) + 언어 기억
(function () {
  const HOME = 'https://y0useunghyun.github.io/workshop/';
  const LANG_KEY = 'ws-lang';

  const TEXT = {
    header: { ko: '시각디자인 워크숍', en: 'Visual Design Workshop' },
    langBtn: { ko: { button: 'EN', label: '영어로 보기' }, en: { button: 'KO', label: '한국어로 보기' } },
    close: { ko: '닫기', en: 'Close' },
    paper: {
      home: {
        ko: { title: '30일 프로젝트 1', body: '안녕하세요. 저희는 계원예술대학교 시각디자인 워크숍 수업에서 ‘30일 프로젝트’를 진행했습니다. 30일 동안 팀원 5명이 거침과 부드러움을 주제로, 매체에 상관없이 자료를 수집했습니다. 그리고 수집한 자료를 보여주는 방식에 대해 고민하고, 시도해 보았습니다.' },
        en: { title: '30-Day Project 1', body: 'Hello. In the Visual Design Workshop class at Kaywon University of Art & Design, we carried out the ‘30-Day Project.’ For 30 days, our five team members collected materials on the themes of roughness and softness, regardless of medium. We then explored and experimented with ways of presenting what we collected.' },
      },
      roll: {
        ko: { title: '롤', body: '30일 동안 모은 자료를 한 장의 긴 종이 띠로 이어 키친타올처럼 감았습니다. 거침과 부드러움을 두 롤에 나눠 감고, 종이가 풀려 나오면서 자료가 하나씩 보이게 했습니다. 쌓인 기록을 ‘풀어서 본다’는 감각을 담고 싶었습니다.' },
        en: { title: 'Roll', body: 'We joined everything we collected over 30 days into one long paper strip and wound it like a kitchen towel roll. Roughness and softness are wound on two separate rolls, and each item appears as the paper unrolls. We wanted to capture the feeling of “unrolling” what had piled up.' },
      },
      band: {
        ko: { title: '띠', body: '모든 자료를 하나의 띠로 이어 원으로 둘렀습니다. 처음과 끝이 없는 띠 위에서 거침과 부드러움이 구분 없이 이어지며 돌아갑니다.' },
        en: { title: 'Band', body: 'We linked every item into a single band and wrapped it into a ring. On a band with no beginning or end, roughness and softness run into each other without division as it turns.' },
      },
      weave: {
        ko: { title: '직조', body: '트레이싱지에 뽑은 사진을 길게 오려 띠로 만들고, 거침과 부드러움을 날실과 씨실처럼 엮었습니다. 반투명한 띠가 겹치는 자리에서 두 감각이 섞여 보이도록 했습니다. 직접 띠를 골라 엮어 볼 수도 있습니다.' },
        en: { title: 'Weave', body: 'We printed photos on tracing paper, cut them into long strips, and wove roughness and softness together like warp and weft. Where the translucent strips overlap, the two sensations blend. You can also pick strips and weave your own.' },
      },
      cube: {
        ko: { title: '큐브', body: '사진의 한 부분씩을 큐브의 칸에 붙였습니다. 줄을 돌릴 때마다 서로 다른 자료가 맞붙으며 새로운 조합이 생기고, 칸을 누르면 그 조각이 원래 어떤 사진이었는지 볼 수 있습니다.' },
        en: { title: 'Cube', body: 'We placed a fragment of a photo on each cell of the cube. Every turn of a row brings different materials side by side into new combinations, and tapping a cell shows which photo the fragment came from.' },
      },
    },
  };

  // ── 언어: 페이지를 옮겨도 기억 ──
  const store = {
    get() { try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(LANG_KEY, v); } catch (e) { /* 사생활 보호 모드 등 — 이 페이지에서만 */ } },
  };
  let lang = store.get() === 'en' ? 'en' : 'ko';
  const langFns = [];
  function setLang(l) {
    lang = l;
    store.set(l);
    document.documentElement.lang = l;
    langFns.forEach(fn => fn(l));
  }
  document.documentElement.lang = lang;

  // ── 칸 계산: 홈 바닥 격자와 같은 식 → 종이 위치·크기가 모든 페이지에서 같음 ──
  const G = {
    N: 142, WORKS: 4,
    BIG_DESK: { w: 5, h: 4 }, BIG_PHONE: { w: 4, h: 3 },
    PHONE_MAX: 700, WORK_RATIO: 5 / 4,
    NOTE_H: 5, NOTE_RATIO: 0.22, NOTE_RATIO_PHONE: 0.6,
    EDGE: 1,
  };
  function grid(W, H) {
    const phone = W < G.PHONE_MAX;
    const big = phone ? G.BIG_PHONE : G.BIG_DESK;
    const cellRatio = (big.w / big.h) / G.WORK_RATIO;   // 사진 칸 세로/가로
    const fixed = G.WORKS * big.w * big.h;
    let cols = Math.max(big.w + 2 * G.EDGE, Math.round(W / Math.sqrt(W * H / (G.N + fixed + 4 * G.NOTE_H) / cellRatio)));
    let rows;
    for (;;) {
      rows = Math.max(big.h + 2 * G.EDGE, G.NOTE_H + 1, Math.round(H / (W / cols * cellRatio)));
      if (cols * rows >= G.N + fixed) break;
      cols++;
    }
    // 글 종이: 컴퓨터는 화면 폭 22% - 1칸, 오른쪽 끝에서 한 칸 띄움 / 폰은 60%, 끝에 붙임
    const noteW = phone ? Math.round(cols * G.NOTE_RATIO_PHONE) : Math.max(4, Math.round(cols * G.NOTE_RATIO)) - 1;
    return { phone, big, cols, rows, cw: W / cols, ch: H / rows, noteW, noteC: cols - noteW - (phone ? 0 : 1), noteR: 1 };
  }

  // ── 헤더 ──
  function header(right, onRight) {
    const h = document.createElement('header');
    h.className = 'ws-head';
    h.innerHTML = `<a class="ws-title" href="${HOME}"></a><button class="ws-btn" type="button"></button>`;
    document.body.prepend(h);
    const title = h.querySelector('.ws-title'), btn = h.querySelector('.ws-btn');
    let label = right;
    const draw = () => { title.textContent = TEXT.header[lang]; btn.textContent = label[lang]; };
    btn.addEventListener('click', onRight);
    langFns.push(draw);
    draw();
    return { setRight(l) { label = l; draw(); }, btn };
  }

  // ── 글 종이: 제목은 한 줄에 드는 최대, 본문은 종이를 채우는 최대(최소 16px, 꽉 찬 크기 - 1px) ──
  const BODY_MIN = 16, BODY_MAX = 30, TITLE_MIN = 18, TITLE_MAX = 48;
  const BOTTOM_ROOM = 0.35;   // 아래 여유 (줄 높이 대비)
  const BODY_STEP_DOWN = 1;   // 꽉 찬 크기에서 한 단계 작게 (유승현)

  function paper(key) {
    const el = document.createElement('div');
    el.className = 'paper';
    let content = TEXT.paper[key];
    const sizes = {};
    let last = null;   // 마지막 fit 조건 { rowH, rows }

    const inner = l => `<div class="in" lang="${l}"><h1>${content[l].title}</h1><p>${content[l].body}</p></div>`;
    const setSize = (t, b) => { el.style.setProperty('--tsize', `${t}px`); el.style.setProperty('--bsize', `${b}px`); };
    const measure = l => { el.innerHTML = inner(l); return el.firstElementChild; };
    const oneLine = (l, t) => { setSize(t, BODY_MIN); const h = measure(l).querySelector('h1'); return h.offsetHeight < t * 1.15 * 1.5; };

    // 종이 줄 수 = 두 언어 모두 최소 크기로 들어가는 줄 수(최소 NOTE_H). 그 안에서 언어마다 크기를 따로
    function fit(rowH, fixedRows) {
      const langs = ['ko', 'en'];
      for (const l of langs) {
        let t = TITLE_MAX;
        while (t > TITLE_MIN && !oneLine(l, t)) t--;
        sizes[l] = { t, b: BODY_MIN };
      }
      const need = Math.max(...langs.map(l => { setSize(sizes[l].t, BODY_MIN); return measure(l).offsetHeight; }));
      const rows = fixedRows || Math.max(G.NOTE_H, Math.ceil((need + BOTTOM_ROOM * rowH) / rowH));
      const maxH = rows * rowH - BOTTOM_ROOM * rowH;
      for (const l of langs) {
        let b = BODY_MAX;
        while (b > BODY_MIN) { setSize(sizes[l].t, b); if (measure(l).offsetHeight <= maxH) break; b--; }
        sizes[l].b = Math.max(BODY_MIN, b - BODY_STEP_DOWN);
      }
      last = { rowH, rows };
      render();
      return rows;
    }

    // Adobe 글꼴은 쓰는 한글 글자를 나중에 받아와 글자 폭이 바뀜 → 넘치거나 제목이 두 줄이 되면
    // 종이 크기는 그대로 두고 글자 크기만 다시 맞춤 (크기가 더 안 바뀌면 멈춤)
    const watch = new ResizeObserver(() => {
      if (!last || !el.isConnected) return;
      const h = el.querySelector('h1');
      const broken = el.scrollHeight > el.clientHeight + 1 || h.offsetHeight > parseFloat(getComputedStyle(h).fontSize) * 1.15 * 1.5;
      if (!broken) return;
      const before = JSON.stringify(sizes);
      fit(last.rowH, last.rows);
      if (JSON.stringify(sizes) === before) watch.disconnect();
    });

    function render() {
      if (!sizes[lang]) return;
      setSize(sizes[lang].t, sizes[lang].b);
      const b = TEXT.langBtn[lang];
      el.innerHTML = inner(lang) + `<button class="plang" type="button" aria-label="${b.label}">${b.button}</button>`;
      el.querySelector('.plang').addEventListener('click', () => {
        setLang(lang === 'ko' ? 'en' : 'ko');
        el.querySelector('.plang').focus();
      });
      watch.disconnect();
      watch.observe(el.firstElementChild);
    }
    langFns.push(render);

    return {
      el, fit, render,
      setContent(k) { if (TEXT.paper[k] === content) return; content = TEXT.paper[k]; if (last) fit(last.rowH); },
    };
  }

  // ── 안쪽 페이지: 헤더 「정보」 → 홈 글 상자와 같은 자리에 종이 ──
  function subpage(key) {
    document.body.classList.add('ws-sub');
    const p = paper(key);
    p.el.classList.add('ws-info');
    p.el.hidden = true;
    document.body.appendChild(p.el);
    const info = { ko: '정보', en: 'Info' };
    const head = header(info, () => toggle());

    function place() {
      const g = grid(innerWidth, innerHeight - headH());   // 헤더 아래 화면 = 홈 바닥과 같은 격자
      Object.assign(p.el.style, { left: `${g.noteC * g.cw}px`, top: `${headH() + g.noteR * g.ch}px`, width: `${g.noteW * g.cw}px` });
      const rows = p.fit(g.ch);
      p.el.style.height = `${rows * g.ch}px`;
    }
    function toggle(open = p.el.hidden) {
      p.el.hidden = !open;
      head.setRight(open ? TEXT.close : info);
      head.btn.setAttribute('aria-expanded', open);
      if (open) place();
    }
    head.btn.setAttribute('aria-expanded', 'false');
    addEventListener('resize', () => { if (!p.el.hidden) place(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !p.el.hidden) toggle(false); });
    return { setPaper: k => { p.setContent(k); if (!p.el.hidden) place(); } };
  }

  const headH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ws-head')) || 40;

  window.WS = { TEXT, G, grid, header, paper, subpage, get lang() { return lang; }, setLang, onLang: fn => langFns.push(fn) };
})();
