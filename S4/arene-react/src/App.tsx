import { useState } from 'react'

// 1. Définir les informations que reçoit Bonjour
type Props = {
  readonly name: string
}

// 2. Créer notre composant Bonjour
function Bonjour({name}: Props) {
  return <p>Bonjour {name}</p>
}

type CompteurProps = {
  readonly count: number
  readonly onIncrement: () => void
  readonly onReset: () => void
}

function Compteur({ count, onIncrement, onReset }: CompteurProps) {
  return (
    <div>
      <p>Compteur : {count}</p>

      <button onClick={onIncrement}>
        +1
      </button>

      <button onClick={onReset}>
        Réinitialiser
      </button>
    </div>
  )
}

type ScoreBoardProps = {
  readonly value: number
  readonly label?: string
}

function ScoreBoard({ value, label = 'Score' }: ScoreBoardProps) {
  return <div>{label} : {value}</div>
}

// 3. Afficher Bonjour deux fois dans App
export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Bonjour name="Ada" />
      <Bonjour name="Linus" />

      <Compteur
        count={count}
        onIncrement={() => setCount(count + 1)}
        onReset={() => setCount(0)}
      />

      <ScoreBoard value={count} />
    </>
  )
}