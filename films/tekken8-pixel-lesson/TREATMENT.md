# 你为什么打不好铁拳8

## Brief
48 seconds, 1920×1080, 24fps. 320×180 indexed framebuffer scaled 6× nearest-neighbour. Original pixel characters, Chinese dialogue-box subtitles, original chiptune and synthesized action foley; no narration. No game footage, logos, copied character designs, game sounds or existing music. The requested game title appears in plain text as the subject of commentary. No prior-story characters or advertisement assets are used. Default production proceeds without a storyboard approval stop unless the user requests one.

## Three structures and choice
1. A three-item countdown: efficient but risks becoming a slideshow with tiny fighting sprites.
2. A failed battle → bad-habit diagnosis → skill-point reallocation → deliberate practice → one successful exchange. Chosen: the same action can fail and later succeed, and an RPG menu makes practice priorities visible.
3. Fighting a literal boss called Bad Habits: expressive, but implies mistakes are outside the player's control and obscures the actual practical lessons.

## Logline and arc
A combo-obsessed rookie keeps losing because they mash on the opponent's turn, miss punish opportunities, and queue again without reviewing. They move one skill point from memorization to judgment, practice one defensive response, and win one exchange without pretending to master the whole game.
Setup: practiced combo, failed match. Turn: the upgrade is judgment, not another long combo. Ending: the same threatening attack is blocked and its explicit recovery punished. Enemy retains HP: this is a learning win, not a promise of instant rank improvement.

## Benchmarks
- Mid-1990s console RPG grammar: readable silhouettes, compact portrait dialogue, layered pixel windows, menu decisions, palette changes. Do not copy any game's characters, maps, logos, font, melody, frame ornaments or specific shot route.
- Fighting-game replay analysis grammar: show an error, freeze on the relevant turn/space, then replay an improved response. No actual move frame numbers, character-specific move properties, or copied game HUD. Guarding alone does not guarantee a punish: a deliberately unsafe fictional attack is signaled by a recovery window.

## Shot list / beat sheet
| Seconds | Framing / camera | Action / purpose | Main dialogue |
|---|---|---|---|
| 0–4 | Wide battle, slow integer-pixel push | A beautiful training combo count collides with a real loss. Title visible for full four seconds. | 连招熟练，实战挨打。 |
| 4–10 | Medium side battle; short lateral track | Opponent turn is clearly orange. Rookie presses early, gets interrupted and knocked back. | 对面还没打完，你先抢招。 |
| 10–16 | Locked battle then small pull | Opponent's explicitly unsafe attack is blocked, red recovery marker appears, rookie hesitates and opportunity expires. | 他露了破绽，你却没还手。 |
| 16–22 | Pull out into a retry/menu corridor | Rookie selects another match; the same failure loops. Replay option is ignored. | 输完只重排，错法又重来。 |
| 22–28 | Hold + pixel menu and portrait closeup | Sound nearly stops; one skill point moves from combo memorization to judgment. Protected green spreads through the palette. | 把加点，从连招挪到判断。 |
| 28–34 | Top-down short dojo pan | Rookie walks through a defensive practice tile, blocks repeated strikes and waits until the opponent string ends. | 先练防守，别乱抢回合。 |
| 34–40 | Push into side practice bay | Repeat one reliable punish on an explicitly unsafe attack; a task stamp replaces damage spectacle. | 再练确反，只记一套稳的。 |
| 40–44 | Return to opening battle, small follow track | Same attack: guard, pause, one clean punish. Enemy retains HP. | 这次先挡，再还手。 |
| 44–48 | Pull back to a task/save menu | End title echoes the opening; rookie saves one concrete practice task. | 今日只改一个错。 |

## Cue map
Tempo 120 BPM, beat=0.5s, bar=2s. Cuts at 0,4,10,16,22,28,34,40,44,48 are all bar boundaries. Opening pulse melody and triangle bass; failures progressively lose melodic layers. Silence 1 at 21.75–22.5 (including echo tails), silence 2 at 39.5–40.0. Pixel menu confirmation at 25.0, guarded hits at 29.0/30.5/32.0, practice punish at 36.0/38.0; final guard at 40.75 and clean punish at 42.0. End resolves the original motif and leaves the save fanfare room to ring. Menu motion at 8fps, sprite actions 8–12fps, camera integer positions at 24fps.

## Sound design
| Section | Ambient | Main foley | Music |
|---|---|---|---|
| 0–4 | faint synthesized arcade hum | button burst, impact, falling HP ticks | bright pulse lead interrupted by loss sting |
| 4–16 | quiet electronic room bed | attack swish, hit, guard, recovery-window tick | bass pulse and sparse noise percussion |
| 16–22 | lowering room bed | cursor, error buzz, repeated KO | increasingly thin loop, then complete silence |
| 22–28 | none at turn | point-transfer ticks, confirm | green palette/fanfare restores the motif |
| 28–40 | tiny dojo room tone | footsteps, block clanks, punish thumps | fuller triangle bass, pulse counterline |
| 40–48 | near-silence then warm arcade bed | clean guard, hit, save ticks | motif resolution and original save fanfare |

Two sound-led transitions: incoming menu ticks begin before 16s; upcoming guard swish anticipates the return at 39.25s, then a true silence precedes the battle.

## Type / look
32-colour original palette, protected mint green for insight and protected cream for text. No alpha gradients, bloom, antialiased game objects, CRT or added grain. Integer camera, indexed pixels and Bayer dither. Original 5×7 Latin bitmap alphabet; Chinese glyphs derived into monochrome 13–14px masks from Noto Sans CJK SC (OFL, credited), rendered in the same framebuffer. Bottom-quarter layered blue dialogue window contains a 32×32 portrait and at most two short lines. Captions share one timeline with exported SRT and text-readability checks. Every short title holds at least four seconds; dialogue duration exceeds reading-time thresholds. Characters' feet stay above dialogue.

## Checks / delivery
Model sheet and two rendered style frames before full render. Contact sheet, 0.2s strips of action/guard/punish, frame pixel palette check, subtitle hold and bounds checks, cue alignment, 24fps video duration/frame count, blackframe scan, audio loudness and peak. Deliver MP4, poster, SRT, this treatment, credits and source with build.sh. Any public upload needs the user's authorization; a local path alone must not be called a working download URL.

## Comparison after reading the library demo
Our opening is an already-failed fighting exchange, not a colonnade journey; structure is three diagnosable habits and practice rather than memories/loss; signature move is skill-point transfer rather than a monumental door; camera route is battle/menu/top-down practice rather than an architectural tilt; score is a short exercise/response loop rather than era-dependent recollection; ending is one saved practice task, not a threshold/CONTINUE card. All six differ. Drawing, dialogue and sound are original.
