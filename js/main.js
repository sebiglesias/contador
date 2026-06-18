// Anotador de cartas — multi-modo. Zero-build, persistencia en localStorage.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('serviceworker.js').catch(() => {}));
}

// Config por juego: dir = dirección del puntero (high=más gana, low=menos gana),
// target = se gana al alcanzarlo (high), limit = se pierde/elimina al superarlo (low),
// steps = botones de suma rápida, fixed = jugadores fijos (no se agregan/borran).
const MODES = {
  libre:       { label: 'Libre',       sub: 'Contador libre',                 dir: 'high', steps: [1],        target: null, limit: null, players: ['Jugador 1', 'Jugador 2'] },
  truco:       { label: 'Truco',       sub: 'Por equipos · a 30',             dir: 'high', steps: [1, 2, 3],  target: 30,   limit: null, players: ['Nosotros', 'Ellos'], fixed: true },
  tute:        { label: 'Tute',        sub: 'Suma de tantos',                 dir: 'high', steps: [10, 20, 1],target: null, limit: null, players: ['Jugador 1', 'Jugador 2'] },
  chinchon:    { label: 'Chinchón',    sub: 'Menos gana · límite 100',        dir: 'low',  steps: [5, 10, 25],target: null, limit: 100,  players: ['Jugador 1', 'Jugador 2'] },
  continental: { label: 'Continental', sub: 'Menos gana · por manos',         dir: 'low',  steps: [5, 10, 50],target: null, limit: null, players: ['Jugador 1', 'Jugador 2'] },
  diezmil:     { label: '10.000',      sub: 'Dados · primero a 10.000',       dir: 'high', steps: [50, 100, 500], target: 10000, limit: null, players: ['Jugador 1', 'Jugador 2'] },
};

const DEFAULT = { mode: 'libre', players: [] };
let state = loadState();

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('anotador'));
    if (s && MODES[s.mode] && Array.isArray(s.players)) return s;
  } catch (e) {}
  const st = { mode: 'libre', players: MODES.libre.players.map(n => newPlayer(n)) };
  return st;
}
function save() { localStorage.setItem('anotador', JSON.stringify(state)); }
function newPlayer(name) { return { name, score: 0, points: [] }; }
function cfg() { return MODES[state.mode]; }

function setMode(mode) {
  if (!MODES[mode]) return;
  state = { mode, players: MODES[mode].players.map(n => newPlayer(n)) };
  save(); render();
}

function addPlayer(name) {
  name = (name || '').trim();
  if (cfg().fixed) return;
  if (!name || state.players.find(p => p.name === name)) return;
  state.players.push(newPlayer(name));
  save(); render();
}

function addPoints(idx, pts) {
  pts = parseInt(pts, 10);
  if (!pts || isNaN(pts)) return;
  const p = state.players[idx];
  p.points.push(pts);
  p.score += pts;
  save(); render();
  checkEnd(p);
}

function undo() {
  // deshace el último punto agregado en toda la partida
  let last = null, lastP = null;
  state.players.forEach(p => { if (p.points.length) { lastP = p; } });
  // buscamos el jugador cuyo último punto fue el más reciente: usamos una pila global simple
  // (sin timestamps, deshacemos el último de cualquier jugador con historial — el de mayor índice modificado)
  for (let i = state.players.length - 1; i >= 0; i--) {
    if (state.players[i].points.length) { lastP = state.players[i]; break; }
  }
  if (!lastP) return;
  const v = lastP.points.pop();
  lastP.score -= v;
  save(); render();
}

function reset() {
  if (!confirm('¿Nueva partida? Se ponen los puntos en cero.')) return;
  state.players = state.players.map(p => newPlayer(p.name));
  save(); render();
}

function checkEnd(p) {
  const c = cfg();
  if (c.target && p.score >= c.target) {
    setTimeout(() => alert(`🏆 ${p.name} llegó a ${c.target}. ¡Ganó!`), 60);
  }
  if (c.limit && p.score > c.limit) {
    setTimeout(() => alert(`☠️ ${p.name} se pasó de ${c.limit}.`), 60);
  }
}

function leaderIndex() {
  const scored = state.players.filter(p => p.score !== 0);
  if (scored.length === 0) return -1;
  const c = cfg();
  let best = state.players[0], bi = 0;
  state.players.forEach((p, i) => {
    if (c.dir === 'high' ? p.score > best.score : p.score < best.score) { best = p; bi = i; }
  });
  return bi;
}

// ---------- fósforos (truco) ----------
// Un cuadrado = 5 puntos: 4 lados + diagonal, dibujados en orden.
function sqSVG(n) {
  const segs = ['M4 4 V28', 'M4 28 H28', 'M28 28 V4', 'M28 4 H4', 'M4 28 L28 4'];
  const lines = segs.slice(0, n).map(d => `<path d="${d}"/>`).join('');
  return `<svg class="sq" viewBox="0 0 32 32" aria-hidden="true">${lines}</svg>`;
}
function fosforos(score) {
  const full = Math.floor(score / 5), rem = score % 5;
  const squares = [];
  for (let i = 0; i < full; i++) squares.push(5);
  if (rem) squares.push(rem);
  if (!squares.length) squares.push(0);
  let html = '<div class="fosforos">';
  squares.forEach((s, i) => {
    if (i === 3) html += '<span class="fos-div" title="malas | buenas"></span>';
    html += `<span class="fos-sq">${sqSVG(s)}</span>`;
  });
  return html + '</div>';
}

// ---------- render ----------
const $ = s => document.querySelector(s);

function renderModes() {
  $('#modes').innerHTML = Object.keys(MODES).map(m =>
    `<button data-m="${m}" aria-pressed="${m === state.mode}">${MODES[m].label}</button>`).join('');
  $('#modes').querySelectorAll('button').forEach(b => b.onclick = () => setMode(b.dataset.m));
  $('#modeSub').textContent = cfg().sub;
  $('#addSection').style.display = cfg().fixed ? 'none' : '';
}

function render() {
  renderModes();
  const c = cfg();
  const li = leaderIndex();
  const isTruco = state.mode === 'truco';
  $('#players').innerHTML = state.players.map((p, i) => {
    const last = p.points.slice(-4);
    const scoreHtml = isTruco
      ? `<span class="pscore sm">${p.score}<i>/${c.target}</i></span>`
      : `<span class="pscore">${p.score}${c.target ? `<i>/${c.target}</i>` : ''}</span>`;
    const middle = isTruco
      ? fosforos(p.score)
      : (last.length ? `<div class="hist">${last.map(v => `<span>${v > 0 ? '+' + v : v}</span>`).join('')}</div>` : '');
    return `
    <div class="player ${i === li ? 'lead' : ''}">
      <div class="player-top">
        <span class="pname" contenteditable data-i="${i}">${p.name}</span>
        ${scoreHtml}
      </div>
      ${middle}
      <div class="addbtns">
        ${c.steps.map(s => `<button class="step" data-i="${i}" data-s="${s}">+${s}</button>`).join('')}
        <input class="custom" type="number" inputmode="numeric" placeholder="±" data-i="${i}" />
        ${cfg().fixed ? '' : `<button class="rm" data-i="${i}" title="Quitar jugador">×</button>`}
      </div>
    </div>`;
  }).join('');
  bindPlayers();
}

function bindPlayers() {
  $('#players').querySelectorAll('.step').forEach(b =>
    b.onclick = () => addPoints(+b.dataset.i, +b.dataset.s));
  $('#players').querySelectorAll('.custom').forEach(inp =>
    inp.onkeydown = e => { if (e.key === 'Enter') { addPoints(+inp.dataset.i, inp.value); inp.value = ''; } });
  $('#players').querySelectorAll('.pname').forEach(el =>
    el.onblur = () => { const n = el.textContent.trim(); if (n) { state.players[+el.dataset.i].name = n; save(); } });
  $('#players').querySelectorAll('.rm').forEach(b =>
    b.onclick = () => { state.players.splice(+b.dataset.i, 1); save(); render(); });
}

$('#addPlayer').onclick = () => { const i = $('#playerName'); addPlayer(i.value); i.value = ''; };
$('#playerName').addEventListener('keydown', e => { if (e.key === 'Enter') $('#addPlayer').click(); });
$('#undo').onclick = undo;
$('#reset').onclick = reset;

render();
