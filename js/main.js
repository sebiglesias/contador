if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("/serviceworker.js");
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
});

let players = []

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


// Show players and their points in vertical columns, show the sum of the points at the top right beneath the player and previous points in strikethrough text, also a button to add points to the player.
function render() {
  document.getElementById('players').innerHTML = players.map((player, index) => `
    <div class="player">
      <div class="name">${player.name}</div>
      <div class="score">${player.score}</div>
      <div class="points">${player.points.map(points => `<div class="points">${points}</div>`).join('')}</div>
      <input type="number" id="points-${index}" />
      <button onclick="addPoints('${player.name}', parseInt(document.getElementById('points-${index}').value))">Add points</button>
    </div>
  `).join('')
}


