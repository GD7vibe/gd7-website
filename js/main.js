(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV ---------- */
  var nav = $('#nav'), burger = $('#burger'), links = $('#links');
  window.addEventListener('scroll', function () { nav.classList.toggle('solid', window.scrollY > 30); }, { passive: true });
  burger.addEventListener('click', function () {
    var o = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  $$('#links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); }); });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- HERO CANVAS: network + turbines on the horizon ---------- */
  var cv = $('#heroCanvas'), ctx = cv.getContext('2d'), W, H, pts = [], mouse = { x: -999, y: -999 };
  function size() {
    var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.floor(W * H / 14000); pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H * 0.78, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 });
  }
  window.addEventListener('resize', size); size();
  cv.parentElement.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
  var t0 = 0;
  function turbine(x, y, s, ang) {
    ctx.strokeStyle = 'rgba(148,180,210,.55)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 90 * s); ctx.stroke();
    for (var k = 0; k < 3; k++) {
      var a = ang + k * 2.094;
      ctx.beginPath(); ctx.moveTo(x, y - 90 * s); ctx.lineTo(x + Math.cos(a) * 48 * s, y - 90 * s + Math.sin(a) * 48 * s); ctx.stroke();
    }
  }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    var horizon = H * 0.82;
    // sea gradient
    var g = ctx.createLinearGradient(0, horizon, 0, H); g.addColorStop(0, 'rgba(12,48,71,.55)'); g.addColorStop(1, 'rgba(4,16,26,.9)');
    ctx.fillStyle = g; ctx.fillRect(0, horizon, W, H - horizon);
    ctx.strokeStyle = 'rgba(34,211,238,.35)'; ctx.lineWidth = 1;
    for (var w = 0; w < 5; w++) {
      ctx.beginPath();
      for (var x = 0; x <= W; x += 12) {
        var yy = horizon + 10 + w * 14 + Math.sin(x / 70 + t / 900 + w) * (2 + w);
        if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    // turbine row
    var ang = t / 2600;
    for (var i = 0; i < 7; i++) { var tx = W * (0.38 + i * 0.1); turbine(tx, horizon, 0.45 + (i % 3) * 0.1, ang + i); }
    // particles
    for (var a = 0; a < pts.length; a++) {
      var p = pts[a];
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H * 0.78) p.vy *= -1;
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { p.x += dx / 40; p.y += dy / 40; }
      ctx.fillStyle = 'rgba(34,211,238,.7)'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
      for (var b = a + 1; b < pts.length; b++) {
        var q = pts[b], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
        if (dd < 13000) { ctx.strokeStyle = 'rgba(34,211,238,' + (0.16 * (1 - dd / 13000)) + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduce) frame(0);

  /* ---------- REVEAL + COUNTERS ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.count, suf = el.dataset.suffix || '', start = performance.now();
      (function tick(n) {
        var k = Math.min((n - start) / 1400, 1), v = Math.round(target * (1 - Math.pow(1 - k, 3)));
        el.textContent = v + suf; if (k < 1) requestAnimationFrame(tick);
      })(start);
      cio.unobserve(el);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* spotlight on service cards */
  $$('.svc').forEach(function (c) {
    c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* ---------- EXPLORER ---------- */
  var info = {
    met: { tag: 'DESIGN', title: 'Offshore met mast design', text: 'New offshore meteorological mast structures, designed to survive the sea and keep instruments working for the measurement campaign.', list: ['Concept and detailed structural design', 'Foundation and access design', 'Installation methodology and interfaces'] },
    monopile: { tag: 'INSTALLATION', title: 'Monopile foundation installation', text: 'Engineering and delivery management for the foundations that carry offshore wind turbines.', list: ['Installation engineering and method statements', 'Marine spread and interface management', 'Programme, cost and risk control offshore'] },
    decom: { tag: 'DECOMMISSIONING / INNOVATION', title: 'Decommissioning and monopile extraction', text: 'Planning and delivery of decommissioning, plus the monopile extraction system GD7 is developing. UK patent pending, EU to follow.', list: ['Decommissioning planning and delivery', 'Purpose-designed monopile extraction system', 'Project management through to completion'] },
    array: { tag: 'CABLES', title: 'Inter-array cable installation', text: 'Project management of the cables linking turbines to each other and to the substation.', list: ['Campaign planning and vessel interfaces', 'Burial, protection and termination coordination', 'Delivery management against programme and budget'] },
    uxo: { tag: 'UXO', title: 'UXO risk and clearance management', text: 'Project management of UXO clearance for cable routes, with a clear position: clear what the evidence says must be cleared, not everything by default.', list: ['Risk-based assessment of what needs clearance', 'Route engineering and avoidance', 'Clearance campaign management where it is justified'] },
    oss: { tag: 'INTERFACE', title: 'Offshore substation interface', text: 'The collection point where inter-array cables meet the export system. Cable installation interfaces are managed here.', list: ['Cable pull-in and termination interfaces', 'Sequencing against platform installation', 'Interface and risk management'] },
    export: { tag: 'CABLES', title: 'Export cable installation', text: 'Project management of the high-value, high-consequence link from offshore substation to landfall. Ongoing consultancy for EON covers this area.', list: ['Route, landfall and vessel planning', 'Installation campaign management', 'Commercial and technical risk control'] },
    tunnel: { tag: 'CONCEPT / THOUGHT LEADERSHIP', title: 'Tunnel to shore', text: 'GD7 argues that boring a tunnel between onshore and offshore substations deserves serious consideration for new wind farms, as new tunnelling technology cuts cost and advance time.', list: ['Avoids beach and intertidal disruption', 'Protected, accessible cable route', 'Read the full position in Insights'] }
  };
  var order = ['met', 'monopile', 'decom', 'array', 'uxo', 'oss', 'export', 'tunnel'];
  var legend = $('#legend'), panel = $('#panel');
  order.forEach(function (k) {
    var b = document.createElement('button'); b.textContent = info[k].title.split(' ').slice(0, 3).join(' ').toUpperCase(); b.dataset.key = k; legend.appendChild(b);
    b.addEventListener('click', function () { select(k); });
  });
  function select(k) {
    var d = info[k]; if (!d) return;
    $('#scene').parentElement.classList.add('touched');
    $$('.hot').forEach(function (h) { h.classList.toggle('active', h.dataset.key === k); });
    $$('#legend button').forEach(function (b) { b.classList.toggle('on', b.dataset.key === k); });
    $('#pTag').textContent = d.tag; $('#pTitle').textContent = d.title; $('#pText').textContent = d.text;
    var ul = $('#pList'); ul.innerHTML = ''; d.list.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    $('#pCta').hidden = false;
    panel.classList.remove('flash'); void panel.offsetWidth; panel.classList.add('flash');
  }
  $$('.hot').forEach(function (h) {
    h.addEventListener('click', function () { select(h.dataset.key); });
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(h.dataset.key); } });
  });
  // service cards jump to explorer item
  var map = { design: 'met', monopile: 'monopile', cables: 'array', uxo: 'uxo', decom: 'decom' };
  $$('.svc').forEach(function (c) {
    c.style.cursor = map[c.dataset.key] ? 'pointer' : 'default';
    c.addEventListener('click', function () { var k = map[c.dataset.key]; if (!k) return; $('#explorer').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { select(k); }, 500); });
  });

  /* ---------- TIMELINE PROGRESS ---------- */
  var tl = $('#timeline'), fill = $('#tlFill');
  function tlp() {
    var r = tl.getBoundingClientRect(), p = (window.innerHeight * .6 - r.top) / r.height;
    fill.parentElement.style.setProperty('--p', Math.max(0, Math.min(1, p)));
  }
  window.addEventListener('scroll', tlp, { passive: true }); tlp();

  /* ---------- PROJECT FILTER + MODAL ---------- */
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.chip').forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on');
      var f = c.dataset.filter;
      $$('.pcard').forEach(function (p) { p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f); });
    });
  });
  var modal = $('#modal');
  function openModal(card) {
    $('#mTitle').textContent = card.dataset.title; $('#mDesc').textContent = card.dataset.desc;
    var m = $('#mMedia'); m.innerHTML = '';
    if (card.dataset.video) {
      var f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(card.dataset.video); f.allow = 'accelerometer; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = card.dataset.title; m.appendChild(f);
    } else if (card.dataset.img) {
      var i = document.createElement('img'); i.src = card.dataset.img; i.alt = card.dataset.title; m.appendChild(i);
    } else { m.textContent = 'Project media goes here'; }
    modal.hidden = false; document.body.style.overflow = 'hidden'; $('#mClose').focus();
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; $('#mMedia').innerHTML = ''; }
  $$('.pcard').forEach(function (c) {
    c.tabIndex = 0;
    if (c.dataset.img) { var m = c.querySelector('.pmedia'); m.querySelector('.pph').remove(); var im = document.createElement('img'); im.loading = 'lazy'; im.src = c.dataset.img; im.alt = ''; m.insertBefore(im, m.firstChild); }
    c.addEventListener('click', function () { openModal(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter') openModal(c); });
  });
  $('#mClose').addEventListener('click', closeModal);
  $('#mCta').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- EXTRACTION ANIMATION ---------- */
  var ex = $('.extract'), st = $('#exStatus'), timers = [];
  function setSt(t) { st.textContent = 'STATUS: ' + t; }
  $('#runBtn').addEventListener('click', function () {
    reset(); ex.classList.add('run'); setSt('EXTRACTING');
    timers.push(setTimeout(function () { setSt('PILE FREE OF SEABED'); }, 4000));
  });
  function reset() { timers.forEach(clearTimeout); timers = []; ex.classList.remove('run'); setSt('IN SEABED'); }
  $('#resetBtn').addEventListener('click', reset);

  /* optional 3D model viewer */
  fetch('assets/models/monopile-extraction.glb', { method: 'HEAD' }).then(function (r) {
    if (!r.ok) return;
    var s = document.createElement('script'); s.type = 'module'; s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js'; document.head.appendChild(s);
    var slot = $('#modelSlot'); slot.innerHTML = '<model-viewer src="assets/models/monopile-extraction.glb" alt="Monopile extraction concept model" camera-controls auto-rotate shadow-intensity="1" exposure="1.1"></model-viewer>'; slot.classList.add('live');
  }).catch(function () {});

  /* ---------- INSIGHT TABS ---------- */
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.tab').forEach(function (x) { x.classList.remove('on'); }); t.classList.add('on');
      $$('.tabpane').forEach(function (p) { p.classList.toggle('on', p.id === 'tab-' + t.dataset.tab); });
    });
  });
  var tunSvg = $('#tunSvg'), tCable = $('#tCable'), tLabel = $('#tLabel');
  $$('.toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.toggle button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
      var tun = b.dataset.mode === 'tun';
      tunSvg.classList.toggle('tun', tun);
      tLabel.textContent = tun ? 'BORED TUNNEL CONNECTION' : 'OPEN-CUT / SURF-ZONE LANDFALL';
    });
  });

  /* ---------- CONTACT FORM (mailto) ---------- */
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, v = function (n) { return f.elements[n].value; };
    var body = 'Name: ' + v('name') + '\nOrganisation: ' + v('org') + '\nEmail: ' + v('email') + '\nService: ' + v('svc') + '\n\n' + v('msg');
    window.location.href = 'mailto:info@gd7.co.uk?subject=' + encodeURIComponent('Website enquiry: ' + v('svc')) + '&body=' + encodeURIComponent(body);
  });
})();
