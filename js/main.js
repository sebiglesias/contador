if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("/serviceworker.js");
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
});

let players = []
let historyExpanded = {}

const root = document.documentElement
const themeToggle = document.getElementById('themeToggle')

function setTheme(light) {
  if (light) {
    root.classList.add('light')
    themeToggle.textContent = '🌙'
  } else {
    root.classList.remove('light')
    themeToggle.textContent = '☀️'
  }
  localStorage.setItem('theme', light ? 'light' : 'dark')
}

function toggleTheme() {
  setTheme(!root.classList.contains('light'))
}

setTheme(localStorage.getItem('theme') === 'light')

function clearPlayers() {
  players = []
  render()
}

function clearAllPoints() {
  players = players.map((p) => ({ name: p.name, points: [], score: 0}))
  render()
}

function addPlayer(name) {
  if (name.length === 0 || players.find(p => p.name === name)) return
  players.push({ name, score: 0, points: [] })
  render()
}

function addPoints(playerName, points) {
  if (points === 0 || isNaN(points)) return
  const player = players.find(p => p.name === playerName)
  player.points.push(points)
  player.score += points
  render()
}


function renderLeaderboard() {
  const top = [...players].sort((a, b) => b.score - a.score).slice(0, 3)
  const medals = ['🥇', '🥈', '🥉']
  const el = document.getElementById('leaderboard')
  if (top.length === 0) { el.innerHTML = ''; return }
  el.innerHTML = `
    <div class="leaderboard">
      <div class="leaderboard-title">Top 3</div>
      ${top.map((p, i) => `
        <div class="leaderboard-row">
          <span class="leaderboard-medal">${medals[i]}</span>
          <span class="leaderboard-name">${p.name}</span>
          <span class="leaderboard-score">${p.score}</span>
        </div>
      `).join('')}
    </div>
  `
}



function toggleHistory(playerName) {
  historyExpanded[playerName] = !historyExpanded[playerName]
  render()
}

function render() {
  renderLeaderboard()
  document.getElementById('players').innerHTML = players.map((player, index) => {
    const expanded = historyExpanded[player.name]
    const visiblePoints = expanded ? player.points : player.points.slice(-3)
    const hasMore = player.points.length > 3

    return `
    <div class="player">
      <div class="name">${player.name}</div>
      <div class="score">${player.score}</div>
      <div class="points">${visiblePoints.map(points => `<div class="points">${points}</div>`).join('')}</div>
      ${hasMore ? `<button class="history-btn" onclick="toggleHistory('${player.name}')">${expanded ? 'Ver menos' : `Ver historial (${player.points.length})`}</button>` : ''}
      <div class="player-input-row">
        <input type="number" pattern="-?[0-9]\.?[0-9]*" inputmode="decimal" id="points-${index}" placeholder="0" />
        <button onclick="addPoints('${player.name}', parseInt(document.getElementById('points-${index}').value))">+</button>
      </div>
    </div>
  `
  }).join('')
}


