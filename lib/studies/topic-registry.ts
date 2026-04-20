import type { StudyTopicSlug } from "@/lib/study/catalog";
import type { TopicChapterCard, TopicEngineRecord } from "@/lib/studies/topic-types";

function ch(urlBook: string, chapter: number, label: string, verse?: number, note?: string): TopicChapterCard {
  return { urlBook, chapter, label, verse, note };
}

/**
 * Single source of truth for topic graph metadata: aliases, hub buckets, chapter tiers, curated related topics.
 * Long-form copy lives in `content/study/topics.ts`.
 */
export const TOPIC_ENGINE_BY_SLUG = {
  anxiety: {
    slug: "anxiety",
    searchAliases: ["worry", "worried", "anxious", "stress", "stressed", "panic", "overwhelm", "mental load", "racing thoughts"],
    hubCategories: ["emotional-mental-struggles", "spiritual-growth"],
    chapterTiers: {
      primary: [
        ch("philippians", 4, "Philippians 4 — prayer, thanksgiving, God’s peace", 6),
        ch("matthew", 6, "Matthew 6 — do not be anxious; seek first his kingdom", 25),
        ch("psalms", 56, "Psalm 56 — when I am afraid, I trust in you", 3),
      ],
      supporting: [
        ch("isaiah", 41, "Isaiah 41 — fear not, for I am with you", 10),
        ch("1-peter", 5, "1 Peter 5 — cast all your anxieties on him", 7),
        ch("psalms", 55, "Psalm 55 — cast your burden on the Lord", 22),
      ],
      relatedPassages: [
        ch("psalms", 34, "Psalm 34 — the Lord is near to the brokenhearted", 18),
        ch("proverbs", 3, "Proverbs 3 — trust in the Lord with all your heart", 5),
        ch("james", 1, "James 1 — ask God for wisdom in trials", 5),
      ],
    },
    relatedTopicSlugs: ["fear", "peace", "prayer", "faith", "identity-in-christ", "grace"],
    keyRefSnippets: {
      "Philippians 4:6–7": "Do not be anxious about anything, but in everything by prayer…",
      "Matthew 6:25–34": "Do not be anxious about your life… seek first the kingdom of God.",
      "1 Peter 5:6–7": "Cast all your anxieties on him, because he cares for you.",
      "Psalm 56:3": "When I am afraid, I put my trust in you.",
      "Isaiah 26:3": "You keep him in perfect peace whose mind is stayed on you…",
    },
    quickHelp: {
      lead: "When you feel overwhelmed",
      lines: [
        "Your mind is carrying more than it was made to carry alone.",
        "Scripture does not treat worry as trivial—it points you back to the Father’s care.",
      ],
      verseRefs: ["Philippians 4:6–7", "Matthew 6:34", "Psalm 56:3"],
    },
    featured: true,
    quickHelpHighlight: true,
  },

  faith: {
    slug: "faith",
    searchAliases: [
      "trust",
      "believe",
      "belief",
      "confidence in god",
      "what is faith in the bible",
      "how to have faith",
      "biblical faith",
      "trust god",
    ],
    hubCategories: ["gospel-foundations", "spiritual-growth"],
    chapterTiers: {
      primary: [
        ch("hebrews", 11, "Hebrews 11 — faith defined and exemplified", 1),
        ch("romans", 10, "Romans 10 — faith comes from hearing Christ", 17),
        ch("mark", 9, "Mark 9 — Lord, I believe; help my unbelief", 24),
      ],
      supporting: [
        ch("james", 2, "James 2 — faith and works together", 14),
        ch("galatians", 2, "Galatians 2 — I have been crucified with Christ", 20),
        ch("2-corinthians", 5, "2 Corinthians 5 — walk by faith, not by sight", 7),
      ],
      relatedPassages: [
        ch("philippians", 4, "Philippians 4 — rejoice; the Lord is at hand; peace of God", 4),
        ch("romans", 5, "Romans 5 — justified by faith; peace with God", 1),
        ch("matthew", 17, "Matthew 17 — if you have faith like a grain of mustard seed", 20),
        ch("luke", 7, "Luke 7 — great faith", 9),
        ch("romans", 4, "Romans 4 — Abraham believed God", 3),
      ],
    },
    relatedTopicSlugs: ["salvation", "grace", "identity-in-christ", "anxiety", "fear", "prayer"],
    keyRefSnippets: {
      "Hebrews 11:1": "Faith is the assurance of things hoped for, the conviction of things not seen.",
      "Romans 10:17": "Faith comes from hearing, and hearing through the word of Christ.",
      "Mark 9:24": "I believe; help my unbelief!",
      "James 2:17": "Faith by itself, if it does not have works, is dead.",
      "Galatians 2:20": "I live by faith in the Son of God, who loved me and gave himself for me.",
    },
    quickHelp: {
      lead: "If you’re struggling to believe",
      lines: [
        "Faith is not pretending to feel certain—it is resting your weight on what God has said and done in Christ.",
        "When belief feels thin, Scripture points you to Christ and his Word, not to your own strength.",
      ],
      verseRefs: ["Mark 9:24", "Romans 10:17", "Hebrews 11:6"],
    },
    featured: true,
  },

  purpose: {
    slug: "purpose",
    searchAliases: ["calling", "meaning", "direction", "vocation", "why am i here"],
    hubCategories: ["purpose-direction", "spiritual-growth"],
    chapterTiers: {
      primary: [ch("ephesians", 2, "Ephesians 2 — created for good works", 10), ch("romans", 8, "Romans 8 — called according to his purpose", 28)],
      supporting: [ch("colossians", 3, "Colossians 3 — whatever you do", 17), ch("proverbs", 16, "Proverbs 16 — commit your work to the Lord", 3)],
      relatedPassages: [ch("genesis", 1, "Genesis 1 — image and blessing", 27)],
    },
    relatedTopicSlugs: ["identity-in-christ", "faith", "work", "wisdom"],
  },

  prayer: {
    slug: "prayer",
    searchAliases: ["pray", "intercession", "supplication", "ask god", "lord’s prayer", "dependence on god"],
    hubCategories: ["spiritual-growth", "gospel-foundations"],
    chapterTiers: {
      primary: [
        ch("matthew", 6, "Matthew 6 — the Lord’s Prayer; ask your Father", 9),
        ch("philippians", 4, "Philippians 4 — with thanksgiving let your requests be made known", 6),
        ch("luke", 11, "Luke 11 — Jesus teaches his disciples to pray", 1),
      ],
      supporting: [
        ch("1-thessalonians", 5, "1 Thessalonians 5 — pray without ceasing", 17),
        ch("james", 5, "James 5 — pray for one another", 13),
        ch("hebrews", 4, "Hebrews 4 — draw near to the throne of grace", 16),
      ],
      relatedPassages: [
        ch("psalms", 145, "Psalm 145 — the Lord is near to all who call", 18),
        ch("romans", 8, "Romans 8 — the Spirit helps us in weakness", 26),
        ch("ephesians", 6, "Ephesians 6 — praying at all times in the Spirit", 18),
      ],
    },
    relatedTopicSlugs: ["anxiety", "peace", "faith", "fear", "salvation", "grace"],
    keyRefSnippets: {
      "Matthew 6:9–13": "Our Father in heaven… your kingdom come, your will be done…",
      "Luke 11:1–4": "Lord, teach us to pray…",
      "Philippians 4:6–7": "Do not be anxious about anything, but in everything by prayer…",
      "Romans 8:26": "The Spirit helps us in our weakness…",
      "Hebrews 4:16": "Let us draw near… that we may receive mercy and find grace to help.",
    },
    quickHelp: {
      lead: "When you don’t know what to pray",
      lines: [
        "You do not need polished words—only an honest heart turned toward God.",
        "Prayer is how dependence sounds: asking, thanking, and listening to the One who already knows you.",
      ],
      verseRefs: ["Matthew 6:9–13", "Romans 8:26", "Hebrews 4:16"],
    },
    featured: true,
  },

  peace: {
    slug: "peace",
    searchAliases: ["calm", "rest", "stillness", "reconciliation", "shalom", "quiet heart"],
    hubCategories: ["spiritual-growth", "gospel-foundations", "emotional-mental-struggles"],
    chapterTiers: {
      primary: [
        ch("philippians", 4, "Philippians 4 — the peace of God, which surpasses understanding", 7),
        ch("john", 14, "John 14 — my peace I give to you", 27),
        ch("colossians", 3, "Colossians 3 — let the peace of Christ rule in your hearts", 15),
      ],
      supporting: [
        ch("isaiah", 26, "Isaiah 26 — perfect peace for those whose minds are stayed on him", 3),
        ch("romans", 5, "Romans 5 — peace with God through our Lord Jesus Christ", 1),
        ch("2-thessalonians", 3, "2 Thessalonians 3 — the Lord of peace himself give you peace", 16),
      ],
      relatedPassages: [
        ch("psalms", 4, "Psalm 4 — in peace I will lie down and sleep", 8),
        ch("psalms", 29, "Psalm 29 — the Lord sits enthroned as king forever", 10),
        ch("psalms", 85, "Psalm 85 — the Lord will speak peace to his people", 8),
      ],
    },
    relatedTopicSlugs: ["anxiety", "fear", "prayer", "faith", "salvation", "grace"],
    keyRefSnippets: {
      "John 14:27": "Peace I leave with you; my peace I give to you…",
      "Philippians 4:6–7": "And the peace of God, which surpasses all understanding, will guard your hearts…",
      "Isaiah 26:3": "You keep him in perfect peace whose mind is stayed on you…",
      "Colossians 3:15": "Let the peace of Christ rule in your hearts…",
      "Romans 5:1": "Since we have been justified by faith, we have peace with God…",
    },
    quickHelp: {
      lead: "When you need calm",
      lines: [
        "Peace in Scripture is not only a feeling—it is steadiness anchored in Christ and his finished work.",
        "God’s peace guards the heart when circumstances do not cooperate.",
      ],
      verseRefs: ["John 14:27", "Philippians 4:7", "Isaiah 26:3"],
    },
    quickHelpHighlight: true,
    recentlyExpanded: true,
  },

  fear: {
    slug: "fear",
    searchAliases: ["afraid", "scared", "terror", "courage", "timidity", "uncertainty", "danger"],
    hubCategories: ["emotional-mental-struggles", "freedom-battle"],
    chapterTiers: {
      primary: [
        ch("isaiah", 41, "Isaiah 41 — fear not, for I am with you", 10),
        ch("psalms", 27, "Psalm 27 — the Lord is my light and my salvation", 1),
        ch("2-timothy", 1, "2 Timothy 1 — God gave us a spirit not of fear but of power", 7),
      ],
      supporting: [
        ch("joshua", 1, "Joshua 1 — be strong and courageous", 9),
        ch("psalms", 56, "Psalm 56 — when I am afraid, I put my trust in you", 3),
        ch("1-john", 4, "1 John 4 — perfect love casts out fear", 18),
      ],
      relatedPassages: [
        ch("deuteronomy", 31, "Deuteronomy 31 — it is the Lord who goes before you", 6),
        ch("psalms", 23, "Psalm 23 — I will fear no evil, for you are with me", 4),
        ch("isaiah", 43, "Isaiah 43 — fear not, for I have redeemed you", 1),
      ],
    },
    relatedTopicSlugs: ["anxiety", "peace", "prayer", "faith", "identity-in-christ", "grace"],
    keyRefSnippets: {
      "Isaiah 41:10": "Fear not, for I am with you; be not dismayed, for I am your God…",
      "Psalm 27:1": "The Lord is my light and my salvation; whom shall I fear?",
      "2 Timothy 1:7": "God gave us a spirit not of fear but of power and love and self-control.",
      "Psalm 56:3": "When I am afraid, I put my trust in you.",
      "Joshua 1:9": "Be strong and courageous. Do not be frightened, for the Lord your God is with you…",
    },
    quickHelp: {
      lead: "When you feel afraid",
      lines: [
        "Fear often names what feels out of your control—danger, loss, or the unknown.",
        "Scripture does not shame fear; it points you to the Lord who is present, able, and true.",
      ],
      verseRefs: ["Isaiah 41:10", "Psalm 27:1", "2 Timothy 1:7"],
    },
  },

  suffering: {
    slug: "suffering",
    searchAliases: ["trials", "pain", "hardship", "persecution", "trials and sorrows"],
    hubCategories: ["emotional-mental-struggles", "hard-seasons"],
    chapterTiers: {
      primary: [ch("romans", 5, "Romans 5 — suffering produces endurance", 3), ch("2-corinthians", 4, "2 Corinthians 4 — light momentary affliction", 16), ch("1-peter", 1, "1 Peter 1 — tested faith", 6)],
      supporting: [ch("romans", 8, "Romans 8 — suffering with Christ", 17), ch("james", 1, "James 1 — joy in trials", 2)],
      relatedPassages: [ch("job", 1, "Job — the Lord gives and takes", 21)],
    },
    relatedTopicSlugs: ["faith", "grief", "salvation", "eternal-life"],
  },

  grief: {
    slug: "grief",
    searchAliases: ["mourning", "loss", "bereavement", "sorrow", "lament"],
    hubCategories: ["hard-seasons", "emotional-mental-struggles"],
    chapterTiers: {
      primary: [ch("psalms", 34, "Psalm 34 — the Lord is near to the brokenhearted", 18), ch("john", 11, "John 11 — Jesus weeps", 35), ch("2-corinthians", 1, "2 Corinthians 1 — God of all comfort", 3)],
      supporting: [ch("matthew", 5, "Matthew 5 — blessed are those who mourn", 4), ch("1-thessalonians", 4, "1 Thessalonians 4 — sorrow not as those without hope", 13)],
      relatedPassages: [ch("revelation", 21, "Revelation 21 — he will wipe every tear", 4)],
    },
    relatedTopicSlugs: ["suffering-and-loss", "faith", "eternal-life", "prayer"],
    quickHelp: {
      lead: "Start here if your heart is heavy",
      verseRefs: ["Psalm 34:18", "Matthew 5:4", "2 Corinthians 1:3–5"],
      encouragement: "God is patient with tears. You do not have to pretend grief is small—bring it to him honestly, one day at a time.",
    },
    quickHelpHighlight: true,
    recentlyExpanded: true,
  },

  salvation: {
    slug: "salvation",
    searchAliases: [
      "saved",
      "save",
      "born again",
      "redemption",
      "eternal life",
      "regeneration",
      "justification",
      "how to be saved",
      "what is salvation",
      "need a savior",
    ],
    hubCategories: ["gospel-foundations"],
    chapterTiers: {
      primary: [
        ch("john", 3, "John 3 — God so loved the world", 16),
        ch("romans", 5, "Romans 5 — justified by faith; peace with God", 1),
        ch("ephesians", 2, "Ephesians 2 — by grace through faith you have been saved", 8),
      ],
      supporting: [
        ch("titus", 3, "Titus 3 — saved by his mercy through washing of regeneration", 4),
        ch("acts", 16, "Acts 16 — believe in the Lord Jesus, and you will be saved", 31),
        ch("1-john", 5, "1 John 5 — he who has the Son has life", 11),
      ],
      relatedPassages: [
        ch("romans", 10, "Romans 10 — confess with your mouth Jesus as Lord", 9),
        ch("john", 1, "John 1 — to all who received him… became children of God", 12),
        ch("2-corinthians", 5, "2 Corinthians 5 — new creation; God reconciled us in Christ", 17),
      ],
    },
    relatedTopicSlugs: ["faith", "grace", "identity-in-christ", "anxiety", "fear", "prayer"],
    keyRefSnippets: {
      "Ephesians 2:8–9": "For by grace you have been saved through faith… not a result of works…",
      "John 3:16–17": "Whoever believes in him should not perish but have eternal life…",
      "Romans 5:1": "Since we have been justified by faith, we have peace with God through our Lord Jesus Christ.",
      "Romans 10:9–10": "If you confess with your mouth that Jesus is Lord… you will be saved.",
      "Titus 3:4–7": "He saved us… according to his own mercy… justified by his grace.",
    },
    quickHelp: {
      lead: "If you’re asking how to be saved",
      lines: [
        "Salvation is God’s rescue: from sin and death, through Jesus Christ, received by turning from sin and trusting him—not by earning your way to God.",
        "The same gospel that tells you the bad news about sin tells you the good news: Christ died and rose, and there is forgiveness and new life in his name.",
      ],
      verseRefs: ["John 3:16", "Romans 10:9", "Ephesians 2:8–9"],
    },
    featured: true,
  },

  grace: {
    slug: "grace",
    searchAliases: [
      "unmerited favor",
      "mercy",
      "kindness of god",
      "what is grace in the bible",
      "gods grace meaning",
      "saved by grace",
    ],
    hubCategories: ["gospel-foundations", "spiritual-growth"],
    chapterTiers: {
      primary: [
        ch("ephesians", 2, "Ephesians 2 — by grace you have been saved", 8),
        ch("romans", 3, "Romans 3 — justified by his grace as a gift", 24),
        ch("titus", 2, "Titus 2 — grace of God appeared… training us", 11),
      ],
      supporting: [
        ch("romans", 5, "Romans 5 — grace abounded where sin increased", 20),
        ch("2-corinthians", 12, "2 Corinthians 12 — my grace is sufficient for you", 9),
        ch("john", 1, "John 1 — grace upon grace", 16),
      ],
      relatedPassages: [
        ch("hebrews", 4, "Hebrews 4 — throne of grace… mercy and grace to help", 16),
        ch("1-peter", 5, "1 Peter 5 — God of all grace… after you have suffered a while", 10),
        ch("romans", 11, "Romans 11 — if by grace… not by works", 6),
      ],
    },
    relatedTopicSlugs: ["salvation", "faith", "forgiveness", "identity-in-christ", "peace", "anxiety"],
    keyRefSnippets: {
      "Ephesians 2:8–9": "For by grace you have been saved through faith… not your own doing…",
      "Romans 3:23–24": "All have sinned… justified by his grace as a gift…",
      "Titus 2:11–12": "The grace of God has appeared… training us to renounce ungodliness…",
      "Romans 5:20–21": "Where sin increased, grace abounded all the more…",
      "John 1:16": "From his fullness we have all received, grace upon grace.",
    },
    quickHelp: {
      lead: "If you feel undeserving",
      lines: [
        "Grace means you do not come to God on the strength of your record—you come on the strength of his mercy in Christ.",
        "That is not permission to love sin; it is freedom to stop hiding and to receive what you could never earn.",
      ],
      verseRefs: ["Ephesians 2:8–9", "Titus 3:5–7", "Romans 5:8"],
    },
    recentlyExpanded: true,
  },

  "identity-in-christ": {
    slug: "identity-in-christ",
    searchAliases: [
      "new creation",
      "in christ",
      "who am i in christ",
      "bible identity verses",
      "adoption",
      "union with christ",
      "who am i in jesus",
    ],
    hubCategories: ["gospel-foundations", "purpose-direction"],
    chapterTiers: {
      primary: [
        ch("2-corinthians", 5, "2 Corinthians 5 — if anyone is in Christ, new creation", 17),
        ch("romans", 8, "Romans 8 — children of God; heirs with Christ", 14),
        ch("ephesians", 1, "Ephesians 1 — blessed in Christ; chosen; adopted", 3),
      ],
      supporting: [
        ch("colossians", 3, "Colossians 3 — your life is hidden with Christ in God", 1),
        ch("galatians", 2, "Galatians 2 — I have been crucified with Christ", 20),
        ch("john", 15, "John 15 — abide in me… you are my friends", 5),
      ],
      relatedPassages: [
        ch("philippians", 3, "Philippians 3 — righteousness from God that depends on faith", 9),
        ch("1-peter", 2, "1 Peter 2 — a chosen race… his own possession", 9),
        ch("romans", 6, "Romans 6 — united with him… walk in newness of life", 4),
      ],
    },
    relatedTopicSlugs: ["salvation", "grace", "faith", "fear", "anxiety", "peace"],
    keyRefSnippets: {
      "2 Corinthians 5:17": "If anyone is in Christ, he is a new creation…",
      "Romans 8:16–17": "The Spirit himself bears witness… children of God, and if children, then heirs…",
      "Ephesians 1:5–6": "He predestined us for adoption… to the praise of his glorious grace…",
      "Colossians 3:1–4": "You have died, and your life is hidden with Christ in God…",
      "John 1:12": "To all who did receive him… he gave the right to become children of God.",
    },
    quickHelp: {
      lead: "If you’re unsure who you are in Christ",
      lines: [
        "Your deepest identity is not what you perform—it is what God declares true of you in union with Jesus.",
        "That security is meant to free you from endless self-definition and to ground love, obedience, and hope.",
      ],
      verseRefs: ["2 Corinthians 5:17", "John 1:12", "Romans 8:16"],
    },
    quickHelpHighlight: true,
  },

  forgiveness: {
    slug: "forgiveness",
    searchAliases: ["mercy", "pardon", "reconcile", "reconciliation", "bitterness"],
    hubCategories: ["spiritual-growth", "relationships"],
    chapterTiers: {
      primary: [ch("ephesians", 4, "Ephesians 4 — be kind, tenderhearted, forgiving", 32), ch("matthew", 18, "Matthew 18 — the parable of forgiveness", 21), ch("colossians", 3, "Colossians 3 — forgive as the Lord forgave", 13)],
      supporting: [ch("romans", 12, "Romans 12 — do not repay evil", 17), ch("psalms", 103, "Psalm 103 — as far as east from west", 12)],
      relatedPassages: [ch("luke", 23, "Luke 23 — Father, forgive them", 34)],
    },
    relatedTopicSlugs: ["grace", "repentance", "faith", "marriage"],
  },

  discernment: {
    slug: "discernment",
    searchAliases: ["discern", "test spirits", "wisdom", "truth and error"],
    hubCategories: ["freedom-battle", "spiritual-growth"],
    chapterTiers: {
      primary: [ch("1-john", 4, "1 John 4 — test the spirits", 1), ch("1-thessalonians", 5, "1 Thessalonians 5 — test everything", 21), ch("hebrews", 5, "Hebrews 5 — mature discernment", 14)],
      supporting: [ch("proverbs", 2, "Proverbs 2 — wisdom from the Lord", 6), ch("philippians", 1, "Philippians 1 — approve what is excellent", 10)],
      relatedPassages: [ch("acts", 17, "Acts 17 — examining the Scriptures", 11)],
    },
    relatedTopicSlugs: ["wisdom", "faith", "holiness"],
  },

  holiness: {
    slug: "holiness",
    searchAliases: ["set apart", "purity", "sanctification", "godliness"],
    hubCategories: ["spiritual-growth", "freedom-battle"],
    chapterTiers: {
      primary: [ch("1-peter", 1, "1 Peter 1 — be holy", 15), ch("romans", 12, "Romans 12 — living sacrifice", 1), ch("hebrews", 12, "Hebrews 12 — holiness without which no one will see the Lord", 14)],
      supporting: [ch("2-corinthians", 7, "2 Corinthians 7 — cleanse ourselves", 1), ch("leviticus", 20, "Leviticus 20 — be holy", 26)],
      relatedPassages: [ch("isaiah", 6, "Isaiah 6 — holy, holy, holy", 3)],
    },
    relatedTopicSlugs: ["sanctification", "grace", "temptation"],
  },

  temptation: {
    slug: "temptation",
    searchAliases: ["sin", "desire", "lust", "enticement", "watchfulness"],
    hubCategories: ["freedom-battle", "spiritual-growth"],
    chapterTiers: {
      primary: [ch("1-corinthians", 10, "1 Corinthians 10 — way of escape", 13), ch("james", 1, "James 1 — desire conceives sin", 13), ch("hebrews", 4, "Hebrews 4 — tempted yet without sin", 15)],
      supporting: [ch("matthew", 26, "Matthew 26 — watch and pray", 41), ch("galatians", 5, "Galatians 5 — spirit and flesh", 16)],
      relatedPassages: [ch("genesis", 3, "Genesis 3 — first temptation", 1)],
    },
    relatedTopicSlugs: ["holiness", "repentance", "faith", "prayer"],
    quickHelp: {
      lead: "Start here if you feel caught in the same struggle",
      verseRefs: ["1 Corinthians 10:13", "Hebrews 4:15–16", "James 4:7"],
      encouragement: "Temptation is not the end of the story—God is faithful, and there is mercy for help in the moment you turn toward him.",
    },
    recentlyExpanded: true,
  },

  repentance: {
    slug: "repentance",
    searchAliases: ["repent", "turn", "godly sorrow", "confession"],
    hubCategories: ["freedom-battle", "gospel-foundations"],
    chapterTiers: {
      primary: [ch("acts", 3, "Acts 3 — repent and turn", 19), ch("2-corinthians", 7, "2 Corinthians 7 — godly grief", 10), ch("psalms", 51, "Psalm 51 — a broken spirit", 1)],
      supporting: [ch("luke", 15, "Luke 15 — the prodigal returns", 17), ch("isaiah", 55, "Isaiah 55 — return to the Lord", 6)],
      relatedPassages: [ch("jonah", 3, "Jonah 3 — Nineveh repents", 5)],
    },
    relatedTopicSlugs: ["forgiveness", "grace", "faith", "holiness"],
  },

  assurance: {
    slug: "assurance",
    searchAliases: ["confidence", "doubt", "security", "am i saved"],
    hubCategories: ["gospel-foundations", "emotional-mental-struggles"],
    chapterTiers: {
      primary: [ch("1-john", 5, "1 John 5 — know you have eternal life", 11), ch("romans", 8, "Romans 8 — nothing can separate", 31), ch("john", 10, "John 10 — eternal life; never perish", 28)],
      supporting: [ch("romans", 8, "Romans 8 — no condemnation", 1), ch("hebrews", 10, "Hebrews 10 — draw near in full assurance", 22)],
      relatedPassages: [ch("ephesians", 1, "Ephesians 1 — sealed with the Spirit", 13)],
    },
    relatedTopicSlugs: ["salvation", "faith", "identity-in-christ"],
  },

  "eternal-life": {
    slug: "eternal-life",
    searchAliases: ["heaven", "resurrection", "life everlasting", "glory"],
    hubCategories: ["gospel-foundations", "hard-seasons"],
    chapterTiers: {
      primary: [ch("john", 17, "John 17 — this is eternal life", 3), ch("john", 11, "John 11 — resurrection and life", 25), ch("romans", 6, "Romans 6 — gift of God is eternal life", 23)],
      supporting: [ch("1-corinthians", 15, "1 Corinthians 15 — the resurrection body", 51), ch("revelation", 21, "Revelation 21 — new heavens and earth", 1)],
      relatedPassages: [ch("1-john", 5, "1 John 5 — testimony of eternal life", 11)],
    },
    relatedTopicSlugs: ["salvation", "grief", "faith"],
  },

  wisdom: {
    slug: "wisdom",
    searchAliases: ["wise", "proverbs", "judgment", "understanding", "skill"],
    hubCategories: ["spiritual-growth", "purpose-direction"],
    chapterTiers: {
      primary: [ch("proverbs", 1, "Proverbs 1 — fear of the Lord", 7), ch("james", 1, "James 1 — ask God for wisdom", 5), ch("proverbs", 3, "Proverbs 3 — lean not on your understanding", 5)],
      supporting: [ch("colossians", 1, "Colossians 1 — spiritual wisdom", 9), ch("ecclesiastes", 12, "Ecclesiastes 12 — fear God", 13)],
      relatedPassages: [ch("1-kings", 3, "1 Kings 3 — Solomon’s wisdom", 9)],
    },
    relatedTopicSlugs: ["discernment", "faith", "work"],
  },

  work: {
    slug: "work",
    searchAliases: ["job", "labor", "vocation", "employment", "diligence"],
    hubCategories: ["purpose-direction", "relationships"],
    chapterTiers: {
      primary: [ch("colossians", 3, "Colossians 3 — work heartily as for the Lord", 23), ch("genesis", 2, "Genesis 2 — cultivate and keep", 15), ch("ephesians", 6, "Ephesians 6 — bondservants and masters", 7)],
      supporting: [ch("2-thessalonians", 3, "2 Thessalonians 3 — work quietly", 10), ch("proverbs", 14, "Proverbs 14 — honest work", 23)],
      relatedPassages: [ch("matthew", 25, "Matthew 25 — faithful servants", 21)],
    },
    relatedTopicSlugs: ["purpose", "wisdom", "money"],
  },

  marriage: {
    slug: "marriage",
    searchAliases: ["husband", "wife", "spouse", "covenant", "wedding"],
    hubCategories: ["relationships"],
    chapterTiers: {
      primary: [ch("ephesians", 5, "Ephesians 5 — one flesh; love as Christ", 22), ch("genesis", 2, "Genesis 2 — helper fit for him", 18), ch("1-peter", 3, "1 Peter 3 — honor and understanding", 1)],
      supporting: [ch("proverbs", 18, "Proverbs 18 — finds a good thing", 22), ch("malachi", 2, "Malachi 2 — covenant of marriage", 14)],
      relatedPassages: [ch("song-of-songs", 2, "Song of Songs — love", 16)],
    },
    relatedTopicSlugs: ["forgiveness", "holiness", "wisdom"],
  },

  parenting: {
    slug: "parenting",
    searchAliases: ["children", "kids", "family", "train up", "mother", "father"],
    hubCategories: ["relationships"],
    chapterTiers: {
      primary: [ch("deuteronomy", 6, "Deuteronomy 6 — teach diligently", 6), ch("ephesians", 6, "Ephesians 6 — bring them up in the Lord", 4), ch("proverbs", 22, "Proverbs 22 — train up a child", 6)],
      supporting: [ch("colossians", 3, "Colossians 3 — do not provoke", 21), ch("psalms", 127, "Psalm 127 — children a heritage", 3)],
      relatedPassages: [ch("luke", 2, "Luke 2 — child grew in wisdom", 52)],
    },
    relatedTopicSlugs: ["wisdom", "prayer", "faith"],
  },

  money: {
    slug: "money",
    searchAliases: ["wealth", "stewardship", "greed", "generosity", "finances", "mammon"],
    hubCategories: ["relationships", "purpose-direction"],
    chapterTiers: {
      primary: [ch("matthew", 6, "Matthew 6 — treasure in heaven", 19), ch("1-timothy", 6, "1 Timothy 6 — love of money", 10), ch("2-corinthians", 9, "2 Corinthians 9 — cheerful giver", 7)],
      supporting: [ch("proverbs", 3, "Proverbs 3 — honor the Lord with wealth", 9), ch("hebrews", 13, "Hebrews 13 — be content", 5)],
      relatedPassages: [ch("luke", 16, "Luke 16 — faithful in little", 10)],
    },
    relatedTopicSlugs: ["wisdom", "faith", "work"],
  },

  "suffering-and-loss": {
    slug: "suffering-and-loss",
    searchAliases: ["loss", "mourning", "grief", "hard season"],
    hubCategories: ["hard-seasons", "emotional-mental-struggles"],
    chapterTiers: {
      primary: [ch("psalms", 34, "Psalm 34 — near to the brokenhearted", 18), ch("2-corinthians", 1, "2 Corinthians 1 — comfort in affliction", 3), ch("romans", 8, "Romans 8 — present suffering", 18)],
      supporting: [ch("revelation", 21, "Revelation 21 — no more death", 4), ch("john", 11, "John 11 — Jesus weeps", 35)],
      relatedPassages: [ch("job", 1, "Job — the Lord gave", 21)],
    },
    relatedTopicSlugs: ["grief", "faith", "eternal-life"],
  },

  obedience: {
    slug: "obedience",
    searchAliases: ["obey", "keep commandments", "faithfulness", "submission"],
    hubCategories: ["spiritual-growth", "freedom-battle"],
    chapterTiers: {
      primary: [ch("john", 14, "John 14 — if you love me, keep my commands", 15), ch("james", 1, "James 1 — be doers of the word", 22), ch("romans", 6, "Romans 6 — slaves of righteousness", 16)],
      supporting: [ch("deuteronomy", 5, "Deuteronomy 5 — walk in his ways", 33), ch("1-samuel", 15, "1 Samuel 15 — to obey is better", 22)],
      relatedPassages: [ch("matthew", 7, "Matthew 7 — wise builder", 24)],
    },
    relatedTopicSlugs: ["holiness", "faith", "sanctification"],
  },

  gospel: {
    slug: "gospel",
    searchAliases: ["good news", "christ crucified", "cross", "resurrection"],
    hubCategories: ["gospel-foundations"],
    chapterTiers: {
      primary: [ch("1-corinthians", 15, "1 Corinthians 15 — gospel defined", 1), ch("romans", 1, "Romans 1 — power of God for salvation", 16), ch("mark", 1, "Mark 1 — repent and believe", 15)],
      supporting: [ch("2-corinthians", 5, "2 Corinthians 5 — reconciled to God", 21), ch("colossians", 1, "Colossians 1 — delivered from darkness", 13)],
      relatedPassages: [ch("luke", 24, "Luke 24 — opened the Scriptures", 27)],
    },
    relatedTopicSlugs: ["salvation", "grace", "faith", "anxiety", "fear", "peace"],
  },

  sanctification: {
    slug: "sanctification",
    searchAliases: ["growth", "transformation", "holiness", "renewal"],
    hubCategories: ["spiritual-growth"],
    chapterTiers: {
      primary: [ch("1-thessalonians", 4, "1 Thessalonians 4 — God’s will, sanctification", 3), ch("2-corinthians", 3, "2 Corinthians 3 — transformed into his likeness", 18), ch("philippians", 2, "Philippians 2 — work in you", 12)],
      supporting: [ch("romans", 12, "Romans 12 — transformed by renewal", 2), ch("colossians", 3, "Colossians 3 — put on the new self", 9)],
      relatedPassages: [ch("john", 17, "John 17 — sanctify them in truth", 17)],
    },
    relatedTopicSlugs: ["holiness", "grace", "obedience"],
  },

  "church-history": {
    slug: "church-history",
    searchAliases: ["reformation", "creeds", "tradition", "historical theology"],
    hubCategories: ["spiritual-growth", "gospel-foundations"],
    chapterTiers: {
      primary: [ch("hebrews", 12, "Hebrews 12 — great cloud of witnesses", 1), ch("2-timothy", 2, "2 Timothy 2 — entrust to faithful men", 2), ch("jude", 1, "Jude — contend for the faith", 3)],
      supporting: [ch("acts", 2, "Acts 2 — the church begins", 42), ch("revelation", 2, "Revelation 2 — letters to churches", 1)],
      relatedPassages: [ch("matthew", 16, "Matthew 16 — on this rock", 18)],
    },
    relatedTopicSlugs: ["discernment", "faith", "gospel"],
  },
} as const satisfies Record<StudyTopicSlug, TopicEngineRecord>;

/** Cross-chapter “see also” links keyed like `john:3` (lowercase urlBook). Kept small to avoid link noise. */
export const CROSS_CHAPTER_RELATED: Record<string, TopicChapterCard[]> = {
  "john:3": [
    { urlBook: "romans", chapter: 5, verse: 1, label: "Romans 5 — peace with God" },
    { urlBook: "ephesians", chapter: 2, verse: 8, label: "Ephesians 2 — saved by grace" },
  ],
  "romans:5": [{ urlBook: "john", chapter: 3, verse: 16, label: "John 3 — God so loved the world" }],
};
