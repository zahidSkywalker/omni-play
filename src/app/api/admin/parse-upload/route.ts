import { NextResponse } from "next/server";
import { validateCsrf, validateFileUpload, requireAdmin } from "@/lib/security";

// Polyfill browser APIs required by pdf-parse/pdfjs-dist in Node.js (Vercel serverless)
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    private m: number[];
    constructor(init?: string | number[]) {
      this.m = new Array(6).fill(0);
      if (typeof init === "string") {
        const match = init.match(/matrix\(([^)]+)\)/);
        if (match) {
          this.m = match[1].split(",").map(Number);
        }
      } else if (Array.isArray(init)) {
        this.m = [...init];
      } else {
        this.m[0] = 1; this.m[3] = 1; // identity matrix
      }
    }
    get a() { return this.m[0] || 0; }
    get b() { return this.m[1] || 0; }
    get c() { return this.m[2] || 0; }
    get d() { return this.m[3] || 0; }
    get e() { return this.m[4] || 0; }
    get f() { return this.m[5] || 0; }
    get is2D() { return true; }
    get isIdentity() { return this.a === 1 && this.d === 1 && this.b === 0 && this.c === 0 && this.e === 0 && this.f === 0; }
    inverse() { return new DOMMatrix([1,0,0,1,0,0]); }
    multiply(other: DOMMatrix) { return new DOMMatrix([1,0,0,1,0,0]); }
    rotate() { return new DOMMatrix([1,0,0,1,0,0]); }
    scale() { return new DOMMatrix([1,0,0,1,0,0]); }
    translate() { return new DOMMatrix([1,0,0,1,0,0]); }
    transformPoint() { return { x: 0, y: 0 }; }
    toString() { return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`; }
    toJSON() { return { a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f, is2D: true, isIdentity: this.isIdentity }; }
  } as any;
}

if (typeof globalThis.DOMRect === "undefined") {
  globalThis.DOMRect = class DOMRect {
    x = 0; y = 0; width = 0; height = 0;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x; this.y = y; this.width = width; this.height = height;
    }
    get top() { return this.y; }
    get left() { return this.x; }
    get bottom() { return this.y + this.height; }
    get right() { return this.x + this.width; }
  } as any;
}

if (typeof globalThis.DOMPoint === "undefined") {
  globalThis.DOMPoint = class DOMPoint {
    x = 0; y = 0; z = 0; w = 1;
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
    matrixTransform() { return new DOMPoint(); }
  } as any;
}

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    width: number; height: number; data: Uint8ClampedArray;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  } as any;
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D {} as any;
}

if (typeof globalThis.TextMetrics === "undefined") {
  globalThis.TextMetrics = class TextMetrics {
    width = 0;
  } as any;
}


// MCQ Parser — extracts questions from raw text
function parseMCQs(text: string): Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}> {
  const questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }> = [];

  // Normalize text
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Multiple patterns for question detection
  const qPattern = /^\(?\s*(\d+)\s*\)?\s*[.)]\s*(.*)/;
  const qPatternAlt = /^(?:Q\.?\s*|Question\s*)\s*(\d+)\s*[.:)]\s*(.*)/i;

  // Option patterns: A) B) C) D)  or (A) (B) (C) (D)  or a. b. c. d.  or A: B: C: D:
  const optPattern = /^\(?([A-Da-d])\)?\s*[.)]\s*:?\s*(.*)/;
  const optPatternNum = /^\(?(\d)\)?\s*[.)]\s*:?\s*(.*)/;

  // Answer patterns
  const ansPattern = /^(?:Answer|Ans|Correct|Key)\s*[.:)]\s*(?:([A-Da-d])\s*[.)]?\s*(.*))?/i;
  const ansPatternDirect = /^(?:Answer|Ans|Correct)\s+(?:is\s+)?(?:Option\s+)?([A-Da-d])/i;

  let currentQuestion: string | null = null;
  let currentOptions: string[] = [];
  let currentAnswer: number = -1;
  let currentExplanation: string = "";

  function flushQuestion() {
    const filledOptions = currentOptions.filter((o) => o !== undefined && o !== "");
    if (currentQuestion && filledOptions.length >= 2) {
      questions.push({
        question: currentQuestion.trim(),
        options: currentOptions.map((o) => (o || "").trim()),
        correctAnswer: currentAnswer >= 0 && currentAnswer <= 3 ? currentAnswer : 0,
        explanation: currentExplanation.trim() || undefined,
      });
    }
    currentQuestion = null;
    currentOptions = [];
    currentAnswer = -1;
    currentExplanation = "";
  }

  let inExplanation = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const explMatch = line.match(/^(?:Explanation|Exp|Reason|Solution)\s*[.:)]\s*(.*)/i);
    if (explMatch) {
      inExplanation = true;
      currentExplanation = explMatch[1] || "";
      continue;
    }

    const qMatch = line.match(qPattern) || line.match(qPatternAlt);
    if (qMatch) {
      flushQuestion();
      inExplanation = false;
      currentQuestion = qMatch[2] || "";
      continue;
    }

    const optMatch = line.match(optPattern) || line.match(optPatternNum);
    if (optMatch && currentQuestion) {
      inExplanation = false;
      const letter = optMatch[1].toUpperCase();
      const idx = letter.charCodeAt(0) - 65;
      if (idx >= 0 && idx <= 3) {
        currentOptions[idx] = optMatch[2] || "";
      }
      continue;
    }

    const ansMatch = line.match(ansPattern) || line.match(ansPatternDirect);
    if (ansMatch) {
      inExplanation = false;
      const answerLetter = ansMatch[1]?.toUpperCase();
      if (answerLetter) {
        const idx = answerLetter.charCodeAt(0) - 65;
        if (idx >= 0 && idx <= 3) {
          currentAnswer = idx;
        }
      }
      if (ansMatch[2]) {
        currentExplanation = ansMatch[2];
      }
      continue;
    }

    if (inExplanation && currentQuestion) {
      currentExplanation += " " + line;
    }
  }

  flushQuestion();

  return questions;
}

export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Verify admin auth (no hardcoded fallback)
    const authError = requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size and extension
    const fileError = validateFileUpload(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      // Parse PDF — use lib directly to avoid index.js debug-mode test file read
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (fileName.endsWith(".txt")) {
      text = await file.text();
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file. The file may be empty or corrupted." },
        { status: 400 }
      );
    }

    // Parse MCQs
    const questions = parseMCQs(text);

    if (questions.length === 0) {
      return NextResponse.json({
        error: "No MCQ questions detected. Make sure your document has numbered questions (1, 2, 3...) with options (A, B, C, D) and answer keys.",
        rawText: text.substring(0, 2000),
      });
    }

    return NextResponse.json({
      success: true,
      questionCount: questions.length,
      questions,
      rawText: text.substring(0, 1000),
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    return NextResponse.json(
      { error: "Failed to parse file: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
