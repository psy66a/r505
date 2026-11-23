import { Game } from './engine/game.ts'
import { bindKeyboard } from './input.ts'
import { arena } from './levels/arena.ts'
import { createRenderer } from './renderer.ts'
import './components/score-board.ts'
import './components/x-timer.ts'

const canvas = document.querySelector<HTMLCanvasElement>('#arena')
const score = document.querySelector('score-board')
const message = document.querySelector<HTMLElement>('#message')
const timer = document.querySelector('x-timer')
if (canvas === null || score === null || message === null || timer === null)
  throw new Error('Page incomplète')

const PLAYER_ID = 'p1'
const game = new Game(arena, [{ id: PLAYER_ID, name: 'Moi', color: '#61dafb' }])
const draw = createRenderer(canvas, game.snapshot)

draw(game.snapshot)
bindKeyboard(game, PLAYER_ID)

game.events.on('tick', draw)
game.events.on('start', () => {
  score.value = 0
  timer.reset()
  timer.start()
  message.textContent = 'Flèches ou ZQSD pour tourner'
})

game.events.on('score', ({ score: value }) => {
  score.value = value
})
game.events.on('over', (state) => {
  timer.stop() // Arrête le chronomètre

  const [player] = state.players
  message.textContent = `Perdu avec ${player.score} cible(s). Espace pour rejouer.`
})

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && game.snapshot.status !== 'running') {
    event.preventDefault()
    game.start()
  }
})
