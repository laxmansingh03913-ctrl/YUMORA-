import { UserProfile, Novel, Comic, Contest, CommunityPost, ReportItem } from "../types";

export const SEED_USERS: UserProfile[] = [
  {
    id: "usr-creator-1",
    name: "Aria Thorne",
    username: "ariathorne",
    email: "aria@yumora.io",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    bio: "Sci-Fi and Dark Fantasy author. Winner of the 2025 Global Nebula Indie Award. Building worlds full of starlight and shadow.",
    country: "Canada",
    website: "https://ariathorne.dev",
    twitter: "@ariathorne_writes",
    preferredTypes: ["NOVEL", "ILLUSTRATED_NOVEL"],
    primaryGenres: ["Sci-Fi", "Fantasy"],
    agreedToCreatorTerms: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    monetizationTier: "LEVEL_3_VERIFIED",
    monetizationStatus: "ACTIVE",
    fraudAuditStatus: "CLEAN",
    isVerified: true,
    followersCount: 14850,
    followingCount: 142,
    totalReads: 1420500,
    createdAt: "2024-03-15T08:00:00Z",
  },
  {
    id: "usr-creator-2",
    name: "Kaelen Vance",
    username: "kaelenvance",
    email: "kaelen@yumora.io",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    bio: "Obsessed with magic systems, political intrigue, and slow-burn romantic tension. Graphic novelist & serial fiction author.",
    country: "United Kingdom",
    website: "https://kaelenvance.com",
    twitter: "@kaelenvance",
    preferredTypes: ["COMIC", "MANGA"],
    primaryGenres: ["Mystery", "Sci-Fi"],
    agreedToCreatorTerms: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    monetizationTier: "LEVEL_2_ESTABLISHED",
    monetizationStatus: "ACTIVE",
    fraudAuditStatus: "CLEAN",
    isVerified: true,
    followersCount: 9320,
    followingCount: 88,
    totalReads: 890400,
    createdAt: "2024-06-10T12:00:00Z",
  },
  {
    id: "usr-creator-3",
    name: "Mei Lin Takahashi",
    username: "meilintakahashi",
    email: "mei@yumora.io",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    bio: "Manga artist and webtoon creator. Storytelling through visual rhythm and poetic fantasy.",
    country: "Japan",
    website: "https://meilinstudio.jp",
    twitter: "@meilin_draws",
    preferredTypes: ["WEBTOON", "MANGA"],
    primaryGenres: ["Action", "Cyberpunk", "Fantasy"],
    agreedToCreatorTerms: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    monetizationTier: "LEVEL_2_ESTABLISHED",
    monetizationStatus: "ACTIVE",
    fraudAuditStatus: "CLEAN",
    isVerified: true,
    followersCount: 22400,
    followingCount: 310,
    totalReads: 2450000,
    createdAt: "2024-01-20T09:30:00Z",
  },
  {
    id: "usr-reader-1",
    name: "Elena Rostova",
    username: "elenareads",
    email: "reader@yumora.io",
    role: "READER",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    bio: "Avid bookworm and reviewer of indie web serials.",
    country: "Germany",
    preferredTypes: [],
    primaryGenres: [],
    agreedToCreatorTerms: false,
    isCreatorProfileComplete: false,
    isEmailVerified: true,
    isAgeVerified: true,
    monetizationTier: "NONE",
    monetizationStatus: "NOT_APPLIED",
    fraudAuditStatus: "CLEAN",
    isVerified: false,
    followersCount: 412,
    followingCount: 89,
    totalReads: 320,
    createdAt: "2024-08-01T14:00:00Z",
  },
  {
    id: "usr-admin-1",
    name: "Yumora Editorial",
    username: "yumora_admin",
    email: "admin@yumora.io",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    bio: "Official Yumora Platform Administration & Content Moderation Team.",
    country: "Global",
    preferredTypes: ["NOVEL", "WEBTOON", "MANGA"],
    primaryGenres: ["All"],
    agreedToCreatorTerms: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    monetizationTier: "LEVEL_3_VERIFIED",
    monetizationStatus: "ACTIVE",
    fraudAuditStatus: "CLEAN",
    isVerified: true,
    followersCount: 150000,
    followingCount: 5,
    totalReads: 0,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const SEED_NOVELS: Novel[] = [
  {
    id: "novel-1",
    creatorId: "usr-creator-1",
    creator: {
      id: "usr-creator-1",
      name: "Aria Thorne",
      username: "ariathorne",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "The Last Star Weaver",
    slug: "the-last-star-weaver",
    description: "In an empire powered by dying stellar cores, Lyra is an outlaw artisan who can weave cosmic gravity threads with her bare hands. When an ancient dying constellation falls into her workshop, she uncovers a conspiracy that spans three galaxies and the throne of the Celestial Emperor.",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80",
    genre: "Sci-Fi",
    secondaryGenre: "Fantasy",
    tags: ["Space Opera", "Magic System", "Strong Female Lead", "Cosmic Horror", "Slow Burn"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 485200,
    reads: 194200,
    likesCount: 18450,
    bookmarksCount: 9230,
    rating: 4.92,
    totalRatings: 1420,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 4,
    contentWarning: "Mild violence and intense sci-fi themes",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-02-14T15:30:00Z",
    chapters: [
      {
        id: "ch-1-1",
        novelId: "novel-1",
        chapterNumber: 1,
        title: "Chapter 1: The Broken Loom of Orion",
        status: "PUBLISHED",
        wordCount: 1450,
        isFree: true,
        readTimeMinutes: 6,
        publishedAt: "2025-01-10T10:00:00Z",
        content: `The filaments never hummed unless they were dying.

Lyra leaned over her carbon-slate workbench, her breath frosting against the ambient temperature regulator. Between her calloused fingertips, a hairline strand of ionized pulsar silk pulsed an irregular, frantic violet.

"Hold still," she whispered, touching the phosphor-tipped needle to the junction point.

In the lower underbelly of Port Hyperion, noise was a constant pressure—the hydraulic groan of freighter docks, the ozone hiss of leaking atmospheric seals, the distant shouts of synthetic fuel hawkers. But in Lyra’s alcove, three decks below the stellar shipping lanes, the only sound was the delicate harmonic dissonance of captive gravity.

A sharp spark jumped across her knuckles. She didn't flinch. Ten years of repairing star-weft had rendered the skin on her palms tough as tempered ceramic.

"Another dead conduit?" 

The voice came from the hatchway. Valen stood framed against the amber halogen light of the alley, shaking condensation from his pilot’s duster. His mechanical left eye whirred softly as it adjusted its focal aperture.

"Not dead," Lyra replied without looking up. "Stolen. Someone severed this core while the reactor was still cycling at forty thousand kelvins. Look at the crystallization on the edges."

Valen stepped inside, the magnetic soles of his boots clamping to the mesh floor. He peered down at the flickering thread. "Nobody survives pulling a live star-filament, Lyra. That’s Imperial Executioner work."

"Or someone who didn't know what they were touching," she said, finally letting the tension release as the strand stabilized into a calm, bioluminescent sapphire. "Where did your runner find this?"

Valen’s expression darkened. He reached into his coat and produced a heavy brass cylinder, cold and frosted over with microscopic vacuum crystals. 

"He didn't find it in a scrap heap, Lyra. It was embedded in the fuselage of an unmanned survey drone that crashed into Docking Bay 9. The beacon on the drone had been burned out from the inside. But the hull... it was marked with the seal of the Seventh Dynasty."

Lyra’s breath caught. The Seventh Dynasty had vanished four centuries ago beyond the Outer Veil, taking the original Loom of Creation with them.

"Open it," she said quietly.

"Lyra, if the Imperial Sentinels trace this frequency—"

"I said open it, Valen. If they already know it's here, we're dead anyway."`,
      },
      {
        id: "ch-1-2",
        novelId: "novel-1",
        chapterNumber: 2,
        title: "Chapter 2: Stardust in the Wounds",
        status: "PUBLISHED",
        wordCount: 1680,
        isFree: true,
        readTimeMinutes: 7,
        publishedAt: "2025-01-18T12:00:00Z",
        content: `The seal cracked with the sound of snapping ice.

A plume of supercooled helium escaped into the room, swirling like silver smoke around Lyra's boots. Inside the brass canister lay something that defied the standard laws of quantum mechanics: a sphere of solid starlight no larger than a sparrow’s egg, suspended in an electromagnetic cradle.

It didn't reflect the light of the workshop. It created its own, casting long, geometric shadows against the metal bulkhead.

"What in the void is that?" Valen muttered, instinctively drawing his plasma sidearm.

"Put that away," Lyra snapped. "You can't shoot a localized singularity, you idiot."

She reached out, extending her bare left hand. The moment her skin came within three inches of the orb, the air between them shimmered with intricate mandalas of gold and azure thread. The threads didn't follow the contours of her fingers; they wove through them, slipping past epidermis and bone as if matter were nothing more than a polite suggestion.

A sensation rushed through her mind—not words, but memories that belonged to an ocean of burning gas a thousand light-years away. She saw twin suns colliding in silence, their planetary rings shattering into dust, and beneath the cataclysm, a structure of impossible geometry: a cathedral built of woven light.

"Lyra!" Valen grabbed her shoulder and yanked her back.

The connection severed with a resonant ring, like a crystal bell struck in a vacuum. Lyra collapsed against her workbench, gasping for air, her vision swimming with iridescent afterimages. Her fingertips were glowing with residual luminescence.

"Did you see it?" she choked out.

"I saw you almost get vaporized," Valen said, his breathing ragged. "Your pulse went past two hundred. The power grid on this whole sub-level just dipped twenty percent."

"It's an anchor," Lyra said, pushing herself upright. Her hands were shaking, but her mind was sharper than it had ever been in her life. "The Loom wasn't destroyed four hundred years ago, Valen. It was hidden. And this core isn't dead—it's a compass key."

Before Valen could argue, the perimeter alarm above the entrance began to flash crimson.

*Warning: Class-4 Imperial Suppression Cruiser detected in upper atmospheric transit. Orbital scans in progress.*

Lyra looked from the flashing light to the brass cylinder. "Pack the tools," she said. "We're leaving Port Hyperion tonight."`,
      },
      {
        id: "ch-1-3",
        novelId: "novel-1",
        chapterNumber: 3,
        title: "Chapter 3: The Black Market of Nebula Row",
        status: "PUBLISHED",
        wordCount: 1820,
        isFree: true,
        readTimeMinutes: 8,
        publishedAt: "2025-01-28T14:00:00Z",
        content: `Nebula Row was not a street; it was a pressurized rift carved between two abandoned orbital ore refineries. Here, gravity was maintained by stolen gyroscopic rotors that sputtered every forty-seven minutes, causing merchants and pickpockets alike to momentarily float three inches off the rust-pitted floor.

Lyra kept her hood low, her hands buried deep in the thermal pockets of her cloak. Next to her, Valen carried the modified heat-shielded crate containing the singularity sphere.

"If we sell this to Saffron," Valen muttered under his breath, "we can buy a jump-runner with dual warp turbines. We could disappear to the outer colonies before the Emperor's fleet even finishes indexing the port."

"We're not selling it," Lyra said.

"Lyra, be reasonable. The entire sector is under military lockdown because of this rock."

"It's not a rock, Valen. It's a map. And Saffron isn't an antiquities dealer—he's a broker for the Shadow Synod. If he touches this, they will weaponize the stellar weft and burn every colony between here and the Centauri Gate."

They turned down an alley smelling of roasted protein paste and ionized copper. At the end of the corridor stood a doorway guarded by two eight-foot cybernetic hulks with heavy rotary autocannons mounted directly to their clavicles.

"Ident or disperse," one of the hulks droned, its vocoder vibrating with sub-bass distortion.

Lyra stepped forward and lifted her right hand. She flicked her thumbnail against her index finger, producing a faint spark of azure weft that danced across her knuckles before dissipating.

The guards exchanged a glance. The right-hand unit lowered its weapon and pressed a palm against the hydraulic access panel.

"The Weaver is expected. Keep your companion quiet."`,
      },
      {
        id: "ch-1-4",
        novelId: "novel-1",
        chapterNumber: 4,
        title: "Chapter 4: The Song of the Dying Giants",
        status: "PUBLISHED",
        wordCount: 1950,
        isFree: true,
        readTimeMinutes: 9,
        publishedAt: "2025-02-14T15:30:00Z",
        content: `Inside the chamber, the air was warm and smelled of dried lotus leaves and ozone.

Sitting atop a dais made of fused meteoritic glass was Madame Saffron. Her cybernetic eyes were faceted like emeralds, and her gown was spun from genuine lunar spider silk that shimmered with every shallow breath.

"Lyra," Saffron purred, setting down a tiny porcelain cup of tea. "Word travels swiftly in the underdecks. They say you ignited a dead star in your kitchen."

"I brought something better than rumors," Lyra said, signaling Valen to set the crate on the obsidian table.

"Open it," Saffron commanded softly.

When the lid slid back, the green hue of Saffron's optical implants flared into brilliant turquoise. She leaned forward, the clicking of her articulated finger joints loud in the silence of the vault.

"The Keystar of Aldebaran," Saffron whispered, her poise slipping for the barest fraction of a second. "Do you have any idea what you hold, girl?"

"I know it's a navigational relay to the Prime Loom," Lyra said steadily. "And I know the Imperial Fleet is offering fifty million platinum credits for its recovery. Which means you can't fence it on the open market."

"I don't intend to fence it," Saffron said, her lips curving into a cold, predatory smile. "I intend to use it to breach the Sovereign Veil."

She raised her hand. From the shadows behind the tapestries, four cloaked assassins stepped into the light, their phase-blades humming with lethal electromagnetic energy.

"Valen!" Lyra yelled.

Before the blades could strike, Lyra slammed both hands down onto the singularity sphere. She didn't insulate her palms. She let the raw cosmic current flood directly into her bloodstream.

A shockwave of azure light tore through the chamber, tearing tapestries from their mountings and shattering the porcelain tea set into ten thousand glowing shards. The assassins were thrown against the far wall as the laws of local inertia warped into an impossible vortex.

"I told you," Lyra said, her voice echoing with the harmonic roar of a newborn supernova, "matter is just a suggestion."`,
      },
    ],
  },
  {
    id: "novel-2",
    creatorId: "usr-creator-2",
    creator: {
      id: "usr-creator-2",
      name: "Kaelen Vance",
      username: "kaelenvance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "Shadows of the Sunken Spire",
    slug: "shadows-of-the-sunken-spire",
    description: "In the drowned city of Oakhaven, blood magic is currency and memories can be stolen through a touch. A disgraced inquisitor must partner with an elusive street thief to solve a series of aristocratic murders before the city's ancient protective wards collapse completely.",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1400&auto=format&fit=crop&q=80",
    genre: "Fantasy",
    secondaryGenre: "Mystery",
    tags: ["Dark Fantasy", "Noir", "Magic", "Detective", "Enemies to Lovers"],
    language: "en",
    status: "ONGOING",
    contentRating: "MATURE",
    views: 310400,
    reads: 142000,
    likesCount: 14200,
    bookmarksCount: 6800,
    rating: 4.88,
    totalRatings: 980,
    isFeatured: true,
    isEditorPick: false,
    isPremium: false,
    chaptersCount: 3,
    createdAt: "2025-01-05T08:00:00Z",
    updatedAt: "2025-02-10T11:00:00Z",
    chapters: [
      {
        id: "ch-2-1",
        novelId: "novel-2",
        chapterNumber: 1,
        title: "Chapter 1: The Tide of Black Silver",
        status: "PUBLISHED",
        wordCount: 1380,
        isFree: true,
        readTimeMinutes: 6,
        publishedAt: "2025-01-05T08:00:00Z",
        content: `The tide always brought up the things Oakhaven wanted to forget.

Rowan adjusted the collar of his leather coat against the brackish mist rolling off the Grand Canal. Beneath the arched stone bridges, lanterns burned with eerie pale-green witchfire, reflecting off water as dark and viscous as squid ink.

"Third one this fortnight, Inquisitor," the constable whispered, holding a kerchief doused in vinegar over his nose.

"Former Inquisitor," Rowan corrected, stepping onto the slime-slicked wooden pier.

The corpse was tied to the iron mooring ring of the Duke's private barge. But it wasn't water that had killed Lord Kenneth. His chest cavity was hollowed out cleanly, the ribs pried open like the petals of an iron flower, and where his heart should have been, a cluster of black crystalline glass sprouted like petrified thorns.

"Blood-crystallization," Rowan muttered, crouching. He drew a silver needle from his lapel and lightly tapped one of the black shards. It chimed with a low, mournful resonance that sent a cold shudder down his spine. "Forbidden ninth-circle alchemy."

"Who in the city even knows that ritual?" the constable asked, teeth chattering.

"Only one person currently alive outside the Black Vault," Rowan said grimly. "And she was supposed to be executed at dawn."`,
      },
      {
        id: "ch-2-2",
        novelId: "novel-2",
        chapterNumber: 2,
        title: "Chapter 2: The Sanguine Debt",
        status: "PUBLISHED",
        wordCount: 1540,
        isFree: true,
        readTimeMinutes: 7,
        publishedAt: "2025-01-15T09:00:00Z",
        content: `The subterranean cells beneath the Bell Tower had not dried in three centuries.

Water dripped in rhythmic cadence from the vaulted limestone ceiling. Rowan walked past the empty iron cages until he reached the solitary cell at the end of the flooded walkway.

Sitting on a dry stone slab, her legs crossed and a deck of tarot cards floating lazily around her head in a slow orbit, was Vespera.

"Rowan," she said, her voice dripping with venomous amusement. "Did you bring wine, or are you just here to watch the tide rise over my boots?"

"Kenneth is dead," Rowan said, resting his hand on the hilt of his runic broadsword.

The floating cards froze in mid-air. One of them, depicting a crown pierced by black daggers, fluttered down into her outstretched palm.

"Kenneth was a pig with more gold than brains," Vespera replied, her amber eyes narrowing. "But he owed me fourteen thousand florins. I don't kill debtors before collection day."

"His heart was replaced with obsidian sanguinite."

For the first time, the smirk vanished from Vespera's face. She stood up, the chains at her wrists chiming against the damp stone.

"Someone breached the Ossuary of Saint Jude," she whispered. "Rowan, that wasn't an execution. That was the first seal."`,
      },
      {
        id: "ch-2-3",
        novelId: "novel-2",
        chapterNumber: 3,
        title: "Chapter 3: The Crimson Masquerade",
        status: "PUBLISHED",
        wordCount: 1720,
        isFree: true,
        readTimeMinutes: 8,
        publishedAt: "2025-02-10T11:00:00Z",
        content: `The Grand Ballroom of House Valois was ablaze with chandeliers cast from enchanted sun-coral. Hundreds of masked aristocrats twirled across the marble parquet, sipping crushed pomegranate wine infused with mild hallucinogens.

Rowan wore the midnight-blue velvet attire of an imperial envoy, while Vespera, her identity concealed beneath an ornate porcelain mask depicting a crying swan, glided through the crowd like a shadow cast by silk.

"The Duke is watching us from the mezzanine," Vespera murmured through the telepathic resonance stone tucked beneath her collarbone.

"Let him watch," Rowan replied, scanning the perimeter guards. "His guards aren't carrying standard ceremonial rapiers. Those scabbards are etched with blood-ward runes."

"Which means half the High Council is already converted," she said.

Suddenly, the music stopped. The violinist collapsed onto the stage, blood bubbling from his mouth as black crystals erupted through his silk waistcoat. The guests screamed, stampeding toward the gilded exit doors—only to find the gates slamming shut with the sound of iron thunder.

From the high balcony, Duke Valois raised a goblet of obsidian liquid.

"Welcome, my honored guests," the Duke announced, his voice reverberating through the hall. "Tonight, Oakhaven pays its ancient debt to the deep."`,
      },
    ],
  },
  {
    id: "novel-3",
    creatorId: "usr-creator-3",
    creator: {
      id: "usr-creator-3",
      name: "Mei Lin Takahashi",
      username: "meilintakahashi",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "The Alchemist of Neo-Kyoto",
    slug: "the-alchemist-of-neo-kyoto",
    description: "In the year 2188, ancient Shinto spirits inhabit high-voltage server farms and synthetic bodies. Rin, a neon-district tea herbalist with an illegal affinity for spirit synthesis, must save her sister from a rogue megacorporation extracting souls for quantum computing processors.",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80",
    genre: "Cyberpunk",
    secondaryGenre: "Fantasy",
    tags: ["Cyberpunk", "Spirits", "Action", "Cybernetics", "Sisterhood"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 520000,
    reads: 265000,
    likesCount: 29800,
    bookmarksCount: 14200,
    rating: 4.95,
    totalRatings: 2150,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 2,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-12T18:00:00Z",
    chapters: [
      {
        id: "ch-3-1",
        novelId: "novel-3",
        chapterNumber: 1,
        title: "Chapter 1: Rain in the Circuit Alleys",
        status: "PUBLISHED",
        wordCount: 1200,
        isFree: true,
        readTimeMinutes: 5,
        publishedAt: "2025-01-01T00:00:00Z",
        content: `Neon rain fell in sheets of electric pink and cyan, splashing against the worn ceramic tiles of Alley 44.

Rin ground the dried ginger root in a bronze mortar, listening to the static hiss of the holo-ads flickering outside her shop window. Across the street, a holographic geisha fifty stories tall poured an endless stream of synthetic sake into the smoggy sky.

"Tea won't fix a corrupt memory sector, Rin-chan," whispered a small voice from the kettle.

Rin tapped the brass spout with her wooden spoon. "Be quiet, Haku. You're a tea spirit, not a hardware diagnostic tool."

A small ball of azure flame bobbed out of the steam, blinking two curious golden eyes. Haku settled onto the brim of the ceramic pot, his spectral heat keeping the water at a precise ninety-four degrees Celsius.

The bell above the heavy acrylic door chimed—not the welcoming ring of a regular customer, but the harsh metallic ping of military-grade telemetry interference.

Three men stepped inside. Their trench coats were stamped with the silver crest of Kuroda Bio-Tech.

"Rin Asakura?" the lead agent inquired, his retinal HUD glowing amber as he scanned her face. "Your sister failed to report for her shift at the Soul Foundry. We believe you have her neural backup drive."`,
      },
      {
        id: "ch-3-2",
        novelId: "novel-3",
        chapterNumber: 2,
        title: "Chapter 2: The Spirit in the Motherboard",
        status: "PUBLISHED",
        wordCount: 1410,
        isFree: true,
        readTimeMinutes: 6,
        publishedAt: "2025-01-15T12:00:00Z",
        content: `Rin didn't answer. She subtly slid her right hand beneath the counter, where an old electromagnetic pulse canister lay wrapped in sacred ofuda talismans.

"My sister is a database curator," Rin said calmly. "She doesn't carry company hardware home."

"Then you won't mind if we conduct a memory wipe of your local terminals," the agent said, stepping forward with an override dongle.

Haku screeched from the kettle.

"Now!" Rin shouted.

She crushed the talisman. The EMP roared through the tiny tea shop, not in a destructive blast, but in a dazzling vortex of electric-blue dragon scales. The Kuroda agents' ocular implants exploded with static, their cybernetic joints seizing up instantly under the spiritual surge.

"Grab your bag, Rin-chan!" Haku cried, growing in size until he formed a serpentine shield of blazing azure fire around her shoulders. "They've already deployed the hunter drones on the rooftop!"`,
      },
    ],
  },
  {
    id: "novel-4",
    creatorId: "usr-creator-1",
    creator: {
      id: "usr-creator-1",
      name: "Aria Thorne",
      username: "ariathorne",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "Heart of the clockwork Dragon",
    slug: "heart-of-the-clockwork-dragon",
    description: "Steam-powered airships battle ancient leviathans in the skies above the Great Cloud Sea. A runaway grease monkey and a rogue royal cartographer discover the slumbering mechanical engine of a titan that could power the entire empire—or ignite the skies in apocalyptic fire.",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    genre: "Adventure",
    secondaryGenre: "Steampunk",
    tags: ["Steampunk", "Airships", "Dragons", "Adventure", "Found Family"],
    language: "en",
    status: "ONGOING",
    contentRating: "EVERYONE",
    views: 189000,
    reads: 92000,
    likesCount: 8400,
    bookmarksCount: 4300,
    rating: 4.79,
    totalRatings: 620,
    isFeatured: false,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 2,
    createdAt: "2025-01-20T14:00:00Z",
    updatedAt: "2025-02-05T09:00:00Z",
    chapters: [
      {
        id: "ch-4-1",
        novelId: "novel-4",
        chapterNumber: 1,
        title: "Chapter 1: The Cloud Sea Harbor",
        status: "PUBLISHED",
        wordCount: 1100,
        isFree: true,
        readTimeMinutes: 5,
        publishedAt: "2025-01-20T14:00:00Z",
        content: `Ten thousand feet above the earth, the clouds looked like an infinite expanse of whipped cream touched by morning amber.

Barnaby wiped engine grease across his forehead, adjusting the intake valve on the port thruster of the *Gilded Sparrow*. The twin steam turbines roared with rhythmic, satisfying thrums.

"Barnaby! Check the altimeter!" yelled Captain Jack from the bridge.

Below them, breaking through the dense cumulus clouds like the dorsal fin of a prehistoric whale, was the jagged brass spine of the Clockwork Dragon.`,
      },
      {
        id: "ch-4-2",
        novelId: "novel-4",
        chapterNumber: 2,
        title: "Chapter 2: The Brass Core",
        status: "PUBLISHED",
        wordCount: 1250,
        isFree: true,
        readTimeMinutes: 5,
        publishedAt: "2025-01-28T16:00:00Z",
        content: `The beast did not breathe fire; it exhaled pressurized steam that could strip the canvas from an airship's keel in seconds.

Barnaby hitched his safety harness to the harpoon winch. "Hold her steady, Jack! I'm going in through the maintenance hatch on its flank!"`,
      },
    ],
  },
  {
    id: "novel-5",
    creatorId: "usr-creator-2",
    creator: {
      id: "usr-creator-2",
      name: "Kaelen Vance",
      username: "kaelenvance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "Whispers in the Library of Babel",
    slug: "whispers-in-the-library-of-babel",
    description: "An infinite labyrinth of hexagonal rooms containing every book that has ever been written, will be written, or never could be written. Two archivists search for the Book of Apologies before the encroaching Silence erases their universe.",
    coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
    genre: "Mystery",
    secondaryGenre: "Sci-Fi",
    tags: ["Mind-Bending", "Philosophical", "Labyrinth", "Cosmic", "Literary"],
    language: "en",
    status: "COMPLETED",
    contentRating: "EVERYONE",
    views: 245000,
    reads: 118000,
    likesCount: 16500,
    bookmarksCount: 8900,
    rating: 4.96,
    totalRatings: 1890,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 2,
    createdAt: "2024-11-10T10:00:00Z",
    updatedAt: "2025-01-15T12:00:00Z",
    chapters: [
      {
        id: "ch-5-1",
        novelId: "novel-5",
        chapterNumber: 1,
        title: "Chapter 1: The Hexagon of Forgotten Names",
        status: "PUBLISHED",
        wordCount: 1300,
        isFree: true,
        readTimeMinutes: 5,
        publishedAt: "2024-11-10T10:00:00Z",
        content: `Every corridor opened into four identical galleries, each wall lined with five shelves of thirty-two uniform volumes.

Archivist Samuel had walked four thousand leagues without encountering another living soul—until he heard the rustle of turning parchment on the floor below.`,
      },
      {
        id: "ch-5-2",
        novelId: "novel-5",
        chapterNumber: 2,
        title: "Chapter 2: The Page That Vanished",
        status: "PUBLISHED",
        wordCount: 1400,
        isFree: true,
        readTimeMinutes: 6,
        publishedAt: "2024-11-20T10:00:00Z",
        content: `The woman holding the lantern looked up. Her eyes were silver, like polished mirrors that reflected not Samuel, but the books behind him.

"You're late, Samuel," she said. "The Silence just consumed Sector 99."`,
      },
    ],
  },
  {
    id: "novel-6",
    creatorId: "usr-creator-3",
    creator: {
      id: "usr-creator-3",
      name: "Mei Lin Takahashi",
      username: "meilintakahashi",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "Summer Romance at 100km/h",
    slug: "summer-romance-at-100kmh",
    description: "A former professional drift racer turned high-school driving instructor meets an ambitious automotive engineer with a secret past. Sparks fly on mountain passes under summer fireworks.",
    coverUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    genre: "Romance",
    secondaryGenre: "Slice of Life",
    tags: ["Racing", "Romance", "Summer Vibes", "Fast Cars", "Drama"],
    language: "en",
    status: "ONGOING",
    contentRating: "EVERYONE",
    views: 142000,
    reads: 78000,
    likesCount: 9600,
    bookmarksCount: 3900,
    rating: 4.82,
    totalRatings: 540,
    isFeatured: false,
    isEditorPick: false,
    isPremium: false,
    chaptersCount: 2,
    createdAt: "2025-01-12T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    chapters: [
      {
        id: "ch-6-1",
        novelId: "novel-6",
        chapterNumber: 1,
        title: "Chapter 1: The Mountain Pass at Sunset",
        status: "PUBLISHED",
        wordCount: 1150,
        isFree: true,
        readTimeMinutes: 5,
        publishedAt: "2025-01-12T00:00:00Z",
        content: `The smell of burnt Yokohama rubber mingled with the evening pine scent of Mount Haruna.

Leo tapped the steering wheel of his red GT-86. Next to him, Hana adjusted her telemetry laptop without glancing up from the suspension curve graphs.

"If you brake three meters earlier at Hairpin Four," she said coolly, "we'll shave two tenths off your sector time. Try it."`,
      },
      {
        id: "ch-6-2",
        novelId: "novel-6",
        chapterNumber: 2,
        title: "Chapter 2: Fireflies and Downshifts",
        status: "PUBLISHED",
        wordCount: 1200,
        isFree: true,
        readTimeMinutes: 5,
        publishedAt: "2025-01-19T00:00:00Z",
        content: `The headlights cut through the descending fog. Leo downshifted into third gear, the heel-and-toe rev match roaring smoothly through the dual exhaust.

Hana smiled—a rare, genuine expression that made Leo miss his apex by a full foot.`,
      },
    ],
  },
  {
    id: "novel-solo-leveling",
    creatorId: "usr-creator-3",
    creator: {
      id: "usr-creator-3",
      name: "Mei Lin Takahashi",
      username: "meilintakahashi",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "Solo Leveling: Shadow Monarch Awakening",
    slug: "solo-leveling",
    description: "In a world where dimensional gates connect our world to deadly monster dungeons, the weakest E-rank hunter Sung Jinwoo is left for dead inside a double dungeon. When he awakens, a mysterious floating quest log grants him a unique ability no other hunter possesses: the power to level up infinitely.",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&auto=format&fit=crop&q=80",
    genre: "Fantasy",
    secondaryGenre: "Action",
    tags: ["Action", "Hunters", "Dungeons", "Level Up", "Shadow Monarch", "Overpowered"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 890000,
    reads: 420000,
    likesCount: 52000,
    bookmarksCount: 28400,
    rating: 4.99,
    totalRatings: 4850,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 3,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-15T12:00:00Z",
    chapters: [
      {
        id: "ch-sl-1",
        novelId: "novel-solo-leveling",
        chapterNumber: 1,
        title: "Chapter 1: The E-Rank Hunter",
        status: "PUBLISHED",
        wordCount: 1420,
        isFree: true,
        readTimeMinutes: 6,
        publishedAt: "2025-01-01T00:00:00Z",
        content: `Known throughout the hunter community as the "World's Weakest Hunter," Sung Jinwoo risked his life in low-level D-rank gates just to pay for his mother's medical bills and his sister's tuition.

Inside the cavern, the air was damp and smelled of sulfur. The raid party had easily cleared the outer goblins, but at the far end of the cave, an ominous archway led down into an uncharted dual dungeon.

"Are we really going in there?" Jinwoo whispered, clutching his chipped standard-issue steel dagger.

Above the entrance, colossal stone statues held tablets inscribed with ancient runic commandments:
1. Worship the Lord.
2. Praise the Lord.
3. Prove your faith.

As the final hunter stepped over the threshold, the massive stone doors slammed shut with a concussive boom, sealing them inside.`,
      },
      {
        id: "ch-sl-2",
        novelId: "novel-solo-leveling",
        chapterNumber: 2,
        title: "Chapter 2: The Double Dungeon of the God Statue",
        status: "PUBLISHED",
        wordCount: 1650,
        isFree: true,
        readTimeMinutes: 7,
        publishedAt: "2025-01-10T00:00:00Z",
        content: `The colossal statue seated upon the throne slowly opened its glowing crimson eyes.

Before anyone could scream, a beam of pure thermal energy swept across the chamber, vaporizing two C-rank hunters instantly into ash.

"Don't move!" Jinwoo shouted at the top of his lungs. "The statues only attack when you break the commandments!"

Blood dripped down his temple as he calculated the movement angles of the stone executioners. When all seemed lost and the sacrificial altar demanded a final offering, Jinwoo stayed behind to let the surviving party members escape through the exit portal.

As the stone blade descended toward his heart, time froze.

[Notification: You have fulfilled all secret requirements of the Courageous Sacrifice Trial.]
[You have been chosen as the Player.]
[Accept the Quest?]`,
      },
      {
        id: "ch-sl-3",
        novelId: "novel-solo-leveling",
        chapterNumber: 3,
        title: "Chapter 3: Daily Quest & The Shadow Extraction",
        status: "PUBLISHED",
        wordCount: 1800,
        isFree: true,
        readTimeMinutes: 8,
        publishedAt: "2025-01-20T00:00:00Z",
        content: `Jinwoo woke up in a hospital bed in Seoul, surrounded by baffled doctors. Not a single scar remained on his body.

Floating in front of his eyes was a glowing blue holographic interface that only he could see:

[Player: Sung Jinwoo]
[Level: 1]
[HP: 100/100 | MP: 10/10]
[Strength: 10 | Agility: 10 | Sense: 10 | Vitality: 10 | Intelligence: 10]
[Daily Quest: Preparing to Become Stronger]
- Push-ups: 0/100
- Sit-ups: 0/100
- Squats: 0/100
- Running: 0/10km
*Warning: Failure to complete daily quest will result in a penalty zone.*

Jinwoo smiled. For the first time in his life, his limits were not carved in stone. He was about to become the Monarch of Shadows.`,
      },
    ],
  },
];

export const SEED_COMICS: Comic[] = [
  {
    id: "comic-1",
    creatorId: "usr-creator-3",
    creator: {
      id: "usr-creator-3",
      name: "Mei Lin Takahashi",
      username: "meilintakahashi",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    title: "Valkyrie Protocol: ZERO",
    slug: "valkyrie-protocol-zero",
    description: "In a post-cataclysmic floating metropolis, biomechanical android Valkyries defend human refugees against titan kaiju rising from the deep abyss. Webtoon style full-color weekly release.",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&auto=format&fit=crop&q=80",
    genre: "Action",
    tags: ["Mecha", "Sci-Fi", "Webtoon", "Action", "Full Color"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 650000,
    reads: 320000,
    rating: 4.97,
    totalRatings: 3400,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    episodesCount: 2,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-14T00:00:00Z",
    episodes: [
      {
        id: "ep-1-1",
        comicId: "comic-1",
        episodeNumber: 1,
        title: "Episode 1: Awakening in the Chrome Cradle",
        thumbnailUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80",
        ],
        status: "PUBLISHED",
        publishedAt: "2025-01-01T00:00:00Z",
        likesCount: 14200,
      },
      {
        id: "ep-1-2",
        comicId: "comic-1",
        episodeNumber: 2,
        title: "Episode 2: The Siren of Level 9",
        thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1563089145-599997674d42?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80",
        ],
        status: "PUBLISHED",
        publishedAt: "2025-01-10T00:00:00Z",
        likesCount: 11800,
      },
    ],
  },
];

export const SEED_CONTESTS: Contest[] = [
  {
    id: "contest-1",
    title: "2026 Global Sci-Fi & Fantasy Story Challenge",
    slug: "2026-global-scifi-fantasy-challenge",
    subtitle: "$1,000 Total Prize Pool • Monthly International Creator Competition",
    description: "Write an original, gripping fantasy or science fiction story and compete for cash prizes, global editorial features, and future comic adaptation contracts. Judged by community engagement and our international editorial panel.",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80",
    prizePool: "$1,000",
    prizeStructure: [
      { place: "1st Place", reward: "$500 USD", desc: "Cash Prize + Homepage Spotlight + Comic Adaptation Consideration" },
      { place: "2nd Place", reward: "$250 USD", desc: "Cash Prize + Verified Creator Badge + Editorial Review" },
      { place: "3rd Place", reward: "$150 USD", desc: "Cash Prize + Community Feature" },
      { place: "Community Choice", reward: "$100 USD", desc: "Most Bookmarked & Voted Story" },
    ],
    startDate: "2025-02-01T00:00:00Z",
    endDate: "2025-03-31T23:59:59Z",
    status: "ACTIVE",
    rules: [
      "Submissions must be original works written by the author.",
      "Must have a minimum of 2 published chapters at time of deadline.",
      "Eligible genres: Sci-Fi, Fantasy, Cyberpunk, Dystopian, Supernatural.",
      "No plagiarized content or unauthorized fanfiction.",
      "Winners are determined by 40% reader engagement + 60% editorial judging score.",
    ],
    judgingCriteria: [
      { title: "World-Building & Immersion", weight: "30%", desc: "Depth, originality, and sensory atmosphere of the setting." },
      { title: "Character Development & Voice", weight: "30%", desc: "Memorable character arcs, distinctive voice, and compelling dialogue." },
      { title: "Plot Pacing & Hook", weight: "25%", desc: "Pacing of cliffhangers, narrative tension, and structure." },
      { title: "Reader Retention & Read Rate", weight: "15%", desc: "Completion rate of chapters across global readers." },
    ],
    eligibleGenres: ["Sci-Fi", "Fantasy", "Cyberpunk", "Adventure", "Mystery"],
    minChapters: 2,
    submissionCount: 48,
  },
];

export const SEED_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    userId: "usr-creator-1",
    user: {
      name: "Aria Thorne",
      username: "ariathorne",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      badge: "Verified Author",
    },
    category: "Creator Lounge",
    title: "How do you handle magic system pacing without exposition dumping in Chapter 1?",
    content: "When writing *The Last Star Weaver*, I struggled with explaining the gravity thread mechanics without slowing down the initial action sequence. My best breakthrough was revealing rules only when a character fails a spell or experiences physical strain. How do other writers tackle this in serial fiction?",
    tags: ["WritingTips", "WorldBuilding", "MagicSystems", "Pacing"],
    upvotes: 142,
    commentsCount: 28,
    views: 1890,
    isPinned: true,
    createdAt: "2025-02-10T14:30:00Z",
    comments: [
      {
        id: "com-1-1",
        userId: "usr-creator-2",
        user: {
          name: "Kaelen Vance",
          username: "kaelenvance",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        },
        text: "100% agree! I always follow Sanderson's First Law: an author's ability to solve problems with magic is directly proportional to how well the reader understands said magic. Show the costs early!",
        upvotes: 45,
        createdAt: "2025-02-10T16:00:00Z",
      },
      {
        id: "com-1-2",
        userId: "usr-reader-1",
        user: {
          name: "Elena Rostova",
          username: "elenareads",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
        },
        text: "As a reader, nothing pulls me out faster than 3 pages of historical textbook in Chapter 1. The broken loom scene in Chapter 1 was the perfect example of showing through tactile action!",
        upvotes: 31,
        createdAt: "2025-02-11T09:15:00Z",
      },
    ],
  },
  {
    id: "post-2",
    userId: "usr-admin-1",
    user: {
      name: "Yumora Editorial",
      username: "yumora_admin",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
      badge: "Official Team",
    },
    category: "Announcements",
    title: "Announcing the 2026 Global Story Challenge ($1,000 Prize Pool)",
    content: "We are thrilled to launch Yumora's first global monthly challenge! Creators can submit serialized novels or short stories. Top finalists receive cash rewards, featured placement on the global discover feed, and direct meetings with our webtoon adaptation team.",
    tags: ["Contest", "Announcement", "Prizes", "Creators"],
    upvotes: 318,
    commentsCount: 54,
    views: 4520,
    isPinned: true,
    createdAt: "2025-02-01T08:00:00Z",
  },
  {
    id: "post-3",
    userId: "usr-creator-3",
    user: {
      name: "Mei Lin Takahashi",
      username: "meilintakahashi",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      badge: "Webtoon Creator",
    },
    category: "Story Feedback",
    title: "Vertical Scroll vs Page Flip: What format do you prefer for high-action scenes?",
    content: "When designing Valkyrie Protocol, I found that vertical scroll allows for continuous vertical drop animations that feel much more dynamic on mobile screens. Would love to hear what formats you all enjoy most when reading intense combat!",
    tags: ["Comics", "Webtoon", "ActionLayout", "ArtTips"],
    upvotes: 89,
    commentsCount: 19,
    views: 1240,
    createdAt: "2025-02-12T11:00:00Z",
  },
];

export const SEED_REPORTS: ReportItem[] = [
  {
    id: "rep-1",
    reporterName: "Marcus_Reads",
    contentId: "novel-99-demo",
    contentTitle: "Unlicensed Translation of Famous LN",
    contentType: "NOVEL",
    creatorName: "ShadowTranslator_01",
    reason: "Copyright Infringement",
    description: "This upload is an unauthorized word-for-word translation of a published Japanese light novel without creator consent.",
    status: "PENDING",
    createdAt: "2025-02-15T09:30:00Z",
  },
  {
    id: "rep-2",
    reporterName: "Elena Rostova",
    contentId: "novel-1",
    contentTitle: "The Last Star Weaver",
    contentType: "NOVEL",
    creatorName: "Aria Thorne",
    reason: "Other",
    description: "Minor formatting typo in Chapter 3 line 45 (double quotes missing). Otherwise love the story!",
    status: "RESOLVED",
    createdAt: "2025-02-14T18:00:00Z",
  },
];
