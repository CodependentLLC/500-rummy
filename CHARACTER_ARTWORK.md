# Transparent character artwork — production checklist

The gallery uses `/public/avatars/poses/<slug>-full.png` and the game table uses `/public/avatars/poses/<slug>-table.png`. Both must be RGBA PNG files with actual transparent pixels, NOT a flattened image of the checkerboard/black backdrop.

Each full asset: entire standing character head to toe; no frame, playing card, floor, scene or text. Each table asset: SAME person/face/hair/clothes, upper body with forearms folded/crossed at the game table; no tabletop or scene baked in. Character identity and family likeness must be retained. Do not substitute generic avatars.

## Active character roster (24 required transparent PNGs)

| Character | Standing asset | At-table asset |
| --- | --- | --- |
| Mara Vale | mara-vale-full.png | mara-vale-table.png |
| Cal Brooks | cal-brooks-full.png | cal-brooks-table.png |
| Iris Quinn | iris-quinn-full.png | iris-quinn-table.png |
| Dante Rios | dante-rios-full.png | dante-rios-table.png |
| Sofia Lee | sofia-lee-full.png | sofia-lee-table.png |
| Jax Cole | jax-cole-full.png | jax-cole-table.png |
| Vera Moon | vera-moon-full.png | vera-moon-table.png |
| Theo Banks | theo-banks-full.png | theo-banks-table.png |
| Lena Hart | lena-hart-full.png | lena-hart-table.png |
| Rafi Cruz | rafi-cruz-full.png | rafi-cruz-table.png |
| Owen Pike | owen-pike-full.png | owen-pike-table.png |
| Dahlia West | dahlia-west-full.png | dahlia-west-table.png |

Legacy `public/avatars/*.webp` files are fallback sources until their correct transparent pose pairs are supplied. The source repo also contains older `public/avatars/*.png` files not listed in `src/data/avatars.ts`; these are not part of the active selectable roster on the current main branch. Do not overwrite them or invent identities.

**Important:** Code can reference new pose assets but does not create the artwork itself. Do not declare this work complete until all 24 transparent PNGs have been produced, visually checked for real alpha transparency and character likeness, placed in `public/avatars/poses/`, and the live deployment has been checked on desktop and mobile.
