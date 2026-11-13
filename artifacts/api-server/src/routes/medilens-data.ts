export const educationalSources = [
  {
    id: "medlineplus-cbc",
    name: "Complete Blood Count (CBC)",
    publisher: "MedlinePlus · U.S. National Library of Medicine",
    url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
    description:
      "Patient-friendly information about common blood-count measurements.",
  },
  {
    id: "medlineplus-a1c",
    name: "Hemoglobin A1C Test",
    publisher: "MedlinePlus · U.S. National Library of Medicine",
    url: "https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/",
    description:
      "An overview of what an A1C test measures and how it is used.",
  },
  {
    id: "nhs-blood-tests",
    name: "Blood tests",
    publisher: "National Health Service",
    url: "https://www.nhs.uk/conditions/blood-tests/",
    description:
      "General information about blood tests, taking samples, and results.",
  },
  {
    id: "nlm-bookshelf",
    name: "NCBI Bookshelf",
    publisher: "U.S. National Library of Medicine",
    url: "https://www.ncbi.nlm.nih.gov/books/",
    description:
      "A searchable collection of biomedical books and documents.",
  },
];

export const glossaryEntries = [
  {
    term: "Hemoglobin A1c",
    simple:
      "A blood test that gives an estimate of average blood sugar over the past few months.",
    detailed:
      "Hemoglobin A1c (often written as HbA1c) measures the share of hemoglobin with glucose attached to it. It is one piece of information that a clinician interprets alongside a person's history and other results.",
    example:
      "A report may show an HbA1c result as a percentage, with a laboratory-specific reference interval.",
    simpleArabic:
      "فحص دم يقدّر متوسط مستوى السكر في الدم خلال الأشهر القليلة الماضية.",
    detailedArabic:
      "يقيس الهيموغلوبين A1c نسبة الهيموغلوبين المرتبط بالغلوكوز. يفسّر الطبيب هذه المعلومة إلى جانب التاريخ الصحي والنتائج الأخرى.",
    sourceIds: ["medlineplus-a1c"],
  },
  {
    term: "Hemoglobin",
    simple:
      "A protein in red blood cells that carries oxygen through the body.",
    detailed:
      "Hemoglobin is the oxygen-carrying protein inside red blood cells. A report may list its amount as part of a complete blood count.",
    example:
      "A complete blood count may include a hemoglobin value and a printed reference interval.",
    simpleArabic:
      "بروتين في خلايا الدم الحمراء ينقل الأكسجين في أنحاء الجسم.",
    detailedArabic:
      "الهيموغلوبين بروتين يحمل الأكسجين داخل خلايا الدم الحمراء. قد يظهر مقداره ضمن تعداد الدم الكامل.",
    sourceIds: ["medlineplus-cbc"],
  },
  {
    term: "White blood cell count",
    simple:
      "A count of the white blood cells reported in a blood sample.",
    detailed:
      "White blood cells are part of the body's immune system. A white blood cell count is one measurement in a complete blood count; the number alone does not explain why a result is present.",
    example:
      "A report may show the count with a unit such as cells per microliter.",
    simpleArabic: "عدد خلايا الدم البيضاء الذي يظهر في عينة الدم.",
    detailedArabic:
      "خلايا الدم البيضاء جزء من جهاز المناعة. والعدد وحده لا يوضح سبب النتيجة أو معناها لشخص بعينه.",
    sourceIds: ["medlineplus-cbc"],
  },
  {
    term: "Platelet count",
    simple:
      "A count of platelets, small blood components involved in clotting.",
    detailed:
      "Platelets are cell fragments that help blood clot. A platelet count is commonly included in a complete blood count and should be read with its printed unit and laboratory interval.",
    example:
      "The report may list a platelet count in thousands per microliter.",
    simpleArabic:
      "عدد الصفائح الدموية، وهي مكوّنات صغيرة تساعد على تخثّر الدم.",
    detailedArabic:
      "الصفائح أجزاء خلوية تساعد الدم على التخثّر. غالباً ما يظهر عددها في تعداد الدم الكامل مع الوحدة والمجال المطبوع.",
    sourceIds: ["medlineplus-cbc"],
  },
  {
    term: "Reference range",
    simple:
      "A comparison interval printed by a laboratory for a particular test.",
    detailed:
      "A reference range is the interval a laboratory prints for a test. Ranges can differ between laboratories and do not, by themselves, determine whether a result is healthy or what it means for one person.",
    example:
      "A report might print a range next to a measurement; compare the original report before discussing it with a clinician.",
    simpleArabic: "مجال مقارنة يطبعه المختبر لفحص معيّن.",
    detailedArabic:
      "المجال المرجعي هو المجال الذي يطبعه المختبر للفحص. قد تختلف المجالات بين المختبرات، ولا تحدد وحدها معنى النتيجة لشخص بعينه.",
    sourceIds: ["medlineplus-cbc", "nhs-blood-tests"],
  },
  {
    term: "Fasting glucose",
    simple:
      "A measurement of glucose in a blood sample collected after fasting.",
    detailed:
      "Fasting glucose is the amount of glucose measured in a sample after a specified period without food. The report's units and printed interval should remain attached to the value.",
    example:
      "The report may identify the test as fasting glucose and print the result in mg/dL or mmol/L.",
    simpleArabic: "قياس الغلوكوز في عينة دم بعد الصيام.",
    detailedArabic:
      "يقيس سكر الصيام مقدار الغلوكوز في عينة جُمعت بعد فترة محددة من دون طعام. يجب قراءة الوحدة والمجال المطبوع مع النتيجة.",
    sourceIds: ["nhs-blood-tests"],
  },
  {
    term: "Creatinine",
    simple:
      "A substance measured in blood that is commonly included in kidney-related testing.",
    detailed:
      "Creatinine is a waste product measured in blood or urine. A result is interpreted in context and may be considered alongside other measurements; this explanation is general information, not an assessment.",
    example:
      "A report may show a creatinine value with a unit such as mg/dL or µmol/L.",
    simpleArabic:
      "مادة تُقاس في الدم وتُدرج عادةً ضمن فحوصات مرتبطة بالكلى.",
    detailedArabic:
      "الكرياتينين مادة ناتجة عن عمليات الجسم، ويمكن قياسها في الدم أو البول. تُفسر النتيجة ضمن سياقها ومع قياسات أخرى.",
    sourceIds: ["nlm-bookshelf"],
  },
  {
    term: "Ferritin",
    simple:
      "A protein that stores iron; a blood test can measure ferritin levels.",
    detailed:
      "Ferritin stores iron inside cells. A ferritin blood test measures ferritin in the blood, and a clinician interprets it with the rest of a person's information.",
    example:
      "A ferritin result may be printed with a unit and a laboratory reference interval.",
    simpleArabic:
      "بروتين يخزّن الحديد، ويمكن قياس مستواه في الدم.",
    detailedArabic:
      "الفيريتين بروتين يخزّن الحديد داخل الخلايا. يقيس فحص الدم مستواه، ويفسّره الطبيب مع بقية المعلومات الصحية.",
    sourceIds: ["nlm-bookshelf"],
  },
];

const demoSections = [
  {
    title: "Test information",
    content:
      "Fictional example only · Sample blood panel · Collection date: 12 Nov 2026",
    page: 1,
    classification: "test_information" as const,
  },
  {
    title: "Measurements",
    content:
      "Fasting glucose: 92 mg/dL · Hemoglobin A1c: 5.4 % · Creatinine: 0.9 mg/dL",
    page: 1,
    classification: "measurement" as const,
  },
  {
    title: "Printed reference ranges",
    content:
      "Fasting glucose: 70–99 mg/dL · Hemoglobin A1c: 4.0–5.6 % · Creatinine: 0.6–1.2 mg/dL",
    page: 1,
    classification: "reference_range" as const,
  },
  {
    title: "Educational note",
    content:
      "All names, values, dates, and results in this sample are invented for demonstration. Reference intervals are illustrative and not medical guidance.",
    page: 1,
    classification: "explanatory_note" as const,
  },
];

export function getDemoReport() {
  return {
    id: "fictional-sample-report",
    title: "Fictional sample blood panel",
    fileName: "fictional-sample-report.pdf",
    createdAt: "2026-11-12T09:00:00.000Z",
    pageCount: 1,
    sourceMode: "fictional_demo" as const,
    confidence: "high" as const,
    uncertainty:
      "Fictional sample data for demonstration only. Explanations are educational and do not assess health.",
    sections: demoSections,
    terms: glossaryEntries.filter((entry) =>
      ["Hemoglobin A1c", "Fasting glucose", "Creatinine", "Reference range"].includes(
        entry.term,
      ),
    ),
    measurements: [
      {
        label: "Fasting glucose",
        originalValue: "92",
        unit: "mg/dL",
        printedRange: "70–99 mg/dL",
        page: 1,
        context: "Fictional sample value; compare with the source report.",
      },
      {
        label: "Hemoglobin A1c",
        originalValue: "5.4",
        unit: "%",
        printedRange: "4.0–5.6 %",
        page: 1,
        context: "Fictional sample value; compare with the source report.",
      },
      {
        label: "Creatinine",
        originalValue: "0.9",
        unit: "mg/dL",
        printedRange: "0.6–1.2 mg/dL",
        page: 1,
        context: "Fictional sample value; compare with the source report.",
      },
    ],
    sources: educationalSources.filter((source) =>
      ["medlineplus-a1c", "nhs-blood-tests", "nlm-bookshelf"].includes(
        source.id,
      ),
    ),
  };
}

export function getDemoSummary() {
  const report = getDemoReport();
  return {
    id: report.id,
    title: report.title,
    fileName: report.fileName,
    createdAt: report.createdAt,
    pageCount: report.pageCount,
    sourceMode: report.sourceMode,
    termCount: report.terms.length,
    measurementCount: report.measurements.length,
  };
}

export const workflowStages = [
  {
    key: "upload",
    title: "Upload",
    description: "Choose a document to process temporarily in memory.",
  },
  {
    key: "extract",
    title: "Extract",
    description: "Read text and preserve each visible value and unit.",
  },
  {
    key: "understand",
    title: "Understand",
    description: "Match known terms to a concise educational glossary.",
  },
  {
    key: "explore",
    title: "Explore",
    description: "Review page references, printed ranges, and sources.",
  },
  {
    key: "prepare",
    title: "Prepare",
    description: "Edit questions to discuss with a healthcare professional.",
  },
];
