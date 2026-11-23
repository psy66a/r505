export class XTimer extends HTMLElement {

  // Nombre de secondes écoulées
  private seconds = 0

  // Identifiant du chronomètre
  private intervalId: number | undefined

  // Quand le composant apparaît dans la page
  connectedCallback() {
    this.render()
  }

  // Démarrer le chronomètre
  start() {
  if (this.intervalId !== undefined) return

  this.intervalId = window.setInterval(() => {
    this.seconds++
    this.render()
  }, 1000)
}

  // Arrêter le chronomètre
  stop() {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  // Remettre le chronomètre à zéro
  reset() {
    this.stop()
    this.seconds = 0
    this.render()
  }

  // Quand le composant est retiré de la page
  disconnectedCallback() {
    this.stop()
  }

  // Afficher le temps sous la forme mm:ss
  private render() {
    const minutes = Math.floor(this.seconds / 60)
    const seconds = this.seconds % 60

    this.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
}

customElements.define('x-timer', XTimer)

declare global {
  interface HTMLElementTagNameMap {
    'x-timer': XTimer
  }
}