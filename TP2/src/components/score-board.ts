class ScoreBoard extends HTMLElement {

    static readonly observedAttributes = ['value', 'label'] as const

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
    
        if (name === 'value') this.render()
        if (name === 'label') this.render()
    }

    get value(): number {
        return Number(this.getAttribute('value') ?? 0)
    }

    set value(v: number) {
        this.setAttribute('value', String(v))
    }

    private render() {
        const label = this.getAttribute('label') ?? 'Score'
        const value = Number(this.getAttribute('value') ?? 0)
         this.textContent = `${label} : ${value}`
    }
}

customElements.define('score-board', ScoreBoard)

declare global {
  interface HTMLElementTagNameMap {
    'score-board': ScoreBoard
  }
}