import { UserProfile, Novel, Comic, Contest, CommunityPost, ReportItem } from "../types";

// ============================================================================
// VERIFIED CREATOR & AUTHOR PROFILES
// ============================================================================

export const SEED_USERS: UserProfile[] = [
  {
    id: "user-abhishek-master",
    name: "Abhishek Megwansi",
    username: "abhishek",
    email: "megwansiabhishek7@gmail.com",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85",
    bio: "Founder & Lead Architect of Yomika. Building the future of global serialized fiction, webtoons, and creator monetization.",
    country: "India",
    website: "https://youmika.site",
    twitter: "https://x.com/yomika_official",
    isVerified: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    followersCount: 1420,
    followingCount: 34,
    totalReads: 48900,
    coins: 5000,
    totalTipsReceived: 1200,
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "creator-ren-kurogane",
    name: "Ren Kurogane",
    username: "ren_kurogane",
    email: "ren.kurogane@yomika.site",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=85",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85",
    bio: "Author of 'Shadow's Ascent'. Writing dark progression fantasy, LitRPG systems, and high-octane dungeon action.",
    country: "Japan",
    website: "https://youmika.site/creator/ren_kurogane",
    twitter: "https://x.com/ren_kurogane",
    isVerified: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    followersCount: 980,
    followingCount: 12,
    totalReads: 38400,
    coins: 1800,
    totalTipsReceived: 850,
    createdAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "creator-elena-rostova",
    name: "Elena Rostova",
    username: "elena_writes",
    email: "elena.rostova@yomika.site",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=85",
    banner: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1600&auto=format&fit=crop&q=85",
    bio: "Gothic fantasy writer & worldbuilder. Creating immersive dark medieval lore, cursed bloodlines, and atmospheric horror.",
    country: "United Kingdom",
    website: "https://youmika.site/creator/elena_writes",
    isVerified: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    followersCount: 840,
    followingCount: 19,
    totalReads: 31200,
    coins: 1200,
    totalTipsReceived: 620,
    createdAt: "2026-02-18T00:00:00.000Z",
  },
  {
    id: "creator-kaito-tanaka",
    name: "Kaito Tanaka",
    username: "kaito_neon",
    email: "kaito.tanaka@yomika.site",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=85",
    banner: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=85",
    bio: "Cyberpunk novelist & sci-fi enthusiast. Exploring artificial intelligence, corporate espionage, and futuristic Tokyo.",
    country: "Japan",
    website: "https://youmika.site/creator/kaito_neon",
    isVerified: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    followersCount: 650,
    followingCount: 22,
    totalReads: 24500,
    coins: 950,
    totalTipsReceived: 410,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "creator-aoi-hoshino",
    name: "Aoi Hoshino",
    username: "aoi_manga",
    email: "aoi.manga@yomika.site",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85",
    bio: "Professional Manga & Webtoon Artist. Drawing serialized action webcomics with vertical scrolling and audio dubbing.",
    country: "South Korea",
    website: "https://youmika.site/creator/aoi_manga",
    isVerified: true,
    isCreatorProfileComplete: true,
    isEmailVerified: true,
    isAgeVerified: true,
    followersCount: 1150,
    followingCount: 15,
    totalReads: 42100,
    coins: 2400,
    totalTipsReceived: 1100,
    createdAt: "2026-03-05T00:00:00.000Z",
  },
];

// ============================================================================
// TOP-TIER SERIAL LIGHT NOVELS WITH AUTHENTIC CHAPTERS
// ============================================================================

export const SEED_NOVELS: Novel[] = [
  {
    id: "novel-shadows-ascent",
    creatorId: "creator-ren-kurogane",
    creator: {
      id: "creator-ren-kurogane",
      name: "Ren Kurogane",
      username: "ren_kurogane",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=85",
      isVerified: true,
    },
    title: "Shadow's Ascent: Reborn with the Monarch System",
    slug: "shadows-ascent",
    description:
      "When the crimson rift tore through Shinjuku, Ray lost everything. Left for dead in an S-Rank abyss dungeon, a mysterious black prompt flickered before his fading vision: [Condition Met: The Shadow Monarch System has awakened]. Now armed with infinite necromantic power and level-up authority, he begins his ascent from the weakest rank to the supreme ruler of all realms.",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=85",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85",
    genre: "Action",
    secondaryGenre: "LitRPG",
    tags: ["System", "Rebirth", "Dungeon", "Overpowered", "Dark Fantasy", "Necromancy"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 48920,
    reads: 38400,
    likesCount: 3120,
    bookmarksCount: 2450,
    rating: 4.92,
    totalRatings: 420,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 3,
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-08-20T00:00:00.000Z",
    chapters: [
      {
        id: "ch-sa-1",
        novelId: "novel-shadows-ascent",
        chapterNumber: 1,
        title: "Chapter 1: The Crimson Abyss",
        content: `The taste of copper and ozone filled Ray's mouth as he pressed his back against the shattered obsidian altar.

Around him, the raid team was gone. The S-Rank Crimson Rift had collapsed five levels deeper than the guild intelligence predicted. Where there should have been dormant crystalline golems, there were towering Blood Chimeras with jaws like hydraulic presses.

"Just... one more breath," Ray whispered, clutching his broken left shoulder.

[ALERT: Host Vital Signs Critical — 4%]
[WARNING: Physical Death Imminent in 32 Seconds]

A colossal shadow stepped through the smoke. The Chimera Alpha's crimson eyes glowed like twin supernovas. It raised a taloned arm the size of a war hammer, preparing to crush the last survivor into dust.

Ray looked up. He didn't close his eyes. In this world of awakened hunters, he had been mocked as the 'E-Rank Scrap Collector.' He had bled for bread, carried the guild's baggage, and watched prodigies laugh in golden armor.

'If death is all that waits,' Ray thought, his grip tightening on a broken dagger blade, 'then I will die looking up.'

The beast lunged.

*BZZZZT.*

Time stopped. The falling dust motes froze in mid-air. The beast's fangs hung motionless three inches from Ray's face.

In the center of the frozen abyss, a dark violet interface tore through reality.

[HIDDEN QUEST REQUIREMENT FULFILLED: 'Unbroken Will at the Threshold of Despair']
[CALCULATING COMPATIBILITY...]
[MATCH: 100% — THE PRIMORDIAL SHADOW MONARCH HAS CHOSEN HIS VESSEL]

[Do you accept the System's coronation?]
[YES / NO]

Ray coughed a mouthful of dark blood and grinned with cracked lips.

"Yes. Give me everything."`,
        status: "PUBLISHED",
        wordCount: 890,
        isFree: true,
        publishedAt: "2026-02-15T00:00:00.000Z",
        readTimeMinutes: 4,
      },
      {
        id: "ch-sa-2",
        novelId: "novel-shadows-ascent",
        chapterNumber: 2,
        title: "Chapter 2: Arise, First Legion",
        content: `A shockwave of pitch-black lightning erupted from Ray's chest, shattering the frozen time pocket.

[CORONATION COMMENCING...]
[Player Name: Ray Vance]
[Class: Shadow Sovereign (Unique Mythic)]
[Level: 1]
[HP: Fully Restored | MP: 500/500]
[Strength: 25 (+15) | Agility: 30 (+20) | Intelligence: 45]

![Ray Vance Awakens the Primordial Shadow Monarch Power](https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=85)

The Blood Chimera Alpha roared in fury as the divine aura blasted it backward against the cavern wall. It shook its horned skull, confused by the frail human now radiating an abyss of dark power.

Ray stood up. His broken bones knitted back together in a burst of violet embers. The dull pain in his chest vanished, replaced by an intoxicating surge of raw magical pressure.

"So this is what power feels like," Ray murmured, flexing his fingers.

The Chimera charged again, ground shaking under its immense weight.

Ray didn't dodge. With a single fluid step, his speed blurred past the beast's sight. He appeared directly above the beast's neck, his right hand enveloped in spiraling dark mist.

[SKILL ACTIVATED: 'Shadow Strike Lv.1']

*CRACK!*

A thunderous blow shattered the beast's spinal armor. The Chimera crashed to the stone floor with a deafening thud, its vitality bar evaporating to zero in three seconds flat.

[You have defeated the Dungeon Boss: Blood Chimera Alpha (Lv. 45)]
[EXP Earned: +14,500]
[Level Up! Level Up! Level Up!]
[Current Level: 7]

Ray stood over the massive corpse as black smoke began to seep from its lifeless flesh.

[UNIQUE SKILL: 'Shadow Extraction' is now available.]
[Extract the soul of the defeated entity to serve in your eternal army.]

Ray reached his hand forward and uttered a single command:

"Arise."`,
        status: "PUBLISHED",
        wordCount: 940,
        isFree: true,
        publishedAt: "2026-02-18T00:00:00.000Z",
        readTimeMinutes: 4,
      },
      {
        id: "ch-sa-3",
        novelId: "novel-shadows-ascent",
        chapterNumber: 3,
        title: "Chapter 3: Return to the Surface",
        content: `From the black mist rising off the Chimera's corpse, glowing violet claws emerged.

A towering armored specter rose, clad in obsidian shadow plate with twin glowing sapphire eyes. It knelt reverently on one knee before Ray, bowing its horned head to the stone floor.

[EXTRACTION SUCCESSFUL!]
[Shadow Knight: 'Grimclaw' (Elite Grade) has sworn fealty.]
[Shadow Storage Capacity: 1/30]

Ray looked at the spectral beast. It possessed 80% of its former boss stats, but with zero stamina depletion and complete regeneration within his shadow domain.

"Rise, Grimclaw," Ray ordered.

The shadow beast merged into Ray's shadow with a soft ripple. From the surface above, the faint sounds of emergency sirens and guild recovery helicopters echoed down the rift shaft.

Outside the gate, the Hunter Association medical teams were setting up body bags.

"Any survivors from the 7th Vanguard?" a commander shouted.

"None, sir. The S-Rank mana spike wiped the entire dungeon floor."

Suddenly, the crimson gate glowed bright purple. The heavy dungeon barrier parted, and footsteps echoed through the dust.

A young man stepped out into the blinding sunlight, his eyes burning with dark violet fire.

The world of awakened hunters was about to change forever.`,
        status: "PUBLISHED",
        wordCount: 880,
        isFree: true,
        publishedAt: "2026-02-22T00:00:00.000Z",
        readTimeMinutes: 4,
      },
    ],
  },
  {
    id: "novel-bound-by-blood",
    creatorId: "creator-elena-rostova",
    creator: {
      id: "creator-elena-rostova",
      name: "Elena Rostova",
      username: "elena_writes",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=85",
      isVerified: true,
    },
    title: "Bound by Blood: The Demon Hunter's Vow",
    slug: "bound-by-blood",
    description:
      "In the mist-shrouded cathedral city of Val-Kareth, demon hunters are cursed to drink the blood of the fiends they slay. Kaelen is the last of the Silver Order—bearing a cursed bloodline that threatens to consume his humanity with every strike of his blade.",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
    bannerUrl: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1600&auto=format&fit=crop&q=85",
    genre: "Fantasy",
    secondaryGenre: "Supernatural",
    tags: ["Dark Fantasy", "Gothic", "Demon Hunter", "Sword & Sorcery", "Cursed Hero"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 41200,
    reads: 32400,
    likesCount: 2890,
    bookmarksCount: 2100,
    rating: 4.88,
    totalRatings: 380,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    chaptersCount: 2,
    createdAt: "2026-02-18T00:00:00.000Z",
    updatedAt: "2026-08-21T00:00:00.000Z",
    chapters: [
      {
        id: "ch-bb-1",
        novelId: "novel-bound-by-blood",
        chapterNumber: 1,
        title: "Chapter 1: The Silver Vow",
        content: `The rain over Val-Kareth fell like liquid lead, washing ash through the cobblestone alleys of the lower ward.

Kaelen knelt on the stone gargoyle overlooking the cathedral square. His long silver-stitched greatcoat billowed against the howling gale. Beneath his leather gloves, the cursed black veins on his forearms throbbed with a burning hunger.

"They are inside the crypts," a soft voice whispered behind him.

Lady Vivienne stepped onto the parapet, her raven hair bound with crimson velvet ribbon. She held a silver vial of consecrated essence.

"You took three doses yesterday, Kaelen. Another hunt will push the curse past the 4th seal."

"If I do not hunt tonight, Vivienne, there will be no city left to save by sunrise."

Kaelen drew the greatsword from his back. The silver blade caught the lightning, illuminating ancient glyphs etched deep into the runic steel. The sword hummed with the trapped souls of fifty arch-demons.

He leapt from the spire into the abyss below.`,
        status: "PUBLISHED",
        wordCount: 780,
        isFree: true,
        publishedAt: "2026-02-18T00:00:00.000Z",
        readTimeMinutes: 3,
      },
      {
        id: "ch-bb-2",
        novelId: "novel-bound-by-blood",
        chapterNumber: 2,
        title: "Chapter 2: Beneath the Hallowed Crypt",
        content: `The crypt doors lay splintered like kindling.

Inside, the scent of sulfur and burned incense hung heavy in the damp chill. Dozens of acolytes lay unconscious along the stone colonnade, their life force steadily being siphoned toward a pulsing crimson seal in the central vault.

In the center stood Malakor, a Greater Fiend of the 3rd Circle. Four curved horns curled from his skull, and six eyes burned with unholy flame.

"Ah, the last dog of the Silver Order," Malakor hissed, his voice vibrating like scraped bone. "You smell more like demon than man today, hunter."

"That only makes it easier to cut your throat," Kaelen replied softly.

The clash of silver and demonic iron rang through the subterranean darkness like funeral bells.`,
        status: "PUBLISHED",
        wordCount: 820,
        isFree: true,
        publishedAt: "2026-02-21T00:00:00.000Z",
        readTimeMinutes: 4,
      },
    ],
  },
  {
    id: "novel-cyberpunk-2099",
    creatorId: "creator-kaito-tanaka",
    creator: {
      id: "creator-kaito-tanaka",
      name: "Kaito Tanaka",
      username: "kaito_neon",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=85",
      isVerified: true,
    },
    title: "Cyberpunk 2099: Ghost of Neo-Shinjuku",
    slug: "cyberpunk-2099",
    description:
      "In the neon-drenched megacity of Neo-Shinjuku, memories are bought and sold on the dark net. Ren is a rogue cyber-operative with an illegal neural implant that allows him to hijack corporate combat drones in real time.",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85",
    bannerUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=85",
    genre: "Sci-Fi",
    secondaryGenre: "Cyberpunk",
    tags: ["Cyberpunk", "Hacking", "AI", "Neon", "Tech Thriller", "Mercenary"],
    language: "en",
    status: "ONGOING",
    contentRating: "TEEN",
    views: 31500,
    reads: 24500,
    likesCount: 1980,
    bookmarksCount: 1650,
    rating: 4.78,
    totalRatings: 290,
    isFeatured: true,
    isEditorPick: false,
    isPremium: false,
    chaptersCount: 2,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-08-22T00:00:00.000Z",
    chapters: [
      {
        id: "ch-cp-1",
        novelId: "novel-cyberpunk-2099",
        chapterNumber: 1,
        title: "Chapter 1: Neon Static",
        content: `Rain hammered the holographic billboards advertising synthetic happiness above Sector 4.

Ren plugged his optic cable directly into the rusted access terminal behind the noodle stall. Instantly, the digital layer of the city exploded across his retinas in cascading cyan and amber hex codes.

[NEURAL OVERCLOCK: ACTIVE — 140%]
[WARNING: THERMAL SINK AT 78°C]

"Target acquired," Ren muttered into his sub-vocal mic. "Arasaka convoy crossing the Takahashi Skybridge in three minutes."`,
        status: "PUBLISHED",
        wordCount: 750,
        isFree: true,
        publishedAt: "2026-03-01T00:00:00.000Z",
        readTimeMinutes: 3,
      },
      {
        id: "ch-cp-2",
        novelId: "novel-cyberpunk-2099",
        chapterNumber: 2,
        title: "Chapter 2: The Ghost Protocol",
        content: `The skybridge security turrets swung toward the sky as Ren overrode their encrypted firewall.

With a flick of his cybernetic wrist, three military assault drones detached from the corporate convoy and turned their targeting lasers directly on their own escort vehicles.

"Welcome to Neo-Shinjuku," Ren smiled in the dark.`,
        status: "PUBLISHED",
        wordCount: 790,
        isFree: true,
        publishedAt: "2026-03-04T00:00:00.000Z",
        readTimeMinutes: 3,
      },
    ],
  },
];

// ============================================================================
// SERIALIZED WEBTOON & MANGA COMICS
// ============================================================================

export const SEED_COMICS: Comic[] = [
  {
    id: "comic-blade-eclipse",
    creatorId: "creator-aoi-hoshino",
    creator: {
      id: "creator-aoi-hoshino",
      name: "Aoi Hoshino",
      username: "aoi_manga",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
      isVerified: true,
    },
    title: "Blade of the Eclipse",
    slug: "blade-of-the-eclipse",
    description:
      "When the moon turned blood-red over the imperial capital, ancient sealed demons awakened. A lone rogue swordsman must master the forbidden Eclipse breathing style to protect humanity.",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=85",
    bannerUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=85",
    genre: "Action",
    secondaryGenre: "Supernatural",
    tags: ["Manga", "Webtoon", "Samurai", "Demons", "Sword Action"],
    language: "en",
    format: "VERTICAL",
    readingDirection: "VERTICAL",
    subType: "WEBTOON",
    allowPdfDownload: true,
    status: "ONGOING",
    contentRating: "TEEN",
    views: 52400,
    reads: 42100,
    likesCount: 3890,
    bookmarksCount: 2800,
    rating: 4.94,
    totalRatings: 510,
    isFeatured: true,
    isEditorPick: true,
    isPremium: false,
    episodesCount: 2,
    createdAt: "2026-03-05T00:00:00.000Z",
    updatedAt: "2026-08-24T00:00:00.000Z",
    episodes: [
      {
        id: "ep-be-1",
        comicId: "comic-blade-eclipse",
        episodeNumber: 1,
        title: "Episode 1: The Blood Moon Rises",
        thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=85",
        ],
        status: "PUBLISHED",
        publishedAt: "2026-03-05T00:00:00.000Z",
        likesCount: 1420,
      },
      {
        id: "ep-be-2",
        comicId: "comic-blade-eclipse",
        episodeNumber: 2,
        title: "Episode 2: The First Breath",
        thumbnailUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=85",
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=85",
        ],
        status: "PUBLISHED",
        publishedAt: "2026-03-12T00:00:00.000Z",
        likesCount: 1180,
      },
    ],
  },
];

// ============================================================================
// LIVE CONTEST WITH $1,000 CASH PRIZE POOL
// ============================================================================

export const SEED_CONTESTS: Contest[] = [
  {
    id: "contest-grand-creator-2026",
    contestNumber: 1,
    title: "The Yomika Grand Storytelling Awards 2026",
    slug: "yomika-grand-awards-2026",
    subtitle: "Compete with original serial web novels & webtoons for cash prizes & editorial contracts!",
    description:
      "Welcome to Yomika's flagship seasonal creator competition. Publish original chapters, engage with readers, and climb the leaderboard for a share of the $1,000 cash prize pool and guaranteed official serialization contract.",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85",
    heroCoverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=85",
    category: "Web Novels & Webtoon Comics",
    prizePool: "$1,000 USD",
    prizeStructure: [
      { place: "🥇 1st Place (Grand Champion)", reward: "$500 USD", desc: "Cash Prize + Homepage Banner Spotlight + Official Verified Creator Badge" },
      { place: "🥈 2nd Place (Runner Up)", reward: "$300 USD", desc: "Cash Prize + Featured Story Recommendation + Creator Spotlight" },
      { place: "🥉 3rd Place (Rising Star)", reward: "$200 USD", desc: "Cash Prize + Official Contest Trophy Badge + Social Media Promotion" },
    ],
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: "2026-09-30T23:59:59.000Z",
    status: "ACTIVE",
    isPublished: true,
    rules: [
      "Must be 100% original work owned by the author",
      "Minimum 2 published chapters or episodes to qualify",
      "No plagiarized or copyrighted character usage",
      "Community reader engagement and editorial review will decide final winners",
    ],
    judgingCriteria: [
      { title: "Storytelling & Plot Depth", weight: "35%", desc: "Engaging narrative hook, character development, and pacing." },
      { title: "Worldbuilding & Originality", weight: "25%", desc: "Unique concepts, creative magic systems or sci-fi lore." },
      { title: "Reader Engagement", weight: "25%", desc: "Likes, bookmarks, reads, and chapter discussions." },
      { title: "Consistency & Craft", weight: "15%", desc: "Regular updates, clean typography, and visual presentation." },
    ],
    eligibleGenres: ["Action", "Fantasy", "Sci-Fi", "Romance", "Wuxia", "Mystery", "Cyberpunk"],
    minChapters: 2,
    submissionCount: 28,
  },
];

// ============================================================================
// ACTIVE COMMUNITY DISCUSSION THREADS
// ============================================================================

export const SEED_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    userId: "user-abhishek-master",
    user: {
      name: "Abhishek Megwansi",
      username: "abhishek",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=85",
      badge: "Founder",
    },
    category: "Announcements",
    title: "🎉 Welcome to Yomika — The Future of Global Storytelling & Creator Monetization!",
    content:
      "We are thrilled to welcome all authors, manga artists, and story lovers to Yomika! Our mission is simple: provide creators with 100% IP ownership, rich reader tools (Danmaku reactions, voice dubbing), and instant reader tipping. Let us know what genres you're writing in the comments below!",
    tags: ["YomikaLaunch", "Welcome", "Creators", "WritingCommunity"],
    upvotes: 245,
    commentsCount: 38,
    views: 3120,
    isPinned: true,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "post-2",
    userId: "creator-ren-kurogane",
    user: {
      name: "Ren Kurogane",
      username: "ren_kurogane",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=85",
      badge: "Author",
    },
    category: "Writing Prompts",
    title: "How do you design a System / LitRPG interface that feels rewarding to readers?",
    content:
      "When writing 'Shadow's Ascent', I spent weeks balancing stat gains, skill cooldowns, and level progression so the protagonist feels earned rather than cheap. What are your favorite system mechanics in web novels?",
    tags: ["LitRPG", "SystemNovel", "WritingTips", "ProgressionFantasy"],
    upvotes: 180,
    commentsCount: 24,
    views: 1950,
    isPinned: false,
    createdAt: "2026-08-15T00:00:00.000Z",
  },
  {
    id: "post-3",
    userId: "creator-aoi-hoshino",
    user: {
      name: "Aoi Hoshino",
      username: "aoi_manga",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=85",
      badge: "Artist",
    },
    category: "Creator Lounge",
    title: "Panel layout tip: Why vertical gutter spacing matters for mobile webtoons",
    content:
      "Reading on a smartphone is completely different from paper manga. Giving dramatic pauses 400px of negative vertical space increases reader tension by 10x! What software do you use for your webtoon line art?",
    tags: ["WebtoonArt", "MangaTips", "DigitalArt", "CreatorStudio"],
    upvotes: 142,
    commentsCount: 19,
    views: 1620,
    isPinned: false,
    createdAt: "2026-08-20T00:00:00.000Z",
  },
];

export const SEED_REPORTS: ReportItem[] = [];
