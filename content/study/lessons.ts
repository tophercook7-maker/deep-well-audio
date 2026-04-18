import type { StudyLesson } from "@/lib/study/types";

function L(
  topicSlug: string,
  slug: string,
  data: Omit<StudyLesson, "slug" | "topicSlug">
): StudyLesson {
  return { slug, topicSlug, ...data };
}

/** All study lessons keyed as `${topicSlug}/${slug}` — built at module load. */
export function buildStudyLessonsMap(): Record<string, StudyLesson> {
  const list: StudyLesson[] = [
    L("anxiety", "anxiety-and-trust", {
      title: "Anxiety and Trust",
      seoTitle: "Anxiety and Trust — Bible study",
      seoDescription:
        "How anxiety exposes fear and how Scripture redirects the heart toward trust in God’s care and presence.",
      shortDescription:
        "Study how anxiety exposes fear and how Scripture redirects the heart toward trust in God.",
      scriptureRefs: ["Matthew 6:25–34", "Proverbs 3:5–6", "Isaiah 26:3"],
      sections: [
        {
          title: "Anxiety often grows where control feels threatened",
          paragraphs: [
            "Anxiety frequently attaches itself to what we cannot guarantee: health, provision, reputation, or the future. When those things feel unstable, the mind rehearses danger and the heart tightens around imagined outcomes. Scripture does not treat that experience as trivial. It names the pull toward self-protection and the exhaustion of trying to hold what was never meant to be held alone.",
            "At the same time, anxiety exposes what has become functionally ultimate in our thoughts—what we look to for safety when pressure rises. Jesus does not scold people merely for feeling concern; he speaks to the deeper posture beneath the feeling, calling attention away from endless “what ifs” toward the Father who rules and provides.",
          ],
        },
        {
          title: "Jesus addresses anxiety by teaching about the Father’s care",
          paragraphs: [
            "In Matthew 6, Jesus places worry in the context of God’s kingship and fatherly care. Life is more than food and clothing; the body is more than what it wears. Birds and flowers become small witnesses to a large truth: God feeds and clothes what he tends. If that is true in creation, how much more may his children look to him when the heart is restless?",
            "The command not to be anxious is not a demand to feel nothing. It is an invitation to learn a different story about where security is found. Seeking first God’s kingdom and righteousness is a daily re-ordering of desire—trusting that today’s bread belongs to today’s God, and that tomorrow will be met with tomorrow’s mercy.",
          ],
        },
        {
          title: "Trust is not passivity; it is active dependence",
          paragraphs: [
            "Trust in Scripture is not denial, numbness, or pretending problems are small. It is the settled conviction that God is good, near, and able—and therefore the soul can stop trying to be its own god. Proverbs calls us to trust the Lord with all our heart and not lean on our own understanding, which is another way of saying: do not let limited human judgment have the final word about reality.",
            "Active dependence shows up in concrete choices: speaking truth instead of catastrophizing, doing the next right duty, asking for help, keeping commitments, and bringing the mind back to what is true when it wanders. Trust often looks like ordinary faithfulness practiced while feelings catch up slowly.",
          ],
        },
        {
          title: "Peace grows where the mind is fixed on God",
          paragraphs: [
            "Isaiah connects steadfast peace with a mind stayed on God because trust and attention move together. What the mind returns to—again and again—shapes what the heart feeds on. When the mind habitually rehearses threat without also rehearsing God’s character, anxiety finds fertile soil.",
            "Peace in the biblical sense is not merely calm emotion; it is stability rooted in God’s trustworthiness. That peace is cultivated as believers learn to speak truthfully to God, receive his promises, and walk one step at a time without demanding a full map for every mile ahead.",
          ],
        },
      ],
      reflectionPoints: [
        "What pressures are feeding anxiety most strongly right now?",
        "Where am I trying to secure myself apart from trust in God?",
        "What would it look like to practice trust one day at a time?",
      ],
      relatedLessonSlugs: ["anxiety-and-prayer", "faith/faith-in-uncertainty"],
      relatedContentTags: ["anxiety", "trust", "fear", "peace"],
    }),

    L("anxiety", "anxiety-and-prayer", {
      title: "Anxiety and Prayer",
      seoTitle: "Anxiety and Prayer — Bible study",
      seoDescription:
        "How prayer carries anxious burdens to God and reshapes the heart with peace, humility, and dependence.",
      shortDescription:
        "Study how prayer helps carry anxious burdens to God and reshapes the heart with peace and dependence.",
      scriptureRefs: ["Philippians 4:6–7", "1 Peter 5:6–7", "Psalm 55:22"],
      sections: [
        {
          title: "Scripture calls anxiety into prayer, not denial",
          paragraphs: [
            "Paul does not tell the Philippians to pretend they have no cares. He tells them to bring those cares into prayer with thanksgiving. The Christian path is not stoic silence before God; it is honest speech that refuses to let worry be the only voice in the room. Naming fear before the Lord is part of learning to trust him with it.",
            "Thanksgiving alongside requests is not a trick to manipulate emotions. It is a discipline that sets God’s past faithfulness and present goodness in view, so that prayer does not collapse into narrow panic. The heart is trained, slowly, to speak both need and gratitude in the same breath.",
          ],
        },
        {
          title: "Prayer includes surrender, not only requests",
          paragraphs: [
            "Many anxious thoughts are attempts to control what cannot be controlled. Prayer reopens the hands: God’s will, God’s timing, God’s wisdom. That surrender is not resignation that refuses action; it is humility that refuses to play God. Casting cares is an act of transferring weight from shoulders that cannot bear it to hands that never tire.",
            "Humble prayer fits Peter’s command: humble yourselves under God’s mighty hand, casting anxieties on him, because he cares for you. Humility and prayer belong together, because pride tries to carry life alone, while humility admits need and receives help.",
          ],
        },
        {
          title: "God’s peace guards the heart and mind",
          paragraphs: [
            "The peace of God, which surpasses understanding, is said to guard hearts and minds in Christ Jesus. That language suggests protection—like a sentinel—around what is most vulnerable when anxiety swirls. This peace is not the absence of trouble; it is God’s calm holding the believer to what is true when feelings argue otherwise.",
            "Such peace is received, not manufactured. It comes as believers keep company with God in prayer, return to his promises, and refuse to let worry have the final say. It may not arrive all at once, but it grows as prayer becomes a practiced refuge rather than a last resort.",
          ],
        },
        {
          title: "Casting burdens on God is an act of humility",
          paragraphs: [
            "David’s language in the Psalms—casting burdens on the Lord—pictures something heavy being deliberately placed elsewhere. Anxiety often thrives in secret carrying. Scripture calls that burden out into the open before God, where it belongs.",
            "This habit does not remove every difficulty from life, but it changes the inner posture toward difficulty. The anxious mind learns, over time, to speak sooner, to ask for help sooner, and to rest in the Father who listens and cares.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I tend to carry anxiety silently instead of praying honestly?",
        "What burdens need to be named before God?",
        "How can prayer become a first response instead of a last resort?",
      ],
      relatedLessonSlugs: ["anxiety-and-trust", "prayer/prayer-and-dependence"],
      relatedContentTags: ["anxiety", "prayer", "peace", "dependence"],
    }),

    L("faith", "what-biblical-faith-is", {
      title: "What Biblical Faith Is",
      seoTitle: "What Biblical Faith Is — Bible study",
      seoDescription:
        "Faith as trust in God’s character and Word—distinct from wishful thinking, hype, or self-reliance.",
      shortDescription:
        "Study faith as trust in God’s character and Word rather than vague optimism or self-confidence.",
      scriptureRefs: ["Hebrews 11:1", "Romans 10:17", "Mark 9:24"],
      sections: [
        {
          title: "Faith is rooted in what God has revealed",
          paragraphs: [
            "Hebrews describes faith as assurance of things hoped for and conviction of things not seen. That is not a celebration of ignorance; it is confidence in God’s testimony about reality. Faith answers God’s self-revelation with trust—treating his word as worthy of reliance when sight is incomplete.",
            "Romans ties faith to hearing: faith comes from hearing, and hearing through the word of Christ. The object of faith is not a vague force but a speaking God whose promises and commands are known through Scripture. Faith grows where God’s word is actually heard, pondered, and believed.",
          ],
        },
        {
          title: "Faith is different from wishful thinking",
          paragraphs: [
            "Wishful thinking tries to make comfort by imagination. Biblical faith receives comfort from God’s truth. It does not invent a story that feels better; it rests on what God has said is true about himself, about sin, about Christ, and about the future.",
            "That distinction matters in hardship. Faith does not deny facts; it interprets facts in light of God’s character. It can say hard things honestly while still trusting God’s final word over the mood of the moment.",
          ],
        },
        {
          title: "Faith grows through hearing the Word",
          paragraphs: [
            "If faith is tied to God’s word, then neglect of Scripture is not a neutral habit—it is a slow starvation of trust. The mind needs steady nourishment from what God has spoken, not only from impressions, anxieties, or cultural narratives.",
            "Growth is usually incremental. Faith becomes steadier as promises are revisited, prayers are shaped by truth, and obedience follows conviction. Over time, believers learn to recognize God’s voice in Scripture and to respond with reliance rather than mere curiosity.",
          ],
        },
        {
          title: "Honest weakness does not cancel real faith",
          paragraphs: [
            "The father in Mark 9 cries, “I believe; help my unbelief!” That is not hypocrisy; it is humility. Biblical faith can coexist with struggle, fear, and incomplete understanding—because faith looks to Christ, not to the perfection of one’s inner feelings.",
            "Weak faith may still be true faith if it rests on a strong Savior. The gospel welcomes people who come with trembling hands, not only those who feel certainty. What matters is the object of trust: the Lord who is faithful even when we are not.",
          ],
        },
      ],
      reflectionPoints: [
        "How have I misunderstood faith in the past?",
        "What truths from Scripture most strengthen trust in God?",
        "Where do I need to bring honest weakness before God?",
      ],
      relatedLessonSlugs: ["faith-in-uncertainty", "prayer/prayer-and-dependence"],
      relatedContentTags: ["faith", "word-of-god", "trust", "weakness"],
    }),

    L("faith", "faith-in-uncertainty", {
      title: "Faith in Uncertainty",
      seoTitle: "Faith in Uncertainty — Bible study",
      seoDescription:
        "How faith trusts God when outcomes are unclear and plans remain unresolved.",
      shortDescription:
        "Study how faith operates when outcomes are unclear and circumstances remain unresolved.",
      scriptureRefs: ["Proverbs 3:5–6", "2 Corinthians 5:7", "Hebrews 11:8"],
      sections: [
        {
          title: "Uncertainty is one of faith’s hardest settings",
          paragraphs: [
            "It is one thing to trust God when life feels stable; it is another when decisions loom, diagnoses arrive, relationships fracture, or the future is opaque. Uncertainty presses hard on the desire for control, and it can make the heart demand guarantees before obedience.",
            "Scripture does not promise believers a life of constant clarity. It promises a Person who is wise, good, and sovereign—and calls for trust even when the next chapter cannot be read in advance.",
          ],
        },
        {
          title: "Faith walks without seeing everything ahead",
          paragraphs: [
            "Paul contrasts walking by faith with walking by sight. Sight demands visible proof at every step; faith learns to move under God’s word and with God’s presence when visibility is limited. That is not recklessness; it is guided dependence.",
            "Abraham’s call illustrates this: he went out not knowing where he was going, because he knew who called him. Uncertainty about place was answered by certainty about God. Faith often looks like stepping forward in obedience while details remain incomplete.",
          ],
        },
        {
          title: "Trusting God includes submitting plans and outcomes",
          paragraphs: [
            "Proverbs calls us to trust the Lord with all our heart and acknowledge him in all our ways. Practically, that means plans are held loosely enough to be corrected, delayed, or redirected without collapsing into despair. Submission is the posture that says: God’s wisdom is higher than mine, even when I cannot see his reasons.",
            "This does not remove diligence or wisdom in decision-making. It places those decisions under God’s rule, refusing to treat any outcome as ultimate besides his glory and our faithful obedience.",
          ],
        },
        {
          title: "Uncertainty exposes what we rely on most",
          paragraphs: [
            "When answers are slow, the heart shows what it has been leaning on: reputation, money, health, other people’s approval, or our own competence. Uncertainty strips those props until we feel how insufficient they are.",
            "That exposure is painful but merciful. It drives believers back to the one foundation that does not shift. Faith in uncertainty is often less about feelings of confidence and more about repeated returning to God when confidence feels thin.",
          ],
        },
      ],
      reflectionPoints: [
        "What uncertainty feels hardest to entrust to God right now?",
        "Am I waiting for certainty before I obey?",
        "How might faithful trust look in this season?",
      ],
      relatedLessonSlugs: ["what-biblical-faith-is", "anxiety/anxiety-and-trust"],
      relatedContentTags: ["faith", "uncertainty", "trust", "obedience"],
    }),

    L("purpose", "purpose-and-identity", {
      title: "Purpose and Identity",
      seoTitle: "Purpose and Identity — Bible study",
      seoDescription:
        "How biblical purpose grows from belonging to God and identity in Christ before achievement or visibility.",
      shortDescription:
        "Study how purpose becomes clearer when it begins with identity in God rather than achievement.",
      scriptureRefs: ["Ephesians 2:10", "Colossians 3:17", "Romans 8:28"],
      sections: [
        {
          title: "Purpose is often confused with personal success",
          paragraphs: [
            "Modern culture often equates purpose with impact metrics: titles, platforms, recognition, or measurable results. Those things are not automatically wrong, but they are fragile foundations. When purpose is tied mainly to achievement, a person’s worth rises and falls with circumstances that cannot be controlled.",
            "Scripture offers a different starting point. Believers are God’s workmanship, created in Christ Jesus for good works prepared beforehand. Purpose begins with being—whose we are—before it speaks of doing. That ordering protects purpose from becoming an endless self-justifying project.",
          ],
        },
        {
          title: "Scripture roots purpose in belonging to God",
          paragraphs: [
            "Ephesians grounds Christian life in grace: saved by grace, created for good works that God planned. Purpose is not invented from scratch; it is discovered within a relationship to God and a place in his purposes. The question shifts from “What should I build?” to “What has God prepared for me to walk in?”",
            "Romans 8 reminds believers that God works in all things for good for those who love him and are called according to his purpose. That does not promise ease, but it does promise that God’s purpose is at work even in seasons that feel unclear or small.",
          ],
        },
        {
          title: "Identity shapes calling and direction",
          paragraphs: [
            "Who you are in Christ reshapes what you pursue. If you are forgiven, loved, and sent, then purpose includes truth-telling, love, service, and worship in whatever roles you occupy. Colossians calls believers to do everything in the name of the Lord Jesus, which turns ordinary tasks into meaningful obedience when done faithfully.",
            "Calling includes specific responsibilities—family, church, work, neighborhood—but those responsibilities are lived out by someone whose core identity is not earned by performance. That frees people from constant comparison and from measuring their lives only by outward visibility.",
          ],
        },
        {
          title: "Meaning is found in faithful response to God",
          paragraphs: [
            "Purpose in Scripture is not identical with fame or extraordinary gifting. Much of it is steady faithfulness: keeping promises, speaking kindly, working conscientiously, repenting quickly, serving without needing credit. These are not distractions from purpose; they often are purpose in its most daily form.",
            "When believers anchor purpose in God’s grace, they can pursue goals with energy without turning goals into gods. Success and failure both become places to learn dependence, gratitude, and perseverance—because the story is larger than any single chapter we can see.",
          ],
        },
      ],
      reflectionPoints: [
        "Have I tied purpose too closely to visibility or achievement?",
        "How does belonging to God change the way I think about purpose?",
        "What faithful responsibilities are already in front of me?",
      ],
      relatedLessonSlugs: ["purpose-and-faithfulness", "identity-in-christ/who-believers-are-in-christ"],
      relatedContentTags: ["purpose", "identity", "calling", "faithfulness"],
    }),

    L("purpose", "purpose-and-faithfulness", {
      title: "Purpose and Faithfulness",
      seoTitle: "Purpose and Faithfulness — Bible study",
      seoDescription:
        "Biblical purpose expressed through ordinary obedience, small duties, and steady perseverance.",
      shortDescription:
        "Study how biblical purpose is often expressed through ordinary, steady faithfulness.",
      scriptureRefs: ["Colossians 3:23", "Luke 16:10", "Proverbs 16:3"],
      sections: [
        {
          title: "Scripture honors ordinary faithfulness",
          paragraphs: [
            "The Bible often highlights unnoticed integrity: faithful in little, faithful in much. Jesus’ words in Luke 16 assume that character is formed in small duties—handling money honestly, keeping word, showing up—long before any public platform exists.",
            "Cultural narratives can make faithfulness sound unremarkable. Scripture treats it as precious, because God sees what is done in secret and weighs the heart. Purpose is not only the dramatic moment; it is the long arc of trustworthy living.",
          ],
        },
        {
          title: "God often forms purpose through daily obedience",
          paragraphs: [
            "Colossians tells servants to work heartily, as for the Lord and not for men, knowing that from the Lord they will receive inheritance. That reframes mundane labor: it is not meaningless because it is ordinary; it is offered to God and tested by conscience more than by applause.",
            "Daily obedience includes repentance, forgiveness, patience, and truthfulness in relationships that do not feel exciting. These are the grooves in which Christlikeness is actually formed.",
          ],
        },
        {
          title: "Small responsibilities matter before God",
          paragraphs: [
            "Neglect of small things often trains neglect of larger things. Faithfulness in conversation, schedule, finances, and secret thought life shapes whether a person can be trusted with more. Purpose grows where people take today’s duties seriously without despising them as beneath them.",
            "Proverbs commends committing work to the Lord. That is a practical trust: doing what is in front of you with integrity, while leaving outcomes to God rather than manipulating circumstances out of fear.",
          ],
        },
        {
          title: "Purpose is not lost when the season feels quiet",
          paragraphs: [
            "Some seasons offer little visibility: caregiving, illness, obscurity, waiting, or repetitive work. Quiet seasons tempt people to feel useless, but Scripture measures faithfulness differently than crowds do. God’s eyes are on endurance, love, and truth in places where no one claps.",
            "Purpose in such seasons may look like perseverance in prayer, gentleness under stress, faithful attendance to duty, and refusing bitterness. These are not sidelines of the Christian life; they are often its proving ground.",
          ],
        },
      ],
      reflectionPoints: [
        "Where do I overlook ordinary faithfulness?",
        "What responsibilities has God already entrusted to me?",
        "How can I pursue steadiness instead of constant reinvention?",
      ],
      relatedLessonSlugs: ["purpose-and-identity", "prayer/learning-to-pray-from-scripture"],
      relatedContentTags: ["purpose", "faithfulness", "work", "obedience"],
    }),

    L("prayer", "prayer-and-dependence", {
      title: "Prayer and Dependence",
      seoTitle: "Prayer and Dependence — Bible study",
      seoDescription:
        "Prayer as humility, need, and ongoing dependence on God—invited to draw near with honesty and confidence.",
      shortDescription:
        "Study prayer as an expression of humility, need, and ongoing dependence on God.",
      scriptureRefs: ["Philippians 4:6–7", "Hebrews 4:16", "John 15:5"],
      sections: [
        {
          title: "Prayer reveals dependence",
          paragraphs: [
            "To pray is to admit that you are not self-sufficient—that you need help you cannot manufacture, guidance you cannot see, forgiveness you cannot earn, and strength you do not naturally possess. In that sense, prayer is truth-telling about human limits and God’s sufficiency.",
            "Jesus’ image of the vine and branches names the basic posture of the Christian life: apart from me you can do nothing. Prayer is how that dependence stays vocal and conscious rather than collapsing into quiet self-reliance.",
          ],
        },
        {
          title: "Self-reliance weakens prayer",
          paragraphs: [
            "When people trust mainly in planning, talent, or control, prayer shrinks to emergencies or formalities. The heart does not feel need, so it does not seek God except when trouble breaks through defenses. Scripture calls that pattern what it is: pride that treats God as optional until crisis makes him necessary.",
            "Dependence does not mean passivity in practical matters. It means doing what wisdom requires while refusing to act as if outcomes belong finally to human effort. Prayer keeps God at the center of both action and waiting.",
          ],
        },
        {
          title: "God invites needy people to come boldly",
          paragraphs: [
            "Hebrews says we may draw near to the throne of grace to receive mercy and find grace to help in time of need. Boldness here is not arrogance; it is confidence in God’s welcome because of Christ. Needy people are not turned away; they are the ones for whom the throne is open.",
            "That invitation reshapes prayer from performance to reception. Believers do not come to impress God; they come to receive mercy, strength, and guidance from the one who already knows them fully.",
          ],
        },
        {
          title: "Dependence is not weakness but wisdom",
          paragraphs: [
            "The world often treats dependence as immaturity. Scripture treats humble dependence on God as the beginning of wisdom. It aligns the creature with reality: we are finite, contingent, and accountable—and God is infinite, generous, and faithful.",
            "Prayer, then, is not an escape from responsibility; it is the rhythm that keeps responsibility from becoming self-salvation. It trains the heart to work hard without pretending to be God, and to rest without pretending God is absent.",
          ],
        },
      ],
      reflectionPoints: [
        "What does my prayer life reveal about dependence?",
        "Where am I relying on myself more than I realize?",
        "How can prayer become a daily expression of dependence?",
      ],
      relatedLessonSlugs: ["learning-to-pray-from-scripture", "anxiety/anxiety-and-prayer"],
      relatedContentTags: ["prayer", "dependence", "humility", "trust"],
    }),

    L("prayer", "learning-to-pray-from-scripture", {
      title: "Learning to Pray from Scripture",
      seoTitle: "Learning to Pray from Scripture — Bible study",
      seoDescription:
        "How the Bible shapes prayer’s priorities, language, and stability—beyond impulse and mood.",
      shortDescription:
        "Study how Scripture shapes the language, priorities, and direction of prayer.",
      scriptureRefs: ["Matthew 6:9–13", "Psalm 19:14", "Colossians 1:9–12"],
      sections: [
        {
          title: "Scripture teaches us what to ask for",
          paragraphs: [
            "Left to ourselves, prayer easily becomes a list of anxieties or desires without reference to God’s kingdom. The Lord’s Prayer begins with God’s name, kingdom, and will—reordering the heart before it asks for daily bread. That pattern teaches believers to want what God wants and to receive daily provision as a gift rather than a given.",
            "Paul’s prayers for the Colossians—spiritual wisdom, worthy walk, endurance, thanksgiving—show concerns larger than immediate relief. Scripture expands prayer beyond the urgent to the ultimate: maturity, love, knowledge of God’s will, and fruitfulness that honors Christ.",
          ],
        },
        {
          title: "Prayer is shaped by God’s priorities",
          paragraphs: [
            "When Scripture sets the agenda, prayer stops being only a vent for emotion—though honest emotion still belongs—and becomes alignment with God’s purposes. Believers learn to ask for holiness, unity, boldness, comfort, and growth in faith, not only for changed circumstances.",
            "This does not mean ignoring real needs. It means placing needs within a framework where God’s glory and our good are not enemies. Prayer seeks first God’s kingdom even while bringing honest requests about pain, confusion, and daily pressures.",
          ],
        },
        {
          title: "Biblical prayer includes praise, confession, and dependence",
          paragraphs: [
            "The Psalms model a full range: lament, praise, confession, remembrance, and petition. Prayer that only asks but never adores grows thin. Prayer that never confesses sin quietly assumes self-righteousness. Prayer that never laments honestly may be hiding reality from God and from oneself.",
            "Scripture gives language when personal words run dry. Borrowed words from the Bible are not less authentic; they often become the most honest words a person can pray.",
          ],
        },
        {
          title: "Letting Scripture form prayer deepens stability",
          paragraphs: [
            "When prayer tracks Scripture, it is anchored in what is true when feelings fluctuate. The heart may still feel anxious, weary, or sad—but prayer can continue on rails of God’s promises rather than only on the shifting terrain of mood.",
            "Over time, praying Scripture trains desires. Believers begin to want holiness, wisdom, and love in ways they did not naturally want before—because they have been asking God for what he already loves to give.",
          ],
        },
      ],
      reflectionPoints: [
        "Do my prayers reflect the priorities of Scripture?",
        "What passages could I return to in prayer this week?",
        "How would praying from Scripture deepen steadiness?",
      ],
      relatedLessonSlugs: ["prayer-and-dependence", "faith/what-biblical-faith-is"],
      relatedContentTags: ["prayer", "scripture", "worship", "dependence"],
    }),

    L("suffering", "suffering-and-endurance", {
      title: "Suffering and Endurance",
      seoTitle: "Suffering and Endurance — Bible study",
      seoDescription:
        "How Scripture prepares believers to endure trials with faith, maturity, and eyes fixed on Christ.",
      shortDescription:
        "Study how Scripture prepares believers to endure suffering with steadiness and maturity.",
      scriptureRefs: ["James 1:2–4", "Romans 5:3–5", "Hebrews 12:1–3"],
      sections: [
        {
          title: "Endurance is formed under pressure",
          paragraphs: [
            "James speaks of trials producing steadfastness when faith is tested. Endurance is not a natural personality trait; it is forged when difficulty meets trust. The process is not pleasant, but it aims at maturity and completeness—Christlike wholeness that simple ease rarely produces.",
            "Romans describes a chain: suffering produces endurance, endurance character, and character hope. The point is not to romanticize pain but to say God can use even grievous seasons to deepen trust and reshape desires around what will last.",
          ],
        },
        {
          title: "Suffering tests and refines faith",
          paragraphs: [
            "Trials reveal what faith is made of: whether believers will still look to God when the benefits of belief are not obvious, when prayers seem unanswered, or when grief is heavy. Faith that only works in sunshine is thin faith; faith that holds in darkness is tested faith.",
            "Refinement is not God’s cruelty; it is his care. He disciplines those he loves, not to crush them, but to train them toward holiness and dependence. That truth does not remove sorrow, but it gives sorrow a context larger than meaninglessness.",
          ],
        },
        {
          title: "Scripture calls believers to keep running with perspective",
          paragraphs: [
            "Hebrews urges believers to lay aside sin and run with endurance, looking to Jesus, who endured the cross for the joy set before him. Christian endurance is not grim stoicism; it is perseverance energized by a finish line and a Savior who has gone the hardest road first.",
            "Perspective does not pretend suffering is small. It places suffering within a story where resurrection is real, sin is defeated, and the believer’s life is hidden with Christ. That vision helps people take the next step when feelings say quit.",
          ],
        },
        {
          title: "Christ’s endurance reshapes ours",
          paragraphs: [
            "Consider him who endured from sinners such hostility against himself, so that you may not grow weary or fainthearted. Jesus’ suffering was not random—it was for sinners, in love, for joy. Christian endurance is not copying his pain; it is following him through ours with trust in the Father.",
            "This does not answer every “why” about specific trials. It does anchor endurance in a person—not only a principle. Believers are not asked to suffer alone; they follow a Savior who knows weakness, sorrow, and death, and who has overcome.",
          ],
        },
      ],
      reflectionPoints: [
        "How do I typically respond when suffering stretches me?",
        "What is suffering revealing in me right now?",
        "How can endurance be practiced instead of merely admired?",
      ],
      relatedLessonSlugs: ["suffering-and-hope", "faith/faith-in-uncertainty"],
      relatedContentTags: ["suffering", "endurance", "trials", "maturity"],
    }),

    L("suffering", "suffering-and-hope", {
      title: "Suffering and Hope",
      seoTitle: "Suffering and Hope — Bible study",
      seoDescription:
        "Biblical hope in grief and pain—God’s nearness, honest lament, and the promise that sorrow is not the final word.",
      shortDescription:
        "Study how biblical hope sustains believers in pain without minimizing grief.",
      scriptureRefs: ["2 Corinthians 4:16–18", "Psalm 34:18", "Romans 8:18"],
      sections: [
        {
          title: "Christian hope does not deny sorrow",
          paragraphs: [
            "Hope in Scripture is not a demand to smile while hurting. The Psalms are full of lament; Paul speaks of inner renewal while outer life wastes away. Biblical faith makes room for grief without asking it to pretend it is small.",
            "Hope and sorrow can coexist because hope is not a mood—it is conviction about God’s character and the future he promises. A believer can weep honestly while still saying, “I will not despair of God.”",
          ],
        },
        {
          title: "God’s nearness matters in pain",
          paragraphs: [
            "The Lord is near to the brokenhearted. That nearness is not always felt as warm emotion; sometimes it is known only by holding to his word when feelings are numb. Still, Scripture anchors comfort in God’s presence, not merely in improved circumstances.",
            "Suffering can tempt people to feel abandoned. God invites the wounded to draw near to him, to speak honestly, and to find that mercy is not exhausted by pain. Hope begins where God meets the broken, not where brokenness disappears.",
          ],
        },
        {
          title: "Present suffering is not the final word",
          paragraphs: [
            "Paul contrasts present affliction with an eternal weight of glory. He does not measure suffering as light in an emotional sense; he relativizes it against a future so great that the hardest present reality is not ultimate reality.",
            "Romans speaks of creation groaning and believers groaning—yet with hope. The Christian story includes a redemption that will one day remove the curse’s sting. Present pain is real, but it is not forever in the same form.",
          ],
        },
        {
          title: "Future hope changes present endurance",
          paragraphs: [
            "Hope does not remove today’s pain, but it changes what pain means. It can be carried as sorrow that is not meaningless—sorrow that is watched by a faithful God and headed toward resurrection morning.",
            "This hope also fuels compassion. Those who know Christ’s future comfort learn to weep with those who weep today, offering presence and truth without rushing past grief with shallow platitudes.",
          ],
        },
      ],
      reflectionPoints: [
        "Where do I need hope without pretending pain is small?",
        "What promises from Scripture speak most clearly in suffering?",
        "How does future hope change the way I carry present hardship?",
      ],
      relatedLessonSlugs: ["suffering-and-endurance", "identity-in-christ/identity-and-security-in-christ"],
      relatedContentTags: ["suffering", "hope", "grief", "endurance"],
    }),

    L("salvation", "what-salvation-means", {
      title: "What Salvation Means",
      seoTitle: "What Salvation Means — Bible study",
      seoDescription:
        "Salvation as God’s rescue of sinners through Christ—sin, mercy, cross, and new life grounded in the gospel.",
      shortDescription:
        "Study salvation as God’s rescue of sinners through Christ and the heart of the gospel.",
      scriptureRefs: ["Romans 3:23–24", "Romans 5:8", "Titus 3:4–7"],
      sections: [
        {
          title: "Salvation answers the problem of sin",
          paragraphs: [
            "Scripture’s diagnosis is blunt: all have sinned and fall short of God’s glory. Sin is not only bad behavior; it is a bent away from God’s authority and goodness, producing guilt, corruption, and death. Salvation begins to make sense only when the problem is named honestly.",
            "If sin were minor, grace would be optional. Because sin separates people from holy God, rescue must come from outside ourselves. Salvation is God’s answer to a condition we cannot fix by self-improvement alone.",
          ],
        },
        {
          title: "Salvation is rooted in God’s mercy",
          paragraphs: [
            "Titus speaks of kindness, love, and mercy—not human merit—as the source of salvation. God saves not because people deserve it, but because he is merciful. That protects salvation from becoming a reward for those who feel worthy enough.",
            "Romans highlights God’s love displayed while we were still sinners. The timing matters: love precedes our cleanup. Salvation is anchored in God’s character, not in our performance.",
          ],
        },
        {
          title: "Christ’s work stands at the center",
          paragraphs: [
            "Salvation is not a vague spiritual idea; it is centered on Jesus Christ: his life, death, and resurrection. He is the mediator, the substitute, the risen Lord. To be saved is to be united to him by faith, receiving what he accomplished in our place.",
            "This keeps the gospel from dissolving into advice. Christianity is news about what God has done. Our response matters, but the decisive action is Christ’s finished work.",
          ],
        },
        {
          title: "Salvation changes both standing and life",
          paragraphs: [
            "Salvation includes justification—declared righteous in Christ—and renewal by the Spirit. Believers are not only forgiven; they are made new, indwelt, and set on a path of growth. Grace reaches backward to guilt and forward to transformation.",
            "Understanding salvation broadly guards against reducing it to a momentary feeling or a mere ticket to heaven. It names a whole new relationship with God and a new direction of life under his rule.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I think of salvation too narrowly or too vaguely?",
        "How clearly do I understand the role of Christ in salvation?",
        "What part of the gospel needs deeper attention in me?",
      ],
      relatedLessonSlugs: ["salvation-by-grace-through-faith", "grace/what-grace-is"],
      relatedContentTags: ["salvation", "gospel", "christ", "mercy"],
    }),

    L("salvation", "salvation-by-grace-through-faith", {
      title: "Salvation by Grace Through Faith",
      seoTitle: "Salvation by Grace Through Faith — Bible study",
      seoDescription:
        "Why salvation is received, not earned—grace, faith, and the exclusion of boasting in Christ alone.",
      shortDescription:
        "Study why salvation is received by grace through faith and never earned by human effort.",
      scriptureRefs: ["Ephesians 2:8–9", "Galatians 2:16", "Romans 4:4–5"],
      sections: [
        {
          title: "Grace rules out boasting",
          paragraphs: [
            "Ephesians states plainly: by grace you have been saved through faith, and this is not your own doing; it is the gift of God, not a result of works. If salvation were earned, human pride would claim part of the glory. Grace leaves no room for that.",
            "Boasting is not only arrogant speech; it is any quiet assumption that God accepts us because we are better, more disciplined, or more sincere than others. Grace dismantles that assumption and replaces it with gratitude.",
          ],
        },
        {
          title: "Faith receives what Christ has accomplished",
          paragraphs: [
            "Faith is the instrument that receives salvation, not the ground of it. The ground is Christ’s righteousness and sacrifice. Faith is empty hands—not perfect hands—taking hold of what God offers freely.",
            "Galatians contrasts justification by faith in Christ with works of the law. Effort cannot complete what grace began without implying that Christ’s work was insufficient. Faith looks away from self to Christ.",
          ],
        },
        {
          title: "Works cannot replace grace",
          paragraphs: [
            "Romans contrasts wages earned with gift received. If salvation were wages, it would be owed—and human merit would be the measure. Scripture insists salvation is gift, which means it must be received, not achieved.",
            "Good works follow salvation as fruit, not root. They are evidence of new life, not the purchase price of acceptance. Confusing the order turns the gospel into moralism and burdens the conscience with an impossible standard.",
          ],
        },
        {
          title: "Resting in Christ changes how salvation is understood",
          paragraphs: [
            "Assurance shifts from “Am I good enough?” to “Is Christ enough?” That question has a clear answer in Scripture. Resting in Christ does not produce laziness; it produces love that flows from gratitude rather than fear of rejection.",
            "When salvation is by grace through faith, failures lead to repentance and renewed looking to Christ—not to despair or self-punishment as if grace were fragile. The believer’s standing is anchored in Christ’s finished work.",
          ],
        },
      ],
      reflectionPoints: [
        "Where am I tempted to measure standing with God by performance?",
        "What does it mean to receive rather than achieve salvation?",
        "How does grace reshape assurance?",
      ],
      relatedLessonSlugs: ["what-salvation-means", "grace/what-grace-is"],
      relatedContentTags: ["salvation", "grace", "faith", "assurance"],
    }),

    L("grace", "what-grace-is", {
      title: "What Grace Is",
      seoTitle: "What Grace Is — Bible study",
      seoDescription:
        "Grace as God’s undeserved favor in Christ—holy love that saves sinners and sustains the Christian life.",
      shortDescription:
        "Study grace as God’s undeserved favor shown to sinners in Christ.",
      scriptureRefs: ["Ephesians 2:8–9", "Romans 5:20–21", "Titus 2:11"],
      sections: [
        {
          title: "Grace is undeserved",
          paragraphs: [
            "Grace means favor that cannot be claimed as payment. If it were owed, it would no longer be grace. Scripture presents salvation as a gift, which assumes human bankruptcy before God’s holy standard. Grace begins where merit ends.",
            "This humbles every person equally. No one can claim spiritual status apart from God’s kindness. At the same time, it offers hope: acceptance is not reserved for the strongest, but for those who come empty-handed to Christ.",
          ],
        },
        {
          title: "Grace reveals God’s initiative",
          paragraphs: [
            "Grace is God acting to save people who would not and could not save themselves. The Father sends the Son; the Spirit raises the dead heart; the sinner responds in repentance and faith—but the first movement is God’s.",
            "Titus says grace has appeared, bringing salvation. Grace is not a vague atmosphere; it is God’s decisive action in history, centered on Christ. To speak of grace is to speak of what God has done, not what humans have conjured.",
          ],
        },
        {
          title: "Grace is not leniency without truth",
          paragraphs: [
            "Grace is not God winking at sin. Grace is God justly dealing with sin at the cross while mercifully welcoming sinners. Cheap grace that avoids repentance is not biblical grace; it is self-deception.",
            "True grace is costly grace—costly to God, free to us. It forgives sin without pretending sin is insignificant. That is why grace leads to repentance and transformation rather than indifference to holiness.",
          ],
        },
        {
          title: "Grace stands at the center of the Christian life",
          paragraphs: [
            "Grace is not only how people begin; it is how they continue. The Christian life is daily dependence on mercy, daily need for strength, daily return to Christ. Growth happens not by outgrowing grace but by learning to live inside it with greater honesty.",
            "Paul’s letters return to grace again and again because the heart drifts toward earning. Preaching grace to oneself is not an occasional rescue; it is the normal Christian habit.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I understand grace mainly as a concept or as a defining reality?",
        "Where am I tempted to drift back toward earning?",
        "How does grace humble and strengthen at the same time?",
      ],
      relatedLessonSlugs: ["grace-and-growth", "salvation/salvation-by-grace-through-faith"],
      relatedContentTags: ["grace", "mercy", "salvation", "humility"],
    }),

    L("grace", "grace-and-growth", {
      title: "Grace and Growth",
      seoTitle: "Grace and Growth — Bible study",
      seoDescription:
        "How grace teaches, strengthens, and sanctifies—holiness as fruit of grace, not its rival.",
      shortDescription:
        "Study how grace not only saves, but also teaches, strengthens, and shapes the believer over time.",
      scriptureRefs: ["Titus 2:11–12", "2 Corinthians 12:9", "Hebrews 4:16"],
      sections: [
        {
          title: "Grace teaches believers how to live",
          paragraphs: [
            "Titus says grace trains us to renounce ungodliness and worldly passions, and to live self-controlled, upright, and godly lives. Grace is not permission to sin; it is power that reorients desires and disciplines habits toward holiness.",
            "This teaching is not harsh legalism dressed up—it is grace shaping love, integrity, patience, and purity. The same favor that saves also instructs, because God’s kindness leads toward life that matches his character.",
          ],
        },
        {
          title: "Grace meets weakness with strength",
          paragraphs: [
            "Paul’s thorn in the flesh leads to a word from God: my grace is sufficient for you, for my power is made perfect in weakness. Growth often looks like discovering strength not beyond weakness, but in dependence through weakness.",
            "That pattern guards Christian growth from pride. Boasting shifts from self to the Lord, because the believer’s progress is traced to grace at work where human resources run out.",
          ],
        },
        {
          title: "Growth is not opposed to grace",
          paragraphs: [
            "Some fear that pursuing holiness contradicts grace. Scripture joins them: believers work out salvation with fear and trembling because God works in them (Philippians 2:12–13). Effort is not the enemy of grace; self-sufficiency is.",
            "Growth means learning to rely on God more, not less—using means he provides: Word, prayer, church, repentance, accountability. Those means are channels of grace, not replacements for it.",
          ],
        },
        {
          title: "Ongoing dependence keeps growth grounded",
          paragraphs: [
            "Hebrews invites believers to draw near to the throne of grace for help. Growth does not graduate a Christian out of need. Maturity looks more like deeper humility and richer prayer than self-reliant competence.",
            "Sanctification, then, is grace from beginning to end—God forming Christlike character in those who keep coming to him honestly, especially when progress feels slow.",
          ],
        },
      ],
      reflectionPoints: [
        "Have I separated grace from growth in the way I think?",
        "Where do I most need strength through grace right now?",
        "How can dependence on grace deepen steady growth?",
      ],
      relatedLessonSlugs: ["what-grace-is", "suffering/suffering-and-endurance"],
      relatedContentTags: ["grace", "growth", "weakness", "sanctification"],
    }),

    L("identity-in-christ", "who-believers-are-in-christ", {
      title: "Who Believers Are in Christ",
      seoTitle: "Who Believers Are in Christ — Bible study",
      seoDescription:
        "New creation, adoption, and union with Christ—biblical identity as received truth, not self-invention.",
      shortDescription:
        "Study core biblical truths about who believers are in Christ and why identity must begin there.",
      scriptureRefs: ["2 Corinthians 5:17", "Ephesians 1:3–6", "Romans 8:14–17"],
      sections: [
        {
          title: "Identity in Christ is given, not invented",
          paragraphs: [
            "The world says, “Define yourself.” Scripture says, “Receive who God declares you to be in Christ.” Identity is not primarily a creative project; it is a faithful response to God’s word about us. That humbles pride and stabilizes the soul.",
            "If anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come. This is God’s verdict, not a self-image exercise. Christian confidence begins with what God has done, not with what the self has achieved.",
          ],
        },
        {
          title: "Believers are adopted, forgiven, and made new",
          paragraphs: [
            "Ephesians overflows with blessings: chosen, holy, predestined for adoption, redemption through Christ’s blood, forgiveness. These are relational realities—family language—not abstract labels. Believers are children of God through Jesus Christ, according to the purpose of his will.",
            "Romans describes the Spirit of adoption, crying “Abba! Father!”—a voice that belongs to those led by God’s Spirit. Identity includes both privilege and responsibility: heirs of God, called to walk in step with the Spirit.",
          ],
        },
        {
          title: "Identity in Christ shapes perspective and conduct",
          paragraphs: [
            "Who you are changes how you live. If you are forgiven, you can forgive. If you are loved, you are freed from slavery to approval. If you are an heir, you can endure hardship with hope. Conduct flows from position, even when feelings lag behind.",
            "This guards the Christian life from mere rule-keeping. Obedience is not a way to become acceptable; it is the path of someone already accepted, learning to live in line with reality.",
          ],
        },
        {
          title: "Remembering identity guards against confusion",
          paragraphs: [
            "The world’s voices are loud: performance, comparison, shame, fear. Identity in Christ must be rehearsed—through Scripture, prayer, and community—because forgetfulness is easy. Steady remembrance is not narcissism; it is alignment with truth.",
            "When believers forget who they are, they revert to older scripts: earning, hiding, performing. The gospel calls them back again and again to names that cannot be taken away by failure or success.",
          ],
        },
      ],
      reflectionPoints: [
        "What voices most compete with biblical identity in my life?",
        "Which truths about identity in Christ need deeper roots in me?",
        "How would daily life change if I remembered these truths more deliberately?",
      ],
      relatedLessonSlugs: ["identity-and-security-in-christ", "purpose/purpose-and-identity"],
      relatedContentTags: ["identity-in-christ", "adoption", "belonging", "assurance"],
    }),

    L("identity-in-christ", "identity-and-security-in-christ", {
      title: "Identity and Security in Christ",
      seoTitle: "Identity and Security in Christ — Bible study",
      seoDescription:
        "Steadfast security in union with Christ—against shame, fear, comparison, and the instability of feelings.",
      shortDescription:
        "Study how identity in Christ provides security in the face of shame, fear, comparison, and instability.",
      scriptureRefs: ["Colossians 3:1–4", "Galatians 2:20", "Romans 8:31–39"],
      sections: [
        {
          title: "Security in Christ is deeper than emotional certainty",
          paragraphs: [
            "Feelings fluctuate: peace one day, doubt the next. Security in Christ rests on objective realities—what God has accomplished and promised—not on the weather inside the soul. That does not mean feelings are irrelevant; it means they are not the foundation.",
            "Believers learn to preach the gospel to themselves when emotions argue against it: Christ died, rose, intercedes, and holds his people. Those facts remain when moods do not cooperate.",
          ],
        },
        {
          title: "Union with Christ reshapes fear and comparison",
          paragraphs: [
            "Fear of rejection loses power where acceptance is already secured in Christ. Comparison loses ultimate weight where worth is not earned by outperforming others. Identity in Christ reframes social anxiety: you can seek love faithfully without making human approval ultimate.",
            "Paul’s words—I have been crucified with Christ; I no longer live, but Christ lives in me—name a union that re-centers life. The self is not erased; it is redefined around Christ’s life and righteousness.",
          ],
        },
        {
          title: "Shame loses power where identity is understood",
          paragraphs: [
            "Shame whispers that failure is final identity. The gospel answers: failure is real, but it is not the last word for those in Christ. There is cleansing, forgiveness, and a new name. Shame’s power is broken where sin is confessed and grace is believed.",
            "That does not mean memories vanish instantly. It means they are interpreted in light of mercy rather than condemnation. Growth includes learning to bring shame’s accusations to the cross until they grow quieter.",
          ],
        },
        {
          title: "Security produces steadiness, not passivity",
          paragraphs: [
            "Security can be mistaken for complacency. Romans 8’s triumphant questions—If God is for us, who can be against us?—lead not to laziness but to courage. Loved people obey. Secured people can risk love, speak truth, and serve without panicking over every misstep.",
            "Colossians calls believers to seek the things above where Christ is, setting minds on him. Security lifts the gaze toward eternal life and present holiness—active discipleship rooted in what is already true.",
          ],
        },
      ],
      reflectionPoints: [
        "Where do I look for security besides Christ?",
        "How do fear, shame, or comparison distort identity?",
        "What truths from these passages need to be returned to often?",
      ],
      relatedLessonSlugs: ["who-believers-are-in-christ", "anxiety/anxiety-and-trust"],
      relatedContentTags: ["identity-in-christ", "security", "assurance", "shame", "fear"],
    }),

    L("forgiveness", "forgiveness-and-mercy", {
      title: "Forgiveness and Mercy",
      seoTitle: "Forgiveness and Mercy — Bible study",
      seoDescription:
        "How God’s mercy toward sinners shapes the way believers forgive others, resist bitterness, and walk in grace.",
      shortDescription:
        "Study how God’s mercy toward sinners shapes the way believers approach forgiveness.",
      scriptureRefs: ["Ephesians 4:31–32", "Colossians 3:12–13", "Psalm 103:10–12"],
      sections: [
        {
          title: "Forgiveness begins with remembering mercy received",
          paragraphs: [
            "Paul’s commands to put away bitterness and forgive are not issued into a vacuum. They are spoken to people who have been shown mercy in Christ—chosen, beloved, and called to put on compassionate hearts. Forgiveness, in this light, is not a demand that the injured person pretend they are unaffected; it is a call to respond in a way that matches the mercy they themselves depend on every day.",
            "Remembering mercy received reframes the inner conversation. Instead of rehearsing how much someone deserves retaliation, the believer rehearses how much they have been forgiven. That does not erase accountability or truth, but it weakens the grip of self-righteous anger—the kind of anger that treats mercy as something earned rather than received.",
          ],
        },
        {
          title: "Bitterness grows where mercy is forgotten",
          paragraphs: [
            "Bitterness is not only an emotion; it is a habit of the heart that feeds on injury. When mercy is forgotten, the mind returns again and again to wrongs, re-litigating the past and nursing a sense of justified resentment. Scripture warns against this not because pain is unreal, but because bitterness does spiritual damage: it binds the soul to the wrong done and makes the heart a prisoner.",
            "Forgiveness, understood biblically, is one of God’s means of protection. It does not mean the wound was insignificant; it means the believer refuses to let the wound become a throne. Mercy remembered starves bitterness by redirecting the heart toward God’s patience and toward a future shaped by grace rather than revenge.",
          ],
        },
        {
          title: "Forgiveness is costly because mercy is costly",
          paragraphs: [
            "Mercy is never cheap. God’s mercy toward sinners was purchased at the highest cost—the cross of Christ. Human forgiveness, though different in kind, often carries real pain: the pain of releasing a claim to personal vengeance, the pain of accepting that justice may not look the way the flesh demands, and the pain of entrusting outcomes to God.",
            "Costly forgiveness is not performed to earn God’s love; it flows from having received love. It may take time, repeated prayer, and help from the church. The point is direction: the heart is learning to walk in the pattern of mercy, not because injury is denied, but because Christ’s people are being remade to resemble Him.",
          ],
        },
        {
          title: "Mercy does not make sin small, but it changes how believers respond",
          paragraphs: [
            "Mercy does not say evil is insignificant. The gospel insists that sin is serious enough to require the death of the Son of God. What mercy does is remove the believer’s final hope from personal payback and place it in God’s righteous judgment and reconciling grace.",
            "This changes the posture of the Christian toward others: truth can still be spoken, boundaries can still exist, and wisdom can still be pursued—but the driving engine is no longer hatred. The believer seeks to reflect God’s heart: hating what is evil while refusing to be consumed by evil’s cycle.",
          ],
        },
      ],
      reflectionPoints: [
        "Where am I tempted to hold tightly to bitterness?",
        "How does God’s mercy toward me reshape my view of others?",
        "What would it look like to respond with mercy without denying truth?",
      ],
      relatedLessonSlugs: ["forgiveness-and-reconciliation", "repentance/repentance-and-returning-to-god"],
      relatedContentTags: ["forgiveness", "mercy", "bitterness", "grace"],
    }),

    L("forgiveness", "forgiveness-and-reconciliation", {
      title: "Forgiveness and Reconciliation",
      seoTitle: "Forgiveness and Reconciliation — Bible study",
      seoDescription:
        "The relationship between forgiveness, truth, repentance, and restored peace—without confusing mercy with denial.",
      shortDescription:
        "Study the relationship between forgiveness, reconciliation, truth, and restored relationship.",
      scriptureRefs: ["Romans 12:17–21", "Matthew 18:21–35", "2 Corinthians 5:18–19"],
      sections: [
        {
          title: "Forgiveness and reconciliation are related but not identical",
          paragraphs: [
            "Forgiveness is a heart posture before God that releases personal vengeance and seeks the good even toward someone who has done wrong. Reconciliation is a restored relationship, and it requires more than one person’s willingness. Where sin has broken trust, reconciliation typically needs truth, repentance, and time—sometimes with boundaries that protect the vulnerable.",
            "Christians err when they treat forgiveness as automatic reconciliation: pressing wounded people to pretend, to return to unsafe situations, or to silence honesty for the sake of superficial peace. Scripture calls for forgiveness, but it also calls for wisdom, truth-telling, and sometimes the patient work of rebuilding trust only where repentance and safety allow.",
          ],
        },
        {
          title: "Reconciliation involves truth, repentance, and wisdom",
          paragraphs: [
            "Paul’s ministry of reconciliation is grounded in God’s act in Christ—truth about sin, truth about grace, and a call to be reconciled to God. Human reconciliation follows a similar pattern: real peace is not the absence of conflict at any cost, but the presence of truth and repentance where relationship is genuinely healed.",
            "Wisdom asks practical questions: What has happened? What is safe? What is being asked of each person? What does love require in this situation—sometimes tender pursuit, sometimes firm distance? The goal is not vengeance disguised as wisdom, nor permissiveness disguised as love.",
          ],
        },
        {
          title: "Forgiveness releases revenge to God",
          paragraphs: [
            "Romans 12 refuses the church the satisfaction of personal retaliation. Instead, it commands believers to leave room for God’s wrath—His righteous judgment—and to overcome evil with good. Forgiveness, in this framework, is entrusting the final word to God rather than seizing it for oneself.",
            "This is deeply countercultural. It does not promise that every wrong will be answered on your timetable, nor does it remove the need for civil justice in many cases. It does mean the believer’s heart is not chained to the project of making someone suffer as payment for suffering. God’s justice is real; the Christian is freed to do good without being ruled by rage.",
          ],
        },
        {
          title: "Peace is pursued faithfully, not superficially",
          paragraphs: [
            "Jesus teaches forgiveness with sobering seriousness—there is a warning in the parable of the unforgiving servant because mercy received should produce mercy given. At the same time, biblical peace is not a sticker placed over unresolved sin. It is pursued with integrity: honest confession where needed, patient listening, and a refusal to confuse quietness with righteousness.",
            "Sometimes the most faithful pursuit of peace is prayer for an enemy while maintaining careful distance. Sometimes it is a long road of conversation and repentance. In every case, the Christian aims at true peace—peace that honors God, protects the weak, and reflects the reconciling power of the gospel.",
          ],
        },
      ],
      reflectionPoints: [
        "Have I confused forgiveness with pretending nothing happened?",
        "Where is wisdom needed in pursuing peace?",
        "How can I release personal vengeance to God?",
      ],
      relatedLessonSlugs: ["forgiveness-and-mercy", "repentance/repentance-and-godly-sorrow"],
      relatedContentTags: ["forgiveness", "reconciliation", "peace", "wisdom"],
    }),

    L("discernment", "testing-what-you-hear", {
      title: "Testing What You Hear",
      seoTitle: "Testing What You Hear — Bible study",
      seoDescription:
        "Why believers must examine teaching and spiritual claims carefully, comparing all things to Scripture.",
      shortDescription:
        "Study how believers are called to examine ideas, teaching, and claims carefully under Scripture.",
      scriptureRefs: ["1 Thessalonians 5:21–22", "1 John 4:1", "Acts 17:11"],
      sections: [
        {
          title: "Scripture commands believers to test, not merely absorb",
          paragraphs: [
            "Paul tells the Thessalonians to test everything and hold fast to what is good. John warns not to believe every spirit, but to test the spirits. These commands assume something vital: spiritual talk is not automatically safe talk. Sincerity, intensity, and even miracles are not sufficient grounds for trust—truth is.",
            "Testing is not the same as paranoia. It is a disciplined habit of asking, “What does God say?” The Bereans are commended not for being cynical, but for examining the Scriptures daily to see whether Paul’s teaching was so. Discernment begins with a high view of God’s Word as the standard.",
          ],
        },
        {
          title: "Spiritual claims are not trustworthy just because they sound sincere",
          paragraphs: [
            "People can be sincere and mistaken. A teacher can speak with warmth and still distort the gospel. A movement can feel exciting and still lead away from Christ. Discernment refuses the shortcut of judging truth by tone, popularity, or personal preference.",
            "This is especially important because error often arrives with religious language attached. Testing calls believers to slow down, compare texts in context, and ask whether teaching elevates Christ according to Scripture or smuggles in another foundation—self, culture, fear, or pride.",
          ],
        },
        {
          title: "Truth requires careful listening and careful comparison",
          paragraphs: [
            "Careful listening means understanding what is actually being said—not reacting to a label, a rumor, or a fragment. Careful comparison means measuring claims against the whole counsel of God, because isolated verses can be made to say almost anything.",
            "Discernment grows where believers are willing to be corrected. If testing is only a tool to defend what one already wants to believe, it becomes self-deception. True testing submits to Scripture even when it disrupts comfortable assumptions.",
          ],
        },
        {
          title: "Discernment protects both doctrine and life",
          paragraphs: [
            "Doctrine matters because truth shapes worship, hope, and obedience. Wrong ideas about God, sin, grace, and salvation do not stay in the head; they show up in anxiety, pride, legalism, or despair.",
            "Discernment also protects life: relationships, priorities, and conscience. It helps believers recognize manipulation, moral compromise, and spiritual performance. The church becomes healthier when people learn to test what they hear—not to create suspicion, but to pursue faithfulness.",
          ],
        },
      ],
      reflectionPoints: [
        "Am I too quick to accept what sounds spiritual?",
        "What habits help me test what I hear?",
        "Where do I need stronger commitment to truth over convenience?",
      ],
      relatedLessonSlugs: ["discernment-and-maturity", "wisdom/wisdom-for-daily-decisions"],
      relatedContentTags: ["discernment", "truth", "teaching", "scripture"],
    }),

    L("discernment", "discernment-and-maturity", {
      title: "Discernment and Maturity",
      seoTitle: "Discernment and Maturity — Bible study",
      seoDescription:
        "How discernment deepens through obedience, practice, and love that abounds with knowledge and insight.",
      shortDescription:
        "Study how discernment grows through maturity, obedience, and trained judgment.",
      scriptureRefs: ["Hebrews 5:14", "Philippians 1:9–10", "Proverbs 2:1–6"],
      sections: [
        {
          title: "Discernment deepens with maturity",
          paragraphs: [
            "Hebrews contrasts milk and solid food, linking maturity to trained powers of discernment. Immaturity is not mainly about age; it is about instability—unskilled in the word, easily swayed, slow to obey. Maturity, by contrast, is the capacity to recognize good and evil in complex situations because the heart has been shaped by truth over time.",
            "This means discernment is not a single moment of cleverness. It is the fruit of a life that keeps returning to Scripture, keeps repenting, and keeps practicing righteousness in ordinary places where no one applauds.",
          ],
        },
        {
          title: "Trained judgment does not develop accidentally",
          paragraphs: [
            "Proverbs presents wisdom as something sought—received through listening, instruction, and the fear of the Lord. Discernment grows where believers do the slow work: reading carefully, learning from correction, and refusing lazy habits of mind.",
            "The modern appetite for instant expertise works against this. Discernment requires patience: learning definitions, tracing arguments, and noticing when a teacher’s life does not match their claims. Training is mundane, but it is how judgment becomes reliable.",
          ],
        },
        {
          title: "Love and discernment belong together",
          paragraphs: [
            "Paul prays that love may abound more and more with knowledge and discernment. Love without discernment can become harmful sentiment; discernment without love can become harsh pride. Together they aim at what is excellent—true Christian affection that refuses both naïveté and cruelty.",
            "This is why maturity is not merely intellectual. It shows up in patience with the weak, courage to speak truth, and humility to admit error. Discernment serves people, not the ego of being “right.”",
          ],
        },
        {
          title: "Wisdom grows where truth is practiced",
          paragraphs: [
            "Discernment is tested in decisions: what to say, what to refuse, what to prioritize, whom to trust. The classroom of wisdom is often the ordinary week—family tensions, workplace pressures, digital temptations—where believers learn to apply Scripture with increasing consistency.",
            "Failure, too, becomes instruction. When a believer sees the fruit of a foolish choice, repentance retrains the heart. Maturity is not perfection; it is a direction—steadier obedience and clearer sight formed through repeated return to God.",
          ],
        },
      ],
      reflectionPoints: [
        "In what ways do I still think immaturely about discernment?",
        "What patterns are training my judgment right now?",
        "How can maturity grow through obedience and attention?",
      ],
      relatedLessonSlugs: ["testing-what-you-hear", "wisdom/wisdom-and-the-fear-of-the-lord"],
      relatedContentTags: ["discernment", "maturity", "wisdom", "obedience"],
    }),

    L("holiness", "holiness-and-being-set-apart", {
      title: "Holiness and Being Set Apart",
      seoTitle: "Holiness and Being Set Apart — Bible study",
      seoDescription:
        "Holiness as belonging to the Holy One—set apart by grace and called to reflect God’s character.",
      shortDescription:
        "Study holiness as belonging to God and being set apart by His truth and character.",
      scriptureRefs: ["1 Peter 1:15–16", "Leviticus 20:26", "Romans 12:1–2"],
      sections: [
        {
          title: "Holiness begins with God’s own character",
          paragraphs: [
            "Peter quotes Leviticus: “You shall be holy, for I am holy.” Holiness starts with God—His purity, His authority, His otherness from sin. The Christian life is not an attempt to impress a vague moral force; it is a response to the Holy One who has redeemed a people for Himself.",
            "That is why holiness is not merely cultural preference dressed in religious language. It is alignment with God’s revealed nature—learning to love what He loves and hate what He hates, because He is worthy and because His people bear His name.",
          ],
        },
        {
          title: "Being set apart is about belonging before behavior",
          paragraphs: [
            "In Scripture, holiness includes being set apart to God—marked out as His, consecrated for His purposes. Behavior matters deeply, but it flows from belonging. The believer is not first trying to earn a place; the believer is learning to live like someone who already belongs to Christ.",
            "This order protects holiness from both pride and despair. Pride says, “Look at my performance.” Despair says, “I can never measure up.” The gospel says: you are Christ’s; now walk in a manner worthy of Him—by grace, in dependence, with real change over time.",
          ],
        },
        {
          title: "Holiness resists conformity to the world",
          paragraphs: [
            "Romans 12 calls believers not to be conformed to this age, but to be transformed by the renewal of the mind. The world has patterns—what it praises, what it tolerates, what it treats as ultimate—and those patterns quietly shape desires unless they are challenged by Scripture.",
            "Holiness means a different loyalty. It does not require withdrawal from every common task, but it does require a refusal to let the age set the conscience. The Christian asks continually: what does faithfulness look like here, in this place, among these pressures?",
          ],
        },
        {
          title: "Renewal of the mind matters in holiness",
          paragraphs: [
            "Transformation begins internally. Holiness is not only external rule-keeping; it is a mind taught by God’s Word—learning new categories for truth, beauty, and goodness. Where the mind is unrenewed, obedience becomes brittle; where the mind is renewed, obedience becomes intelligent and heartfelt.",
            "Renewal is ongoing. Believers learn to recognize lies, rehearse gospel truth, and take thoughts captive—not by sheer effort alone, but by the Spirit’s work through Word, prayer, and community.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I view holiness as belonging to God or only as behavior control?",
        "Where am I being shaped more by the world than by truth?",
        "What would greater set-apartness look like in daily life?",
      ],
      relatedLessonSlugs: ["holiness-and-daily-life", "repentance/repentance-and-returning-to-god"],
      relatedContentTags: ["holiness", "purity", "renewal", "obedience"],
    }),

    L("holiness", "holiness-and-daily-life", {
      title: "Holiness and Daily Life",
      seoTitle: "Holiness and Daily Life — Bible study",
      seoDescription:
        "How holiness reaches speech, desires, habits, and conduct—putting off the old and putting on the new.",
      shortDescription:
        "Study how holiness reaches into speech, desires, habits, and everyday conduct.",
      scriptureRefs: ["Hebrews 12:14", "2 Corinthians 7:1", "Colossians 3:5–10"],
      sections: [
        {
          title: "Holiness is not confined to special moments",
          paragraphs: [
            "It is easy to treat holiness as a Sunday mood—a burst of seriousness in worship followed by practical atheism on Monday. Scripture refuses that split. Holiness is pursued in conversations, in private thought, in money, in sexuality, in patience, in truth-telling.",
            "Daily life is where desires show themselves. Holiness names those desires honestly and brings them under Christ’s lordship—not only the dramatic sins, but the subtle ones: irritation, exaggeration, envy, laziness, and self-justification.",
          ],
        },
        {
          title: "Daily habits reveal spiritual direction",
          paragraphs: [
            "Habits are theology practiced in miniature. What you rehearse, what you feed on, what you avoid, what you excuse—these patterns shape the soul. Holiness pays attention to habits because character is not built in rare moments alone; it is built in repeated choices.",
            "This is why spiritual disciplines matter: not as superstitious routines, but as means of keeping the Word, prayer, and fellowship near enough to redirect the heart when it drifts.",
          ],
        },
        {
          title: "Holiness includes putting off and putting on",
          paragraphs: [
            "Colossians describes Christian growth as stripping off old practices—sexual immorality, covetousness, slander, rage—and clothing oneself with compassion, kindness, humility, patience, forgiveness. Holiness is active: turn from what dishonors God; turn toward what reflects Him.",
            "Putting off without putting on leaves emptiness; putting on without putting off leaves hypocrisy. The Christian needs both: honest repentance and Spirit-empowered replacement—new speech, new loves, new patterns of faithfulness.",
          ],
        },
        {
          title: "Grace strengthens practical holiness",
          paragraphs: [
            "Holiness is not a self-made project. Believers are urged to cleanse themselves not as a way of earning acceptance, but as those who possess the promises—because God’s grace trains and empowers. Grace is not permission to sin; it is power to fight sin.",
            "When believers fail—and they will—grace brings confession and restoration, not despair. The goal is not perfection in one week, but steady growth: a life increasingly aligned with Christ, fought for in dependence on Him.",
          ],
        },
      ],
      reflectionPoints: [
        "What daily patterns most need to be brought under God’s truth?",
        "Where have I treated holiness as abstract instead of practical?",
        "How can grace strengthen daily obedience?",
      ],
      relatedLessonSlugs: ["holiness-and-being-set-apart", "grace/grace-and-growth"],
      relatedContentTags: ["holiness", "habits", "sanctification", "grace"],
    }),

    L("repentance", "repentance-and-godly-sorrow", {
      title: "Repentance and Godly Sorrow",
      seoTitle: "Repentance and Godly Sorrow — Bible study",
      seoDescription:
        "Worldly regret versus godly sorrow that produces repentance—truthful confession and turning toward God.",
      shortDescription:
        "Study the difference between worldly regret and godly sorrow that leads to true repentance.",
      scriptureRefs: ["2 Corinthians 7:10", "Psalm 51:1–4", "James 4:8–10"],
      sections: [
        {
          title: "Not all sorrow leads to repentance",
          paragraphs: [
            "Paul distinguishes godly grief from worldly grief: one produces life; the other produces death. Worldly sorrow often centers on being caught, embarrassed, or inconvenienced. It may produce tears, apologies, or temporary change, but it does not necessarily turn the heart toward God.",
            "Godly sorrow, by contrast, agrees with God about sin. It grieves what grieves Him—not merely the consequences of sin, but sin itself. This sorrow opens the door to repentance because it stops defending the self and starts seeking mercy.",
          ],
        },
        {
          title: "Godly sorrow is truthful and humble",
          paragraphs: [
            "David’s prayer in Psalm 51 models repentance: a plea for mercy based on God’s steadfast love, a frank acknowledgment of transgression, and a refusal to minimize guilt. Godly sorrow does not perform for others; it speaks honestly before God.",
            "Humility here is not self-hatred as an identity. It is honesty that accepts God’s verdict on sin and welcomes His cleansing. The repentant person stops bargaining and starts confessing—clearly, specifically, and without excuse.",
          ],
        },
        {
          title: "Repentance refuses self-justification",
          paragraphs: [
            "Repentance and self-justification cannot coexist for long. The heart either argues its case or lays it down. Self-justification rearranges blame, minimizes harm, and protects reputation. Repentance says, “I sinned; I need mercy; I will turn.”",
            "James calls believers to draw near to God, cleanse their hands, and purify their hearts—actions that match inner truth. Repentance is not a mood; it is a reorientation away from sin’s defense mechanisms toward God’s grace.",
          ],
        },
        {
          title: "Mercy invites honest return",
          paragraphs: [
            "Repentance is possible because God is merciful. If He only thundered judgment, sorrow would collapse into despair. But He calls sinners to return, promising cleansing and restoration in Christ. Godly sorrow leads to life because it leads to Him.",
            "That is why repentance is hopeful. It is not wallowing; it is washing. The believer leaves the mud of excuse and returns to the Father’s presence, where forgiveness is real and change becomes imaginable.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I confuse regret with repentance?",
        "Where am I tempted to defend instead of confess?",
        "What would honest sorrow before God look like here?",
      ],
      relatedLessonSlugs: ["repentance-and-returning-to-god", "forgiveness/forgiveness-and-mercy"],
      relatedContentTags: ["repentance", "sorrow", "confession", "humility"],
    }),

    L("repentance", "repentance-and-returning-to-god", {
      title: "Repentance and Returning to God",
      seoTitle: "Repentance and Returning to God — Bible study",
      seoDescription:
        "Repentance as turning—not a pause—with new direction, renewed dependence, and God’s welcome.",
      shortDescription:
        "Study repentance as a real turning from sin to God marked by new direction and renewed dependence.",
      scriptureRefs: ["Acts 3:19", "Isaiah 55:6–7", "Luke 15:17–24"],
      sections: [
        {
          title: "Repentance is a turning, not a pause",
          paragraphs: [
            "Biblical repentance is more than a momentary feeling. It is a turning—a change of direction where the feet follow the heart. Acts calls Israel to repent so that times of refreshing may come from the Lord. The picture is movement: away from sin, toward God.",
            "A pause can be avoidance: feeling bad without changing anything. Turning is different; it involves concrete steps—confession where needed, restitution where possible, breaking with patterns that lead back to the same sin. Repentance shows up in real life.",
          ],
        },
        {
          title: "Returning to God begins with truth",
          paragraphs: [
            "Isaiah invites the wicked to forsake his way and return to the Lord, who will have mercy. Returning begins with truth about who God is and what sin is. Without truth, “return” is just sentiment.",
            "Truth also means refusing false returns—returning for appearance while keeping hidden rebellion. God welcomes the repentant, but He is not fooled by performance. True return matches inward honesty with outward change.",
          ],
        },
        {
          title: "God welcomes the repentant",
          paragraphs: [
            "The parable of the prodigal son is a portrait of God’s heart. The Father watches, runs, embraces, and celebrates—not because sin is trivial, but because repentance is precious. Return is met with mercy when the son comes home humbled and honest.",
            "This welcome strengthens the church’s confidence in repentance. No one is beyond reach while God calls them to return. The worst sins, when truly forsaken, meet the wide mercy of God in Christ—though wisdom and consequences may still remain in earthly relationships.",
          ],
        },
        {
          title: "Repentance becomes part of ongoing growth",
          paragraphs: [
            "Even after conversion, believers continue to learn repentance as a way of life: quick to confess, quick to turn, slow to excuse. Growth is not measured by sinless perfection in this life, but by increasing hatred of sin and increasing love for God.",
            "Ongoing repentance supports assurance rather than undermining it, because it keeps the believer anchored in grace rather than in pretense. The Christian’s posture becomes: Lord, I need You again today—and that need is met in Christ.",
          ],
        },
      ],
      reflectionPoints: [
        "What needs to be turned from, not merely felt about?",
        "Where is God inviting me to return honestly?",
        "How can repentance become an ongoing posture of humility?",
      ],
      relatedLessonSlugs: ["repentance-and-godly-sorrow", "grace/grace-and-growth"],
      relatedContentTags: ["repentance", "return", "mercy", "growth"],
    }),

    L("assurance", "assurance-and-gods-promises", {
      title: "Assurance and God’s Promises",
      seoTitle: "Assurance and God’s Promises — Bible study",
      seoDescription:
        "Confidence anchored in Christ’s finished work, God’s written promises, and His power to keep His people.",
      shortDescription:
        "Study how assurance is strengthened by the promises of God and the finished work of Christ.",
      scriptureRefs: ["1 John 5:11–13", "John 10:27–29", "Hebrews 10:19–23"],
      sections: [
        {
          title: "Assurance grows where God’s promises are trusted",
          paragraphs: [
            "Assurance is not a mood manufactured by positive thinking; it is confidence rooted in what God has said. John writes so that believers may know they have eternal life—not because they have mastered inner peace, but because God has given testimony in His Word about His Son.",
            "Promises give the soul something firm to stand on when feelings fluctuate. The Christian learns to answer fear with sentences that begin, “God has said…”—resting not on self-invented hope, but on covenant faithfulness.",
          ],
        },
        {
          title: "Confidence rests on Christ’s work, not personal perfection",
          paragraphs: [
            "Hebrews speaks of confidence to enter God’s presence through Christ’s blood—the new and living way opened once for all. Assurance stands on the sufficiency of Christ’s sacrifice and intercession, not on the believer’s flawless record.",
            "That does not minimize holiness; it rightly orders it. Good works follow grace; they do not create standing before God. Where people look mainly to their performance for assurance, they swing between pride and despair. Where they look to Christ, assurance can remain steady even when obedience is imperfect.",
          ],
        },
        {
          title: "God’s keeping power matters deeply for assurance",
          paragraphs: [
            "Jesus describes His sheep as hearing His voice, following Him, and receiving eternal life—no one snatching them from the Father’s hand. Assurance includes confidence not only in past forgiveness, but in God’s present faithfulness to preserve His own.",
            "This is not permission for carelessness. It is comfort for the weak. The believer’s security ultimately rests in God’s strength, not in the ability to hold on by sheer willpower alone—though faith is real and active.",
          ],
        },
        {
          title: "Assurance strengthens perseverance and peace",
          paragraphs: [
            "Assurance produces steadiness: not a swagger that ignores sin, but a quiet confidence that encourages continued faithfulness. When the heart knows it is safe in Christ, it can endure trials without collapsing into terror.",
            "Peace here is not numbness; it is alignment with truth. The assured believer still wrestles, still repents, still grows—but does so without the constant dread that one mistake has undone redemption.",
          ],
        },
      ],
      reflectionPoints: [
        "What promises of God most anchor assurance for me?",
        "Where do I drift toward measuring assurance by feelings alone?",
        "How does Christ’s finished work steady confidence?",
      ],
      relatedLessonSlugs: ["assurance-and-struggling-faith", "salvation/salvation-by-grace-through-faith"],
      relatedContentTags: ["assurance", "promises", "christ", "confidence"],
    }),

    L("assurance", "assurance-and-struggling-faith", {
      title: "Assurance and Struggling Faith",
      seoTitle: "Assurance and Struggling Faith — Bible study",
      seoDescription:
        "When faith feels weak, feelings waver, or the conscience is loud—how assurance stays anchored in Christ.",
      shortDescription:
        "Study how assurance can remain steady even when faith feels weak or troubled.",
      scriptureRefs: ["Romans 8:1", "Romans 8:31–39", "Mark 9:24"],
      sections: [
        {
          title: "Weak feelings do not erase strong promises",
          paragraphs: [
            "Romans 8 begins with a thunderclap of gospel comfort: no condemnation for those in Christ Jesus. That verdict does not disappear when emotions disagree. Feelings are real, but they are not sovereign; God’s word stands above the weather of the heart.",
            "Struggling believers need permission to be honest about pain without concluding they are abandoned. Assurance looks through feelings to Christ—preaching the gospel to oneself until the heart catches up.",
          ],
        },
        {
          title: "Struggling faith still looks to Christ",
          paragraphs: [
            "The father in Mark 9 cries, “I believe; help my unbelief.” Faith there is mixed, imperfect, and yet directed toward Jesus. Assurance is not the absence of struggle; it is the direction of the struggle—toward mercy, not away from God.",
            "This protects believers from making faith a feeling they must manufacture. Faith is trust, and trust can be small and trembling while still resting on a great Savior.",
          ],
        },
        {
          title: "Condemnation and conviction must be distinguished",
          paragraphs: [
            "Conviction is from the Spirit: it points to specific sin, leads to repentance, and restores fellowship with God. Condemnation is accusation that produces despair, hiding, and a sense of being beyond grace—even when the mind assents to doctrine.",
            "Assurance learns this discernment. If the heart hears only accusation with no path to repentance, it is not the voice of the gospel. Christ calls sinners to come—not to wallow, but to be cleansed.",
          ],
        },
        {
          title: "Assurance grows through returning to truth",
          paragraphs: [
            "Romans 8’s chain of questions—If God is for us, who can be against us?—is meant to be rehearsed until it steadies the soul. Assurance deepens where believers habitually return to Scripture, not only when they feel strong, but especially when they feel weak.",
            "Community matters here: weary believers need voices that speak truth with gentleness—reminding them of Christ when their own thoughts turn hostile.",
          ],
        },
      ],
      reflectionPoints: [
        "Where do weak feelings most challenge assurance?",
        "Do I know the difference between condemnation and conviction?",
        "What truths do I need to return to when faith feels unsettled?",
      ],
      relatedLessonSlugs: ["assurance-and-gods-promises", "faith/what-biblical-faith-is"],
      relatedContentTags: ["assurance", "faith", "condemnation", "confidence"],
    }),

    L("eternal-life", "eternal-life-and-present-hope", {
      title: "Eternal Life and Present Hope",
      seoTitle: "Eternal Life and Present Hope — Bible study",
      seoDescription:
        "Eternal life as knowing God now—reshaping values, endurance, and perspective by a sure future.",
      shortDescription:
        "Study how eternal life shapes present hope, endurance, and perspective.",
      scriptureRefs: ["John 17:3", "Romans 6:23", "Colossians 3:1–4"],
      sections: [
        {
          title: "Eternal life begins with knowing God through Christ",
          paragraphs: [
            "Jesus defines eternal life as knowing the only true God and Jesus Christ whom He sent. That is more than information; it is relationship—life in communion with God through the Mediator. Eternal life, in this sense, is not only a future state; it begins in the present through faith.",
            "This reframes the Christian’s daily experience. The believer is not merely waiting for heaven; they are learning God—being taught by His Word, shaped by His Spirit, and learning to love His ways.",
          ],
        },
        {
          title: "Present hope is shaped by future certainty",
          paragraphs: [
            "Paul urges believers to seek the things above where Christ is seated—because their life is hidden with Him and will appear in glory. Present choices gain meaning when they are connected to a sure future. Hope is not wishful thinking; it is the expectation anchored in God’s promise.",
            "That hope steadies endurance. Trials can be endured when they are not interpreted as the final word. The story continues; the kingdom is coming; Christ will finish what He began.",
          ],
        },
        {
          title: "Eternal life changes what is valued now",
          paragraphs: [
            "When eternal life is real, earthly rewards lose ultimate weight. Money, praise, comfort, and control stop functioning as gods—not because they become meaningless, but because they are put in their place under Christ’s lordship.",
            "This is a slow retraining of desires. The believer learns to ask: what will matter in ten thousand years? That question clarifies priorities without despising ordinary faithfulness.",
          ],
        },
        {
          title: "Hope strengthens endurance in ordinary life",
          paragraphs: [
            "Hope does not remove fatigue or sorrow in this age, but it prevents despair from having the last word. Eternal life gives reasons to get up, forgive, speak truth, and serve when results are unclear—because the verdict of the age to come is secure in Christ.",
            "Endurance becomes quiet courage: not dramatic heroism every day, but steady obedience in small places—believing that God sees, remembers, and will vindicate His people in His time.",
          ],
        },
      ],
      reflectionPoints: [
        "How often does eternal life shape my present perspective?",
        "What priorities need to be re-ordered by hope?",
        "How can future certainty strengthen present faithfulness?",
      ],
      relatedLessonSlugs: ["resurrection-and-future-glory", "suffering/suffering-and-hope"],
      relatedContentTags: ["eternal-life", "hope", "perspective", "endurance"],
    }),

    L("eternal-life", "resurrection-and-future-glory", {
      title: "Resurrection and Future Glory",
      seoTitle: "Resurrection and Future Glory — Bible study",
      seoDescription:
        "Christ’s resurrection, the believer’s future body, and the hope that ends in life with God.",
      shortDescription:
        "Study the resurrection hope of believers and the future glory promised in Christ.",
      scriptureRefs: ["John 11:25–26", "1 Corinthians 15:51–58", "Revelation 21:1–4"],
      sections: [
        {
          title: "Resurrection hope is central, not secondary",
          paragraphs: [
            "Christian hope is not merely that souls survive; it is that God will raise the dead and renew creation. Paul’s argument in 1 Corinthians 15 treats resurrection as foundational—if Christ is not raised, faith is futile. Resurrection is the pledge that God’s justice and mercy will fully triumph.",
            "This keeps Christianity from dissolving into vague spirituality. The future is concrete: bodies raised, corruption swallowed up, victory through Jesus Christ.",
          ],
        },
        {
          title: "Death is real, but not final in Christ",
          paragraphs: [
            "Jesus wept at Lazarus’s tomb because death is an enemy—real grief, real loss. Yet He declares Himself the resurrection and the life. In Him, death is not the final silence; it is a defeated foe, even when it still hurts on this side of glory.",
            "Believers face death with sober honesty and steady hope—grieving, but not as those without hope, because the last word belongs to the risen Lord.",
          ],
        },
        {
          title: "Future glory gives courage for present steadiness",
          paragraphs: [
            "Knowing the end of the story changes how believers walk through the middle. They can suffer without concluding God has failed; they can serve without demanding immediate reward; they can forgive knowing that justice and restoration belong to God’s timetable.",
            "Glory ahead does not trivialize today’s pain, but it prevents pain from defining ultimate meaning. The believer can be faithful in obscurity because the day of Christ will reveal what was done in secret.",
          ],
        },
        {
          title: "The believer’s hope ends in the presence of God",
          paragraphs: [
            "Revelation’s vision of a new heaven and new earth culminates in dwelling with God—tears wiped away, death gone, mourning ended. Eternal life is life with God in the fullness of joy, not mere continuation.",
            "That hope purifies hope’s objects here. The Christian learns to long for the right thing: not escape for selfish comfort, but the presence of the One who is life itself.",
          ],
        },
      ],
      reflectionPoints: [
        "How clearly does resurrection hope shape my understanding of death?",
        "What fears lose power in light of future glory?",
        "How does this hope strengthen faithfulness now?",
      ],
      relatedLessonSlugs: ["eternal-life-and-present-hope", "suffering/suffering-and-hope"],
      relatedContentTags: ["resurrection", "eternal-life", "glory", "hope"],
    }),

    L("wisdom", "wisdom-and-the-fear-of-the-lord", {
      title: "Wisdom and the Fear of the Lord",
      seoTitle: "Wisdom and the Fear of the Lord — Bible study",
      seoDescription:
        "Why Scripture roots wisdom in reverence—moral clarity, humility, and a life ordered around God.",
      shortDescription:
        "Study why biblical wisdom begins with reverence for God and submission to His truth.",
      scriptureRefs: ["Proverbs 1:7", "Proverbs 9:10", "Ecclesiastes 12:13"],
      sections: [
        {
          title: "Wisdom begins where God is rightly honored",
          paragraphs: [
            "Proverbs opens by insisting that knowledge apart from the fear of the Lord is incomplete at best and dangerous at worst. Wisdom is not a neutral skill; it is moral and relational—it begins with recognizing that God is God.",
            "To fear the Lord is to take Him seriously: His commands, His judgment, His mercy, His authority. That reverence becomes the compass that keeps intelligence from becoming a tool of pride or cruelty.",
          ],
        },
        {
          title: "Reverence shapes judgment and restraint",
          paragraphs: [
            "Where God is feared in the biblical sense, the tongue slows down, desires are questioned, and shortcuts become less attractive. Fear of the Lord is not terror without love; it is the humility that refuses to treat God as irrelevant.",
            "This reverence protects against impulsive decisions that sound bold but ignore consequences—especially consequences in the soul. Wisdom learns to ask not only “Can I?” but “Should I—before God?”",
          ],
        },
        {
          title: "Wisdom is moral, not merely intellectual",
          paragraphs: [
            "Clever people can be foolish if their lives disregard righteousness. Biblical wisdom includes skill in living—knowing how to speak, when to be silent, how to handle money, how to navigate conflict—because truth is meant to be walked, not only debated.",
            "That is why wisdom is often learned through correction. The wise accept reproof; fools resent it. Maturity shows up in teachability under God’s Word and under faithful counsel.",
          ],
        },
        {
          title: "The fear of the Lord orders life rightly",
          paragraphs: [
            "Ecclesiastes ends where Proverbs begins: fear God and keep His commandments. Life’s complexity resolves in this center: reverent obedience. Without it, even success becomes vanity; with it, ordinary duties gain weight and dignity.",
            "Ordering life around God’s authority simplifies in the best sense: not easy answers, but a clear north star—faithfulness over visibility, integrity over applause.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I think of wisdom mainly as skill or as reverence-shaped living?",
        "Where is self-confidence crowding out godly fear?",
        "What would wiser reverence look like in daily decisions?",
      ],
      relatedLessonSlugs: ["wisdom-for-daily-decisions", "discernment/discernment-and-maturity"],
      relatedContentTags: ["wisdom", "fear-of-the-lord", "reverence", "judgment"],
    }),

    L("wisdom", "wisdom-for-daily-decisions", {
      title: "Wisdom for Daily Decisions",
      seoTitle: "Wisdom for Daily Decisions — Bible study",
      seoDescription:
        "Asking God for wisdom, applying Scripture patiently, and walking wisely in ordinary choices.",
      shortDescription:
        "Study how wisdom applies truth carefully to ordinary decisions, priorities, and relationships.",
      scriptureRefs: ["James 1:5", "Proverbs 3:13–18", "Colossians 1:9–10"],
      sections: [
        {
          title: "Wisdom is needed in ordinary life, not only major crises",
          paragraphs: [
            "It is easy to pray for wisdom when the stakes feel dramatic—health, jobs, relocation—while ignoring the small decisions that form character. Yet Proverbs is filled with ordinary traps: careless words, lazy habits, quick anger, foolish company. Wisdom is daily, because life is daily.",
            "James invites believers who lack wisdom to ask God, who gives generously. That promise dignifies ordinary confusion. God cares about decisions that feel small to the world but shape the soul.",
          ],
        },
        {
          title: "Asking God for wisdom is an act of dependence",
          paragraphs: [
            "Prayer for wisdom admits limitation—which is the beginning of wisdom. Independence often masquerades as strength, but it leads to folly. Dependence acknowledges that the heart is easily deceived and needs guidance from the One who sees all things.",
            "Asking does not guarantee instant clarity; sometimes wisdom is a process—counsel, waiting, testing motives, searching Scripture. But it does guarantee that the believer is not alone in the puzzle.",
          ],
        },
        {
          title: "Wise decisions are shaped by truth and patience",
          paragraphs: [
            "Wisdom refuses panic. It is willing to slow down long enough to evaluate facts, hear others, and measure options against Scripture. Impatience often buys short-term relief at long-term cost.",
            "Patience also includes willingness to accept limits: not every question has an immediate answer, and not every desire should be satisfied. Wisdom discerns when to act, when to wait, and when to say no.",
          ],
        },
        {
          title: "Wisdom shows up in priorities, relationships, and speech",
          paragraphs: [
            "Paul prays that believers may walk worthy, bearing fruit and growing in knowledge. Wisdom becomes visible in what gets scheduled, how money is used, how conflict is handled, and how words are weighed.",
            "This is why wisdom and love belong together: wise speech builds up; wise priorities protect what matters; wise relationships honor commitments. The Christian aims at a life that is not only correct in doctrine, but good in practice.",
          ],
        },
      ],
      reflectionPoints: [
        "What current decisions most need wisdom?",
        "Am I rushing where patience is needed?",
        "How can I seek wisdom more deliberately before acting?",
      ],
      relatedLessonSlugs: ["wisdom-and-the-fear-of-the-lord", "discernment/testing-what-you-hear"],
      relatedContentTags: ["wisdom", "decisions", "patience", "dependence"],
    }),

    L("work", "work-and-faithfulness", {
      title: "Work and Faithfulness",
      seoTitle: "Work and Faithfulness — Bible study",
      seoDescription:
        "Diligence, integrity, and offering ordinary labor to God—work as stewardship, not mere survival.",
      shortDescription:
        "Study work as a place of stewardship, diligence, and serving God through ordinary responsibilities.",
      scriptureRefs: ["Colossians 3:23–24", "Proverbs 14:23", "2 Thessalonians 3:10–12"],
      sections: [
        {
          title: "Work matters because faithfulness matters",
          paragraphs: [
            "Paul tells servants—people in difficult, uncelebrated labor—to work heartily as for the Lord, not only for human masters. The point is not that every job is enjoyable, but that every task can be offered as worship when done with integrity before God.",
            "Faithfulness transforms the meaning of “ordinary.” What looks small may be significant when done in obedience: showing up, telling the truth, refusing shortcuts, treating people with respect.",
          ],
        },
        {
          title: "Ordinary labor can be offered to God",
          paragraphs: [
            "Work becomes spiritual not because it is religious in form, but because it is done coram Deo—before the Lord. Believers learn to connect Monday with Sunday: the same God who receives gathered worship receives honest labor offered in faith.",
            "This guards against splitting life into sacred and secular compartments. Cleaning, building, teaching, caring, organizing—all can express love for neighbor and reverence for God when done faithfully.",
          ],
        },
        {
          title: "Diligence and integrity are part of Christian witness",
          paragraphs: [
            "Proverbs honors honest labor and warns against empty talk. Thessalonians commends quiet industry. The Christian’s public credibility is strengthened when words about grace are matched by habits of reliability and truth-telling at work.",
            "Witness here is often quiet: coworkers notice steadiness long before they hear a testimony. Integrity under pressure—refusing dishonest gain, refusing gossip—can be a powerful apologetic.",
          ],
        },
        {
          title: "Faithfulness at work is often quiet but meaningful",
          paragraphs: [
            "Not every season brings visible reward. Some work feels repetitive or unseen. Scripture still calls believers to endurance—not because outcomes are guaranteed by effort, but because faithfulness is a way of honoring God regardless of applause.",
            "Quiet faithfulness also trains the soul away from vanity. The heart learns to serve when no one notices, which is preparation for true humility before God.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I see daily work as a place of faithfulness before God?",
        "Where is diligence or integrity being tested?",
        "How can ordinary work be approached with renewed steadiness?",
      ],
      relatedLessonSlugs: ["work-and-worship", "purpose/purpose-and-faithfulness"],
      relatedContentTags: ["work", "diligence", "faithfulness", "stewardship"],
    }),

    L("work", "work-and-worship", {
      title: "Work and Worship",
      seoTitle: "Work and Worship — Bible study",
      seoDescription:
        "Serving Christ in daily tasks, keeping work in its place, and living a life offered to God.",
      shortDescription:
        "Study how work can be understood as part of a life offered to God in service and worship.",
      scriptureRefs: ["Genesis 2:15", "Ephesians 6:7–8", "Colossians 3:17"],
      sections: [
        {
          title: "Work is part of human calling before God",
          paragraphs: [
            "Before the fall, humanity was placed in the garden to work and keep it. Work is not a punishment invented after sin; it is part of creational dignity—fruitful stewardship in God’s world. That framework helps believers refuse both laziness and workaholism.",
            "Calling includes many kinds of labor across seasons. What matters is faithfulness in the assignment given—not comparing one’s place to another’s visibility.",
          ],
        },
        {
          title: "Worship includes more than gathered moments",
          paragraphs: [
            "Paul urges doing everything in the name of the Lord Jesus, giving thanks. Worship is not confined to singing; it is a life orientation—doing common things in a holy direction. Work becomes worship when it is offered sincerely to God, not merely performed for human eyes.",
            "This does not mean every spreadsheet is a hymn, but it does mean intention matters. The believer can pray, “Lord, this is for You,” and mean it—doing the next task with conscience and love.",
          ],
        },
        {
          title: "Work must not become identity or ultimate security",
          paragraphs: [
            "When work becomes identity, success inflates and failure devastates. When work becomes ultimate security, rest disappears and ethics bend under pressure. Scripture honors diligence while refusing to let labor bear a weight only God can bear.",
            "Colossians reminds believers that their inheritance is from the Lord. That reorders ambition: work hard, but do not worship outcomes. Serve faithfully, but do not let the soul be enslaved to achievement.",
          ],
        },
        {
          title: "Serving God reshapes how work is done",
          paragraphs: [
            "Serving God means truthfulness when deception would be easier; kindness when irritation is natural; perseverance when quitting is tempting. It means refusing to treat people as obstacles to personal goals.",
            "Reshaped work is still work—tiring at times, frustrating at times—but it is not meaningless. It is part of discipleship: learning to glorify God in the very places where selfishness most easily grows.",
          ],
        },
      ],
      reflectionPoints: [
        "How might work change if it were more consciously offered to God?",
        "Where has work become too central to identity?",
        "What would it look like to serve wholeheartedly in this season?",
      ],
      relatedLessonSlugs: ["work-and-faithfulness", "purpose/purpose-and-identity"],
      relatedContentTags: ["work", "worship", "calling", "service"],
    }),

    L("marriage", "marriage-and-covenant-faithfulness", {
      title: "Marriage and Covenant Faithfulness",
      seoTitle: "Marriage and Covenant Faithfulness — Bible study",
      seoDescription:
        "Marriage as covenant commitment before God—faithfulness, truth, and endurance beyond shifting moods.",
      shortDescription:
        "Study marriage as a covenant shaped by faithfulness, commitment, and truth over time.",
      scriptureRefs: ["Genesis 2:24", "Malachi 2:14", "Ephesians 5:31–33"],
      sections: [
        {
          title: "Marriage is covenant, not convenience",
          paragraphs: [
            "From creation onward, Scripture speaks of marriage as a one-flesh union joined by God—serious, exclusive, and intended to endure. Covenant language means promises made before God, not feelings that rise and fall with circumstances.",
            "Convenience asks whether marriage still “works for me.” Covenant asks what faithfulness requires when it is costly—when health fails, when stress mounts, when affection is uneven. The difference is whether marriage is treated as a disposable arrangement or a vowed commitment.",
          ],
        },
        {
          title: "Faithfulness matters more than changing moods",
          paragraphs: [
            "Feelings are real, but they are not reliable foundations for covenant life. Seasons change; stress, fatigue, and sin disrupt warmth. Faithfulness means keeping faith with the promise and with the person—not pretending difficulty away, but refusing to let moods become permission for betrayal or contempt.",
            "Malachi’s warning against faithlessness shows how seriously God views broken covenant loyalty. Faithfulness is not numb endurance; it is steady love that seeks repair, speaks truth, and depends on grace when the heart is cold.",
          ],
        },
        {
          title: "Covenant love requires endurance and truth",
          paragraphs: [
            "Endurance does not mean accepting abuse or refusing help where sin is destructive; it means not treating marriage as a series of exits when obedience is hard. Truth-telling belongs in covenant: honest confession, humble listening, and refusal to live in pretense.",
            "Covenant love seeks the other’s true good, not merely short-term peace. Sometimes that requires hard conversations, pastoral care, or repentance. The aim is integrity before God—love that matches His design rather than self-protection alone.",
          ],
        },
        {
          title: "God’s design gives marriage seriousness and stability",
          paragraphs: [
            "Ephesians connects marriage to Christ and the church—not to glorify romance, but to show weight. Marriage is meant to display covenant faithfulness in a world of selfishness. That gives ordinary days dignity: fidelity, forgiveness, and service are acts of worship.",
            "Seriousness protects spouses from treating each other casually. Stability comes from God’s purpose: companionship, fruitfulness, mutual care, and a shared life that points beyond itself to faithful love rooted in the gospel.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I think of marriage more as personal fulfillment or covenant faithfulness?",
        "Where is faithfulness being tested in ordinary life?",
        "What would covenant-minded love look like more clearly?",
      ],
      relatedLessonSlugs: ["marriage-and-sacrificial-love", "forgiveness/forgiveness-and-reconciliation"],
      relatedContentTags: ["marriage", "covenant", "faithfulness", "commitment"],
    }),

    L("marriage", "marriage-and-sacrificial-love", {
      title: "Marriage and Sacrificial Love",
      seoTitle: "Marriage and Sacrificial Love — Bible study",
      seoDescription:
        "Love shaped by humility, service, and daily care—resisting selfishness in the rhythms of home life.",
      shortDescription:
        "Study how Scripture calls for love shaped by humility, service, and self-giving care.",
      scriptureRefs: ["Ephesians 5:25", "Philippians 2:3–4", "Colossians 3:12–14"],
      sections: [
        {
          title: "Love is more than affection",
          paragraphs: [
            "Affection is a gift, but biblical love is broader and sturdier. It includes commitment, patience, and willingness to serve when feelings are thin. Husbands are called to love as Christ loved the church—sacrificially, cleansing, nourishing—not merely when romance is easy.",
            "Where love is reduced to emotion, marriage becomes fragile: partners become consumers of feelings rather than servants of good. Scripture calls spouses to a love that acts, forgives, and perseveres—shaped by Christ’s pattern rather than Hollywood’s mood.",
          ],
        },
        {
          title: "Sacrificial love resists selfishness",
          paragraphs: [
            "Selfishness is the default setting of the fallen heart—defending turf, demanding rights, keeping score. Sacrificial love turns toward the other’s good: listening before defending, serving before insisting, apologizing without excuse when wrong.",
            "Sacrifice is not enabling sin or absorbing abuse; it is Christlike willingness to bear cost for genuine good—time, pride, preferences—so the relationship can reflect grace rather than competition.",
          ],
        },
        {
          title: "Humility strengthens marriage",
          paragraphs: [
            "Philippians calls believers to count others more significant than themselves—an attitude that disarms many conflicts. In marriage, humility shows up as quick repentance, slow anger, and refusal to win arguments at the expense of love.",
            "Pride turns spouses into adversaries; humility makes repair possible. When both seek humility, trust grows—not because problems vanish, but because hearts soften and truth can be spoken without domination.",
          ],
        },
        {
          title: "Daily care often matters more than dramatic gestures",
          paragraphs: [
            "Grand gestures can be beautiful, but covenant love is mostly proved in small currencies: showing up, keeping promises, speaking kindly, carrying burdens, being faithful in boring weeks. Colossians lists compassion, kindness, humility, patience, and bearing with one another—ordinary virtues that build a home.",
            "Sacrificial love is learned in dishes, schedules, illness, and stress—places where selfishness shows first and grace can show too. That daily care is how spouses learn to love for decades, not only for honeymoons.",
          ],
        },
      ],
      reflectionPoints: [
        "Where does selfishness most disrupt love in daily life?",
        "What would sacrificial love look like in ordinary habits?",
        "How can humility strengthen the relationship right now?",
      ],
      relatedLessonSlugs: ["marriage-and-covenant-faithfulness", "forgiveness/forgiveness-and-mercy"],
      relatedContentTags: ["marriage", "love", "humility", "service"],
    }),

    L("parenting", "parenting-and-faithful-instruction", {
      title: "Parenting and Faithful Instruction",
      seoTitle: "Parenting and Faithful Instruction — Bible study",
      seoDescription:
        "Teaching truth in word and example—raising children in the discipline and instruction of the Lord.",
      shortDescription:
        "Study the role of truth, teaching, and example in raising children faithfully.",
      scriptureRefs: ["Deuteronomy 6:6–7", "Ephesians 6:4", "Proverbs 1:8–9"],
      sections: [
        {
          title: "Parenting includes intentional instruction",
          paragraphs: [
            "Deuteronomy ties teaching to the heart: God’s words are to be on the parent’s heart first, then impressed on children through conversation and daily life. Instruction is not occasional lectures; it is a way of life—talking, explaining, modeling what faith looks like in real situations.",
            "Ephesians warns against provoking children to anger while calling fathers to bring them up in the Lord’s discipline and instruction. Faithful instruction combines clarity about truth with tenderness about weakness—neither harsh control nor vague permissiveness.",
          ],
        },
        {
          title: "Truth is taught in daily life, not only formal moments",
          paragraphs: [
            "Scripture’s pattern is “when you sit in your house, and when you walk by the way”—faith woven into routines, meals, travel, and questions. Children learn what parents rehearse: what is feared, loved, prioritized, and spoken about when no one is performing.",
            "That means parents teach when they handle money, conflict, disappointment, and joy. The goal is not a perfect household, but a truthful one—where God’s Word is the compass parents themselves are learning to follow.",
          ],
        },
        {
          title: "Example matters alongside words",
          paragraphs: [
            "Proverbs joins father’s and mother’s teaching with the beauty of wisdom—children are drawn when instruction is lived, not only announced. Hypocrisy undercuts truth; repentance and humility strengthen it. When parents apologize, pray, and seek God openly, they teach louder than slogans.",
            "Example also includes what parents avoid: contempt, dishonesty, bitterness, and idolatry. Children notice what rules parents break for themselves. Faithful instruction asks parents to grow, not only to correct.",
          ],
        },
        {
          title: "Instruction requires steadiness, not perfection",
          paragraphs: [
            "Parents will sin and fail; steadiness means returning again to truth, love, and consistency—not despairing after bad days. Children need a reliable direction more than flawless parents: repentance, forgiveness, and renewed effort.",
            "Steadiness also refuses panic-driven control. Faithful instruction paces with a child’s age and capacity, repeats what must be learned, and trusts God with outcomes parents cannot force.",
          ],
        },
      ],
      reflectionPoints: [
        "How intentional am I about passing on truth?",
        "What examples am I setting in daily life?",
        "Where is steadier instruction needed?",
      ],
      relatedLessonSlugs: ["parenting-and-patient-care", "prayer/learning-to-pray-from-scripture"],
      relatedContentTags: ["parenting", "instruction", "children", "truth"],
    }),

    L("parenting", "parenting-and-patient-care", {
      title: "Parenting and Patient Care",
      seoTitle: "Parenting and Patient Care — Bible study",
      seoDescription:
        "Patience under pressure, encouragement paired with correction, and asking God for wisdom again and again.",
      shortDescription:
        "Study parenting with patience, encouragement, correction, and dependence on God.",
      scriptureRefs: ["Colossians 3:21", "Psalm 127:3", "James 1:5"],
      sections: [
        {
          title: "Parenting requires patience under pressure",
          paragraphs: [
            "Colossians warns fathers not to provoke children, lest they become discouraged. Exasperation is a real danger—repeated nagging, unpredictable anger, or standards that crush rather than guide. Patience is not passivity; it is self-controlled strength that matches correction to a child’s frame.",
            "Pressure exposes parents’ hearts: hurry, fear, comparison. Patience learns to slow down, listen, and correct without contempt—because children are immature by definition and need time to grow, fail, and try again.",
          ],
        },
        {
          title: "Correction and encouragement must belong together",
          paragraphs: [
            "Healthy parenting is not only stopping wrong behavior; it is building courage for right behavior. Encouragement names effort, character growth, and God-given gifts—so a child’s identity is not reduced to failures.",
            "Correction without encouragement breeds fear; encouragement without correction breeds confusion. Together they say: God’s way is good, sin is serious, and mercy makes growth possible.",
          ],
        },
        {
          title: "Children are gifts, not projects",
          paragraphs: [
            "Psalm calls children a heritage—a blessing, not a trophy. When parenting becomes a project to prove the parents’ worth, children become objects of anxiety. Gifts are received with gratitude and returned to God in trust.",
            "That posture reduces the need to control every outcome. Parents teach, discipline, love—and leave final results with the Lord, who alone changes hearts.",
          ],
        },
        {
          title: "Wisdom is needed again and again",
          paragraphs: [
            "James promises wisdom to those who ask God generously. Parenting is a long series of situations without textbook answers: discipline choices, technology, friendships, suffering. Wisdom comes through prayer, Scripture, counsel, and humility to learn from mistakes.",
            "Patient care includes admitting when parents do not know—and seeking help rather than pretending. That models reliance on God for children to see.",
          ],
        },
      ],
      reflectionPoints: [
        "Where is impatience most shaping my parenting?",
        "How can encouragement become more present?",
        "What wisdom do I need to ask God for now?",
      ],
      relatedLessonSlugs: ["parenting-and-faithful-instruction", "wisdom/wisdom-for-daily-decisions"],
      relatedContentTags: ["parenting", "patience", "encouragement", "wisdom"],
    }),

    L("money", "money-and-contentment", {
      title: "Money and Contentment",
      seoTitle: "Money and Contentment — Bible study",
      seoDescription:
        "Contentment as learned trust in God—guarding the heart against greed, comparison, and false security.",
      shortDescription:
        "Study contentment as a guard against greed, comparison, and false security.",
      scriptureRefs: ["1 Timothy 6:6–10", "Hebrews 13:5", "Philippians 4:11–13"],
      sections: [
        {
          title: "Contentment is a spiritual issue, not just a financial one",
          paragraphs: [
            "Paul says godliness with contentment is great gain—because the soul’s peace does not rise and fall with account balances. Contentment is learned: Paul knew how to be brought low and how to abound, resting in Christ who strengthens.",
            "That reframes money: it is a tool and a test, not a savior. The heart that is never satisfied will remain restless no matter how much it acquires, because the hunger was never merely material.",
          ],
        },
        {
          title: "Greed grows where contentment weakens",
          paragraphs: [
            "Scripture warns that the love of money is a root of many kinds of evil—craving that pierces people with many griefs. Greed often wears respectable clothes: ambition, security, comfort—while quietly reordering loves.",
            "Contentment does not mean laziness or ignoring real needs. It means refusing to let desire for more become a master. It finds sufficiency in God’s presence and provision, even when circumstances are tight.",
          ],
        },
        {
          title: "Comparison distorts priorities",
          paragraphs: [
            "Comparison feeds envy and anxiety—measuring life by others’ highlights, lifestyles, or possessions. Social comparison trains the eye to see lack everywhere, even in abundance.",
            "Contentment learns to bless others without demanding their circumstances. It asks different questions: What has God given me to steward? What does faithfulness look like here? What fear is driving my spending?",
          ],
        },
        {
          title: "God’s presence matters more than possessions",
          paragraphs: [
            "Hebrews pairs contentment with confidence that God will never leave nor forsake—so money is not the final guarantor of safety. That does not remove financial stress in a broken world, but it anchors the soul.",
            "When God is enough, possessions can be held loosely: received with gratitude, shared with generosity, and refused when they would become idols.",
          ],
        },
      ],
      reflectionPoints: [
        "Where is comparison shaping how I think about money?",
        "What fears or desires weaken contentment?",
        "How can trust in God reshape financial thinking?",
      ],
      relatedLessonSlugs: ["money-and-stewardship", "work/work-and-worship"],
      relatedContentTags: ["money", "contentment", "greed", "trust"],
    }),

    L("money", "money-and-stewardship", {
      title: "Money and Stewardship",
      seoTitle: "Money and Stewardship — Bible study",
      seoDescription:
        "Recognizing God’s ownership, honoring Him with resources, and letting generosity reveal trust.",
      shortDescription:
        "Study money as something entrusted by God to be handled with wisdom, generosity, and accountability.",
      scriptureRefs: ["Matthew 6:19–24", "2 Corinthians 9:6–8", "Proverbs 3:9–10"],
      sections: [
        {
          title: "Stewardship begins with recognizing that everything belongs to God",
          paragraphs: [
            "Christians are not owners of ultimate meaning—only stewards of what God entrusts for a time. That shifts questions from “What do I deserve?” to “What is faithful?”—income, savings, giving, debt, and honesty in business.",
            "Recognizing God’s ownership also reduces both hoarding and reckless spending: money is not security itself, nor is it meaningless; it is entrusted for His glory and neighbor’s good.",
          ],
        },
        {
          title: "Money can serve worship or compete with it",
          paragraphs: [
            "Jesus says you cannot serve God and money—meaning money can become a rival master, demanding loyalty, worry, and compromise. Stewardship means ordering money under God: giving first, living within means where possible, and refusing shortcuts that violate conscience.",
            "Where money competes with worship, anxiety and moral drift follow. Where money serves worship, generosity and integrity become plausible in ordinary life.",
          ],
        },
        {
          title: "Generosity reveals trust",
          paragraphs: [
            "Paul encourages cheerful giving, trusting God who supplies seed to the sower and bread for food—God can multiply righteousness and increase thanksgiving. Generosity is not a payment to earn blessing; it is faith expressing itself in open hands.",
            "Generosity takes many forms: supporting the church, helping the needy, lending without usury, paying fairly. In each case, giving tests whether God is trusted as provider.",
          ],
        },
        {
          title: "Wise stewardship requires intention",
          paragraphs: [
            "Intention means planning: budgets, honesty about limits, avoiding foolish debt, and regular review of priorities. Proverbs honors diligence and warns against schemes that promise wealth without labor or integrity.",
            "Stewardship is not miserliness; it is wisdom—knowing when to save, when to give, and when to say no. It asks God for discernment and often benefits from counsel when decisions are complex.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I think of money as owned or entrusted?",
        "What does generosity reveal about my heart?",
        "Where is wiser stewardship needed?",
      ],
      relatedLessonSlugs: ["money-and-contentment", "work/work-and-faithfulness"],
      relatedContentTags: ["money", "stewardship", "generosity", "priorities"],
    }),

    L("suffering-and-loss", "grief-and-the-nearness-of-god", {
      title: "Grief and the Nearness of God",
      seoTitle: "Grief and the Nearness of God — Bible study",
      seoDescription:
        "Honest lament, the comfort of God’s presence, and Christ’s solidarity with sorrow.",
      shortDescription:
        "Study how Scripture speaks to grief with honesty and points to the nearness of God.",
      scriptureRefs: ["Psalm 34:18", "John 11:35", "2 Corinthians 1:3–4"],
      sections: [
        {
          title: "Scripture gives room for grief",
          paragraphs: [
            "The Bible does not rush mourners to premature cheer. Psalms of lament cry out with pain, confusion, and longing—yet still address God. Grief is not faithlessness; it is often the honest language of love in a world where death and loss are real.",
            "Room for grief protects people from hollow spirituality that quotes verses to silence pain. God is strong enough for lament; He invites burdens to be brought into the light, not hidden behind performance.",
          ],
        },
        {
          title: "God’s nearness matters in sorrow",
          paragraphs: [
            "The Lord is near to the brokenhearted and saves the crushed in spirit. Nearness does not always mean immediate explanation; it means God does not abandon the grieving. His presence is itself comfort—holding, sustaining, and in time, healing in ways only He can.",
            "Comfort also comes through the church—tears shared, meals brought, silence kept, prayers offered. God often comforts through His people, training them to comfort others with the comfort they have received.",
          ],
        },
        {
          title: "Jesus does not stand distant from grief",
          paragraphs: [
            "At Lazarus’s tomb, Jesus weeps—entering sorrow rather than dismissing it. The incarnate Son does not treat human loss as insignificant. His compassion is not theatrical; it is real solidarity with those who hurt.",
            "That nearness gives permission to grieve while hoping. The Man of Sorrows understands grief and carries it toward resurrection—so sorrow is never the last word for those in Him, even when it is the honest word today.",
          ],
        },
        {
          title: "Comfort does not always remove pain immediately",
          paragraphs: [
            "God’s comfort often sustains through pain rather than erasing it on demand. Paul speaks of the Father of mercies comforting in affliction—a process that may be long, uneven, and requiring patience with oneself and others.",
            "That realism guards against guilt when healing is slow. Comfort in Scripture is steadfast love walking alongside—not a promise that grief will feel tidy by next week.",
          ],
        },
      ],
      reflectionPoints: [
        "Have I allowed grief to be honest before God?",
        "Where do I most need the comfort of God’s nearness?",
        "What does it mean to grieve without losing hope?",
      ],
      relatedLessonSlugs: ["loss-and-christian-hope", "suffering/suffering-and-hope"],
      relatedContentTags: ["grief", "sorrow", "comfort", "nearness-of-god"],
    }),

    L("suffering-and-loss", "loss-and-christian-hope", {
      title: "Loss and Christian Hope",
      seoTitle: "Loss and Christian Hope — Bible study",
      seoDescription:
        "Holding sorrow and resurrection hope together—loss is real, but not final in Christ.",
      shortDescription:
        "Study how Christian hope steadies believers in loss without denying sorrow.",
      scriptureRefs: ["Romans 8:18", "Revelation 21:4", "1 Thessalonians 4:13–14"],
      sections: [
        {
          title: "Hope does not erase grief",
          paragraphs: [
            "Christian hope does not command believers to stop hurting on schedule. Paul says we do not grieve as those who have no hope—not that we do not grieve. Hope gives sorrow a context; it does not pretend the wound is small.",
            "Holding hope and grief together is not contradiction; it is maturity. The same heart can weep at a grave and still trust the risen Christ—often through tears.",
          ],
        },
        {
          title: "Loss is real, but not final in Christ",
          paragraphs: [
            "Paul comforts those who mourn with the promise of resurrection—those who sleep in Jesus will be brought with Him. Loss is real: separation, absence, dreams ended. But for those in Christ, death is a defeated enemy, not the final silence.",
            "That truth does not remove the ache of now; it gives the ache a horizon. Love continues in hope of reunion; labor is not wasted in the Lord.",
          ],
        },
        {
          title: "Resurrection hope changes how sorrow is carried",
          paragraphs: [
            "Romans contrasts present sufferings with future glory—not minimizing present pain, but measuring it against a weight of glory beyond comparison. Hope does not arithmetic away grief; it gives strength to endure.",
            "Carrying sorrow in hope means refusing to let loss become ultimate meaning. It means bringing pain to God repeatedly, trusting His character when feelings argue.",
          ],
        },
        {
          title: "God’s promises keep grief from becoming ultimate",
          paragraphs: [
            "Revelation points to a day when God will wipe every tear—death, mourning, crying, and pain ended. That future steadies the present: not by denying tears now, but by assuring believers that the story ends in restoration, not chaos.",
            "Until then, hope is exercised in faith—sometimes weakly. The promises remain true when emotions lag; they anchor the soul until the morning comes.",
          ],
        },
      ],
      reflectionPoints: [
        "What losses are hardest to carry right now?",
        "How does resurrection hope speak into grief?",
        "Where do I need to hold sorrow and hope together?",
      ],
      relatedLessonSlugs: ["grief-and-the-nearness-of-god", "eternal-life/resurrection-and-future-glory"],
      relatedContentTags: ["loss", "hope", "grief", "resurrection"],
    }),

    L("obedience", "obedience-and-love-for-god", {
      title: "Obedience and Love for God",
      seoTitle: "Obedience and Love for God — Bible study",
      seoDescription:
        "Obedience as response to God’s goodness—love that keeps Christ’s words, not empty ritual.",
      shortDescription:
        "Study how obedience flows from love for God and trust in His wisdom.",
      scriptureRefs: ["John 14:15", "Deuteronomy 5:33", "1 Samuel 15:22"],
      sections: [
        {
          title: "Obedience is connected to love",
          paragraphs: [
            "Jesus says, “If you love me, you will keep my commandments.” Love and obedience belong together—not as a transaction that earns love, but as the fruit of love. The one who loves Christ wants to walk in His ways.",
            "Where obedience is divorced from love, it becomes either pride (self-salvation) or resentment (duty without delight). Love reorders obedience as relationship—following a Person who is trusted and treasured.",
          ],
        },
        {
          title: "God values responsive hearts over empty ritual",
          paragraphs: [
            "Samuel tells Saul that obedience is better than sacrifice—that external religion without surrendered hearts disgusts God. Ritual without obedience is hollow; offerings without humility are noise.",
            "That warning extends to every age: religious activity can mask rebellion. True obedience begins internally—with truthfulness, repentance, and willingness to obey even when no one sees.",
          ],
        },
        {
          title: "Obedience trusts that God’s ways are good",
          paragraphs: [
            "Deuteronomy calls Israel to walk in God’s ways for their good—His commands are not arbitrary traps but paths of life. Obedience rests on confidence in God’s character: He is wise, good, and right.",
            "When obedience feels costly, trust asks whether God knows better than immediate desire. Faith believes His commands are for flourishing, even when the flesh disagrees.",
          ],
        },
        {
          title: "Love makes obedience meaningful rather than mechanical",
          paragraphs: [
            "Mechanical obedience checks boxes; loving obedience seeks God. The difference shows in attitude—quick confession when wrong, eagerness to please, grief over sin, joy in holiness.",
            "Love also frames failure: not despair, but return. The obedient heart is not perfect; it is responsive—turning again to Christ when sin is exposed.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I think of obedience mainly as pressure or as response to God?",
        "Where is love for God being tested in obedience?",
        "What would more willing obedience look like now?",
      ],
      relatedLessonSlugs: ["obedience-in-daily-life", "faith/what-biblical-faith-is"],
      relatedContentTags: ["obedience", "love-for-god", "trust", "worship"],
    }),

    L("obedience", "obedience-in-daily-life", {
      title: "Obedience in Daily Life",
      seoTitle: "Obedience in Daily Life — Bible study",
      seoDescription:
        "Doing the word, not only hearing it—small faithfulness, Spirit-empowered perseverance.",
      shortDescription:
        "Study obedience as a daily response to truth through real action, not mere agreement.",
      scriptureRefs: ["James 1:22", "Romans 6:16–18", "Luke 11:28"],
      sections: [
        {
          title: "Hearing truth is not the same as doing it",
          paragraphs: [
            "James warns against deceiving oneself—being hearers only. Agreement with doctrine that never touches schedule, wallet, tongue, or conscience is not living faith. Truth is meant to move the will and shape conduct.",
            "Daily life is where hearing is tested: traffic, family tension, workplace pressure, private temptation. Obedience is not mainly a public performance; it is integrity where no one applauds.",
          ],
        },
        {
          title: "Small acts of obedience matter deeply",
          paragraphs: [
            "Faithfulness in little things trains the heart for larger ones. Kindness in a small irritation, honesty in a small matter, refusal of a small compromise—these are not trivial; they are discipleship.",
            "Jesus blesses those who hear the word of God and keep it—keeping is ongoing, daily, repeated. Obedience is often unglamorous, which is why it requires love for God more than love of image.",
          ],
        },
        {
          title: "Daily obedience forms spiritual direction",
          paragraphs: [
            "Romans describes becoming obedient from the heart—patterns of slavery broken and new patterns formed under grace. Direction is shaped by repeated choices: what the mind returns to, what the mouth allows, what the body does with desire.",
            "Over months and years, those choices become character. Daily obedience is how Christlikeness grows—not overnight, but steadily, as grace trains the heart.",
          ],
        },
        {
          title: "Grace strengthens continuing obedience",
          paragraphs: [
            "Obedience under grace is not self-powered striving alone; it is Spirit-dependent walking—repenting quickly, relying on Christ, refusing both pride and despair. Failure leads back to mercy, not to abandonment.",
            "Grace teaches believers to say no to ungodliness and to live soberly and righteously—so obedience is sustainable, not crushed by perfectionism.",
          ],
        },
      ],
      reflectionPoints: [
        "Where am I hearing truth without acting on it?",
        "What small act of obedience is in front of me now?",
        "How can daily obedience become more intentional?",
      ],
      relatedLessonSlugs: ["obedience-and-love-for-god", "sanctification/sanctification-and-daily-transformation"],
      relatedContentTags: ["obedience", "daily-life", "faithfulness", "response"],
    }),

    L("gospel", "the-gospel-and-jesus-christ", {
      title: "The Gospel and Jesus Christ",
      seoTitle: "The Gospel and Jesus Christ — Bible study",
      seoDescription:
        "The good news centered on Christ crucified and risen—the foundation of salvation and new life.",
      shortDescription:
        "Study the gospel as the good news centered in the person and work of Jesus Christ.",
      scriptureRefs: ["1 Corinthians 15:1–4", "2 Corinthians 5:21", "Colossians 1:13–14"],
      sections: [
        {
          title: "The gospel is about Christ",
          paragraphs: [
            "Paul delivers as of first importance what he received: Christ died for sins, was buried, was raised. The gospel is not a general idea about kindness or spirituality; it is news about a Person and His saving acts in history.",
            "That center protects the church from drifting into moralism or vague theism. Whatever else is taught must serve this announcement—Jesus Christ, crucified and risen, Savior and Lord.",
          ],
        },
        {
          title: "Christ’s death and resurrection stand at the center",
          paragraphs: [
            "The cross is not an unfortunate episode; it is the atonement—sin judged, wrath absorbed, reconciliation purchased. The resurrection is not optional epilogue; it is vindication—Christ victorious over death, firstfruits of the new creation.",
            "To shrink either is to shrink the gospel. A Christ without the cross leaves sin unaddressed; a cross without the resurrection leaves hope incomplete.",
          ],
        },
        {
          title: "The gospel answers the problem of sin",
          paragraphs: [
            "Paul speaks of becoming the righteousness of God in Christ—sinners credited with Christ’s righteousness through union with Him. Colossians describes rescue from darkness and forgiveness—sin’s guilt and power addressed, not ignored.",
            "The gospel is honest about sin’s seriousness—so honest that only God’s action can save. It offers no self-salvation, only Christ.",
          ],
        },
        {
          title: "The gospel must be understood personally, not only intellectually",
          paragraphs: [
            "One can know facts about the gospel and still not rest in Christ. Personal reception means trusting Him—renouncing self-reliance, turning from sin, and receiving His righteousness as one’s only hope.",
            "Intellectual clarity matters; so does the cry of faith. The gospel is to be believed with the whole person—mind, heart, and will united in dependence on Jesus.",
          ],
        },
      ],
      reflectionPoints: [
        "How central is Christ in my understanding of the gospel?",
        "Do I treat the gospel as truth to admire or truth to trust?",
        "What part of Christ’s work needs deeper attention in me?",
      ],
      relatedLessonSlugs: ["the-gospel-and-new-life", "salvation/what-salvation-means"],
      relatedContentTags: ["gospel", "christ", "salvation", "redemption"],
    }),

    L("gospel", "the-gospel-and-new-life", {
      title: "The Gospel and New Life",
      seoTitle: "The Gospel and New Life — Bible study",
      seoDescription:
        "Repentance, faith, union with Christ—new creation and new direction by the Spirit.",
      shortDescription:
        "Study how the gospel not only saves, but also creates new life, new direction, and new hope.",
      scriptureRefs: ["Mark 1:14–15", "Romans 1:16–17", "2 Corinthians 5:17"],
      sections: [
        {
          title: "The gospel calls for faith and repentance",
          paragraphs: [
            "Jesus proclaims the kingdom of God and calls for repentance and belief in the gospel. The two belong together: turning from sin’s direction and trusting Christ. Repentance without faith becomes despair; faith without repentance becomes hollow.",
            "That call is not only for the beginning of Christian life; it describes the ongoing posture of disciples—returning again and again to Christ as Lord.",
          ],
        },
        {
          title: "New life begins with union to Christ",
          paragraphs: [
            "Paul says if anyone is in Christ, he is a new creation—the old has passed; behold, the new has come. Union with Christ is the source of new life: died with Him, raised with Him, indwelt by His Spirit.",
            "New life is not merely improved behavior first; it is a new status and a new power—then behavior follows as fruit. Identity precedes and shapes practice.",
          ],
        },
        {
          title: "The gospel reshapes identity and direction",
          paragraphs: [
            "The gospel renames people: not primarily by achievements or failures, but by Christ. That reshapes direction—priorities, loves, community, and mission shift because the center has shifted.",
            "Direction changes imperfectly in this life, but the trajectory matters. New life means learning to hate what God hates and love what He loves—slowly, often painfully, but genuinely by grace.",
          ],
        },
        {
          title: "Gospel hope changes present life",
          paragraphs: [
            "Paul is not ashamed of the gospel; it is God’s power for salvation. Hope is not only future heaven; it is present strength—reason to endure, forgive, speak truth, and walk faithfully because the verdict is already secure in Christ.",
            "When the gospel becomes practical, patience grows, fear of man shrinks, and obedience feels like gratitude rather than payback.",
          ],
        },
      ],
      reflectionPoints: [
        "In what ways has the gospel become too familiar to me?",
        "How is new life in Christ meant to show itself?",
        "Where does gospel hope need to become more practical?",
      ],
      relatedLessonSlugs: ["the-gospel-and-jesus-christ", "identity-in-christ/who-believers-are-in-christ"],
      relatedContentTags: ["gospel", "new-life", "repentance", "hope"],
    }),

    L("sanctification", "sanctification-and-spiritual-growth", {
      title: "Sanctification and Spiritual Growth",
      seoTitle: "Sanctification and Spiritual Growth — Bible study",
      seoDescription:
        "Ongoing growth in holiness—God at work, believers responding, Christlikeness as the aim.",
      shortDescription:
        "Study sanctification as ongoing growth in likeness to Christ through truth, grace, and obedience.",
      scriptureRefs: ["1 Thessalonians 4:3", "2 Corinthians 3:18", "Philippians 2:12–13"],
      sections: [
        {
          title: "Sanctification is growth over time",
          paragraphs: [
            "Paul prays that believers be sanctified—God’s will is sanctification. Growth is not instant perfection; it is increasing holiness, increasing love, increasing alignment with God’s character across years.",
            "Beholding Christ’s glory leads to transformation from one degree of glory to another—often imperceptible day by day, visible only when looking back over seasons of faithfulness and repentance.",
          ],
        },
        {
          title: "God works within believers as they respond in obedience",
          paragraphs: [
            "Philippians commands working out salvation with fear and trembling—for God works in believers to will and to work. Divine initiative and human response are not competitors; grace energizes effort.",
            "That means sanctification is never self-made moralism. It is Spirit-empowered cooperation—fighting sin, pursuing holiness, depending on Christ in prayer and Word.",
          ],
        },
        {
          title: "Growth is often steady rather than dramatic",
          paragraphs: [
            "Testimonies sometimes emphasize sudden turns; Scripture also honors slow fidelity—ordinary weeks of prayer, repentance, and obedience. Steady growth may lack spectacle but not reality.",
            "Impatience with slow growth can lead to despair or performance. Faithfulness trusts God’s timing while refusing complacency about sin.",
          ],
        },
        {
          title: "Christlikeness is the goal of sanctification",
          paragraphs: [
            "The measure is Christ: His humility, truthfulness, compassion, courage. Sanctification is not merely cultural conformity or rule lists—it is becoming like Him in character and mission.",
            "That goal keeps growth from becoming comparison with others or pride in visible success. The question is increasing resemblance to Jesus, however quietly.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I expect growth to be faster or easier than Scripture does?",
        "Where can I see signs of steady growth?",
        "How can I cooperate more faithfully with God’s work?",
      ],
      relatedLessonSlugs: ["sanctification-and-daily-transformation", "grace/grace-and-growth"],
      relatedContentTags: ["sanctification", "growth", "christlikeness", "obedience"],
    }),

    L("sanctification", "sanctification-and-daily-transformation", {
      title: "Sanctification and Daily Transformation",
      seoTitle: "Sanctification and Daily Transformation — Bible study",
      seoDescription:
        "Renewing the mind, putting off the old self, putting on the new—holiness in habits and speech.",
      shortDescription:
        "Study how sanctification reaches daily thoughts, habits, speech, and responses.",
      scriptureRefs: ["Romans 12:1–2", "Colossians 3:9–10", "Ephesians 4:22–24"],
      sections: [
        {
          title: "Transformation includes the renewing of the mind",
          paragraphs: [
            "Romans calls for presenting bodies as living sacrifices and not being conformed to this world—renewed in mind to discern God’s will. Sanctification reaches thinking: what is believed, feared, desired, and imagined.",
            "Renewal means Scripture-shaped patterns of attention—replacing lies with truth, rehearsing gospel realities, refusing mental habits that feed sin.",
          ],
        },
        {
          title: "Old patterns must be put off",
          paragraphs: [
            "Paul speaks of stripping off the old self—deceit, anger, theft, corrupt speech—naming sin specifically. Daily transformation requires honest identification of what must die: habits, words, entertainments, attitudes.",
            "Putting off is not self-help willpower alone; it is Spirit-empowered repentance—confessing, fleeing, replacing. But it is also practical: stop feeding what must starve.",
          ],
        },
        {
          title: "New life must be put on in practice",
          paragraphs: [
            "Ephesians describes putting on the new self—truth, work, kindness, forgiveness, imitating God as beloved children. Transformation is active: speak truth, give, encourage, forgive—concrete practices that embody new identity.",
            "Putting on is daily clothing—choices that align with who believers are in Christ until those choices become character.",
          ],
        },
        {
          title: "Daily transformation is part of real holiness",
          paragraphs: [
            "Holiness is not a mystical mood; it is renewed persons in real relationships and routines. Colossians ties new self to knowledge renewed after the image of Christ—growth visible in patience, humility, and love.",
            "Sanctification that ignores daily life is incomplete. God cares about words at the dinner table, habits on devices, and integrity in private—because He is sanctifying whole people.",
          ],
        },
      ],
      reflectionPoints: [
        "What patterns most need renewal right now?",
        "Where does daily life reveal resistance to change?",
        "What truths need to shape my habits more deeply?",
      ],
      relatedLessonSlugs: ["sanctification-and-spiritual-growth", "holiness/holiness-and-daily-life"],
      relatedContentTags: ["sanctification", "transformation", "habits", "renewal"],
    }),

    L("church-history", "why-church-history-matters", {
      title: "Why Church History Matters",
      seoTitle: "Why Church History Matters — Bible study",
      seoDescription:
        "Standing in a long line of faith—memory, gratitude, humility, and perseverance through the witness of generations.",
      shortDescription:
        "Study why church history strengthens memory, humility, discernment, and gratitude.",
      scriptureRefs: ["Hebrews 12:1", "Psalm 78:4–7", "Jude 3"],
      sections: [
        {
          title: "Christians are part of a larger story",
          paragraphs: [
            "Faith did not begin yesterday. The church spans centuries of preaching, suffering, scholarship, mission, failure, and reform. Seeing that larger story corrects the illusion that the present moment is the whole measure of Christianity.",
            "Hebrews pictures witnesses surrounding believers—not replacing Christ, but encouraging endurance. History widens the lens so present trials are not interpreted as ultimate isolation.",
          ],
        },
        {
          title: "Memory helps protect against arrogance and forgetfulness",
          paragraphs: [
            "Psalm urges telling the next generation God’s praiseworthy deeds and His strength—memory as discipleship. Forgetfulness breeds novelty for its own sake and contempt for the past; memory breeds humility: others have walked this road before.",
            "Remembering creeds, confessions, and martyrs reminds believers that truth has been clarified at cost—that convenience is not the test of doctrine.",
          ],
        },
        {
          title: "Church history strengthens gratitude and sobriety",
          paragraphs: [
            "Gratitude grows when believers see how Scripture was preserved, translated, and proclaimed—often through sacrifice. Sobriety grows when believers see how quickly churches can drift, compromise, or divide.",
            "Both responses deepen faithfulness: thankfulness for grace received; caution about repeating old errors.",
          ],
        },
        {
          title: "Learning from earlier generations supports present faithfulness",
          paragraphs: [
            "Jude urges contending for the faith once delivered—not inventing a new faith each generation. History shows how that faith was defended, how heresies rose, and how reform recovered biblical clarity.",
            "Present faithfulness stands on others’ shoulders—language, doctrine, and worship practices refined over time. Ignoring history does not make one pure; it often makes one naive.",
          ],
        },
      ],
      reflectionPoints: [
        "Do I tend to think of faith too independently from the church across time?",
        "What might history teach me about humility?",
        "How can remembering strengthen present faithfulness?",
      ],
      relatedLessonSlugs: ["learning-from-faithfulness-and-error", "discernment/testing-what-you-hear"],
      relatedContentTags: ["church-history", "memory", "gratitude", "faithfulness"],
    }),

    L("church-history", "learning-from-faithfulness-and-error", {
      title: "Learning from Faithfulness and Error",
      seoTitle: "Learning from Faithfulness and Error — Bible study",
      seoDescription:
        "Patterns of courage and compromise—doctrine defended, doctrine distorted, and discernment sharpened by the past.",
      shortDescription:
        "Study how church history helps believers recognize both courage and compromise across generations.",
      scriptureRefs: ["2 Timothy 2:2", "Ecclesiastes 1:9", "Proverbs 13:20"],
      sections: [
        {
          title: "Church history includes both faithfulness and failure",
          paragraphs: [
            "The church is both Christ’s body and a human institution in a fallen world—capable of courage, love, and truth; also capable of cowardice, abuse, and error. Honest history refuses hagiography and cynicism alike.",
            "Seeing failure warns against idolizing any era or leader. Seeing faithfulness encourages: God has preserved His people and His Word despite human weakness.",
          ],
        },
        {
          title: "Doctrinal error has consequences across generations",
          paragraphs: [
            "Ideas have children. Distortions about Christ, Scripture, grace, or the church do not stay private—they shape worship, ethics, and souls. History shows how small compromises can compound and how recovery often requires bold reformation anchored in Scripture.",
            "Learning this pattern trains discernment: error often repeats in new packaging—Ecclesiastes says there is nothing new under the sun, not as an excuse for despair, but as a call to wisdom.",
          ],
        },
        {
          title: "Courage and reform often grow through costly conviction",
          paragraphs: [
            "Paul charges Timothy to entrust truth to faithful men who will teach others—multiplication across generations, often at cost. Reform movements frequently arise when conscience aligns with Scripture against pressure, popularity, or power.",
            "History’s heroes are not flawless, but their costly stands remind believers that faithfulness is sometimes expensive—and that truth is worth contending for with gentleness and courage.",
          ],
        },
        {
          title: "Learning from the past strengthens present discernment",
          paragraphs: [
            "Proverbs says walk with the wise and become wise. Studying faithful teachers from the past—through their writings and lives—sharpens judgment about truth, method, and character.",
            "Discernment today benefits from asking: have we seen this kind of teaching before? What happened then? What does Scripture say? History is a tutor, not a master—but a valuable one.",
          ],
        },
      ],
      reflectionPoints: [
        "What kinds of errors am I most likely to underestimate?",
        "How does historical faithfulness challenge me?",
        "Where can the past sharpen present discernment?",
      ],
      relatedLessonSlugs: ["why-church-history-matters", "discernment/discernment-and-maturity"],
      relatedContentTags: ["church-history", "discernment", "reform", "doctrine"],
    }),
  ];

  const map: Record<string, StudyLesson> = {};
  for (const lesson of list) {
    map[`${lesson.topicSlug}/${lesson.slug}`] = lesson;
  }
  return map;
}
