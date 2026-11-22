# Wellenlänge

A browser-based party guessing game for groups playing in front of one shared screen. The UI is in German.

Each round shows a pair of opposite terms (e.g. *Warm ← → Kalt*). The game hides a target somewhere on a half-circle dial between the two ends. One player sees where the target is and gives a clue. Everyone else has to work out from the clue where the target lies.

## How to play

1. **Starten (Spieler umdrehen):** the guessers look away. The pointer spins and stops on a random target, and a colored zone shows the target area.
2. Only the clue giver looks at the zone. They then give a clue that falls somewhere between the two terms.
3. Click the dial to hide the zone. The guessers can now come back.
4. The guessers move the mouse to aim the pointer and click to lock in a guess. Clicking again unlocks it.
5. **Aufdecken:** shows the solution (1–25) and the points scored. An exact hit is worth 4 points, and each position off costs one point: `max(0, 4 - distance)`.
6. **Nächste Runde** starts the next round. **Begriffe überspringen** skips the current pair.

Clicking the dial while the pointer is spinning skips the animation.

## Customizing

The term pairs are in the `waves` array in `src/App.vue`, as `{category, left, right}` entries. They are played in the order listed. A seeded shuffle exists but is turned off in `randomWaves`.

## Development

Requires Node `^20.19.0 || >=22.12.0`. Built with Vue 3, Vite and Tailwind CSS v4.

```sh
npm install
npm run dev      # dev server with hot reload
npm run build    # production build to dist/
npm run preview  # serve the production build
```
