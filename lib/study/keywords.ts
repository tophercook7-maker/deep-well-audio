import type { ParsedPassage } from "@/lib/study/refs";

export type StudyKeyword = {
  /** English surface word in verse (match loosely) */
  surface: string;
  original: string;
  language: "Greek" | "Hebrew";
  transliteration: string;
  pronunciation: string;
  shortDefinition: string;
  expanded: string;
  /** Stub: verses that echo the same root (optional) */
  relatedVerses?: string[];
};

const JOHN_3_16: StudyKeyword[] = [
  {
    surface: "loved",
    original: "ἠγάπησεν",
    language: "Greek",
    transliteration: "ēgapēsen",
    pronunciation: "ay-GAH-pay-sen",
    shortDefinition: "loved deeply, chose to love",
    expanded:
      "Not merely affection—this kind of love is purposeful and costly. It is the love that acts for the beloved’s good.",
    relatedVerses: ["1 John 4:9–10", "Romans 5:8"],
  },
  {
    surface: "world",
    original: "κόσμον",
    language: "Greek",
    transliteration: "kosmon",
    pronunciation: "KOSS-mon",
    shortDefinition: "the world order—people and cultures under sin’s shadow",
    expanded:
      "Here it points to humanity in need of rescue, not only geography. God’s love reaches outward, not inward to a small club.",
    relatedVerses: ["John 1:29", "John 4:42"],
  },
  {
    surface: "believes",
    original: "πιστεύων",
    language: "Greek",
    transliteration: "pisteuōn",
    pronunciation: "pis-TEV-ohn",
    shortDefinition: "trusts, entrusts oneself to",
    expanded:
      "Faith here is active reliance on Christ—not a mere opinion, but leaning your weight on what Jesus has done.",
    relatedVerses: ["John 6:29", "Romans 10:9"],
  },
  {
    surface: "eternal life",
    original: "ζωὴν αἰώνιον",
    language: "Greek",
    transliteration: "zōēn aiōnion",
    pronunciation: "ZOH-ayn eye-OH-nee-on",
    shortDefinition: "the life of the age to come—God’s own life in you",
    expanded:
      "More than endless time: it is participation in God’s kingdom life—beginning now, fulfilled fully in God’s new creation.",
    relatedVerses: ["John 17:3", "Romans 6:23"],
  },
];

const ROMANS_8_28: StudyKeyword[] = [
  {
    surface: "works",
    original: "συνεργεῖ",
    language: "Greek",
    transliteration: "synergei",
    pronunciation: "soon-ER-gay",
    shortDefinition: "works together with",
    expanded: "God weaves even hardship into a redemptive pattern for those who love him and are called to his purpose.",
  },
  {
    surface: "good",
    original: "ἀγαθοῖς",
    language: "Greek",
    transliteration: "agathois",
    pronunciation: "ah-GAH-thoys",
    shortDefinition: "good, beneficial, aligned with God’s character",
    expanded: "The good here is God-shaped good—not merely comfortable circumstances.",
  },
  {
    surface: "purpose",
    original: "πρόθεσιν",
    language: "Greek",
    transliteration: "prothesin",
    pronunciation: "PRO-theh-sin",
    shortDefinition: "a set plan; what God has purposed beforehand",
    expanded: "God’s calling is anchored in his foreknown intention to shape you into Christ’s likeness.",
  },
];

const JOHN_1_1: StudyKeyword[] = [
  {
    surface: "beginning",
    original: "ἀρχῇ",
    language: "Greek",
    transliteration: "archē",
    pronunciation: "AR-khay",
    shortDefinition: "the first, the starting point",
    expanded: "John echoes Genesis: before time as we measure it, the Word already was—with God, and as God.",
  },
  {
    surface: "Word",
    original: "λόγος",
    language: "Greek",
    transliteration: "logos",
    pronunciation: "LOH-goss",
    shortDefinition: "God’s self-expression; personal divine communication",
    expanded: "Not a mere idea: the Word is someone you can hear, trust, and follow—revealed fully in Jesus.",
  },
  {
    surface: "God",
    original: "θεός",
    language: "Greek",
    transliteration: "theos",
    pronunciation: "theh-OSS",
    shortDefinition: "the one true God—Father in this opening line",
    expanded: "The Word was toward the Father and of the same divine nature: intimacy without confusion.",
  },
];

const MATTHEW_5_3: StudyKeyword[] = [
  {
    surface: "poor in spirit",
    original: "πτωχοὶ τῷ πνεύματι",
    language: "Greek",
    transliteration: "ptōchoi tō pneumati",
    pronunciation: "PTO-khoy toh pnev-MAH-tee",
    shortDefinition: "humble before God—not self-reliant",
    expanded: "Blessedness begins where pride ends: people who know they need God’s mercy, not their own resume.",
  },
  {
    surface: "kingdom",
    original: "βασιλεία",
    language: "Greek",
    transliteration: "basileia",
    pronunciation: "bah-see-LAY-ah",
    shortDefinition: "God’s reign—his saving rule breaking in",
    expanded: "The kingdom is a gift received, not a trophy earned; it belongs to the lowly who look to Christ.",
  },
];

const ROMANS_12_2: StudyKeyword[] = [
  {
    surface: "transformed",
    original: "μεταμορφοῦσθε",
    language: "Greek",
    transliteration: "metamorphousthe",
    pronunciation: "meh-ta-mor-FOH-stheh",
    shortDefinition: "changed in form—like a caterpillar to a butterfly",
    expanded: "God reshapes desires and loves from the inside out, not by pressure to conform outwardly.",
  },
  {
    surface: "renewed",
    original: "ἀνακαίνωσις",
    language: "Greek",
    transliteration: "anakainōsis",
    pronunciation: "ah-nah-kye-NOH-sis",
    shortDefinition: "made new again",
    expanded: "The mind learns to read life the way God reads it—through mercy, truth, and the good of others.",
  },
];

const PHILIPPIANS_4_6: StudyKeyword[] = [
  {
    surface: "anxious",
    original: "μεριμνᾶτε",
    language: "Greek",
    transliteration: "merimnate",
    pronunciation: "meh-rim-NAH-teh",
    shortDefinition: "pulled apart with worry",
    expanded: "Care for real things is good; fret that fractures trust is what Paul gently calls us to hand over.",
  },
  {
    surface: "thanksgiving",
    original: "εὐχαριστίᾳ",
    language: "Greek",
    transliteration: "eucharistia",
    pronunciation: "yoo-khar-is-TEE-ah",
    shortDefinition: "grateful acknowledgment of God’s goodness",
    expanded: "Thanksgiving reframes the heart before the circumstance changes—faith sees reasons to bless God.",
  },
];

const GENESIS_1_1: StudyKeyword[] = [
  {
    surface: "created",
    original: "בָּרָא",
    language: "Hebrew",
    transliteration: "bārāʾ",
    pronunciation: "bah-RAH",
    shortDefinition: "made from nothing; brought into being",
    expanded: "The universe is not accidental; God speaks and reality answers—good news for a restless mind.",
  },
  {
    surface: "beginning",
    original: "רֵאשִׁית",
    language: "Hebrew",
    transliteration: "rēʾšît",
    pronunciation: "ray-SHEET",
    shortDefinition: "the starting point of the story",
    expanded: "Time itself has a before-and-after: history is going somewhere because God began it on purpose.",
  },
];

const ISAIAH_53_5: StudyKeyword[] = [
  {
    surface: "pierced",
    original: "נִדְּקָה",
    language: "Hebrew",
    transliteration: "nidqāh",
    pronunciation: "nid-KAH",
    shortDefinition: "wounded through, pierced",
    expanded: "The servant bears pain that belongs to others—love that absorbs hurt instead of returning it.",
  },
  {
    surface: "healing",
    original: "מַרְפֵּא",
    language: "Hebrew",
    transliteration: "marpeʾ",
    pronunciation: "mar-PAY",
    shortDefinition: "restoration, wholeness",
    expanded: "Peace with God touches body and soul; the deepest healing is being reconciled to your Maker.",
  },
];

const EPHESIANS_2_8: StudyKeyword[] = [
  {
    surface: "grace",
    original: "χάριτι",
    language: "Greek",
    transliteration: "chariti",
    pronunciation: "KHA-ree-tee",
    shortDefinition: "God’s undeserved favor",
    expanded: "You are welcomed before you are fixed—God’s kindness arrives while we are still unable to save ourselves.",
  },
  {
    surface: "faith",
    original: "πίστεως",
    language: "Greek",
    transliteration: "pisteōs",
    pronunciation: "PEE-steh-ohs",
    shortDefinition: "trust that receives what God gives",
    expanded: "Faith is the open hand, not the achievement—receiving Christ as Lord and gift.",
  },
];

const FIRST_CORINTHIANS_13_4: StudyKeyword[] = [
  {
    surface: "love",
    original: "ἀγάπη",
    language: "Greek",
    transliteration: "agapē",
    pronunciation: "ah-GAH-pay",
    shortDefinition: "self-giving commitment to another’s good",
    expanded: "This love is patient and kind because it begins with God’s own heart toward us.",
  },
  {
    surface: "patient",
    original: "μακροθυμεῖ",
    language: "Greek",
    transliteration: "makrothumei",
    pronunciation: "mak-roh-thoo-MAY",
    shortDefinition: "slow to anger; long-fused",
    expanded: "Love makes space for people to grow, fail, and return—mirroring how God deals with us.",
  },
];

const PSALM_119_105: StudyKeyword[] = [
  {
    surface: "lamp",
    original: "נֵר",
    language: "Hebrew",
    transliteration: "nēr",
    pronunciation: "nare",
    shortDefinition: "light for the next step",
    expanded: "Scripture doesn’t always show the whole map at once—it lights the path under your feet.",
  },
  {
    surface: "light",
    original: "אוֹר",
    language: "Hebrew",
    transliteration: "ʾôr",
    pronunciation: "ore",
    shortDefinition: "illumination; clarity",
    expanded: "God’s word clears moral fog so you can walk without stumbling in the dark.",
  },
];

const MATTHEW_11_28: StudyKeyword[] = [
  {
    surface: "weary",
    original: "κοπιῶντες",
    language: "Greek",
    transliteration: "kopiōntes",
    pronunciation: "ko-pee-ON-tes",
    shortDefinition: "worn out from labor or care",
    expanded: "Jesus speaks to people carrying loads—religious, emotional, or daily—that never seem to lighten.",
  },
  {
    surface: "rest",
    original: "ἀναπαύσω",
    language: "Greek",
    transliteration: "anapausō",
    pronunciation: "ah-nah-POW-soh",
    shortDefinition: "refresh; cease striving",
    expanded: "His rest is not laziness—it is relief found in trusting the one who finished the heavy lifting.",
  },
];

const HEBREWS_4_12: StudyKeyword[] = [
  {
    surface: "living",
    original: "ζῶν",
    language: "Greek",
    transliteration: "zōn",
    pronunciation: "zone",
    shortDefinition: "alive and active",
    expanded: "God’s word is not a dead relic—it addresses the conscience with present authority.",
  },
  {
    surface: "sword",
    original: "μάχαιραν",
    language: "Greek",
    transliteration: "machairan",
    pronunciation: "MAH-khee-ran",
    shortDefinition: "a sharp blade—here, piercing truth",
    expanded: "The word cuts through excuses and mixed motives to expose what we truly love.",
  },
];

const PROVERBS_3_5: StudyKeyword[] = [
  {
    surface: "Trust",
    original: "בְּטַח",
    language: "Hebrew",
    transliteration: "bāṭaḥ",
    pronunciation: "bah-TAKH",
    shortDefinition: "lean your whole weight on",
    expanded: "Trust is not a mood—it is a settled reliance on God’s character when outcomes are unclear.",
  },
  {
    surface: "heart",
    original: "לֵב",
    language: "Hebrew",
    transliteration: "lēv",
    pronunciation: "layve",
    shortDefinition: "the inner person—mind, will, affections",
    expanded: "God asks for the center of the self, not a polished surface—honesty before him opens wisdom.",
  },
];

const PSALM_23_1: StudyKeyword[] = [
  {
    surface: "Lord",
    original: "יְהוָה",
    language: "Hebrew",
    transliteration: "YHWH",
    pronunciation: "yah-WEH (traditional)",
    shortDefinition: "God’s covenant name—faithful presence",
    expanded: "The psalm begins with relationship: the Lord personally shepherds his own.",
  },
  {
    surface: "shepherd",
    original: "רֹעִי",
    language: "Hebrew",
    transliteration: "roʿi",
    pronunciation: "roh-EE",
    shortDefinition: "one who feeds, leads, and guards the flock",
    expanded: "A shepherd knows each sheep; God’s care is attentive, not distant management.",
  },
  {
    surface: "want",
    original: "אֶחְסָר",
    language: "Hebrew",
    transliteration: "ʾeḥsar",
    pronunciation: "ekh-SAR",
    shortDefinition: "lack, be without",
    expanded: "Not every want removed—but nothing essential withheld for those kept in his fold.",
  },
];

const TABLE: Record<string, StudyKeyword[]> = {
  "JHN:1:1": JOHN_1_1,
  "JHN:1:1-5": JOHN_1_1,
  "JHN:3:16": JOHN_3_16,
  "JHN:3:16-18": JOHN_3_16,
  "MAT:5:3": MATTHEW_5_3,
  "MAT:5:3-12": MATTHEW_5_3,
  "MAT:11:28": MATTHEW_11_28,
  "ROM:8:28": ROMANS_8_28,
  "ROM:12:2": ROMANS_12_2,
  "PHP:4:6": PHILIPPIANS_4_6,
  "PHP:4:6-7": PHILIPPIANS_4_6,
  "GEN:1:1": GENESIS_1_1,
  "ISA:53:5": ISAIAH_53_5,
  "EPH:2:8": EPHESIANS_2_8,
  "EPH:2:8-9": EPHESIANS_2_8,
  "1CO:13:4": FIRST_CORINTHIANS_13_4,
  "1CO:13:4-7": FIRST_CORINTHIANS_13_4,
  "PSA:23:1": PSALM_23_1,
  "PSA:119:105": PSALM_119_105,
  "HEB:4:12": HEBREWS_4_12,
  "PRO:3:5": PROVERBS_3_5,
  "PRO:3:5-6": PROVERBS_3_5,
};

export function keywordsForPassage(p: ParsedPassage, max: number): StudyKeyword[] {
  const row = TABLE[p.verseKey];
  if (row) return row.slice(0, max);
  const single = TABLE[`${p.book.apiBookId}:${p.chapter}:${p.verseFrom}`];
  if (single) return single.slice(0, max);
  return genericKeywords(p, max);
}

function genericKeywords(p: ParsedPassage, max: number): StudyKeyword[] {
  const isNt = !["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"].includes(
    p.book.apiBookId
  );
  const lang: StudyKeyword["language"] = isNt ? "Greek" : "Hebrew";
  return [
    {
      surface: "this passage",
      original: isNt ? "λόγος" : "דָּבָר",
      language: lang,
      transliteration: isNt ? "logos" : "davar",
      pronunciation: isNt ? "LOH-goss" : "dah-VAHR",
      shortDefinition: "God’s word in human words",
      expanded:
        "We’re still growing curated word studies across the whole Bible. For now, read slowly, notice repeated ideas, and return to the teaching that brought you here.",
    },
  ].slice(0, max);
}
