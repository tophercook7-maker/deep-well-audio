/**
 * Book names for reference parsing (longest-first alternation) and bible-api.com slugs.
 * Slugs use + for spaces in URLs (we encodeURIComponent when fetching).
 */

export type BibleBookDef = {
  /** Primary display name */
  label: string;
  /** bible-api path segment, e.g. "1+john" */
  apiSlug: string;
  /** Stable id from bible-api responses */
  apiBookId: string;
  /** Match in running text (longest first in combined regex) */
  patterns: string[];
};

function def(label: string, apiSlug: string, apiBookId: string, patterns: string[]): BibleBookDef {
  return { label, apiSlug, apiBookId, patterns };
}

/** Order: longest pattern strings first (handled in buildBookPatternSource). */
export const BIBLE_BOOKS: BibleBookDef[] = [
  def("1 Corinthians", "1+corinthians", "1CO", ["1 Corinthians", "First Corinthians", "1 Cor", "1Cor"]),
  def("2 Corinthians", "2+corinthians", "2CO", ["2 Corinthians", "Second Corinthians", "2 Cor", "2Cor"]),
  def("1 Thessalonians", "1+thessalonians", "1TH", ["1 Thessalonians", "First Thessalonians", "1 Thess", "1Thess"]),
  def("2 Thessalonians", "2+thessalonians", "2TH", ["2 Thessalonians", "Second Thessalonians", "2 Thess", "2Thess"]),
  def("1 Timothy", "1+timothy", "1TI", ["1 Timothy", "First Timothy", "1 Tim", "1Tim"]),
  def("2 Timothy", "2+timothy", "2TI", ["2 Timothy", "Second Timothy", "2 Tim", "2Tim"]),
  def("Titus", "titus", "TIT", ["Titus"]),
  def("Philemon", "philemon", "PHM", ["Philemon", "Phlm"]),
  def("1 Peter", "1+peter", "1PE", ["1 Peter", "First Peter", "1 Pet", "1Pet"]),
  def("2 Peter", "2+peter", "2PE", ["2 Peter", "Second Peter", "2 Pet", "2Pet"]),
  def("1 John", "1+john", "1JN", ["1 John", "First John", "1 Jn", "1Jn"]),
  def("2 John", "2+john", "2JN", ["2 John", "Second John", "2 Jn", "2Jn"]),
  def("3 John", "3+john", "3JN", ["3 John", "Third John", "3 Jn", "3Jn"]),
  def("1 Kings", "1+kings", "1KI", ["1 Kings", "First Kings", "1 Kgs"]),
  def("2 Kings", "2+kings", "2KI", ["2 Kings", "Second Kings", "2 Kgs"]),
  def("1 Samuel", "1+samuel", "1SA", ["1 Samuel", "First Samuel", "1 Sam"]),
  def("2 Samuel", "2+samuel", "2SA", ["2 Samuel", "Second Samuel", "2 Sam"]),
  def("1 Chronicles", "1+chronicles", "1CH", ["1 Chronicles", "First Chronicles", "1 Chr"]),
  def("2 Chronicles", "2+chronicles", "2CH", ["2 Chronicles", "Second Chronicles", "2 Chr"]),
  def("Song of Solomon", "song+of+songs", "SNG", ["Song of Solomon", "Song of Songs", "Canticles", "SOS"]),
  def("Deuteronomy", "deuteronomy", "DEU", ["Deuteronomy", "Deut"]),
  def("Leviticus", "leviticus", "LEV", ["Leviticus", "Lev"]),
  def("Jeremiah", "jeremiah", "JER", ["Jeremiah", "Jer"]),
  def("Zechariah", "zechariah", "ZEC", ["Zechariah", "Zech"]),
  def("Zephaniah", "zephaniah", "ZEP", ["Zephaniah", "Zeph"]),
  def("Habakkuk", "habakkuk", "HAB", ["Habakkuk"]),
  def("Malachi", "malachi", "MAL", ["Malachi", "Mal"]),
  def("Matthew", "matthew", "MAT", ["Matthew", "Matt"]),
  def("Philippians", "philippians", "PHP", ["Philippians", "Phil"]),
  def("Colossians", "colossians", "COL", ["Colossians", "Col"]),
  def("Genesis", "genesis", "GEN", ["Genesis", "Gen"]),
  def("Exodus", "exodus", "EXO", ["Exodus", "Exod", "Ex"]),
  def("Joshua", "joshua", "JOS", ["Joshua", "Josh"]),
  def("Judges", "judges", "JDG", ["Judges", "Judg"]),
  def("Ruth", "ruth", "RUT", ["Ruth"]),
  def("Ezra", "ezra", "EZR", ["Ezra"]),
  def("Nehemiah", "nehemiah", "NEH", ["Nehemiah", "Neh"]),
  def("Esther", "esther", "EST", ["Esther", "Esth"]),
  def("Job", "job", "JOB", ["Job"]),
  def("Psalm", "psalms", "PSA", ["Psalm", "Psalms", "Ps"]),
  def("Proverbs", "proverbs", "PRO", ["Proverbs", "Prov"]),
  def("Ecclesiastes", "ecclesiastes", "ECC", ["Ecclesiastes", "Eccl"]),
  def("Isaiah", "isaiah", "ISA", ["Isaiah", "Isa"]),
  def("Lamentations", "lamentations", "LAM", ["Lamentations", "Lam"]),
  def("Ezekiel", "ezekiel", "EZK", ["Ezekiel", "Ezek"]),
  def("Daniel", "daniel", "DAN", ["Daniel", "Dan"]),
  def("Hosea", "hosea", "HOS", ["Hosea", "Hos"]),
  def("Joel", "joel", "JOL", ["Joel"]),
  def("Amos", "amos", "AMO", ["Amos"]),
  def("Obadiah", "obadiah", "OBA", ["Obadiah", "Obad"]),
  def("Jonah", "jonah", "JON", ["Jonah"]),
  def("Micah", "micah", "MIC", ["Micah"]),
  def("Nahum", "nahum", "NAH", ["Nahum"]),
  def("Haggai", "haggai", "HAG", ["Haggai"]),
  def("Mark", "mark", "MRK", ["Mark"]),
  def("Luke", "luke", "LUK", ["Luke"]),
  def("John", "john", "JHN", ["John", "Jn"]),
  def("Acts", "acts", "ACT", ["Acts"]),
  def("Romans", "romans", "ROM", ["Romans", "Rom"]),
  def("Galatians", "galatians", "GAL", ["Galatians", "Gal"]),
  def("Ephesians", "ephesians", "EPH", ["Ephesians", "Eph"]),
  def("Hebrews", "hebrews", "HEB", ["Hebrews", "Heb"]),
  def("James", "james", "JAS", ["James", "Jas"]),
  def("Jude", "jude", "JUD", ["Jude"]),
  def("Revelation", "revelation", "REV", ["Revelation", "Rev"]),
];

function escapeRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let _bookPatternInner: string | null = null;

/** Longest-first alternation of all book surface forms (shared by tag + body parsers). */
export function scriptureBookPatternInner(): string {
  if (_bookPatternInner) return _bookPatternInner;
  const parts: string[] = [];
  for (const b of BIBLE_BOOKS) {
    for (const p of b.patterns) {
      parts.push(escapeRx(p));
    }
  }
  parts.sort((a, b) => b.length - a.length);
  _bookPatternInner = parts.join("|");
  return _bookPatternInner;
}

let _pattern: RegExp | null = null;

/** Case-insensitive; captures: (1) full book match (2) chapter (3) verse (4) optional end verse */
export function scriptureDetectionRegex(): RegExp {
  if (_pattern) return _pattern;
  const inner = scriptureBookPatternInner();
  _pattern = new RegExp(`\\b(${inner})\\s+(\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[-\\u2013\\u2014]\\s*(\\d{1,3}))?`, "gi");
  return _pattern;
}

let _tagVerseAnchored: RegExp | null = null;

/**
 * Full-string verse tag: one reference only, no trailing junk (reduces false positives vs body scan).
 * Dashes: ASCII hyphen and common unicode dashes between verse numbers.
 */
export function scriptureTagVerseAnchoredRegex(): RegExp {
  if (_tagVerseAnchored) return _tagVerseAnchored;
  const inner = scriptureBookPatternInner();
  _tagVerseAnchored = new RegExp(
    `^\\s*(${inner})\\s+(\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[-\\u2013\\u2014]\\s*(\\d{1,3}))?\\s*$`,
    "i"
  );
  return _tagVerseAnchored;
}

export function getBibleBookByApiId(apiBookId: string): BibleBookDef | undefined {
  const id = apiBookId.trim();
  return BIBLE_BOOKS.find((b) => b.apiBookId === id);
}

export function resolveBookFromMatch(matchedBook: string): BibleBookDef | undefined {
  const t = matchedBook.trim().replace(/\s+/g, " ");
  const lower = t.toLowerCase();
  for (const b of BIBLE_BOOKS) {
    for (const p of b.patterns) {
      if (p.toLowerCase() === lower) return b;
    }
  }
  return undefined;
}
