# git blame --dad

**Skills I was supposed to learn from my dad.**

A pixel-art RPG quest log of the things boys are supposed to pick up from their fathers: shaving, tying a tie, changing a tire, handling a breakup, saying "I'm not okay". You check off each skill and record **who actually taught you**, with an optional memory and photo. Then the game runs `git blame` on your life.

Built for a hackathon with the theme *"Build something that tells your story."*

## The story

My dad wasn't around. Everything other boys learned from their fathers I learned from YouTube, Reddit, my mom, my uncle, my aunt, my friends, a coach, or by failing on my own. This app is that list, and a thank-you to the people who did show up.

## How it plays

1. **Title screen.** Night sky, a kid with a backpack. Press Start.
2. **Quest Log.** Skills grouped into five regions: Grooming, Hands, Money, People, Inner. Each quest card has a pixel icon, XP and a YouTube tutorial search link. Checking one asks **"WHO TAUGHT YOU THIS?"**: YouTube, Reddit, Uncle, Aunt, Friend, Mom, Teacher/Coach, Trial & Error, or Dad. You can add a name, a year, a one-line memory and a photo. Saving pops `+XP` with an 8-bit blip, and levels go up as XP adds up.
3. **`git blame me`.** Unlocks at 8 cleared quests (or press **B**). A slideshow of everything you learned, oldest first, with your photos. A **Dad meter** sits above it and stays empty.
4. **The Tally.** Quests cleared, years on the road, XP, and a bar for every teacher who showed up. Dad's row waits on a blinking cursor, then resolves. **Dad's share of my growing up: 0%.** Then the final commit: *"I'll teach these myself. Every line."*
5. **Epilogue.** The hero, grown up, standing next to a new kid. **Start Your Own Quest** clears the seeded save so anyone can play.

## Tech

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- Client-only: no backend, no accounts, no API keys
- Progress and photos are saved in `localStorage`. Photos are downscaled in the browser to a 480px JPEG first, so a full log fits.
- Sprites are drawn from 2D character arrays onto a tiny `<canvas>` with `image-rendering: pixelated`. All art is original.
- Chiptune sound effects use the Web Audio API, start only after the first interaction, and can be muted.
- Fonts: Press Start 2P and VT323
- Respects `prefers-reduced-motion`. Works at 1280×720 on a projector and at phone width.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Make it yours

All the words live in two files:

- `data/skills.ts`: the quests and the seeded answers the demo opens with. Entries marked `TODO(Kai)` are placeholders. To give a seeded quest a photo, put the image in `public/photos/` and set `photo: "/photos/<file>.jpg"`.
- `data/story.ts`: titles, region blurbs, teacher names and colours, your name and your final line (`BLAME.finalLine`).

If you change the seeded answers, bump the save key in `hooks/useSave.ts` (or press **Settings → Reset save**) so a browser that already has an old save picks them up.

## Controls

| Key | Where | Does |
|---|---|---|
| Enter / Space | Title | Start |
| B | Quest Log | Jump straight to `git blame me` (demo mode) |
| ← → / Space | Slideshow | Previous / next / pause |
| Esc | Anywhere | Close the dialog or go back |
| Drag, drop or paste an image | Quest entry | Attach a photo |

---

*If you're going through something heavier, talk to someone you trust, or look up a mentoring program like Big Brothers Big Sisters.*
