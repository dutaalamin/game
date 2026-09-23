# Duta Game Hub

Seven browser games in one place, served from a single static folder.

```
D:/game
├── index.html          launcher page (cards for every game)
├── serve.mjs           zero-dependency static server
├── games/
│   ├── sonic/          momentum platformer        (Phaser 3)
│   ├── mario/          power-up platformer        (Phaser 3)
│   ├── geometrydash/   one-button rhythm game     (Phaser 3)
│   ├── krunker/        low-poly arena FPS         (PlayCanvas)
│   ├── duta-racing/    arcade time-attack racer   (Three.js)
│   ├── harvestmoon/    isometric farming sim      (Phaser 3)
│   └── pokedex/        interactive Pokédex        (Next.js)
└── README.md
```

## Run it

```bash
cd D:/game
node serve.mjs          # http://localhost:8080
node serve.mjs 3000     # custom port
```

Then open **http://localhost:8080/** and click a card.

The server uses only Node's built-in modules — no `npm install` required.

## The games

| Game | Genre | Engine | Highlights |
| --- | --- | --- | --- |
| **Sonic** | Platformer | Phaser 3 | Momentum movement, ring pickups, 5 enemy types, boss fight, Green Hill backdrop |
| **Super Mario** | Platformer | Phaser 3 | 3 power states, `?`-blocks, Koopa shells, flagpole finish, 3 worlds |
| **Neon Dash** | Rhythm | Phaser 3 | Auto-run cube, 90° rotation, jump orbs, 128 BPM sequencer, beat-synced bloom |
| **Duta Racing** | Racing | Three.js | Catmull-Rom circuit, 4 AI rivals, drift physics, chase camera, minimap |
| **Krunk Arena** | FPS | PlayCanvas | Hitscan weapons, headshots, bot AI with LOS, 5-minute deathmatch |
| **Harvest Moon** | Farming sim | Phaser 3 | Isometric map, crops with seasons, animals, villager friendship, save/load |
| **Pokédex** | Interactive | Next.js | Encounters, ball throwing, battle scene, retro styling |

## How the hub is assembled

Each game is built independently and its `dist/` output is copied into
`games/<name>/`. Two settings make that work:

1. **`base: './'`** in every Vite config, so asset URLs are relative and resolve
   correctly from a subfolder.
2. **`assetPrefix: '/games/pokedex'`** in the Pokédex's `next.config.mjs`.
   Next.js nested routes (`/collection/`) would otherwise look for
   `_next/` inside the sub-route instead of the game root. Override it with
   `NEXT_PUBLIC_BASE_PATH` when deploying elsewhere.

The Pokédex also sets `output: 'export'` and `trailingSlash: true` so it emits
plain `collection/index.html` files with no server required.

### Rebuilding a game

```bash
cd D:/sonic && npm run build
cp -r dist/. D:/game/games/sonic/

# Pokédex exports to out/ instead of dist/
cd D:/pokedex-game && npm run build
cp -r out/. D:/game/games/pokedex/
```

### Server behaviour worth knowing

- **HEAD requests** return headers with no body. Next.js prefetches routes with
  HEAD, and an incorrect reply makes it abort the request.
- **`RSC: 1` requests** are served the matching `.txt` payload with a
  `text/x-component` content type, which is what the App Router expects for
  client-side navigation.
- Paths are resolved inside the hub directory only, so the server cannot be
  tricked into serving files from elsewhere on disk.

## Licensing

The games use a mix of asset sources. Before publishing anything, check the
README in each game folder — in particular:

- **Sonic** contains SEGA-copyrighted sprites and must **not** be published.
- Everything else uses **CC0** (Kenney packs) or procedurally generated art.

## Notes

- These are separate builds bundled for convenience; each game also still runs
  from its own folder with `npm run dev`.
- Total size of `games/` is about 12 MB.
