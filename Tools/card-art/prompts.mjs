// Motive der 92 Kartentypen für die Bildgenerierung (SDXL versteht Englisch am besten).
// Stil: Helge Vogts Rückseiten-Motive als Stilreferenz (IP-Adapter) plus Fraktionspalette im Prompt.

export const COMMON = 'painted sci-fi concept art illustration, trading card game artwork, vibrant multicolored palette, rich contrasting colors, colorful nebula, dramatic rim lighting, volumetric light rays, glowing particles and sparks, deep space background, painterly brushstrokes, highly detailed, centered subject';

export const NEGATIVE = 'text, letters, words, numbers, watermark, signature, logo, frame, border, card border, user interface, blurry, lowres, jpeg artifacts, photograph, deformed, cropped, duplicate, cartoon, anime';

// Fraktionsfarbe nur als Akzent: Die Bilder sollen mehrfarbig sein (Wunsch des Nutzers)
export const FACTION_STYLE = {
  starwing: 'icy cyan highlights, pale stone and silver metal, crackling blue lightning',
  lightforce: 'copper and fiery amber highlights, glowing embers, flying sparks',
  scaretech: 'weathered bronze and gunmetal, battle-scarred armor, menacing mood',
  biotec: 'toxic lime-green bioluminescent highlights, organic biomechanical shapes',
};

/** Stilreferenz je Fraktion: Helges Rückseiten-Motive (public/ui/factions/<f>/back.webp) */
export const STYLE_REF = {
  starwing: 'public/ui/factions/starwing/back.webp',
  lightforce: 'public/ui/factions/lightforce/back.webp',
  scaretech: 'public/ui/factions/scaretech/back.webp',
  biotec: 'public/ui/factions/biotec/back.webp',
};

export const FACTION_KEYS = ['starwing', 'lightforce', 'scaretech', 'biotec'];

/** Motiv je Kartentyp-ID (src/engine/data.ts) */
export const SUBJECTS = {
  // ---- Starwing: Planeten ----
  0: 'a colossal fortified citadel built into a blazing white-blue central star, orbital rings and defense spires, the heart of a galaxy',
  1: 'an orbital reconnaissance complex launching swarms of small unmanned scout drones',
  2: 'a pale moon crackling with blue proton energy, glowing energy conduits across its cratered surface',
  3: 'a busy interstellar trade hub, ring-shaped trading station orbiting a planet with docking cargo freighters',
  4: 'a planet enveloped by a shimmering hexagonal electromagnetic shield, defense turrets on its surface',
  5: 'an enormous orbital shipyard dock with a warship under construction, scaffolding and welding sparks',
  6: 'a swirling hyperspace nebula portal from which sleek starfighters emerge',
  7: 'a majestic parliament palace floating among the stars, white domes and spires, holographic star maps',
  8: 'a gigantic ion cannon superweapon charging a blinding pulsar beam',
  // ---- Starwing: Einheiten ----
  9: 'a small agile scout drone with sensor antennae tracking a trail through an asteroid field',
  10: 'a scout drone with one large glowing eye lens and small missile pods',
  11: 'a fast light assault spaceship shaped like a phoenix bird with swept wings',
  12: 'a winged armored battleship resembling a flying pegasus',
  13: 'a massive white armored artillery ship launching long-range missiles',
  14: 'a heavy trident-shaped battleship firing through a storm of plasma waves',
  15: 'a fighter spacecraft wreathed in lightning bolts',
  16: 'a sleek stealth spaceship half invisible, cloaked in shimmering distortion',
  // ---- Starwing: Upgrades ----
  17: 'a glowing hexagonal energy shield generator protecting a fleet of warships',
  18: 'a ring-shaped particle accelerator with a bright particle stream circling a glowing core',
  19: 'a starfighter making a precise hyperspace jump through a targeting reticle, streaks of light',
  20: 'a volley of glowing missiles launched from fighter ships',
  21: 'a spy satellite with a giant glowing eye-like lens watching over planets',
  22: 'a sleek spaceship with a wing of blazing flames',
  // ---- Lightforce: Planeten ----
  23: 'a colossal fortress built into a radiant golden sun, the heart of a galaxy',
  24: 'a hive-like colony station producing swarms of unmanned drones',
  25: 'a copper moon surrounded by crackling electron clouds and lightning',
  26: 'a defensive ring of comets and glittering star dust surrounding a planet, with turrets',
  27: 'a busy trading sector space station with golden cargo freighters',
  28: 'a huge space shipyard forging a warship, molten metal and showers of sparks',
  29: 'a giant glowing warp gate ring in space with a ship passing through',
  30: 'a radiant temple tribunal of light in space, tall pillars and a blinding halo',
  31: 'a star exploding into a supernova, a superweapon blast wave',
  // ---- Lightforce: Einheiten ----
  32: 'a small glowing drone like a spark of light',
  33: 'a small hunter drone firing a bright energy beam',
  34: 'a heavy battleship with a clenched-fist-shaped prow glowing like the sun',
  35: 'a dragon-shaped warship breathing a stream of fire',
  36: 'an artillery warship engulfed in an inferno, firing burning shells',
  37: 'a colossal armored battleship of light towering over smaller ships',
  38: 'a long-barreled nova cannon warship firing a blinding star blast',
  39: 'a sleek arrow-shaped fighter racing as a streak of light',
  // ---- Lightforce: Upgrades ----
  40: 'a glowing miniature sun core held in heavy armored brackets',
  41: 'black burning napalm flames pouring from a dragon-shaped warship',
  42: 'a glowing crystal quantum collector absorbing converging beams of light',
  43: 'a thunderbolt strike fired from a heavy cannon, shockwave',
  44: 'a pilot helmet night-vision visor with glowing amber lenses',
  45: 'an arrow-shaped fighter ship at light speed leaving long light streaks',
  // ---- Scaretech: Planeten ----
  46: 'a sinister fortress built into a dark dying star, the heart of a galaxy',
  47: 'a cluster of dark relay stations launching unmanned scouts',
  48: 'an asteroid mining colony extracting glowing antimatter crystals',
  49: 'a metallic defensive barrier belt of spiked debris in space',
  50: 'a grim military fleet base carved into an asteroid, rusty warships docked',
  51: 'a dark council chamber of hooded figures aboard a space station, ominous glow',
  52: 'a shadowy spy center analysing data on countless glowing screens',
  53: 'a black hole superweapon devouring a planet',
  54: 'an artificial wormhole jump zone with drones passing through',
  // ---- Scaretech: Einheiten ----
  55: 'a small shadowy scout drone with a mechanical grabbing arm',
  56: 'a kamikaze drone exploding into a hail of photons',
  57: 'a crude improvised gunship with a large sling cannon',
  58: 'a warship shaped like a huge axe blade',
  59: 'a squadron of heavy armored battleships hanging like a sword above a planet',
  60: 'a small aggressive attack ship firing a salvo of rockets',
  61: 'a huge bomb ship packed with explosives flying into a burning sun',
  62: 'a hammer-shaped heavy missile launcher warship',
  // ---- Scaretech: Upgrades ----
  63: 'a menacing artificial intelligence core, a brain made of glowing circuits',
  64: 'a swarm of nanites assimilating a spaceship',
  65: 'robotic arms and crossed wrenches repairing a damaged battleship',
  66: 'a swarm of small rocket ships invading a planet',
  67: 'an axe-shaped warship slingshotting around a gravity well',
  68: 'a fleet vanishing behind a black nebula veil',
  // ---- BIOTEC: Planeten ----
  69: 'a gleaming biotech corporate headquarters tower with organic green glass domes',
  70: 'an organic insect-like hive structure breeding creatures, glowing green pods',
  71: 'a bio plasma reactor with glowing green plasma tanks and organic pipes',
  72: 'an organic deflector shield emitter dome radiating green energy',
  73: 'a biotech corporate finance vault with holographic green stock charts',
  74: 'an organic factory growing armored vehicles in bio vats',
  75: 'a helipad platform on a biotech tower with a gunship helicopter landing',
  76: 'a biotech research laboratory with a massive bio-weapon charging',
  77: 'a giant organic resonance cannon releasing a shockwave',
  // ---- BIOTEC: Einheiten ----
  78: 'a genetically engineered soldier in green bio armor',
  79: 'a mutated creature soldier with glowing green veins',
  80: 'a hulking tyrant bio-monster warrior',
  81: 'a bio soldier with extendable organic limbs and blades',
  82: 'an aggressive armored bio tank covered in chitin plates',
  83: 'a bio artillery tank firing acid shells',
  84: 'a regenerating organic tank with healing living tissue',
  85: 'a sleek bio gunship helicopter with organic rotor blades',
  // ---- BIOTEC: Upgrades ----
  86: 'a glass flask of glowing green mutagen with a DNA helix inside',
  87: 'a silent stealth helicopter with whispering rotors, fading sound waves',
  88: 'an infinity-shaped perpetual energy loop of green plasma',
  89: 'overlapping insect chitin armor plates on a tank',
  90: 'a glowing neural network of connected neurons',
  91: 'green cells dividing and regenerating tissue, glowing',
};

/**
 * Sondermotive außerhalb der Kartenbilder. BIOTEC hat kein Rückseiten-Motiv von Helge: Es wird im Stil
 * seiner Starwing-Flügel gemalt und dient danach auch als Stilreferenz der BIOTEC-Karten.
 */
export const SPECIALS = {
  'biotec-back': {
    positive: 'a heraldic emblem of a glowing DNA double helix made of organic biomechanical armor plates and living tissue, '
      + 'centered and symmetrical, (toxic lime green:1.3) and (acid yellow-green:1.1) bioluminescence, radiating green light rays, '
      + 'floating glowing green spores, pitch black background, painted fantasy emblem illustration, dramatic rim lighting, '
      + 'painterly brushstrokes, highly detailed',
    negative: `${NEGATIVE}, blue, cyan, teal`,
    styleRef: STYLE_REF.starwing,
    weight: 0.4,
    latent: { width: 896, height: 1152 },
    out: 'public/ui/factions/biotec/back.webp',
    outWidth: 600,
  },
};

export const promptFor = (id) => {
  const faction = FACTION_KEYS[Math.floor(id / 23)];
  return { faction, positive: `${SUBJECTS[id]}, ${FACTION_STYLE[faction]}, ${COMMON}`, negative: NEGATIVE };
};
