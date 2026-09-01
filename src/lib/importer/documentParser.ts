import mammoth from "mammoth";

export interface ParsedChapter {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface DocumentParseResult {
  success: boolean;
  fileName: string;
  chapters: ParsedChapter[];
  totalWords: number;
  error?: string;
}

/**
 * Word conversion for Roman numerals (I, II, III, IV, etc.)
 */
const ROMAN_MAP: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15, xvi: 16, xvii: 17, xviii: 18, xix: 19, xx: 20,
};

/**
 * Smart Chapter Splitter Algorithm
 * Analyzes full manuscript text and automatically segments into chapters based on headings
 */
export function splitManuscriptIntoChapters(fullText: string): ParsedChapter[] {
  if (!fullText || !fullText.trim()) return [];

  // Regex pattern matching common chapter headings in manuscripts:
  // Examples:
  // "Chapter 1", "CHAPTER 1: The New Horizon", "Ch. 1", "Episode 1", "Part 1"
  // "# Chapter 1", "## Chapter 1", "Chapter I", "Chapter 1 — Dawn"
  const chapterHeadingRegex =
    /(?:^|\n\s*\n|\n)(?:#{1,3}\s*)?(?:(?:\*{3,}|={3,})\s*)?(?:Chapter|CHAPTER|Ch\.|Ch|Episode|EPISODE|Ep\.|Part|PART)\s+([0-9]{1,4}|[a-zA-Z]+)(?:[:\s\-—–]+([^\n\r]*))?(?:(?:\*{3,}|={3,}))?(?=\r?\n|$)/gi;

  const matches: Array<{ index: number; fullMatch: string; numRaw: string; titleRaw: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = chapterHeadingRegex.exec(fullText)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      numRaw: match[1] || "",
      titleRaw: (match[2] || "").trim(),
    });
  }

  // If no explicit "Chapter X" headings found, try checking markdown headers ("# Title", "## Title")
  if (matches.length < 2) {
    const headingRegex = /(?:^|\n\s*\n|\n)(?:#{1,2}\s+([^\n\r]+))(?=\r?\n|$)/gi;
    let hMatch: RegExpExecArray | null;
    const hMatches: Array<{ index: number; fullMatch: string; numRaw: string; titleRaw: string }> = [];
    let autoNum = 1;
    while ((hMatch = headingRegex.exec(fullText)) !== null) {
      hMatches.push({
        index: hMatch.index,
        fullMatch: hMatch[0],
        numRaw: String(autoNum++),
        titleRaw: hMatch[1].trim(),
      });
    }
    if (hMatches.length >= 2) {
      matches.splice(0, matches.length, ...hMatches);
    }
  }

  // If still no headings detected, treat the entire file as Chapter 1
  if (matches.length === 0) {
    const cleanContent = fullText.trim();
    const words = cleanContent.split(/\s+/).filter(Boolean).length;
    return [
      {
        chapterNumber: 1,
        title: "Chapter 1",
        content: cleanContent,
        wordCount: words,
      },
    ];
  }

  const parsedChapters: ParsedChapter[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.fullMatch.length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : fullText.length;

    const rawContent = fullText.slice(startIndex, endIndex).trim();

    // Determine numeric chapter number
    let parsedNum = parseInt(current.numRaw, 10);
    if (isNaN(parsedNum)) {
      const lower = current.numRaw.toLowerCase();
      if (ROMAN_MAP[lower]) {
        parsedNum = ROMAN_MAP[lower];
      } else {
        parsedNum = i + 1;
      }
    }

    const title = current.titleRaw
      ? `Chapter ${parsedNum}: ${current.titleRaw}`
      : `Chapter ${parsedNum}`;

    const words = rawContent.split(/\s+/).filter(Boolean).length;

    parsedChapters.push({
      chapterNumber: parsedNum,
      title,
      content: rawContent,
      wordCount: words,
    });
  }

  // Sort by chapter number
  return parsedChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

/**
 * Client-Side File Reader & Ingestion
 * Converts File (.docx, .txt, .md) to parsed chapters
 */
export async function parseDocumentFile(file: File): Promise<DocumentParseResult> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();

  try {
    let rawText = "";

    if (lowerName.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      rawText = result.value;
    } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".markdown")) {
      rawText = await file.text();
    } else {
      return {
        success: false,
        fileName,
        chapters: [],
        totalWords: 0,
        error: "Unsupported file format. Please upload a .docx, .txt, or .md file.",
      };
    }

    if (!rawText || !rawText.trim()) {
      return {
        success: false,
        fileName,
        chapters: [],
        totalWords: 0,
        error: "The uploaded document appears to be empty.",
      };
    }

    const chapters = splitManuscriptIntoChapters(rawText);
    const totalWords = chapters.reduce((acc, ch) => acc + ch.wordCount, 0);

    return {
      success: true,
      fileName,
      chapters,
      totalWords,
    };
  } catch (err: any) {
    console.error("[DOCUMENT PARSER ERROR]", err);
    return {
      success: false,
      fileName,
      chapters: [],
      totalWords: 0,
      error: err?.message || "Failed to process document file.",
    };
  }
}
