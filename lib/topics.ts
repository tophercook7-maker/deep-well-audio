/**
 * First-class topic landing pages (topic_tags), separate from show categories.
 */

export type TopicDefinition = {
  slug: string;
  label: string;
  /** Short hero intro fallback / SEO body when `introParagraphs` is absent. */
  description: string;
  /** Multi-paragraph hero intro (replaces single `description` in the hero when set). May include `[label](/path)` links. */
  introParagraphs?: string[];
  /** Primary H1 for SEO (e.g. "Christian Teaching on Anxiety"). */
  heroTitle?: string;
  /** `<title>` / sharing title — include "| Deep Well Audio" or rely on defaults. */
  seoTitle?: string;
  /** Meta description (≈150–165 chars ideal; trimmed if longer). */
  seoDescription?: string;
  /** "Why this matters" — 2–3 short paragraphs for humans + search. */
  whyItMatters?: string[];
  /** When true, skip the "Why this matters" block (narrative lives in `introParagraphs`). */
  omitWhySection?: boolean;
  /** Heading above the episode list (defaults to "Featured teachings"). */
  featuredSectionHeading?: string;
  /** Subline under featured heading. */
  featuredSectionSubline?: string;
  /** Bottom CTA (see `TopicSeoCta`). */
  ctaHeading?: string;
  ctaSupportLine?: string;
  /** When false, only Listen Free + Create account buttons are emphasized. */
  ctaShowPremiumLink?: boolean;
  /** Optional extra copy for flagship topics (e.g. End times). */
  spotlight?: string;
  /** Other topic slugs to surface as related links. */
  relatedSlugs: string[];
  /** Non-topic routes shown beside related topic chips (e.g. World Watch). */
  relatedExtraLinks?: { href: string; label: string }[];
  /**
   * Episode `topic_tags` values this hub aggregates (defaults to `[slug]`).
   * Use when the public URL slug differs from catalog tags (e.g. `/topics/anxiety` → `anxiety-and-trust`).
   */
  episodeTagSlugs?: string[];
  /** Short verse references for "Related Scripture" (upgraded hubs). */
  relatedScriptureRefs?: string[];
  /** Bullets for "How to use this" (upgraded hubs). */
  howToUseBullets?: string[];
  /** Soft save CTA between scripture and featured teachings. */
  showMidPageSaveCta?: boolean;
};

/** All topic routes we support under /topics/[slug]. */
export const TOPIC_DEFINITIONS: Record<string, TopicDefinition> = {
  "end-times": {
    slug: "end-times",
    label: "End Times",
    description:
      "Biblical teaching on Christ’s return, the last days, and the hope of the new creation—grounded audio from your curated directory.",
    heroTitle: "Christian Teaching on the End Times",
    seoTitle: "Christian Teaching on the End Times | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on the end times. Explore biblical teaching that helps you think clearly without confusion or fear.",
    introParagraphs: [
      "Questions about the end times can create fascination, confusion, or fear. Many people want clarity, but not all teaching on the subject is equally careful or grounded.",
      "Scripture speaks about the last things with seriousness and hope, calling believers not to panic, but to stay watchful, faithful, and anchored in truth.",
      "These teachings are here to help you think biblically about the end times with greater clarity, humility, and steadiness.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on the End Times",
    featuredSectionSubline: "Episodes tagged for end times, prophecy, and last things in the catalog.",
    episodeTagSlugs: ["end-times", "prophecy", "eschatology", "revelation"],
    relatedSlugs: ["discernment", "faith"],
    relatedExtraLinks: [{ href: "/world-watch", label: "World Watch" }],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep important teachings in one place.",
    ctaShowPremiumLink: false,
  },
  prophecy: {
    slug: "prophecy",
    label: "Prophecy",
    description: "Messages on prophetic Scripture, fulfillment, and how the church reads God’s word about the future with humility and hope.",
    relatedSlugs: ["end-times", "eschatology", "revelation"],
  },
  eschatology: {
    slug: "eschatology",
    label: "Eschatology",
    description: "Teaching on last things: Christ’s return, resurrection, judgment, and the restoration of all things—grounded in exegesis, not speculation.",
    relatedSlugs: ["end-times", "prophecy", "revelation"],
  },
  revelation: {
    slug: "revelation",
    label: "Revelation",
    description:
      "Expositions and studies anchored in John’s Apocalypse: the victory of the Lamb, letters to the churches, and the grand vision of God’s throne room to the new heavens and earth.",
    relatedSlugs: ["end-times", "prophecy", "eschatology"],
  },
  discernment: {
    slug: "discernment",
    label: "Discernment",
    description: "Testing ideas by Scripture—teaching that helps you love the truth and recognize error without cynicism.",
    heroTitle: "Christian Teaching on Discernment",
    seoTitle: "Christian Teaching on Discernment | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on discernment. Learn how to think carefully, recognize truth, and test ideas biblically.",
    introParagraphs: [
      "Discernment matters in a world full of confident voices, shallow answers, and spiritual confusion.",
      "The Bible calls believers to test what they hear, hold fast to what is true, and grow in wisdom shaped by God’s Word.",
      "These teachings are here to help you think carefully, listen wisely, and develop stronger biblical discernment over time.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Discernment",
    featuredSectionSubline: "Episodes tagged for discernment and testing teaching in the directory.",
    episodeTagSlugs: ["discernment", "false-teaching", "theology"],
    relatedSlugs: ["doubt", "false-teaching", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save what is worth returning to.",
    ctaShowPremiumLink: false,
  },
  "false-teaching": {
    slug: "false-teaching",
    label: "False teaching",
    description: "Messages that name and answer distortions of the gospel and Scripture, with clarity and charity.",
    relatedSlugs: ["discernment", "theology", "cults"],
  },
  cults: {
    slug: "cults",
    label: "Cults & counterfeits",
    description: "Teaching that compares sects and unbiblical movements to the historic Christian faith—useful for honest apologetics and evangelism.",
    relatedSlugs: ["discernment", "theology", "worldview"],
  },
  theology: {
    slug: "theology",
    label: "Theology",
    description: "Doctrine done devotionally: Trinity, Scripture, salvation, and the church—sermons and series that connect head and heart.",
    heroTitle: "Christian teaching on theology and doctrine",
    seoTitle: "Christian Teaching on Theology & Doctrine | Deep Well Audio",
    seoDescription:
      "Listen to faithful Christian teaching on theology and core doctrine—Trinity, Scripture, salvation, and the church—from trusted voices in one directory.",
    relatedSlugs: ["worldview", "suffering", "marriage", "faith"],
  },
  marriage: {
    slug: "marriage",
    label: "Marriage",
    heroTitle: "Christian Teaching on Marriage",
    seoTitle: "Christian Teaching on Marriage | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on marriage—covenant love, faithfulness, and family life grounded in Scripture for everyday challenges.",
    description: "Covenant marriage, family, and fidelity—practical biblical teaching from the catalog.",
    introParagraphs: [
      "Marriage brings both joy and challenge. It requires patience, humility, forgiveness, and a steady commitment over time.",
      "Scripture speaks clearly about love, sacrifice, and faithfulness within marriage.",
      "These teachings are here to help you think biblically about marriage and grow in it with wisdom and care.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Marriage",
    featuredSectionSubline: "Marriage- and family-tagged teaching in the directory.",
    episodeTagSlugs: ["marriage", "theology", "worldview"],
    relatedSlugs: ["forgiveness", "love", "obedience"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth returning to.",
    ctaShowPremiumLink: false,
  },
  parenting: {
    slug: "parenting",
    label: "Parenting",
    heroTitle: "Christian Teaching on Parenting",
    seoTitle: "Christian Teaching on Parenting | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on parenting. Find biblical wisdom for raising children with patience, instruction, and dependence on God.",
    description: "Raising children with Scripture-shaped patience and wisdom—teaching from the catalog.",
    introParagraphs: [
      "Parenting shapes both children and parents. It brings responsibility, pressure, and the need for wisdom.",
      "Scripture points to patience, instruction, and dependence on God in raising children.",
      "These teachings are here to help you think clearly about parenting and remain steady in it.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Parenting",
    featuredSectionSubline: "Family, home, and formation tags surface parenting-shaped teaching.",
    episodeTagSlugs: ["marriage", "spiritual-growth", "theology", "worldview"],
    relatedSlugs: ["wisdom", "obedience", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  work: {
    slug: "work",
    label: "Work",
    heroTitle: "Christian Teaching on Work",
    seoTitle: "Christian Teaching on Work | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on work, vocation, and integrity. Approach your job with biblical clarity and faithful purpose.",
    description: "Faithfulness on the job—teaching on calling, integrity, and daily work from the catalog.",
    introParagraphs: [
      "Work can feel routine, stressful, or uncertain. It can also be a place of purpose and faithfulness.",
      "Scripture teaches that work matters and should be done with integrity and intention.",
      "These teachings are here to help you approach work with clarity and purpose.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Work",
    featuredSectionSubline: "Worldview, purpose, and doctrine tags surface work- and vocation-shaped teaching.",
    episodeTagSlugs: ["worldview", "spiritual-growth", "theology"],
    relatedSlugs: ["purpose", "calling", "obedience"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters.",
    ctaShowPremiumLink: false,
  },
  money: {
    slug: "money",
    label: "Money",
    heroTitle: "Christian Teaching on Money",
    seoTitle: "Christian Teaching on Money | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on money and stewardship. Learn contentment, generosity, and trust from Scripture.",
    description: "Stewardship, priorities, and trust—biblical teaching on finances from the catalog.",
    introParagraphs: [
      "Money influences decisions, priorities, and direction. It can create pressure, temptation, or security.",
      "Scripture speaks carefully about stewardship, contentment, and trust.",
      "These teachings are here to help you think biblically about money and use it wisely.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Money",
    featuredSectionSubline: "Worldview, faith, and wisdom tags surface stewardship- and money-shaped teaching.",
    episodeTagSlugs: ["worldview", "theology", "spiritual-growth"],
    relatedSlugs: ["contentment", "faith", "wisdom"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth revisiting.",
    ctaShowPremiumLink: false,
  },
  trials: {
    slug: "trials",
    label: "Trials",
    heroTitle: "Christian Teaching on Trials",
    seoTitle: "Christian Teaching on Trials | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on trials and testing. Find endurance, hope, and trust in God when life is hard.",
    description: "When life tests you—teaching on endurance and hope from the catalog.",
    introParagraphs: [
      "Trials test endurance and reveal what we rely on. They can be discouraging, but also shaping.",
      "Scripture calls believers to remain steady and trust God through difficulty.",
      "These teachings are here to help you endure trials with greater clarity and hope.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Trials",
    featuredSectionSubline: "Suffering, growth, and faith-shaped teaching in the directory.",
    episodeTagSlugs: ["suffering", "spiritual-growth", "theology"],
    relatedSlugs: ["suffering", "faith", "perseverance"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what is shaping you.",
    ctaShowPremiumLink: false,
  },
  wisdom: {
    slug: "wisdom",
    label: "Wisdom",
    heroTitle: "Christian Teaching on Wisdom",
    seoTitle: "Christian Teaching on Wisdom | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on wisdom. Learn to live rightly, decide carefully, and walk in step with Scripture.",
    description: "Living wisely—teaching from Proverbs-shaped and doctrinal tags in the catalog.",
    introParagraphs: [
      "Wisdom is more than knowledge. It is the ability to live rightly, make sound decisions, and respond carefully.",
      "Scripture presents wisdom as something to seek, value, and grow in.",
      "These teachings are here to help you think and live with greater wisdom.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Wisdom",
    featuredSectionSubline: "Discernment, theology, and spiritual-growth tags surface wisdom-shaped teaching.",
    episodeTagSlugs: ["discernment", "theology", "spiritual-growth"],
    relatedSlugs: ["discernment", "obedience", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  love: {
    slug: "love",
    label: "Love",
    heroTitle: "Christian Teaching on Love",
    seoTitle: "Christian Teaching on Love | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on love—biblical charity, covenant faithfulness, and Christlike care in relationships.",
    description: "God’s love and ours—gospel-shaped teaching from the catalog.",
    introParagraphs: [
      "Love is one of the Bible’s great themes—not sentiment alone, but steadfast care rooted in God’s character.",
      "Scripture calls believers to love God and neighbor with truth, patience, and humility.",
      "These teachings are here to help you understand love plainly and live it where it costs something.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Love",
    featuredSectionSubline: "Marriage, theology, and growth tags surface love-shaped teaching.",
    episodeTagSlugs: ["marriage", "theology", "spiritual-growth"],
    relatedSlugs: ["marriage", "grace", "forgiveness"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters.",
    ctaShowPremiumLink: false,
  },
  contentment: {
    slug: "contentment",
    label: "Contentment",
    heroTitle: "Christian Teaching on Contentment",
    seoTitle: "Christian Teaching on Contentment | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on contentment—trust, simplicity, and gratitude when life feels tight or uncertain.",
    description: "Enoughness rooted in God—teaching from the catalog.",
    introParagraphs: [
      "Contentment does not ignore real needs; it anchors the heart in God’s care rather than constant comparison.",
      "Scripture speaks of learning to trust, give thanks, and hold money and plans loosely.",
      "These teachings are here to help you grow steadier joy that does not rise and fall with circumstances alone.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Contentment",
    featuredSectionSubline: "Faith, worldview, and wisdom tags surface contentment-shaped teaching.",
    episodeTagSlugs: ["spiritual-growth", "theology", "worldview"],
    relatedSlugs: ["money", "faith", "wisdom"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth revisiting.",
    ctaShowPremiumLink: false,
  },
  perseverance: {
    slug: "perseverance",
    label: "Perseverance",
    heroTitle: "Christian Teaching on Perseverance",
    seoTitle: "Christian Teaching on Perseverance | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on perseverance—endurance, hope, and faith that holds when trials linger.",
    description: "Staying the course—teaching from the catalog.",
    introParagraphs: [
      "Perseverance is not grit for its own sake—it is keeping faith when the road is long.",
      "Scripture honors endurance that looks to Christ and leans on his promises.",
      "These teachings are here to help you remain steady when difficulty does not resolve on your timetable.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Perseverance",
    featuredSectionSubline: "Suffering and spiritual-growth tags surface endurance-shaped teaching.",
    episodeTagSlugs: ["suffering", "spiritual-growth", "theology"],
    relatedSlugs: ["trials", "faith", "suffering"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what is shaping you.",
    ctaShowPremiumLink: false,
  },
  "forgiveness-in-life": {
    slug: "forgiveness-in-life",
    label: "Forgiveness in life",
    heroTitle: "Christian Teaching on Forgiveness in Life",
    seoTitle: "Christian Teaching on Forgiveness in Life | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on forgiveness in everyday relationships—humility, boundaries, and grace that reflects Christ.",
    description: "Forgiveness where it gets messy—teaching from the catalog.",
    introParagraphs: [
      "Forgiveness is not always simple. In everyday life, it requires humility, patience, and strength.",
      "Scripture calls believers to forgive as they have been forgiven.",
      "These teachings are here to help you live out forgiveness in real situations.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Forgiveness in Life",
    featuredSectionSubline: "Forgiveness, grace, and reconciliation-shaped teaching in the directory.",
    episodeTagSlugs: ["forgiveness", "marriage", "spiritual-growth", "theology"],
    relatedSlugs: ["forgiveness", "grace", "repentance"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  "suffering-and-loss": {
    slug: "suffering-and-loss",
    label: "Suffering and loss",
    heroTitle: "Christian Teaching on Suffering and Loss",
    seoTitle: "Christian Teaching on Suffering and Loss | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on suffering and loss. Find honest grief, comfort, and hope anchored in Scripture.",
    description: "Grief, pain, and hope—teaching from the catalog.",
    introParagraphs: [
      "Loss brings grief, questions, and deep emotional weight. It can reshape how people see life and faith.",
      "Scripture speaks honestly about grief while pointing to hope and the nearness of God.",
      "These teachings are here to help you remain grounded through suffering and loss.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Suffering and Loss",
    featuredSectionSubline: "Suffering, lament, and hope-shaped teaching in the directory.",
    episodeTagSlugs: ["suffering", "spiritual-growth", "theology"],
    relatedSlugs: ["suffering", "eternal-life", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters.",
    ctaShowPremiumLink: false,
  },
  suffering: {
    slug: "suffering",
    label: "Suffering",
    description: "Biblical teaching on grief, pain, and hope—grounded episodes from the catalog.",
    heroTitle: "Christian Teaching on Suffering",
    seoTitle: "Christian Teaching on Suffering | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on suffering. Find biblical guidance for enduring hardship with faith and hope.",
    introParagraphs: [
      "Suffering raises difficult questions. It can shake confidence, expose fear, and leave people searching for steady ground.",
      "Scripture does not avoid suffering. It speaks honestly about pain while pointing us to endurance, hope, and the nearness of God.",
      "These teachings are here to help you think biblically about suffering and remain grounded in truth when life is heavy.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Suffering",
    featuredSectionSubline: "Episodes tagged around suffering, lament, and hope in the directory.",
    episodeTagSlugs: ["suffering"],
    relatedSlugs: ["anxiety", "faith", "prayer"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth returning to.",
    ctaShowPremiumLink: false,
  },
  worldview: {
    slug: "worldview",
    label: "Worldview",
    description: "Connecting Scripture to culture, ideas, and the stories we live by—faithful engagement without losing the gospel center.",
    relatedSlugs: ["theology", "discernment", "prophecy"],
  },
  "church-history": {
    slug: "church-history",
    label: "Church history",
    description:
      "Teaching that situates the church in time: creeds, councils, reformation, missions, and the faith once delivered to the saints.",
    heroTitle: "Christian Teaching on Church History",
    seoTitle: "Christian Teaching on Church History | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on church history. Learn from the people, events, and doctrines that shaped the church through time.",
    introParagraphs: [
      "Church history helps believers remember that they are not the first to wrestle with doctrine, suffering, reform, courage, or faithfulness.",
      "Looking back can deepen gratitude, sharpen discernment, and strengthen conviction in the present.",
      "These teachings are here to help you learn from the history of the church and better understand the faith once delivered to the saints.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Church History",
    featuredSectionSubline: "Episodes tagged for church history and historical theology in the catalog.",
    episodeTagSlugs: ["church-history", "theology"],
    relatedSlugs: ["discernment", "faith", "spiritual-growth"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth revisiting.",
    ctaShowPremiumLink: false,
  },
  "spiritual-growth": {
    slug: "spiritual-growth",
    label: "Spiritual growth",
    description: "Steady growth in Christ through truth, obedience, and time in God’s Word—teaching from the catalog.",
    heroTitle: "Christian Teaching on Spiritual Growth",
    seoTitle: "Christian Teaching on Spiritual Growth | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on spiritual growth. Learn how to grow steadily in faith, obedience, and maturity.",
    introParagraphs: [
      "Spiritual growth is rarely dramatic. More often, it happens slowly through truth, repentance, obedience, and time spent returning to God’s Word.",
      "The Christian life is not about constant novelty. It is about being shaped over time.",
      "These teachings are here to help you grow with greater steadiness, depth, and intention.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Spiritual Growth",
    featuredSectionSubline: "Tagged episodes on formation, holiness, and following Jesus—drawn from the catalog.",
    episodeTagSlugs: ["spiritual-growth", "knowing-god"],
    relatedSlugs: ["faith", "prayer", "obedience"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep track of what is shaping you.",
    ctaShowPremiumLink: false,
  },
  anxiety: {
    slug: "anxiety",
    label: "Anxiety",
    heroTitle: "Christian Teaching on Anxiety",
    seoTitle: "Christian Teaching on Anxiety | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on anxiety, worry, and stress. Find biblical peace, calm for racing thoughts, and hope grounded in Scripture—free audio you can revisit.",
    description:
      "Trusted teaching on anxiety from the catalog—listen at your pace, return when you need steadiness.",
    introParagraphs: [
      "Anxiety is something many people carry quietly. It shows up in everyday life through stress, uncertainty, and the feeling of being overwhelmed.",
      "Scripture does not ignore anxiety. It speaks directly to it, calling us back to trust, perspective, and the steady presence of God.",
      "These teachings are here to help you slow down, refocus, and return to what is true.",
      "Many people search for quick relief from worry; the Bible speaks to fear with honesty and invites you to bring it into the light. These episodes pair well with [Bible Study](/bible) when you want Scripture beside you, with topics like [faith](/topics/faith) and [prayer](/topics/prayer) when trust feels thin, and with [World Watch](/world-watch) when headlines add weight.",
    ],
    whyItMatters: [
      "Worry rarely stays in the background. It touches sleep, relationships, decisions, and prayer—often before you have words for what you feel.",
      "Christians are not pretending anxiety is small; they are learning to bring it to God with humility rather than carrying it alone.",
      "Returning to trustworthy teaching matters because feelings surge faster than truth—but truth is what still stands when the surge passes. It gives you language for prayer and a path back to steadiness.",
    ],
    omitWhySection: false,
    relatedScriptureRefs: ["Philippians 4:6–7", "Matthew 6:25–34", "Psalm 56:3", "1 Peter 5:7"],
    howToUseBullets: [
      "Listen to one teaching at a time",
      "Return to what stands out",
      "Save teachings you want to revisit",
    ],
    showMidPageSaveCta: true,
    featuredSectionHeading: "Teaching on Anxiety",
    featuredSectionSubline: "Recent episodes tagged for this topic—listen freely, no account required.",
    episodeTagSlugs: ["anxiety-and-trust"],
    relatedSlugs: ["faith", "suffering", "prayer"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Save what matters and come back to it anytime. Build a library of teaching that shaped you.",
    ctaShowPremiumLink: false,
  },
  faith: {
    slug: "faith",
    label: "Faith",
    heroTitle: "Christian Teaching on Faith",
    seoTitle: "Christian Teaching on Faith | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on faith, trust, and belief. Grow through Scripture-grounded audio on the gospel, assurance, and following Jesus when life feels uncertain.",
    description: "Teaching that lifts your eyes to Christ—trust that grows in real life, not theory alone.",
    introParagraphs: [
      "Faith is not just a concept. It is something you live out daily. It is tested in uncertainty, stretched in difficulty, and strengthened over time.",
      "The Bible presents faith not as blind belief, but as trust rooted in who God is.",
      "These teachings are meant to help you grow in that trust and stay grounded, even when life feels unclear.",
      "Many people search for stronger faith as if it were willpower alone; Scripture ties trust to hearing God’s Word, remembering his promises, and resting on Christ. Use [Bible Study](/bible) to read alongside audio, explore [anxiety](/topics/anxiety) or [purpose](/topics/purpose) when life feels unclear, and browse [spiritual growth](/topics/spiritual-growth) for steady formation. [World Watch](/world-watch) can add calm perspective when the news tests what you believe.",
    ],
    whyItMatters: [
      "Faith is not only a Sunday word. It is tested in hospital rooms, ordinary workweeks, and the quiet moments when God feels distant.",
      "Scripture anchors faith in Christ’s finished work and God’s character—not in your emotional weather. That distinction matters when doubt is loud.",
      "Returning to faithful teaching helps you name fear honestly without letting it steer. It keeps the gospel in front of you until hope has room to speak again.",
    ],
    omitWhySection: false,
    relatedScriptureRefs: ["Hebrews 11:1", "Romans 10:17", "Proverbs 3:5–6", "2 Corinthians 5:7"],
    howToUseBullets: [
      "Listen to one teaching at a time",
      "Return to what stands out",
      "Save teachings you want to revisit",
    ],
    showMidPageSaveCta: true,
    featuredSectionHeading: "Teaching on Faith",
    featuredSectionSubline: "Episodes drawn from growth, knowing God, and core doctrine tags in the directory.",
    episodeTagSlugs: ["spiritual-growth", "knowing-god", "theology"],
    relatedSlugs: ["anxiety", "purpose", "spiritual-growth"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Save what matters and come back to it anytime. Build a library of teaching that shaped you.",
    ctaShowPremiumLink: false,
  },
  "trusting-god": {
    slug: "trusting-god",
    label: "Trusting God",
    heroTitle: "Christian Teaching on Trusting God",
    seoTitle: "Christian Teaching on Trusting God | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on trusting God. Find biblical encouragement for uncertainty, waiting, and depending on God’s faithfulness.",
    description: "Resting in who God is—teaching on faithfulness, waiting, and dependence drawn from the catalog.",
    introParagraphs: [
      "Trusting God is easy to talk about and often harder to live. It is tested most deeply in waiting, uncertainty, and circumstances we would not choose.",
      "Scripture calls us to trust not because we can see everything clearly, but because God is faithful, wise, and unchanging.",
      "These teachings are here to help you rest more fully in God’s character and remain grounded when life feels uncertain.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Trusting God",
    featuredSectionSubline: "Growth, knowing God, and doctrine tags surface trust-shaped teaching in the directory.",
    episodeTagSlugs: ["spiritual-growth", "knowing-god", "theology"],
    relatedSlugs: ["faith", "fear", "suffering"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters over time.",
    ctaShowPremiumLink: false,
  },
  purpose: {
    slug: "purpose",
    label: "Purpose",
    heroTitle: "Christian Teaching on Purpose",
    seoTitle: "Christian Teaching on Purpose | Deep Well Audio",
    seoDescription:
      "Discover Christian teaching on purpose, calling, and meaning. Find biblical direction for faithful living, identity in Christ, and daily intention—without hype.",
    description: "Biblical perspective on calling, meaning, and living with intention—without hype.",
    introParagraphs: [
      "Questions about purpose often come quietly but persistently. What am I meant to do? Does my life have direction? Where am I going?",
      "Scripture answers these questions differently than the world does. It points not just to what you do, but to who you are and who you belong to.",
      "These teachings are here to help you think clearly about purpose and live with greater intention.",
      "Many people search for meaning in achievement, comparison, or constant motion; the Bible sets calling in the frame of grace, service, and faithfulness over time. Pair listening with [Bible Study](/bible), explore [calling](/topics/calling) and [identity](/topics/identity) for the next step, and use [World Watch](/world-watch) when cultural noise pressures you to measure your life by trends.",
    ],
    whyItMatters: [
      "Purpose questions rarely arrive as debates—they often arrive as exhaustion, transition, or the sense that you are drifting.",
      "The gospel reframes what “success” means: faithfulness over visibility, love over positioning, worship over performance.",
      "Returning to clear teaching protects you from both cynicism and hurry. It keeps your life rooted in what outlasts a season—and gives you words to pray when direction feels thin.",
    ],
    omitWhySection: false,
    relatedScriptureRefs: ["Romans 8:28", "Ephesians 2:10", "Proverbs 16:3", "Colossians 3:23"],
    howToUseBullets: [
      "Listen to one teaching at a time",
      "Return to what stands out",
      "Save teachings you want to revisit",
    ],
    showMidPageSaveCta: true,
    featuredSectionHeading: "Teaching on Purpose",
    featuredSectionSubline: "Tagged episodes on meaning, identity, and faithful living in the catalog.",
    episodeTagSlugs: ["worldview", "spiritual-growth", "identity-in-christ", "theology"],
    relatedSlugs: ["faith", "identity", "obedience"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Save what matters and come back to it anytime. Build a library of teaching that shaped you.",
    ctaShowPremiumLink: false,
  },
  calling: {
    slug: "calling",
    label: "Calling",
    heroTitle: "Christian Teaching on Calling",
    seoTitle: "Christian Teaching on Calling | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on calling. Find biblical direction for vocation, faithfulness, and living with purpose.",
    description: "Vocation, faithfulness, and purpose—teaching rooted in Scripture from the catalog.",
    introParagraphs: [
      "Questions about calling often carry both hope and pressure. People want to know where they fit, what faithfulness looks like, and how to live with purpose.",
      "Scripture speaks about calling in ways that are both bigger and steadier than personal ambition. It points to faithfulness, service, and belonging to God.",
      "These teachings are here to help you think more clearly about calling and live with greater purpose and intention.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Calling",
    featuredSectionSubline: "Meaning, identity, and worldview tags surface vocation and calling-shaped teaching.",
    episodeTagSlugs: ["worldview", "spiritual-growth", "identity-in-christ", "theology"],
    relatedSlugs: ["purpose", "obedience", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings you want to return to.",
    ctaShowPremiumLink: false,
  },
  prayer: {
    slug: "prayer",
    label: "Prayer",
    heroTitle: "Christian Teaching on Prayer",
    seoTitle: "Christian Teaching on Prayer | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on prayer. Learn how Scripture shapes prayer, dependence, and daily communion with God.",
    description: "Prayer as dependence, worship, and fellowship with God—teaching drawn from the catalog.",
    episodeTagSlugs: ["spiritual-growth", "knowing-god"],
    relatedSlugs: ["faith", "anxiety", "spiritual-growth"],
    omitWhySection: true,
    introParagraphs: [
      "Prayer is one of the most basic parts of the Christian life, and one of the easiest to neglect or misunderstand.",
      "Scripture shows prayer as dependence, worship, confession, and steady fellowship with God.",
      "These teachings are here to help you return to prayer with clarity, humility, and confidence grounded in God’s Word.",
    ],
    featuredSectionHeading: "Teaching on Prayer",
    featuredSectionSubline: "Growth and knowing-God tags surface prayer-shaped teaching in the directory.",
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  repentance: {
    slug: "repentance",
    label: "Repentance",
    heroTitle: "Christian Teaching on Repentance",
    seoTitle: "Christian Teaching on Repentance | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on repentance. Learn how Scripture presents repentance as turning from sin and returning to God.",
    description: "Turning toward God—teaching on repentance, mercy, and renewal from the catalog.",
    introParagraphs: [
      "Repentance is central to the Christian life, but it is often misunderstood. It is more than regret, and more than momentary emotion.",
      "Scripture presents repentance as a turning of heart and life, shaped by truth, humility, and the mercy of God.",
      "These teachings are here to help you understand repentance more clearly and see it as part of faithful, ongoing growth.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Repentance",
    featuredSectionSubline: "Doctrine, growth, and forgiveness-tagged episodes in the directory.",
    episodeTagSlugs: ["theology", "spiritual-growth", "forgiveness"],
    relatedSlugs: ["obedience", "spiritual-growth", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what is shaping you.",
    ctaShowPremiumLink: false,
  },
  doubt: {
    slug: "doubt",
    label: "Doubt",
    heroTitle: "Christian Teaching on Doubt",
    seoTitle: "Christian Teaching on Doubt | Deep Well Audio",
    seoDescription:
      "Find trusted Christian teaching on doubt. Explore biblical guidance for questions, uncertainty, and growing in grounded faith.",
    description: "Honest questions, anchored faith—teaching from voices who take Scripture seriously.",
    introParagraphs: [
      "Doubt can feel isolating, especially when questions linger longer than expected.",
      "The Bible does not pretend that questions never come. It calls us to bring them honestly into the light and to anchor ourselves in what is true.",
      "These teachings are meant to help you think clearly, face doubt honestly, and keep moving toward deeper faith.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Doubt",
    featuredSectionSubline: "Discernment, doctrine, and growth tags help surface honest, grounded teaching.",
    episodeTagSlugs: ["discernment", "theology", "spiritual-growth"],
    relatedSlugs: ["faith", "discernment", "suffering"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters over time.",
    ctaShowPremiumLink: false,
  },
  fear: {
    slug: "fear",
    label: "Fear",
    heroTitle: "Christian Teaching on Fear",
    seoTitle: "Christian Teaching on Fear | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on fear. Find biblical guidance for facing uncertainty and learning to trust God.",
    description: "Facing fear with Scripture—teaching on courage, peace, and trust drawn from the catalog.",
    introParagraphs: [
      "Fear shows up in many forms. Sometimes it is obvious, and sometimes it quietly shapes decisions, reactions, and the way people carry everyday burdens.",
      "Scripture speaks directly to fear, not by pretending life is easy, but by calling us back to the character of God and the steadiness of His promises.",
      "These teachings are here to help you face fear honestly and remain anchored in what is true.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Fear",
    featuredSectionSubline: "Anxiety-and-trust and suffering tags surface episodes that speak to fear and peace.",
    episodeTagSlugs: ["anxiety-and-trust", "suffering"],
    relatedSlugs: ["anxiety", "faith", "trusting-god"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth returning to.",
    ctaShowPremiumLink: false,
  },
  identity: {
    slug: "identity",
    label: "Identity",
    heroTitle: "Christian Teaching on Identity",
    seoTitle: "Christian Teaching on Identity | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on identity. Discover what Scripture says about who you are and who you belong to.",
    description: "Who you are in Christ—not labels or noise, but gospel-rooted belonging.",
    introParagraphs: [
      "Questions of identity shape how people think, live, and respond to pressure. The world offers endless answers, but they rarely bring lasting clarity.",
      "Scripture roots identity in something steadier: who God is, what Christ has done, and who believers are in Him.",
      "These teachings are here to help you think more clearly about identity and live from what is true.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Identity",
    featuredSectionSubline: "Episodes tagged identity-in-Christ and related themes in the catalog.",
    episodeTagSlugs: ["identity-in-christ", "worldview", "theology"],
    relatedSlugs: ["purpose", "faith", "spiritual-growth"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save what matters and come back to it later.",
    ctaShowPremiumLink: false,
  },
  obedience: {
    slug: "obedience",
    label: "Obedience",
    heroTitle: "Christian Teaching on Obedience",
    seoTitle: "Christian Teaching on Obedience | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on obedience. Learn how Scripture connects obedience with faith, love, and spiritual maturity.",
    description: "Following Jesus with clarity—obedience shaped by faith and love, not empty rule-keeping.",
    episodeTagSlugs: ["theology", "spiritual-growth", "worldview"],
    relatedSlugs: ["faith", "repentance", "spiritual-growth"],
    omitWhySection: true,
    introParagraphs: [
      "Obedience is not just outward behavior. It is the response of a heart shaped by truth, trust, and reverence for God.",
      "The Bible presents obedience as part of faithful living, not as empty rule keeping, but as a life aligned with what is good and true.",
      "These teachings are here to help you think more clearly about obedience and walk it out with greater steadiness.",
    ],
    featuredSectionHeading: "Teaching on Obedience",
    featuredSectionSubline: "Doctrine, growth, and worldview tags surface obedience-shaped teaching in the catalog.",
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  forgiveness: {
    slug: "forgiveness",
    label: "Forgiveness",
    heroTitle: "Christian Teaching on Forgiveness",
    seoTitle: "Christian Teaching on Forgiveness | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on forgiveness. Learn how Scripture calls believers to forgive and be shaped by grace.",
    description: "God’s pardon in Christ and the slow work of extending grace—with clarity, wisdom, and humility.",
    introParagraphs: [
      "Forgiveness can be difficult, especially when wounds run deep or trust has been broken.",
      "Scripture speaks clearly about forgiveness, not minimizing pain, but calling believers to respond in ways shaped by God’s mercy and grace.",
      "These teachings are here to help you understand forgiveness more clearly and walk it out with wisdom and humility.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Forgiveness",
    featuredSectionSubline: "Forgiveness, growth, and doctrine tags surface teaching on mercy and reconciliation in the catalog.",
    episodeTagSlugs: ["forgiveness", "spiritual-growth", "theology"],
    relatedSlugs: ["grace", "repentance", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  grace: {
    slug: "grace",
    label: "Grace",
    heroTitle: "Christian Teaching on Grace",
    seoTitle: "Christian Teaching on Grace | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on grace. Explore how Scripture presents God’s undeserved kindness in Christ.",
    description: "Grace that saves and shapes—teaching drawn from doctrine and growth tags in the catalog.",
    introParagraphs: [
      "Grace is not a vague kindness—it is God’s favor toward sinners, secured in Christ and received by faith.",
      "Scripture sets grace against self-reliance and performance, calling believers to rest in what God has done and to walk in grateful obedience.",
      "These teachings are here to help you see grace clearly and live in light of it day by day.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Grace",
    featuredSectionSubline: "Doctrine and spiritual-growth tags surface teaching on grace, mercy, and the gospel.",
    episodeTagSlugs: ["theology", "spiritual-growth"],
    relatedSlugs: ["gospel", "forgiveness", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters.",
    ctaShowPremiumLink: false,
  },
  salvation: {
    slug: "salvation",
    label: "Salvation",
    heroTitle: "Christian Teaching on Salvation",
    seoTitle: "Christian Teaching on Salvation | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on salvation. Learn how Scripture describes rescue from sin and life in Christ.",
    description: "Rescue, redemption, and new life—teaching rooted in the gospel from the catalog.",
    introParagraphs: [
      "Salvation is God’s work to deliver sinners from guilt and judgment and bring them into life with Christ.",
      "The Bible ties salvation to Christ’s person and work—cross, resurrection, and the gift of faith—not human merit.",
      "These teachings are here to help you understand salvation plainly and rejoice in it with clarity.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Salvation",
    featuredSectionSubline: "Theology, growth, and knowing-God tags surface teaching on redemption and new life.",
    episodeTagSlugs: ["theology", "spiritual-growth", "knowing-god"],
    relatedSlugs: ["gospel", "faith", "assurance"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  sanctification: {
    slug: "sanctification",
    label: "Sanctification",
    heroTitle: "Christian Teaching on Sanctification",
    seoTitle: "Christian Teaching on Sanctification | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on sanctification. Learn how believers are shaped over time through truth, obedience, and grace.",
    description: "Becoming more like Christ—slow, Spirit-ward growth from the catalog.",
    introParagraphs: [
      "Sanctification is the ongoing work of being shaped into the likeness of Christ. It is not instant, and it is not effortless.",
      "Scripture presents growth as something that unfolds over time through truth, repentance, and faithful obedience.",
      "These teachings are here to help you understand spiritual growth more clearly and remain steady in the process.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Sanctification",
    featuredSectionSubline: "Growth, doctrine, and holiness-shaped teaching in the directory.",
    episodeTagSlugs: ["spiritual-growth", "theology", "knowing-god"],
    relatedSlugs: ["spiritual-growth", "obedience", "grace"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what is shaping you.",
    ctaShowPremiumLink: false,
  },
  holiness: {
    slug: "holiness",
    label: "Holiness",
    heroTitle: "Christian Teaching on Holiness",
    seoTitle: "Christian Teaching on Holiness | Deep Well Audio",
    seoDescription:
      "Explore Christian teaching on holiness. Learn how Scripture calls believers to live set apart and shaped by truth.",
    description: "Set apart for God—teaching on character, purity, and faithful living from the catalog.",
    introParagraphs: [
      "Holiness is often misunderstood or reduced to outward behavior. Scripture presents it more deeply as a life shaped by God’s character and truth.",
      "To pursue holiness is to be set apart, not for appearance, but for a life that reflects what is true and good.",
      "These teachings are here to help you understand holiness and live with greater clarity and purpose.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Holiness",
    featuredSectionSubline: "Doctrine and growth tags surface teaching on holy living and devotion.",
    episodeTagSlugs: ["theology", "spiritual-growth", "worldview"],
    relatedSlugs: ["sanctification", "obedience", "repentance"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to save teachings worth revisiting.",
    ctaShowPremiumLink: false,
  },
  worship: {
    slug: "worship",
    label: "Worship",
    heroTitle: "Christian Teaching on Worship",
    seoTitle: "Christian Teaching on Worship | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on worship. Discover how Scripture defines worship as more than music.",
    description: "Reverence, truth, and a life oriented toward God—teaching from the catalog.",
    introParagraphs: [
      "Worship is more than a moment or a setting. Scripture presents it as a life oriented toward God in reverence, truth, and gratitude.",
      "It includes singing, but also obedience, attention, and a heart shaped by who God is.",
      "These teachings are here to help you understand worship more fully and live it out daily.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Worship",
    featuredSectionSubline: "Knowing God and spiritual-growth tags surface worship-shaped teaching.",
    episodeTagSlugs: ["knowing-god", "spiritual-growth", "theology"],
    relatedSlugs: ["faith", "discipleship", "holiness"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  discipleship: {
    slug: "discipleship",
    label: "Discipleship",
    heroTitle: "Christian Teaching on Discipleship",
    seoTitle: "Christian Teaching on Discipleship | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on discipleship. Learn what it means to follow Christ with intention and consistency.",
    description: "Following Jesus over the long haul—teaching on formation and faithfulness from the catalog.",
    introParagraphs: [
      "Discipleship is not a one-time decision. It is a lifelong process of learning, following, and being shaped by Christ.",
      "Scripture calls believers to grow steadily, to be taught, corrected, and formed over time.",
      "These teachings are here to help you think clearly about discipleship and live it out with greater intention.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Discipleship",
    featuredSectionSubline: "Growth, obedience, and doctrine tags surface discipleship-shaped teaching.",
    episodeTagSlugs: ["spiritual-growth", "theology", "worldview"],
    relatedSlugs: ["spiritual-growth", "obedience", "faith"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters.",
    ctaShowPremiumLink: false,
  },
  gospel: {
    slug: "gospel",
    label: "Gospel",
    heroTitle: "Christian Teaching on the Gospel",
    seoTitle: "Christian Teaching on the Gospel | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on the gospel. Understand the message of Christ, grace, and salvation clearly.",
    description: "The good news of Christ—clear, central, life-defining teaching from the catalog.",
    introParagraphs: [
      "The gospel is central to the Christian faith. It is the message of what God has done through Christ to save sinners.",
      "To understand the gospel clearly is to understand grace, sin, redemption, and hope.",
      "These teachings are here to help you stay grounded in the message that defines everything else.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on the Gospel",
    featuredSectionSubline: "Doctrine and growth tags surface gospel-centered teaching.",
    episodeTagSlugs: ["theology", "spiritual-growth", "knowing-god"],
    relatedSlugs: ["salvation", "grace", "repentance"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what is shaping you.",
    ctaShowPremiumLink: false,
  },
  "eternal-life": {
    slug: "eternal-life",
    label: "Eternal life",
    heroTitle: "Christian Teaching on Eternal Life",
    seoTitle: "Christian Teaching on Eternal Life | Deep Well Audio",
    seoDescription:
      "Explore trusted Christian teaching on eternal life. Learn what Scripture says about hope, resurrection, and life with God.",
    description: "Life that begins now and lasts forever—hope anchored in Christ from the catalog.",
    introParagraphs: [
      "Eternal life is not only about the future. Scripture speaks of it as something that begins now and continues forever in the presence of God.",
      "It brings both hope and perspective, shaping how believers think about life, suffering, and what truly matters.",
      "These teachings are here to help you think clearly about eternal life and remain grounded in that hope.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Eternal Life",
    featuredSectionSubline: "Theology, last things, and hope-shaped teaching in the directory.",
    episodeTagSlugs: ["theology", "spiritual-growth", "eschatology", "end-times"],
    relatedSlugs: ["salvation", "faith", "suffering"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to return to what matters.",
    ctaShowPremiumLink: false,
  },
  assurance: {
    slug: "assurance",
    label: "Assurance",
    heroTitle: "Christian Teaching on Assurance",
    seoTitle: "Christian Teaching on Assurance | Deep Well Audio",
    seoDescription:
      "Listen to trusted Christian teaching on assurance. Learn how believers can have confidence in their faith grounded in Scripture.",
    description: "Confidence in Christ, not mere feeling—teaching from the catalog.",
    introParagraphs: [
      "Assurance can be difficult when doubts arise or when faith feels uncertain.",
      "Scripture points believers to confidence grounded not in feelings, but in the promises of God and the finished work of Christ.",
      "These teachings are here to help you think clearly about assurance and grow in steady confidence over time.",
    ],
    omitWhySection: true,
    featuredSectionHeading: "Teaching on Assurance",
    featuredSectionSubline: "Doctrine, growth, and knowing-God tags surface teaching on confidence and rest.",
    episodeTagSlugs: ["theology", "spiritual-growth", "knowing-god"],
    relatedSlugs: ["salvation", "faith", "doubt"],
    ctaHeading: "Start listening for free",
    ctaSupportLine: "Create a free account to keep what matters close.",
    ctaShowPremiumLink: false,
  },
  "knowing-god": {
    slug: "knowing-god",
    label: "Knowing God",
    description:
      "Teaching on the character and nearness of God—Scripture, prayer, and doctrine that aim at affectionate knowledge, not mere information.",
    relatedSlugs: ["theology", "spiritual-growth", "church-history"],
  },
};

/**
 * Homepage / Explore chips (user-facing order).
 * End Times is first for prominence.
 */
export const DISCOVER_TOPIC_SLUGS = [
  "gospel",
  "grace",
  "faith",
  "salvation",
  "end-times",
  "anxiety",
  "fear",
  "trusting-god",
  "purpose",
  "calling",
  "prayer",
  "repentance",
  "forgiveness",
  "sanctification",
  "holiness",
  "worship",
  "discipleship",
  "eternal-life",
  "assurance",
  "obedience",
  "suffering",
  "doubt",
  "identity",
  "spiritual-growth",
  "prophecy",
  "discernment",
  "theology",
  "worldview",
  "marriage",
  "parenting",
  "work",
  "money",
  "trials",
  "wisdom",
  "love",
  "contentment",
  "perseverance",
  "forgiveness-in-life",
  "suffering-and-loss",
  "church-history",
] as const;

export type DiscoverTopicSlug = (typeof DISCOVER_TOPIC_SLUGS)[number];

export function normalizeTopicSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
}

export function getTopicDefinition(slug: string): TopicDefinition | null {
  const key = normalizeTopicSlug(slug);
  return TOPIC_DEFINITIONS[key] ?? null;
}

export function isKnownTopicSlug(slug: string): boolean {
  return Boolean(getTopicDefinition(slug));
}

export function getDiscoverTopicCards(): TopicDefinition[] {
  return DISCOVER_TOPIC_SLUGS.map((s) => TOPIC_DEFINITIONS[s]!).filter(Boolean);
}

/** Related topics that have a landing page, in stable order. */
export function getRelatedTopicCards(relatedSlugs: string[]): TopicDefinition[] {
  const out: TopicDefinition[] = [];
  const seen = new Set<string>();
  for (const raw of relatedSlugs) {
    const def = getTopicDefinition(raw);
    if (!def || seen.has(def.slug)) continue;
    seen.add(def.slug);
    out.push(def);
  }
  return out;
}

/** Catalog `topic_tags` values used to load episodes for a hub. */
export function getTopicCatalogTags(def: TopicDefinition): string[] {
  const from = def.episodeTagSlugs?.map((s) => normalizeTopicSlug(s)).filter(Boolean);
  if (from && from.length > 0) return from;
  return [normalizeTopicSlug(def.slug)];
}

export function getTopicPageH1(def: TopicDefinition): string {
  const h = def.heroTitle?.trim();
  if (h) return h;
  return `Christian teaching on ${def.label.toLowerCase()}`;
}

export function getTopicSeoTitle(def: TopicDefinition): string {
  const t = def.seoTitle?.trim();
  if (t) return t;
  return `Christian Teaching on ${def.label} | Deep Well Audio`;
}

export function getTopicSeoDescription(def: TopicDefinition): string {
  const d = (def.seoDescription ?? def.description).trim();
  if (d.length <= 165) return d;
  return `${d.slice(0, 162).trim()}…`;
}

export function getTopicWhyItMatters(def: TopicDefinition): string[] {
  if (def.omitWhySection) return [];
  if (def.whyItMatters?.length) return def.whyItMatters;
  return [
    `${def.label} names something many believers carry into Scripture and prayer—not a trend, but a lived need. The episodes below are tagged from real teaching in this directory so you can start somewhere calm.`,
    `Audio lets you move at the speed of real life: pause, replay, and return without performance pressure. The aim is nourishment, not noise.`,
    `When you want Scripture, notes, and saves in one place, Bible Study and Premium are there as companions—not requirements to listen.`,
  ];
}

export function getAllTopicSlugs(): string[] {
  return Object.keys(TOPIC_DEFINITIONS);
}
