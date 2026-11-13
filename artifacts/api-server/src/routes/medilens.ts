import { randomUUID } from "node:crypto";
import { createCanvas } from "@napi-rs/canvas";
import { Router, type IRouter, type Response } from "express";
import OpenAI from "openai";
import { createWorker } from "tesseract.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  AnalyzeReportBody,
  AnalyzeReportResponse,
  ExplainDemoTermResponse,
  ExplainDemoTermBody,
  GenerateDoctorQuestionsBody,
  GenerateDoctorQuestionsResponse,
  GetDemoReportResponse,
  GetGlossaryQueryParams,
  GetGlossaryResponse,
  GetMediLensDashboardResponse,
  GetMediLensSourcesResponse,
} from "@workspace/api-zod";
import {
  educationalSources,
  getDemoReport,
  getDemoSummary,
  glossaryEntries,
  workflowStages,
} from "./medilens-data";
import { classifySectionText } from "./section-classifier";

const router: IRouter = Router();
const maxUploadBytes = 10 * 1024 * 1024;
const maxPages = 20;
const maxTextLength = 80_000;
let ocrWorkerPromise: ReturnType<typeof createWorker> | undefined;
const openAiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

type ExtractedPage = { page: number; text: string };

function errorResponse(res: Response, message: string, status = 400) {
  return res.status(status).json({ error: message });
}

function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker("eng").catch((error: unknown) => {
      ocrWorkerPromise = undefined;
      throw error;
    });
  }
  return ocrWorkerPromise;
}

function hasValidSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
  }
  return (
    mimeType === "image/jpeg" &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function redactSensitiveLines(text: string) {
  return text
    .replace(
      /(^|[\n\r])\s*(patient(?:\s+name)?|name|date of birth|dob|mrn|medical record|account|accession|address|phone|email)\s*[:#-]\s*[^\n\r]*/gi,
      "$1$2: [personal details hidden]",
    )
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email hidden]")
    .slice(0, maxTextLength);
}

function extractMeasurements(pages: ExtractedPage[]) {
  const measurements: Array<{
    label: string;
    originalValue: string;
    unit: string;
    printedRange: string | null;
    page: number;
    context: string;
  }> = [];
  const seen = new Set<string>();
  const measurementLine =
    /^\s*([A-Za-z][A-Za-z0-9 /()+_-]{1,60}?)\s*(?::|\|)?\s+([-+]?\d[\d,]*(?:\.\d+)?(?:\s*[–-]\s*[-+]?\d[\d,]*(?:\.\d+)?)?)\s*([A-Za-zµμ/%]+(?:\s*\/\s*[A-Za-z]+)?|\b(?:cells\/uL|cells\/µL)\b)?(?:\s*\((?:reference\s+)?range[:\s]+([^)]*)\))?/i;
  const printedRangePattern =
    /\b(?:reference\s+)?(?:range|interval)\s*[:=]?\s*([<>]?\s*[-+]?\d[\d,.]*(?:\s*(?:–|-|to)\s*[-+]?\d[\d,.]*)?(?:\s*[A-Za-zµμ/%]+)?)/i;

  for (const { page, text } of pages) {
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(measurementLine);
      if (!match || /^(reference range|reference interval|page|date|collected)\b/i.test(match[1].trim())) {
        continue;
      }
      const label = match[1].trim().replace(/[:|]+$/, "");
      if (label.length > 60) continue;
      const originalValue = match[2].trim();
      const unit = (match[3] ?? "").trim();
      const printedRange =
        (match[4] ?? line.match(printedRangePattern)?.[1] ?? "").trim() || null;
      const identity = `${label.toLowerCase()}|${originalValue}|${unit}|${page}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      measurements.push({
        label,
        originalValue,
        unit,
        printedRange,
        page,
        context: line.trim().slice(0, 500),
      });
      if (measurements.length >= 100) return measurements;
    }
  }
  return measurements;
}

function matchTerms(text: string) {
  const normalized = text.toLowerCase();
  return glossaryEntries.filter((entry) =>
    normalized.includes(entry.term.toLowerCase()),
  );
}

async function extractPdf(buffer: Buffer): Promise<{
  pages: ExtractedPage[];
  pageCount: number;
  usedOcr: boolean;
}> {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  if (document.numPages > maxPages) {
    throw new Error(`This prototype supports PDFs up to ${maxPages} pages.`);
  }

  const pages: ExtractedPage[] = [];
  let usedOcr = false;
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const embeddedText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    let text = embeddedText;
    if (embeddedText.length < 24) {
      usedOcr = true;
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );
      const canvasContext = canvas.getContext("2d");
      await page.render({
        canvasContext: canvasContext as never,
        canvas: canvas as never,
        viewport,
      }).promise;
      const worker = await getOcrWorker();
      const result = await worker.recognize(canvas.toBuffer("image/png"));
      text = result.data.text.trim();
    }
    pages.push({ page: pageNumber, text: redactSensitiveLines(text) });
  }
  await loadingTask.destroy();
  return { pages, pageCount: pages.length, usedOcr };
}

async function extractImage(buffer: Buffer): Promise<ExtractedPage[]> {
  const worker = await getOcrWorker();
  const result = await worker.recognize(buffer);
  return [{ page: 1, text: redactSensitiveLines(result.data.text.trim()) }];
}

router.get("/medilens/dashboard", (_req, res) => {
  const response = GetMediLensDashboardResponse.parse({
    demoReport: getDemoSummary(),
    workflow: workflowStages,
    privacyNote:
      "Uploads are processed in memory for this session, are not sent to an AI provider, and are not saved as documents.",
  });
  res.json(response);
});

router.get("/medilens/demo-report", (_req, res) => {
  res.json(GetDemoReportResponse.parse(getDemoReport()));
});

router.get("/medilens/glossary", (req, res) => {
  const parsedQuery = GetGlossaryQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    return errorResponse(res, "Invalid glossary search.", 400);
  }
  const query = parsedQuery.data.search?.trim().toLocaleLowerCase();
  const results = query
    ? glossaryEntries.filter((entry) =>
        [entry.term, entry.simple, entry.detailed, entry.simpleArabic].some(
          (value) => value.toLocaleLowerCase().includes(query),
        ),
      )
    : glossaryEntries;
  return res.json(GetGlossaryResponse.parse(results));
});

router.get("/medilens/sources", (_req, res) => {
  res.json(GetMediLensSourcesResponse.parse(educationalSources));
});

router.post("/medilens/analyze", async (req, res) => {
  const parsedBody = AnalyzeReportBody.safeParse(req.body);
  if (!parsedBody.success) {
    return errorResponse(res, "The upload request is incomplete or invalid.", 400);
  }
  const { fileName, mimeType, contentBase64 } = parsedBody.data;
  if (
    contentBase64.length > 14_000_000 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(contentBase64) ||
    contentBase64.length % 4 !== 0
  ) {
    return errorResponse(res, "The file is too large or is not valid base64.", 413);
  }

  const buffer = Buffer.from(contentBase64, "base64");
  if (buffer.length > maxUploadBytes) {
    return errorResponse(res, "Files must be 10 MB or smaller.", 413);
  }
  if (!hasValidSignature(buffer, mimeType)) {
    return errorResponse(
      res,
      "The file content does not match its selected PDF, JPG, or PNG type.",
      400,
    );
  }

  try {
    const extracted =
      mimeType === "application/pdf"
        ? await extractPdf(buffer)
        : {
            pages: await extractImage(buffer),
            pageCount: 1,
            usedOcr: true,
          };
    const totalText = extracted.pages.map((page) => page.text).join("\n");
    const sections = extracted.pages.flatMap(({ page, text }) => {
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) {
        return [
          {
            title: "Unreadable page",
            content: "No readable text was extracted from this page.",
            page,
            classification: "unclassified" as const,
          },
        ];
      }
      return lines.slice(0, 100).map((line) => {
        const classification = classifySectionText(line);
        const titleByClass = {
          test_information: "Test information",
          measurement: "Measurement",
          reference_range: "Printed reference range",
          explanatory_note: "Explanatory note",
          administrative: "Administrative information",
          unclassified: "Extracted text",
        };
        return {
          title: titleByClass[classification],
          content: line.slice(0, 1200),
          page,
          classification,
        };
      });
    });
    const measurements = extractMeasurements(extracted.pages);
    const terms = matchTerms(totalText);
    const confidence =
      totalText.length < 25 ? "low" : extracted.usedOcr ? "partial" : "high";
    const uncertainty =
      totalText.length < 25
        ? "Little or no readable text was found. Try a clearer scan; nothing has been inferred."
        : extracted.usedOcr
          ? "OCR was used for at least one page. Check every extracted word and value against the original."
          : "Text was extracted locally. Check every extracted word and value against the original.";
    const response = AnalyzeReportResponse.parse({
      id: randomUUID(),
      title: fileName.replace(/\.[^.]+$/, "") || "Uploaded document",
      fileName,
      createdAt: new Date().toISOString(),
      pageCount: extracted.pageCount,
      sourceMode: "local_extraction",
      confidence,
      uncertainty,
      sections,
      terms,
      measurements,
      sources: educationalSources.filter((source) =>
        terms.some((term) => term.sourceIds.includes(source.id)),
      ),
    });
    return res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("This prototype supports PDFs")) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(
      res,
      "The document could not be read. Try a clearer PDF or image; no document was retained.",
      422,
    );
  }
});

router.post("/medilens/questions", (req, res) => {
  const parsedBody = GenerateDoctorQuestionsBody.safeParse(req.body);
  if (!parsedBody.success) {
    return errorResponse(res, "Add one or more terms to prepare questions.", 400);
  }
  const knownTerms = parsedBody.data.terms
    .map((term) =>
      glossaryEntries.find(
        (entry) => entry.term.toLowerCase() === term.trim().toLowerCase(),
      )?.term,
    )
    .filter((term): term is string => Boolean(term))
    .slice(0, 20);
  const questions = [
    ...knownTerms.slice(0, 5).map((term) => ({
      topic: term,
      questions: [
        `What does “${term}” measure, and how is it used in my report?`,
        "How should I read the unit and printed reference interval shown by this laboratory?",
      ],
    })),
    {
      topic: "Understanding the report",
      questions: [
        "Which parts of this report would be useful to review together?",
        "Is any information on this report missing or worth confirming?",
      ],
    },
  ];
  return res.json(GenerateDoctorQuestionsResponse.parse(questions));
});

router.post("/medilens/demo-explanation", async (req, res) => {
  const parsedBody = ExplainDemoTermBody.safeParse(req.body);
  if (!parsedBody.success) {
    return errorResponse(res, "Choose a term from the fictional demo.", 400);
  }
  const demoTerms = new Set(getDemoReport().terms.map((entry) => entry.term));
  const entry = glossaryEntries.find(
    (item) => item.term.toLowerCase() === parsedBody.data.term.trim().toLowerCase(),
  );
  if (!entry || !demoTerms.has(entry.term)) {
    return errorResponse(res, "That term is not part of the fictional demo.", 400);
  }
  const source = educationalSources.find((item) =>
    entry.sourceIds.includes(item.id),
  );
  if (!source) {
    return errorResponse(res, "No verified source is available for this term.", 422);
  }
  let explanation = entry.simple;
  let mode: "ai_demo" | "static_demo" = "static_demo";
  if (openAiClient) {
    try {
      const completion = await openAiClient.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 8192,
        messages: [
          {
            role: "system",
            content:
              "Rewrite the supplied educational glossary entry in plain language. Only restate the provided information; do not add medical claims, interpretations of a person's result, diagnoses, treatments, or citations. The user is exploring a fictional demonstration. Return only the rewritten explanation.",
          },
          {
            role: "user",
            content: JSON.stringify({
              term: entry.term,
              approvedExplanation: entry.simple,
              additionalEducationalContext: entry.detailed,
              sourceName: source.name,
              sourceUrl: source.url,
            }),
          },
        ],
      });
      const generated = completion.choices[0]?.message?.content?.trim();
      if (!generated) {
        return errorResponse(
          res,
          "The AI demo did not return an explanation. The static glossary remains available.",
          503,
        );
      }
      explanation = generated;
      mode = "ai_demo";
    } catch {
      return errorResponse(
        res,
        "The optional AI demo is unavailable. The static glossary remains available.",
        503,
      );
    }
  }
  const response = ExplainDemoTermResponse.parse({
    term: entry.term,
    explanation,
    mode,
    source,
  });
  return res.json(response);
});

export default router;
