// Règles du jeu : des fonctions pures.
// Aucune ne modifie son argument ; chacune renvoie une nouvelle valeur.
//
// ACTIVITÉ S1 : remplacez chaque `todo(...)` par une implémentation.
// `npm test` (ou `npm run test:watch`) vous dit où vous en êtes.
// Ordre conseillé : opposite → nextHead → isFree → freeCells → spawnTarget → movePlayer.

import {
  BASE_LENGTH,
  TARGET_COUNT,
  type Direction,
  type GameState,
  type Inputs,
  type Level,
  type Player,
  type PlayerSetup,
  type Point,
} from './types.ts'

/**
 * Direction opposée : on ne peut pas faire demi‑tour sur place.
 * Indice : un `switch` sur une union de littéraux est exhaustif, TypeScript vérifie
 * que tous les cas sont couverts. Pas besoin de `default`.
 */
export function opposite(direction: Direction): Direction {
  switch (direction) {
    case 'up':
      return 'down'
    case 'down':
      return 'up'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

/**
 * La case suivante à partir d'une tête et d'une direction.
 * L'axe y pointe vers le bas : 'up' diminue y.
 * Indice : renvoyer un NOUVEAU point, ne jamais modifier `head` (il est `readonly`).
 */
export function nextHead(head: Point, direction: Direction): Point {
   switch (direction) {
    case 'up':
      return { x: head.x, y: head.y - 1 }

    case 'down':
      return { x: head.x, y: head.y + 1 }

    case 'left':
      return { x: head.x - 1, y: head.y }

    case 'right':
      return { x: head.x + 1, y: head.y }
  }
}

export function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y
}

/** Le point est‑il dans la grille ? */
export function inside(level: Level, p: Point): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < level.width && p.y < level.height
}

/**
 * Une case est libre si elle est dans la grille, hors des murs et hors de toutes les traces.
 * Indice : `some` sur les murs, puis `some` sur les joueurs et `some` sur leur trace.
 * Trois lignes suffisent.
 */
export function isFree(state: GameState, p: Point): boolean {
  if (!inside(state.level, p)) return false
  if (state.level.walls.some(wall => samePoint(wall, p))) return false
  if (state.players.some(player => player.trail.some(point => samePoint(point, p)))) return false
  return true
}

/**
 * Toutes les cases libres de la grille, en excluant aussi les cibles déjà posées.
 * Indice : construire la liste de TOUTES les cases (`Array.from({ length }, (_, i) => …)`
 * deux fois, puis `flat()`), puis `filter` avec `isFree`, puis `filter` sur les cibles.
 */
export function freeCells(state: GameState): Point[] {
  const cells = Array.from(
    { length: state.level.height },
    (_, y) => Array.from(
      { length: state.level.width },
      (_, x) => ({ x, y })
    )
  ).flat()

  const libres = cells.filter(p => isFree(state, p))

  const sansCibles = libres.filter(p =>
    !state.targets.some(target => samePoint(target, p))
  )

  return sansCibles
}

/**
 * Ajoute une cible sur une case libre tirée au hasard, et renvoie le nouvel état.
 * S'il n'y a plus de case libre, renvoie l'état reçu tel quel (même référence).
 * `random` renvoie un nombre dans [0 ; 1[. Il est injecté (et non `Math.random` en dur)
 * pour que les tests et le serveur puissent rejouer une partie à l'identique.
 * Indice : `Math.floor(random() * cells.length)` puis `{ ...state, targets: [...state.targets, cell] }`.
 */
export function spawnTarget(state: GameState, random: () => number): GameState {
  // 1. Récupérer toutes les cases libres
  const cells = freeCells(state)

  // 2. Si aucune case n'est libre, ne rien changer
  if (cells.length === 0) {
    return state
  }

  // 3. Choisir une case au hasard
  const index = Math.floor(random() * cells.length)
  const cell = cells[index]

  // 4. Ajouter la cible et renvoyer le nouvel état
  return {
    ...state,
    targets: [...state.targets, cell]
  }
}

/**
 * Fait avancer un joueur d'une case et renvoie le joueur mis à jour.
 * 1. Si le joueur est mort, le renvoyer tel quel.
 * 2. La direction demandée (`wanted`) est prise en compte sauf si elle est `undefined`
 *    ou si c'est un demi‑tour ; sinon on garde `player.direction`.
 * 3. La tête (`player.trail[0]`) avance ; si la case n'est pas libre, le joueur meurt
 *    (`alive: false`, la direction est quand même mise à jour).
 * 4. Si la case contient une cible (`state.targets`), le score augmente de 1.
 * 5. La nouvelle trace est `[tête, ...ancienne trace]` limitée à BASE_LENGTH + score cases
 *    (`BASE_LENGTH` est à importer depuis './types.ts', comme TARGET_COUNT ci‑dessus).
 * Indice : `{ ...player, direction, trail, score }` construit le nouveau joueur.
 */
export function movePlayer(state: GameState, player: Player, wanted: Direction | undefined): Player {
 // 1. Si le joueur est mort, on le renvoie sans changement
  if (!player.alive) {
    return player
  }

  // 2. Choisir la direction
  const direction =
    wanted !== undefined &&
    wanted !== opposite(player.direction)
      ? wanted
      : player.direction

  // 3. Calculer la prochaine position
  const head = nextHead(player.trail[0], direction)

  // 4. Vérifier si la case est libre
  if (!isFree(state, head)) {
    return {
      ...player,
      direction,
      alive: false
    }
  }

  // 5. Vérifier si le joueur récupère une cible
  const hasTarget = state.targets.some(target =>
    samePoint(target, head)
  )

  // 6. Calculer le nouveau score
  const score = player.score + (hasTarget ? 1 : 0)

  // 7. Calculer la nouvelle trace
  const trail = [head, ...player.trail]
    .slice(0, BASE_LENGTH + score)

  // 8. Renvoyer le joueur mis à jour
  return {
    ...player,
    direction,
    trail,
    score
  }
}

/** Complète les cibles jusqu'à TARGET_COUNT (sans faire avancer personne). */
export function withTargets(state: GameState, random: () => number): GameState {
  let next = state
  while (next.targets.length < TARGET_COUNT) {
    const spawned = spawnTarget(next, random)
    if (spawned === next) break // plus aucune case libre
    next = spawned
  }
  return next
}

/** Crée l'état de départ : chaque joueur sur son point de départ, aucune cible. */
export function createState(level: Level, setups: readonly PlayerSetup[]): GameState {
  const players = setups.map((setup, i): Player => {
    const spawn = level.spawns[i % level.spawns.length]
    return {
      ...setup,
      direction: spawn.direction,
      trail: [{ x: spawn.x, y: spawn.y }],
      alive: true,
      score: 0,
    }
  })
  return { level, players, targets: [], tick: 0, status: 'idle' }
}

/** Un tick complet : tous les joueurs avancent, les cibles mangées sont remplacées. (Fourni.) */
export function step(state: GameState, inputs: Inputs, random: () => number): GameState {
  if (state.status !== 'running') return state

  const moved = state.players.map((p) => movePlayer(state, p, inputs[p.id]))

  // Deux têtes sur la même case : les deux joueurs meurent.
  const players = moved.map((p) => {
    if (!p.alive) return p
    const collision = moved.some((o) => o !== p && o.alive && samePoint(o.trail[0], p.trail[0]))
    return collision ? { ...p, alive: false } : p
  })

  const heads = players.filter((p) => p.alive).map((p) => p.trail[0])
  const targets = state.targets.filter((t) => !heads.some((h) => samePoint(h, t)))

  const next = withTargets({ ...state, players, targets, tick: state.tick + 1 }, random)

  const status = players.some((p) => p.alive) ? 'running' : 'over'
  return { ...next, status }
}
