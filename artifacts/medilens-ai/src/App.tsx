import { createContext, useContext, useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ChangeEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  useAnalyzeReport,
  useExplainDemoTerm,
  useGenerateDoctorQuestions,
  useGetDemoReport,
  useGetGlossary,
  useGetMediLensDashboard,
  useGetMediLensSources,
  getGetMediLensDashboardQueryKey,
} from '@workspace/api-client-react';
import type { DocumentAnalysis, EducationalSource, QuestionGroup } from '@workspace/api-client-react';
import {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Clipboard, CloudUpload, FileCheck2, FileText, FlaskConical,
  Globe2, HeartPulse, Info, Languages, LockKeyhole, Menu, Printer, Search,
  Settings2, ShieldCheck, Sparkles, Sun, Trash2, Upload, X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

type AppLanguage = 'en' | 'ar';
const LanguageContext = createContext<AppLanguage>('en');
const useLanguage = () => useContext(LanguageContext);
const arabicText: Record<string, string> = {
  'Overview': 'نظرة عامة', 'Report view': 'عرض التقرير', 'Glossary': 'مسرد المصطلحات', 'Questions': 'الأسئلة',
  'How it works': 'كيف يعمل', 'Sources': 'المصادر', 'Preferences': 'التفضيلات',
  'YOUR WORKSPACE': 'مساحة عملك', 'LEARN & TRUST': 'التعلّم والثقة', 'Your report stays yours': 'تقريرك ملكك',
  'Files are processed transiently and never retained.': 'تُعالج الملفات مؤقتًا ولا يتم الاحتفاظ بها.',
  'EDUCATION, NOT DIAGNOSIS': 'للتثقيف، وليس للتشخيص', 'Workspace': 'مساحة العمل', 'Private by design': 'خصوصية مصممة بعناية',
  'A little more clarity.': 'مزيد من الوضوح.', 'Start with a report, learn a term, or prepare for a conversation.': 'ابدأ بتقرير، أو تعرّف على مصطلح، أو حضّر لمحادثة.',
  'YOUR READING ROOM / 01': 'مساحة القراءة / ٠١', 'YOUR PRIVATE WORKSPACE': 'مساحة عملك الخاصة',
  'BEGIN WITH A REPORT': 'ابدأ بتقرير', 'Read it in context.': 'اقرأه ضمن سياقه.', 'Choose a report': 'اختر تقريرًا',
  'Reading your file': 'جارٍ قراءة الملف', 'Cancel': 'إلغاء', 'Clear this view': 'مسح هذا العرض',
  'A FICTIONAL EXAMPLE': 'مثال خيالي', 'DEMO ONLY': 'للعرض فقط', 'LABORATORY REPORT': 'تقرير مختبر',
  'Test panel': 'مجموعة الفحوصات', 'Reference': 'المرجع', 'Marker A': 'المؤشر أ', 'Marker B': 'المؤشر ب',
  'Explore the sample': 'استكشف المثال', 'A STEADY, SIMPLE FLOW': 'خطوات واضحة وبسيطة',
  'From page to conversation.': 'من الصفحة إلى الحوار.', 'Learn more': 'اعرف المزيد',
  'Read the page': 'اقرأ الصفحة', 'Learn the language': 'افهم المصطلحات', 'Prepare to discuss': 'استعد للنقاش',
  'Keep the source in view.': 'احتفظ بالمصدر أمامك.', 'Explore plain-language definitions.': 'استكشف تعريفات واضحة.',
  'Bring editable questions to your clinician.': 'اصطحب أسئلة قابلة للتعديل إلى طبيبك.',
  'CURRENTLY IN THIS SESSION': 'مفتوح في هذه الجلسة', 'Local extraction': 'استخراج محلي',
  'Continue reading': 'تابع القراءة', 'A little more clarity': 'مزيد من الوضوح',
  'Words, with room to breathe.': 'مصطلحات بوضوح وسعة.', 'A LIVING REFERENCE / 02': 'مرجع متجدد / ٠٢',
  'Search a medical term…': 'ابحث عن مصطلح طبي…', 'TERM SEARCH': 'بحث المصطلحات',
  'No matching terms.': 'لا توجد مصطلحات مطابقة.', 'Try a shorter or differently spelled search.': 'جرّب كلمة أقصر أو تهجئة مختلفة.',
  'Clear search': 'مسح البحث', 'Explore': 'استكشف', 'Less': 'أقل', 'MORE DETAIL': 'مزيد من التفاصيل',
  'IN CONTEXT': 'ضمن السياق', 'REFERENCE IDS': 'معرّفات المراجع', 'Curated fictional-sample term only.': 'مصطلح مختار من المثال الخيالي فقط.',
  'Try demo explanation': 'جرّب شرح المثال', 'Preparing…': 'جارٍ التحضير…', 'Questions worth bringing.': 'أسئلة تستحق النقاش.',
  'PREPARE TO DISCUSS / 03': 'استعد للنقاش / ٠٣', 'Copy all': 'نسخ الكل', 'Export summary': 'تصدير الملخص',
  'Clear prompts': 'مسح الأسئلة', 'START WITH A TERM': 'ابدأ بمصطلح', 'What would you like to ask about?': 'ما الذي تود السؤال عنه؟',
  'Prepare discussion prompts': 'حضّر أسئلة للنقاش', 'Preparing prompts': 'جارٍ تحضير الأسئلة',
  'YOUR DISCUSSION NOTES': 'ملاحظات النقاش', 'A good question is a beginning.': 'السؤال الجيد هو البداية.',
  'ADD A QUESTION OF YOUR OWN': 'أضف سؤالًا من عندك', 'What would you like to ask your clinician?': 'ما الذي تود سؤاله للطبيب؟',
  'Add': 'إضافة', 'Add another prompt': 'أضف سؤالًا آخر', 'DISCUSSION THEME': 'محور النقاش',
  'EDITABLE': 'قابل للتعديل', 'Remove question': 'حذف السؤال', 'Your notes are editable. Use your browser’s print option to bring a paper copy.': 'ملاحظاتك قابلة للتعديل. استخدم خيار الطباعة في المتصفح لإحضار نسخة ورقية.',
  'A TRANSPARENT PROCESS': 'عملية واضحة', 'Built to help you ask.': 'صُمم لمساعدتك على السؤال.',
  'Sources & context.': 'المصادر والسياق.', 'FOLLOW THE EVIDENCE TRAIL': 'تتبّع مصادر المعرفة',
  'Traceability matters.': 'معرفة المصدر مهمة.', 'Visit source': 'زيارة المصدر',
  'MAKE IT YOURS': 'اجعل التجربة لك', 'Preferences.': 'التفضيلات.', 'A comfortable reading experience should adapt to you.': 'يجب أن تتكيّف تجربة القراءة مع احتياجاتك.',
  'APPEARANCE': 'المظهر', 'Choose your atmosphere': 'اختر المظهر المناسب', 'Daylight': 'نهاري', 'Soft, clear contrast': 'تباين هادئ وواضح',
  'Midnight': 'ليلي', 'Low-light reading': 'للقراءة في الإضاءة المنخفضة', 'LANGUAGE & DIRECTION': 'اللغة واتجاه العرض',
  'Read in your language': 'اقرأ بلغتك', 'Left-to-right layout': 'اتجاه من اليسار إلى اليمين', 'RTL layout enabled': 'اتجاه من اليمين إلى اليسار',
  'ACCESSIBILITY': 'إمكانية الوصول', 'Adjust your reading view': 'اضبط طريقة القراءة', 'Larger text': 'نص أكبر',
  'Increase the base text size throughout the workspace.': 'زيادة حجم النص الأساسي في مساحة العمل.', 'Higher contrast': 'تباين أعلى',
  'Strengthen foreground and border contrast.': 'تعزيز تباين النصوص والحدود.', 'PRIVACY, PLAINLY': 'الخصوصية بوضوح',
  'No file cabinet.': 'لا نحتفظ بملفاتك.', 'Read how it works': 'تعرّف على طريقة العمل',
  'Clear report & notes': 'مسح التقرير والملاحظات', 'NOT FOUND': 'غير موجود',
  'That page isn’t here.': 'هذه الصفحة غير موجودة.', 'Return to overview': 'العودة إلى النظرة العامة',
  'A clearer conversation starts here': 'تبدأ المحادثة الأوضح من هنا',
  'Medical language,': 'لغة التقارير الطبية،', 'made more human.': 'بمعنى أقرب إليك.',
  'Understand the words in a medical report, at your own pace. Then bring better questions to the person who knows your care.': 'افهم كلمات التقرير الطبي على مهل، ثم اصطحب أسئلة أوضح إلى من يتابع رعايتك.',
  'Open MediLens': 'افتح ميديلنس', 'Explore your workspace': 'استكشف مساحة عملك',
  'See how it works': 'شاهد كيف يعمل', 'Our approach': 'نهجنا', 'Privacy': 'الخصوصية',
  'Made for learning': 'صُمم للتعلّم',
  'THE MEDILENS METHOD': 'منهج ميديلنس', 'A guide, not a verdict.': 'دليل، لا حكم.',
  'Start with the words.': 'ابدأ بفهم الكلمات.', 'Your report stays recognizable.': 'يبقى تقريرك كما هو.',
  'Make room for a better visit.': 'مهّد لزيارة أكثر فائدة.', 'Follow the evidence trail.': 'تتبّع مصادر المعرفة.',
  'Browse the glossary': 'تصفّح مسرد المصطلحات', 'Your report is not a product.': 'تقريرك ليس منتجًا.',
  'Explore privacy settings': 'استكشف إعدادات الخصوصية', 'Start with MediLens': 'ابدأ مع ميديلنس',
  'Sources & approach': 'المصادر والنهج', 'A SMALL STEP TOWARD CLARITY': 'خطوة صغيرة نحو الوضوح',
  'Bring understanding': 'اصطحب الفهم', 'into the room.': 'إلى غرفة الاستشارة.',
  'Choose a file': 'اختر ملفًا', 'Read the extracted page': 'اقرأ النص المستخرج', 'Explore the language': 'استكشف المصطلحات',
  'STEP 01': 'الخطوة ٠١', 'STEP 02': 'الخطوة ٠٢', 'STEP 03': 'الخطوة ٠٣', 'STEP 04': 'الخطوة ٠٤',
  'Your file is transient.': 'ملفك لا يُحتفظ به.', 'Learning, not clinical advice.': 'للتعلّم، وليس نصيحة طبية.',
  'Privacy settings': 'إعدادات الخصوصية', 'Explore sources': 'استكشف المصادر', 'View sources': 'عرض المصادر',
  'Try again': 'حاول مجددًا',
  'The report view is clear.': 'تم مسح عرض التقرير.', 'Confirm clear': 'تأكيد المسح',
  'STATIC FICTIONAL DEMONSTRATION': 'عرض توضيحي خيالي ثابت',
  'FICTIONAL DEMO EXPLANATION': 'شرح للمثال الخيالي',
  'Close navigation': 'إغلاق التنقل', 'Open navigation': 'فتح التنقل', 'Main navigation': 'التنقل الرئيسي',
  'Learning and preferences': 'التعلّم والتفضيلات', 'Page navigation': 'تنقل الصفحة',
  'We couldn’t load this just now.': 'تعذّر التحميل الآن.',
  'The file is too large to send safely. Choose a file no larger than 10 MiB.': 'حجم الملف كبير جدًا. اختر ملفًا لا يتجاوز ١٠ ميبيبايت.',
  'Choose a PDF, JPG, or PNG file. Other file types are not supported.': 'اختر ملف PDF أو JPG أو PNG. لا تُدعم أنواع الملفات الأخرى.',
  'The file name is too long. Please rename it and try again.': 'اسم الملف طويل جدًا. أعد تسميته ثم حاول مجددًا.',
  'This file appears to be empty. Choose a different report.': 'يبدو أن الملف فارغ. اختر تقريرًا آخر.',
  'The encoded file exceeds the 14 MB request limit. Choose a smaller file.': 'يتجاوز الملف المشفّر حد الطلب البالغ ١٤ ميغابايت. اختر ملفًا أصغر.',
  'This file could not be read. Try another PDF or image.': 'تعذّرت قراءة الملف. جرّب ملف PDF أو صورة أخرى.',
  'The report could not be processed. Please try again.': 'تعذّرت معالجة التقرير. حاول مجددًا.',
  'Select at least one term from the fictional sample to prepare discussion prompts.': 'اختر مصطلحًا واحدًا على الأقل من المثال الخيالي لإعداد أسئلة للنقاش.',
  'Questions could not be prepared just now. Your current notes are unchanged. Try again.': 'تعذّر إعداد الأسئلة الآن. لم تتغير ملاحظاتك. حاول مجددًا.',
  'Copy is unavailable in this browser. You can still select and copy each question.': 'النسخ غير متاح في هذا المتصفح. يمكنك تحديد الأسئلة ونسخها يدويًا.',
  'Export is unavailable in this browser. You can still copy or select your questions.': 'التصدير غير متاح في هذا المتصفح. يمكنك نسخ أسئلتك أو تحديدها يدويًا.',
  'This demo explanation is unavailable right now.': 'شرح المثال غير متاح الآن.',
  'The fictional-demo explanation is unavailable.': 'شرح المثال الخيالي غير متاح الآن.',
  'Choose a PDF or a clear JPG/PNG. We’ll extract the printed text and keep the original measurements and ranges intact.': 'اختر ملف PDF أو صورة JPG/PNG واضحة. سنستخرج النص المطبوع مع الحفاظ على القياسات والنطاقات كما وردت.',
  'Processed transiently. Never retained or sent to an AI provider.': 'تُعالج الملفات مؤقتًا. لا تُحفظ ولا تُرسل إلى مزود ذكاء اصطناعي.',
  'Preparing report': 'جارٍ تجهيز التقرير', 'A clearly fictional report to explore the reading experience. No real patient information.': 'تقرير خيالي بوضوح لاستكشاف تجربة القراءة. لا يحتوي على معلومات مرضى حقيقية.',
  'SYNTHETIC / 01': 'اصطناعي / ٠١', 'A sample report': 'تقرير تجريبي', 'Loading sample…': 'جارٍ تحميل المثال…',
  'Not saved between sessions': 'لا يُحفظ بين الجلسات', 'page': 'صفحة', 'pages': 'صفحات',
  'MediLens AI offers educational context only. It does not diagnose, validate clinical results, or recommend treatment.': 'يقدم ميديلنس سياقًا تثقيفيًا فقط. لا يشخّص الحالات، ولا يتحقق من النتائج السريرية، ولا يوصي بعلاج.',
  'Your reading room is clear.': 'مساحة القراءة فارغة.', 'Choose a report for transient local extraction, or open the fictional sample.': 'اختر تقريرًا لاستخراج محلي مؤقت، أو افتح المثال الخيالي.',
  'Nothing open yet.': 'لا يوجد تقرير مفتوح.', 'There’s no report in this session. Upload a file or explore the clearly labeled fictional example.': 'لا يوجد تقرير في هذه الجلسة. ارفع ملفًا أو استكشف المثال الخيالي المعرّف بوضوح.',
  'Go to overview': 'العودة إلى النظرة العامة', 'FICTIONAL DEMONSTRATION / REPORT VIEW': 'عرض خيالي توضيحي / التقرير',
  'LOCAL EXTRACTION / REPORT VIEW': 'استخراج محلي / التقرير',
  'Synthetic sample content only. These details do not describe a real person.': 'محتوى تجريبي اصطناعي فقط. هذه التفاصيل لا تصف شخصًا حقيقيًا.',
  'Original printed values and units are preserved as read.': 'تُحفظ القيم والوحدات المطبوعة كما وردت.',
  'FICTIONAL DEMO': 'مثال خيالي', 'LOCAL EXTRACTION': 'استخراج محلي',
  'high': 'مرتفع', 'partial': 'جزئي', 'low': 'منخفض', 'extraction confidence': 'موثوقية الاستخراج',
  'Read this as a learning aid, not a clinical interpretation.': 'اقرأ هذا كوسيلة للتعلّم، لا كتفسير سريري.',
  'Some details may be incomplete or uncertain. Check the source document and ask a clinician to interpret your specific results.': 'قد تكون بعض التفاصيل غير مكتملة أو غير مؤكدة. راجع المستند الأصلي واطلب من طبيب تفسير نتائجك الخاصة.',
  'AS PRINTED IN THE REPORT': 'كما طُبعت في التقرير', 'Measurements': 'القياسات',
  'Original values preserved': 'القيم الأصلية محفوظة', 'PRINTED RANGE': 'النطاق المطبوع',
  'Not stated': 'غير مذكور', 'No measurements were extracted from this report.': 'لم تُستخرج قياسات من هذا التقرير.',
  'Values, units, and printed reference ranges are reproduced exactly. No interpretation is added here.': 'تُعرض القيم والوحدات والنطاقات المرجعية المطبوعة كما هي تمامًا. لا نضيف أي تفسير هنا.',
  'EXTRACTED SECTIONS': 'الأقسام المستخرجة', 'What the page says': 'ما ورد في الصفحة', 'sections': 'أقسام',
  'Page': 'صفحة', 'No text sections were extracted. Try a higher-quality scan or consult the source document.': 'لم يُستخرج نص من الأقسام. جرّب نسخة أوضح أو راجع المستند الأصلي.',
  'PLAIN-LANGUAGE COMPANIONS': 'شروحات بلغة واضحة', 'Terms to know': 'مصطلحات للتعرّف عليها',
  'More context': 'مزيد من السياق', 'Explore demo explanation': 'استكشف شرح المثال',
  'No glossary terms are available.': 'لا تتوفر مصطلحات في المسرد.',
  'Static fictional sample explanation. Educational context only, not clinical advice.': 'شرح ثابت لمثال خيالي. سياق تثقيفي فقط، وليس نصيحة طبية.',
  'For this fictional demo only. Educational context, not clinical advice.': 'للمثال الخيالي فقط. سياق تثقيفي، وليس نصيحة طبية.',
  'CHECK THE CONTEXT': 'تحقّق من السياق', 'Learning should be traceable.': 'ينبغي أن تكون المعرفة قابلة للتتبّع.',
  'Explore the educational sources associated with this report.': 'استكشف المصادر التثقيفية المرتبطة بهذا التقرير.',
  'Report content is processed transiently and is not retained by MediLens. Clear this view to remove it from the current interface.': 'يُعالج محتوى التقرير مؤقتًا ولا يحتفظ به ميديلنس. امسح العرض لإزالته من الواجهة الحالية.',
  'Search educational explanations for common medical terminology. Definitions are not a reading of your personal results.': 'ابحث عن شروحات تثقيفية للمصطلحات الطبية الشائعة. لا تفسر التعريفات نتائجك الشخصية.',
  'Search glossary': 'ابحث في المسرد', 'The glossary is unavailable at the moment.': 'المسرد غير متاح حاليًا.',
  'This explanation is for the fictional sample only, not clinical advice.': 'هذا الشرح للمثال الخيالي فقط، وليس نصيحة طبية.',
  'educational': 'تثقيفية', 'source': 'مصدر', 'sources': 'مصادر',
  'Definitions offer general educational context. Terminology can vary by specialty and must be interpreted by a clinician in context.': 'تقدم التعريفات سياقًا تثقيفيًا عامًا. قد تختلف المصطلحات حسب التخصص، ويجب أن يفسرها طبيب ضمن سياقها.',
  'Select one or more terms from the fictional sample. Only curated demo terminology is used to create these educational prompts.': 'اختر مصطلحًا واحدًا أو أكثر من المثال الخيالي. تُستخدم المصطلحات المختارة من المثال فقط لإعداد هذه الأسئلة التثقيفية.',
  'Your discussion notes': 'ملاحظات النقاش', 'Choose demo terms to prepare suggested prompts, or write your own below. Nothing here replaces the conversation.': 'اختر مصطلحات من المثال لإعداد أسئلة مقترحة، أو اكتب أسئلتك أدناه. لا شيء هنا يغني عن الحوار مع الطبيب.',
  'What does this term mean in the context of my health?': 'ماذا يعني هذا المصطلح في سياق حالتي الصحية؟',
  'Edit question': 'تعديل السؤال', 'What else should I know about this?': 'ما الذي ينبغي أن أعرفه أيضًا عن هذا؟',
  'Prompts are educational conversation starters—not recommendations. Your clinician can help interpret your individual situation.': 'الأسئلة المقترحة بدايات لحوار تثقيفي، وليست توصيات. يمكن لطبيبك تفسير حالتك الفردية.',
  'MediLens AI — clinician discussion notes': 'ميديلنس — ملاحظات للنقاش مع الطبيب',
  'Educational prompts for discussion. Not a diagnosis or treatment recommendation.': 'أسئلة تثقيفية للنقاش. ليست تشخيصًا أو توصية علاجية.',
  'How It Works': 'كيف يعمل',
  'MediLens is an educational companion for medical-report language—not a diagnostic system.': 'ميديلنس رفيق تثقيفي لفهم لغة التقارير الطبية، وليس نظامًا للتشخيص.',
  'THE PRINCIPLE': 'المبدأ', 'Technology can explain words.': 'يمكن للتقنية شرح الكلمات.',
  'Care belongs in conversation.': 'والرعاية تبدأ بالحوار.',
  'Our role is to help you arrive informed, with the source still in view and your questions in hand.': 'دورنا أن نساعدك على الحضور وأنت أكثر معرفة، مع المصدر أمامك وأسئلتك جاهزة.',
  'Select a PDF, JPG, or PNG report. The file is encoded locally in your browser and sent to a transient extraction endpoint.': 'اختر تقريرًا بصيغة PDF أو JPG أو PNG. يُرمّز الملف محليًا في متصفحك ويُرسل إلى خدمة استخراج مؤقتة.',
  'Review extracted sections, page locations, and measurements. Original values, units, and printed ranges stay as they appear in your report.': 'راجع الأقسام المستخرجة ومواقع الصفحات والقياسات. تبقى القيم والوحدات والنطاقات المطبوعة كما في تقريرك.',
  'Use educational glossary entries to understand common terms. General explanations are not clinical interpretations.': 'استخدم مدخلات المسرد التثقيفية لفهم المصطلحات الشائعة. الشروحات العامة ليست تفسيرات سريرية.',
  'Create and edit questions for a clinician. Your care team is the right place for personal interpretation.': 'أنشئ أسئلة لطبيبك وعدّلها. فريق الرعاية هو المكان المناسب لتفسير حالتك الشخصية.',
  'The file is processed in memory for extraction. MediLens does not retain the uploaded file. Clear the active view to remove it from the current interface.': 'يُعالج الملف في الذاكرة لاستخراج النص. لا يحتفظ ميديلنس بالملف المرفوع. امسح العرض النشط لإزالته من الواجهة.',
  'We do not diagnose, recommend treatment, or claim clinical validation. Extractions can be incomplete; always confirm the source and consult a clinician.': 'لا نشخّص ولا نوصي بعلاج ولا ندّعي تحققًا سريريًا. قد يكون الاستخراج غير مكتمل؛ تحقق دائمًا من المصدر واستشر طبيبًا.',
  'Educational references available to support plain-language learning. A source does not validate or interpret an individual report.': 'مراجع تثقيفية تدعم التعلّم بلغة واضحة. لا يتحقق المصدر من تقرير فردي ولا يفسره.',
  'Sources are provided for general education. Always use a qualified clinician for personal interpretation.': 'تُقدّم المصادر للتثقيف العام. استعن دائمًا بطبيب مؤهل لتفسير حالتك الشخصية.',
  'No sources are available right now.': 'لا تتوفر مصادر الآن.', 'Try again later. MediLens will never invent a source to fill this space.': 'حاول لاحقًا. لن يختلق ميديلنس مصدرًا لملء هذه المساحة.',
  'REF /': 'مرجع /', 'EDUCATIONAL': 'تثقيفي', 'References provide educational background and are not a substitute for advice from a healthcare professional who knows your situation.': 'توفر المراجع خلفية تثقيفية ولا تغني عن نصيحة مختص يعرف حالتك.',
  'No sources are available': 'لا تتوفر مصادر',
  'Glossary entries show Arabic text when available. Interface labels remain in English.': 'تظهر مدخلات المسرد بالعربية عند توفرها، كما تُعرض عناصر الواجهة المترجمة باللغة العربية.',
  'Settings': 'الإعدادات', 'Uploads processed transiently': 'تُعالج الملفات مؤقتًا', 'No document retention': 'لا نحتفظ بالمستندات',
  'Delete clears the current view': 'المسح يزيل العرض الحالي',
  'Uploaded documents are processed transiently for text extraction. MediLens does not retain the file or send its content to an AI provider.': 'تُعالج المستندات المرفوعة مؤقتًا لاستخراج النص. لا يحتفظ ميديلنس بالملف ولا يرسل محتواه إلى مزود ذكاء اصطناعي.',
  'Fictional demonstrations are clearly labeled. Their explanations are educational, not medical advice or clinical validation.': 'تُعرّف العروض الخيالية بوضوح. شروحاتها تثقيفية وليست نصيحة طبية أو تحققًا سريريًا.',
  'Clear the open uploaded report, clinician questions, and demo explanation from this session. No server deletion is needed.': 'امسح التقرير المرفوع المفتوح وأسئلة الطبيب وشرح المثال من هذه الجلسة. لا حاجة إلى حذف من الخادم.',
  'There is no session content to clear.': 'لا يوجد محتوى في الجلسة لمسحه.',
  'This clears the open report, discussion questions, and explanation from this session. No server-side deletion is needed because uploaded files are not retained. Continue?': 'سيؤدي ذلك إلى مسح التقرير المفتوح وأسئلة النقاش والشرح من هذه الجلسة. لا حاجة إلى حذف من الخادم لأن الملفات المرفوعة لا يُحتفظ بها. هل تريد المتابعة؟',
  'Try a higher-quality scan or consult the source document.': 'جرّب نسخة أوضح أو راجع المستند الأصلي.',
  'Skip to main content': 'انتقل إلى المحتوى الرئيسي',
  'THE READING TABLE / 01': 'طاولة القراءة / ٠١',
  'A calmer way to read.': 'طريقة أكثر هدوءًا للقراءة.',
  'This fictional preview shows how a report can stay recognizable while unfamiliar labels become easier to explore.': 'يعرض هذا المثال الخيالي كيف يبقى التقرير واضحًا بينما تصبح المصطلحات أسهل للفهم.',
  'ILLUSTRATIVE SAMPLE · NO REAL PATIENT DATA': 'مثال توضيحي · لا يحتوي على بيانات مريض حقيقي',
  'Complete blood count': 'تعداد الدم الكامل',
  'Test name': 'اسم الفحص',
  'Value as printed': 'القيمة كما طُبعت',
  'Reference range as printed': 'النطاق المرجعي كما طُبع',
  'Sample layout only. No medical results are shown.': 'نموذج توضيحي فقط. لا تظهر فيه نتائج طبية.',
  'Measurements stay as printed. Educational notes and sources stay separate, so you can review each part without replacing your clinician’s advice.': 'تبقى القياسات كما طُبعت. وتبقى الملاحظات والمصادر التثقيفية منفصلة لتراجع كل جزء دون أن تحل محل نصيحة طبيبك.',
  'Original wording': 'النص الأصلي',
  'Source links': 'روابط المصادر',
  'Four calm steps.': 'أربع خطوات هادئة.',
  'No rush. No hidden interpretation.': 'بلا استعجال، وبلا تفسير خفي.',
  'Open a report': 'افتح تقريرًا',
  'Read what was extracted': 'اقرأ ما تم استخراجه',
  'Explore unfamiliar words': 'استكشف الكلمات غير المألوفة',
  'Bring questions to your clinician': 'اصطحب أسئلتك إلى الطبيب',
  'Choose a PDF or image to read.': 'اختر ملف PDF أو صورة لقراءتها.',
  'Compare the text with your original report.': 'قارن النص بتقريرك الأصلي.',
  'Look up terms in plain language and check sources.': 'ابحث عن المصطلحات بلغة واضحة وراجع مصادرها.',
  'Make editable notes for your next visit.': 'جهّز ملاحظات قابلة للتعديل لزيارتك القادمة.',
  'MADE FOR YOUR PACE': 'مصمّم على وتيرتك',
  'Designed for comfortable reading.': 'مصمّم لقراءة مريحة.',
  'Control the size, contrast, and direction of your reading view.': 'تحكّم بحجم النص والتباين واتجاه القراءة.',
  'Adjust reading preferences': 'عدّل تفضيلات القراءة',
  'YOUR READING VIEW': 'طريقة القراءة',
  'One clear thought at a time.': 'فكرة واضحة واحدة في كل مرة.',
  'Larger type': 'خط أكبر',
  'Arabic reading': 'القراءة بالعربية',
  'Clear focus': 'تركيز واضح',
  'Useful words. Traceable sources.': 'مصطلحات مفيدة ومصادر واضحة.',
  'Explore educational definitions and reliable health-information sources. Every reference is there for general learning, not for interpreting an individual report.': 'استكشف تعريفات تثقيفية ومصادر موثوقة للمعلومات الصحية. كل مرجع للتعلم العام وليس لتفسير تقرير فردي.',
  'Explore the learning library': 'استكشف مكتبة التعلّم',
  'Scroll reading progress': 'تقدّم القراءة',
  'CLASSIFIER TRAINING': 'تدريب المصنّف',
  'A small synthetic training set helps organize report sections.': 'تساعد مجموعة تدريب اصطناعية صغيرة على ترتيب أقسام التقرير.',
  'synthetic training examples': 'مثال اصطناعي للتدريب',
  'separate test examples': 'مثال منفصل للاختبار',
  'document layout labels': 'تصنيفًا لتخطيط المستند',
  'macro F1 on this tiny split': 'مقياس F1 الكلي لهذه العينة الصغيرة',
  'This score only describes the tiny synthetic test set. It is not clinical validation and must not be used to interpret health results.': 'تصف هذه النتيجة مجموعة الاختبار الاصطناعية الصغيرة فقط. وهي ليست تحققًا سريريًا ولا يجوز استخدامها لتفسير النتائج الصحية.',
};
function tx(value: string, language: AppLanguage): string {
  return language === 'ar' ? (arabicText[value] || value) : value;
}
function explanationModeLabel(mode: string, language: AppLanguage): string {
  return tx(mode === 'static_demo' ? 'STATIC FICTIONAL DEMONSTRATION' : 'FICTIONAL DEMO EXPLANATION', language);
}

const navItems = [
  { href: '/app', label: 'Overview', icon: Activity },
  { href: '/app/analysis', label: 'Report view', icon: FileText },
  { href: '/app/glossary', label: 'Glossary', icon: BookOpen },
  { href: '/app/questions', label: 'Questions', icon: Clipboard },
];
const secondaryItems = [
  { href: '/app/how-it-works', label: 'How it works', icon: FlaskConical },
  { href: '/app/sources', label: 'Sources', icon: ShieldCheck },
  { href: '/app/settings', label: 'Preferences', icon: Settings2 },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <span className={`brandmark ${inverse ? 'brandmark-inverse' : ''}`} aria-label="MediLens AI">
    <span className="brand-symbol"><span /><span /><span /></span>
    <span className="brand-name">medi<span>lens</span><i>AI</i></span>
  </span>;
}

function Button({ children, className = '', variant = 'primary', ...props }: {
  children: ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button button-${variant} button-transition ${className}`} {...props}>{children}</button>;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`surface-card ${className}`}>{children}</section>;
}

function LoadingCards() {
  return <div className="skeleton-stack" aria-label="Loading content" role="status">
    <span className="skeleton skeleton-line wide" /><span className="skeleton skeleton-line" />
    <span className="skeleton skeleton-block" />
  </div>;
}

function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  const language = useLanguage();
  return <div className="error-notice" role="alert"><Info size={18} /><div><strong>{tx('We couldn’t load this just now.', language)}</strong><p>{message}</p>{retry && <Button variant="secondary" onClick={retry}>{tx('Try again', language)}</Button>}</div></div>;
}

function ScrollEffects() {
  const language = useLanguage();
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      '.landing-page main > section, #main-content > .page-stack > *, #main-content .report-layout > *, #main-content .source-grid > *, #main-content .settings-main > *',
    );
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | undefined;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach(section => section.classList.add('scroll-reveal', 'scroll-revealed'));
    } else {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed');
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
      sections.forEach(section => {
        section.classList.add('scroll-reveal');
        observer?.observe(section);
      });
    }

    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);
      });
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [location]);

  return <div className="scroll-progress-track" role="progressbar" aria-label={tx('Scroll reading progress', language)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
    <span style={{ transform: `scaleX(${progress / 100})` }} />
  </div>;
}

function Shell({ children, activePath }: { children: ReactNode; activePath: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const language = useLanguage();
  const active = activePath || location;
  const closeNav = () => setMobileOpen(false);
  const renderLink = (item: typeof navItems[number]) => <Link key={item.href} href={item.href}
    className={`side-link nav-link ${active === item.href ? 'selected' : ''}`} onClick={closeNav}>
    <item.icon size={17} strokeWidth={1.8} /><span>{tx(item.label, language)}</span>{active === item.href && <span className="nav-current" />}
  </Link>;
  return <div className="app-shell noise">
    <a className="skip-to-content" href="#main-content">{tx('Skip to main content', language)}</a>
    {mobileOpen && <button className="mobile-scrim" onClick={closeNav} aria-label={tx('Close navigation', language)} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Link href="/app" className="sidebar-brand"><Brand inverse /></Link>
      <div className="side-caption eyebrow">{tx('YOUR WORKSPACE', language)}</div>
      <nav aria-label={tx('Main navigation', language)} className="side-nav">{navItems.map(renderLink)}</nav>
      <div className="side-caption eyebrow side-caption-lower">{tx('LEARN & TRUST', language)}</div>
      <nav aria-label={tx('Learning and preferences', language)} className="side-nav">{secondaryItems.map(renderLink)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-safety">
        <span className="safety-icon"><ShieldCheck size={17} /></span>
        <div><b>{tx('Your report stays yours', language)}</b><p>{tx('Files are processed transiently and never retained.', language)}</p></div>
      </div>
      <div className="sidebar-foot"><span className="status-dot" /> {tx('EDUCATION, NOT DIAGNOSIS', language)} <span>v1.0</span></div>
    </aside>
    <div className="main-surface">
      <header className="topbar">
        <button className="mobile-menu icon-button" aria-label={tx('Open navigation', language)} onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
        <div className="crumbs"><span>{tx('Workspace', language)}</span><ChevronRight size={14} /><b>{tx([...navItems, ...secondaryItems].find(x => x.href === active)?.label || 'Overview', language)}</b></div>
        <div className="topbar-right"><span className="secure-label"><LockKeyhole size={13} /> {tx('Private by design', language)}</span><span className="top-avatar">M</span></div>
      </header>
      <main className="content-wrap" id="main-content">{children}</main>
    </div>
  </div>;
}

function AppRoot() {
  const [location, setLocation] = useLocation();
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('medilens-theme') as 'light' | 'dark') || 'light');
  const [language, setLanguage] = useState<'en' | 'ar'>(() => (localStorage.getItem('medilens-language') as 'en' | 'ar') || 'en');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('medilens-large-text') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('medilens-contrast') === 'true');
  const [glossarySearch, setGlossarySearch] = useState('');
  const glossaryParams = useMemo(() => ({ search: glossarySearch.trim() || undefined, language }), [glossarySearch, language]);
  const dashboard = useGetMediLensDashboard();
  const demo = useGetDemoReport();
  const glossary = useGetGlossary(glossaryParams);
  const sources = useGetMediLensSources();
  const queryClient = useQueryClient();
  const [uploadController, setUploadController] = useState<AbortController | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadingName, setUploadingName] = useState('');
  const analyze = useAnalyzeReport({ request: { signal: uploadController?.signal } });
  const questionsMutation = useGenerateDoctorQuestions();
  const explainMutation = useExplainDemoTerm();
  const [explanation, setExplanation] = useState<{ term: string; text: string; mode: string } | null>(null);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [selectedQuestionTerms, setSelectedQuestionTerms] = useState<string[]>([]);
  const [questionError, setQuestionError] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('large-text', largeText);
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('medilens-theme', theme);
    localStorage.setItem('medilens-language', language);
    localStorage.setItem('medilens-large-text', String(largeText));
    localStorage.setItem('medilens-contrast', String(highContrast));
  }, [theme, language, largeText, highContrast]);

  const selectedAnalysis = analysis || demo.data || null;
  const isLanding = location === '/';
  const activeRoute = location === '/app' || location === '/app/' ? '/app' : location;
  const resetUpload = () => {
    uploadController?.abort();
    setUploadController(null);
    analyze.reset();
    setUploadingName('');
  };
  const encodeFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('This file could not be read. Try another PDF or image.'));
    reader.onabort = () => reject(new Error('File reading was cancelled.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(file);
  });
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setUploadError('Choose a PDF, JPG, or PNG file. Other file types are not supported.');
      return;
    }
    if (file.name.length > 255) {
      setUploadError('The file name is too long. Please rename it and try again.');
      return;
    }
    if (file.size === 0) {
      setUploadError('This file appears to be empty. Choose a different report.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('This file is too large to send safely. Choose a file no larger than 10 MiB.');
      return;
    }
    const controller = new AbortController();
    setUploadController(controller);
    setUploadingName(file.name);
    try {
      const contentBase64 = await encodeFile(file);
      if (controller.signal.aborted) return;
      if (contentBase64.length > 14_000_000) {
        setUploadError('The encoded file exceeds the 14 MB request limit. Choose a smaller file.');
        resetUpload();
        return;
      }
      // The selected document is sent only to the transient extraction endpoint; it is never sent to an AI provider.
      const result = await analyze.mutateAsync({ data: { fileName: file.name, mimeType: file.type as 'application/pdf' | 'image/jpeg' | 'image/png', contentBase64 } });
      if (!controller.signal.aborted) {
        setAnalysis(result);
        setExplanation(null);
        setLocation('/app/analysis');
        queryClient.invalidateQueries({ queryKey: getGetMediLensDashboardQueryKey() });
      }
    } catch (error) {
      if (!controller.signal.aborted) setUploadError(error instanceof Error ? error.message : 'The report could not be processed. Please try again.');
    } finally {
      setUploadController(null);
      setUploadingName('');
    }
  };
  const clearDocument = () => {
    resetUpload();
    setAnalysis(null);
    setExplanation(null);
    setQuestionGroups([]);
    setSelectedQuestionTerms([]);
    setQuestionError('');
    setUploadError('');
    setLocation('/app');
  };
  const clearSessionData = () => {
    resetUpload();
    setAnalysis(null);
    setExplanation(null);
    setQuestionGroups([]);
    setSelectedQuestionTerms([]);
    setQuestionError('');
    setUploadError('');
    setLocation('/app');
  };
  const explainDemo = (term: string) => {
    const safeTerm = demo.data?.terms.find(item => item.term === term)?.term;
    if (!safeTerm || demo.data?.sourceMode !== 'fictional_demo') return;
    setExplanation(null);
    explainMutation.mutate({ data: { term: safeTerm } }, {
      onSuccess: result => setExplanation({ term: result.term, text: result.explanation, mode: result.mode }),
    });
  };
  const createQuestions = () => {
    const demoTerms = new Set(demo.data?.terms.map(term => term.term) || []);
    const safeTerms = selectedQuestionTerms.filter(term => demoTerms.has(term)).slice(0, 20);
    if (!safeTerms.length) {
      setQuestionError('Select at least one term from the fictional sample to prepare discussion prompts.');
      return;
    }
    setQuestionError('');
    questionsMutation.mutate({ data: { terms: safeTerms } }, {
      onSuccess: result => setQuestionGroups(result),
      onError: () => setQuestionError('Questions could not be prepared just now. Your current notes are unchanged. Try again.'),
    });
  };

  return <LanguageContext.Provider value={language}><ScrollEffects />{isLanding
    ? <Landing onEnter={() => setLocation('/app')} />
    : <Shell activePath={activeRoute}>
    <Switch>
      <Route path="/app"><Dashboard data={dashboard.data} loading={dashboard.isLoading} error={dashboard.error} retry={() => dashboard.refetch()} demo={demo.data} demoLoading={demo.isLoading} analysis={analysis} onUpload={() => uploadInputRef.current?.click()} uploading={analyze.isPending || !!uploadingName} uploadName={uploadingName} uploadError={uploadError} onCancel={resetUpload} onOpenDemo={() => { setAnalysis(null); setLocation('/app/analysis'); }} /></Route>
      <Route path="/app/analysis"><AnalysisPage analysis={selectedAnalysis} isDemo={!analysis} loading={demo.isLoading && !analysis} error={demo.error} retry={() => demo.refetch()} onDelete={clearDocument} onExplain={explainDemo} explanation={explanation} explanationLoading={explainMutation.isPending} explanationError={explainMutation.error ? 'This demo explanation is unavailable right now.' : ''} onUpload={() => uploadInputRef.current?.click()} uploading={analyze.isPending || !!uploadingName} uploadName={uploadingName} uploadError={uploadError} onCancel={resetUpload} /></Route>
      <Route path="/app/glossary"><GlossaryPage data={glossary.data} loading={glossary.isLoading} error={glossary.error} retry={() => glossary.refetch()} search={glossarySearch} onSearch={setGlossarySearch} language={language} curatedTerms={demo.data?.terms.map(term => term.term) || []} onExplain={explainDemo} explanation={explanation} explanationLoading={explainMutation.isPending} explanationError={explainMutation.error ? 'The fictional-demo explanation is unavailable.' : ''} /></Route>
      <Route path="/app/questions"><QuestionsPage demo={demo.data} groups={questionGroups} setGroups={setQuestionGroups} terms={selectedQuestionTerms} setTerms={setSelectedQuestionTerms} onGenerate={createQuestions} loading={questionsMutation.isPending} error={questionError} onError={setQuestionError} /></Route>
      <Route path="/app/how-it-works"><HowItWorks /></Route>
      <Route path="/app/sources"><SourcesPage data={sources.data} loading={sources.isLoading} error={sources.error} retry={() => sources.refetch()} /></Route>
      <Route path="/app/settings"><SettingsPage theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} largeText={largeText} setLargeText={setLargeText} highContrast={highContrast} setHighContrast={setHighContrast} hasSessionData={Boolean(analysis || questionGroups.length || selectedQuestionTerms.length || explanation || uploadingName)} onClearSession={clearSessionData} /></Route>
      <Route><NotFound /></Route>
    </Switch>
    <input ref={uploadInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" hidden onChange={handleFile} aria-label="Choose a report file" />
  </Shell>}</LanguageContext.Provider>;
}

function Landing({ onEnter }: { onEnter: () => void }) {
  const language = useLanguage();
  return <div className="landing-page noise">
    <a className="skip-to-content" href="#main-content">{tx('Skip to main content', language)}</a>
    <header className="landing-header">
      <Link href="/" className="landing-brand"><Brand /></Link>
      <nav aria-label={tx('Page navigation', language)} className="landing-links"><a href="#approach">{tx('Our approach', language)}</a><a href="#privacy">{tx('Privacy', language)}</a><Link href="/app/how-it-works">{tx('How it works', language)}</Link></nav>
      <Button onClick={onEnter}>{tx('Open MediLens', language)} <ArrowRight size={15} /></Button>
    </header>
    <main id="main-content">
      <section className="hero">
        <div className="hero-copy fade-up">
          <div className="hero-kicker"><span className="live-mark" /> {tx('A clearer conversation starts here', language)}</div>
          <h1 className="display-font">{tx('Medical language,', language)}<br /><em>{tx('made more human.', language)}</em></h1>
          <p className="hero-intro">{tx('Understand the words in a medical report, at your own pace. Then bring better questions to the person who knows your care.', language)}</p>
          <div className="hero-actions"><Button onClick={onEnter}>{tx('Explore your workspace', language)} <ArrowRight size={16} /></Button><Link href="/app/how-it-works" className="text-link">{tx('See how it works', language)} <ArrowUpRight size={15} /></Link></div>
          <div className="hero-proof"><span><ShieldCheck size={15} /> {tx('Private by design', language)}</span><span><HeartPulse size={15} /> {tx('Made for learning', language)}</span></div>
        </div>
        <div className="hero-visual fade-up-delay">
          <div className="visual-topline"><span className="eyebrow">A MORE INFORMED NEXT STEP</span><span className="signal"><i /> <i /> <i /> CLEAR</span></div>
          <div className="visual-orbit orbital soft-grid"><div className="orbit-core"><div className="core-cross">+</div><b>ML</b><small>UNDERSTAND</small></div><span className="orbit-tag tag-a">01 <b>Read</b></span><span className="orbit-tag tag-b">02 <b>Learn</b></span><span className="orbit-tag tag-c">03 <b>Discuss</b></span><span className="orbit-dot dot-a" /><span className="orbit-dot dot-b" /></div>
          <div className="visual-footer"><span>Clarity, without certainty claims.</span><span className="mono">FIG. 01 / YOUR REPORT, YOUR PACE</span></div>
          <div className="visual-stamp"><div>EDUCATION<br />NOT DIAGNOSIS</div><ShieldCheck size={19} /></div>
        </div>
      </section>
      <section className="landing-preview" aria-labelledby="reading-preview-title">
        <div className="section-heading"><div><span className="eyebrow">{tx('THE READING TABLE / 01', language)}</span><h2 id="reading-preview-title" className="display-font">{tx('A calmer way to read.', language)}</h2></div><p>{tx('This fictional preview shows how a report can stay recognizable while unfamiliar labels become easier to explore.', language)}</p></div>
        <div className="preview-layout">
          <article className="preview-report glass-panel">
            <div className="preview-report-top"><span className="eyebrow">{tx('ILLUSTRATIVE SAMPLE · NO REAL PATIENT DATA', language)}</span><span className="preview-orb" /></div>
            <h3 className="display-font">{tx('Complete blood count', language)}</h3>
            <div className="preview-report-row preview-report-label"><span>{tx('Test name', language)}</span><span>{tx('Value as printed', language)}</span><span>{tx('Reference range as printed', language)}</span></div>
            <div className="preview-report-row"><b>{tx('Marker A', language)}</b><span>—</span><span>—</span></div>
            <div className="preview-report-row"><b>{tx('Marker B', language)}</b><span>—</span><span>—</span></div>
            <div className="preview-footnote"><Info size={17} /><span>{tx('Sample layout only. No medical results are shown.', language)}</span></div>
          </article>
          <div className="preview-explanation glass-panel">
            <span className="preview-number">01</span><span className="eyebrow">{tx('A FICTIONAL EXAMPLE', language)}</span>
            <h3 className="display-font">{tx('A sample, never a diagnosis.', language)}</h3>
            <p>{tx('Measurements stay as printed. Educational notes and sources stay separate, so you can review each part without replacing your clinician’s advice.', language)}</p>
            <div className="preview-tags"><span><Check size={15} /> {tx('Original wording', language)}</span><span><Check size={15} /> {tx('Source links', language)}</span></div>
          </div>
        </div>
      </section>
      <section className="principles" id="approach">
        <div className="section-heading"><div><span className="eyebrow">{tx('THE MEDILENS METHOD', language)}</span><h2 className="display-font">{tx('A guide, not a verdict.', language)}</h2></div><p>{tx('Medical reports are written for precision. Understanding them should feel more personal.', language)}</p></div>
        <div className="principle-layout">
          <article className="principle-lead"><span className="principle-index">01 — {tx('UNDERSTAND', language)}</span><div className="principle-mark"><BookOpen size={25} /></div><h3>{tx('Start with the words.', language)}</h3><p>{tx('Get clear, educational explanations of common medical terms, with the original language kept in view.', language)}</p><Link href="/app/glossary" className="text-link">{tx('Browse the glossary', language)} <ArrowRight size={15} /></Link></article>
          <div className="principle-list">
            <article><span className="principle-index">02 — {tx('KEEP CONTEXT', language)}</span><h3>{tx('Your report stays recognizable.', language)}</h3><p>{tx('Measurements and printed reference ranges are shown as they appear in the report—not reinterpreted.', language)}</p></article>
            <article><span className="principle-index">03 — {tx('PREPARE', language)}</span><h3>{tx('Make room for a better visit.', language)}</h3><p>{tx('Turn unfamiliar terminology into editable questions to discuss with a qualified clinician.', language)}</p></article>
            <article><span className="principle-index">04 — {tx('CHECK SOURCES', language)}</span><h3>{tx('Follow the evidence trail.', language)}</h3><p>{tx('Explore educational sources and see where additional context comes from.', language)}</p></article>
          </div>
        </div>
      </section>
      <section className="landing-trail" aria-labelledby="reading-steps-title">
        <div className="section-heading"><div><span className="eyebrow">{tx('A STEADY, SIMPLE FLOW', language)}</span><h2 id="reading-steps-title" className="display-font">{tx('Four calm steps.', language)}</h2></div><p>{tx('No rush. No hidden interpretation.', language)}</p></div>
        <div className="trail-grid">
          {[
            { number: '01', title: 'Open a report', description: 'Choose a PDF or image to read.', icon: Upload },
            { number: '02', title: 'Read what was extracted', description: 'Compare the text with your original report.', icon: FileText },
            { number: '03', title: 'Explore unfamiliar words', description: 'Look up terms in plain language and check sources.', icon: BookOpen },
            { number: '04', title: 'Bring questions to your clinician', description: 'Make editable notes for your next visit.', icon: Clipboard },
          ].map(step => {
            const StepIcon = step.icon;
            return <article className="trail-step glass-panel" key={step.number}>
              <span className="trail-step-number">{step.number}</span><span className="trail-step-icon"><StepIcon size={22} /></span>
              <h3>{tx(step.title, language)}</h3><p>{tx(step.description, language)}</p>
            </article>;
          })}
        </div>
      </section>
      <section className="landing-comfort" aria-labelledby="comfort-title">
        <div className="comfort-copy"><span className="eyebrow">{tx('MADE FOR YOUR PACE', language)}</span><h2 id="comfort-title" className="display-font">{tx('Designed for comfortable reading.', language)}</h2><p>{tx('Control the size, contrast, and direction of your reading view.', language)}</p><Link href="/app/settings" className="text-link">{tx('Adjust reading preferences', language)} <ArrowRight size={16} /></Link></div>
        <div className="comfort-card glass-panel">
          <span className="eyebrow">{tx('YOUR READING VIEW', language)}</span>
          <div className="comfort-line large-line">{tx('A little more clarity.', language)}</div>
          <div className="comfort-line">{tx('One clear thought at a time.', language)}</div>
          <div className="comfort-options"><span><CheckCircle2 size={18} /> {tx('Larger type', language)}</span><span><Globe2 size={18} /> {tx('Arabic reading', language)}</span><span><ShieldCheck size={18} /> {tx('Clear focus', language)}</span></div>
        </div>
      </section>
      <section className="landing-callout" id="privacy">
        <div className="callout-orbital orbital"><span className="callout-center"><LockKeyhole size={27} /></span></div>
        <div className="callout-copy"><span className="eyebrow">{tx('PRIVATE BY DESIGN', language)}</span><h2 className="display-font">{tx('Your report is not a product.', language)}</h2><p>{tx('Uploads are processed transiently for text extraction. The file is not retained, and report content is never sent to an AI provider. Delete the active view any time to clear it from this session.', language)}</p><Link href="/app/settings" className="text-link">{tx('Explore privacy settings', language)} <ArrowRight size={15} /></Link></div>
      </section>
      <section className="landing-sources" aria-labelledby="source-preview-title">
        <div className="source-orb" aria-hidden="true"><span /></div>
        <div className="source-preview-copy"><span className="eyebrow">{tx('FOLLOW THE EVIDENCE TRAIL', language)}</span><h2 id="source-preview-title" className="display-font">{tx('Useful words. Traceable sources.', language)}</h2><p>{tx('Explore educational definitions and reliable health-information sources. Every reference is there for general learning, not for interpreting an individual report.', language)}</p><Link href="/app/sources" className="text-link">{tx('Explore the learning library', language)} <ArrowRight size={16} /></Link></div>
        <div className="source-glass-stack"><div className="source-glass-card"><span>01</span><b>MedlinePlus</b><small>Plain-language health information</small></div><div className="source-glass-card"><span>02</span><b>NHS</b><small>Blood test learning resources</small></div><div className="source-glass-card"><span>03</span><b>National Library of Medicine</b><small>Educational reference material</small></div></div>
      </section>
      <section className="landing-last"><div className="eyebrow">{tx('A SMALL STEP TOWARD CLARITY', language)}</div><h2 className="display-font">{tx('Bring understanding', language)}<br />{tx('into the room.', language)}</h2><Button onClick={onEnter}>{tx('Start with MediLens', language)} <ArrowRight size={16} /></Button><p>{tx('Not a diagnostic tool. Not a substitute for medical care.', language)}</p></section>
    </main>
    <footer className="landing-footer"><Brand /><span>{tx('© MediLens AI · Educational support for informed conversations', language)}</span><Link href="/app/sources">{tx('Sources & approach', language)}</Link></footer>
  </div>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  const language = useLanguage();
  return <div className="page-title"><div><div className="eyebrow">{tx(eyebrow, language)}</div><h1 className="display-font">{tx(title, language)}</h1><p>{tx(description, language)}</p></div>{action && <div className="page-title-action">{action}</div>}</div>;
}

function Dashboard({ data, loading, error, retry, demo, demoLoading, analysis, onUpload, uploading, uploadName, uploadError, onCancel, onOpenDemo }: {
  data?: any; loading: boolean; error: unknown; retry: () => void; demo?: DocumentAnalysis; demoLoading: boolean;
  analysis: DocumentAnalysis | null; onUpload: () => void; uploading: boolean; uploadName: string; uploadError: string;
  onCancel: () => void; onOpenDemo: () => void;
}) {
  const language = useLanguage();
  return <div className="page-stack fade-up">
    <PageTitle eyebrow="YOUR READING ROOM / 01" title="A little more clarity." description="Start with a report, learn a term, or prepare for a conversation." action={<div className="date-chip"><span className="date-pulse" /> {tx('YOUR PRIVATE WORKSPACE', language)}</div>} />
    {loading ? <LoadingCards /> : error ? <ErrorNotice message="Your workspace summary is temporarily unavailable." retry={retry} /> : null}
    <div className="dashboard-grid">
      <Card className="upload-card">
        <div className="upload-copy"><div className="icon-chip cyan-chip"><CloudUpload size={19} /></div><div className="eyebrow">{tx('BEGIN WITH A REPORT', language)}</div><h2 className="display-font">{tx('Read it in context.', language)}</h2><p>{tx('Choose a PDF or a clear JPG/PNG. We’ll extract the printed text and keep the original measurements and ranges intact.', language)}</p><Button onClick={onUpload} disabled={uploading}>{uploading ? <><span className="button-loader" /> {tx('Reading your file', language)}</> : <><Upload size={16} /> {tx('Choose a report', language)}</>}</Button></div>
        <div className="upload-graphic"><div className="file-outline"><div className="file-head"><span /><span /></div><div className="file-line long" /><div className="file-line" /><div className="file-measure"><span /><i /></div><div className="file-line short" /><span className="file-scan" /></div><div className="graphic-orbit graphic-orbit-one" /><div className="graphic-orbit graphic-orbit-two" /><div className="graphic-label mono">LOCAL<br />EXTRACTION</div></div>
        <div className="upload-privacy"><LockKeyhole size={14} /> {tx('Processed transiently. Never retained or sent to an AI provider.', language)}</div>
        {uploading && <div className="upload-progress" role="status"><span className="skeleton progress-shimmer" /><span className="upload-file-label">{uploadName || tx('Preparing report', language)}</span><Button variant="ghost" onClick={onCancel}><X size={14} /> {tx('Cancel', language)}</Button></div>}
        {uploadError && <div className="inline-error" role="alert">{tx(uploadError, language)}</div>}
      </Card>
      <Card className="sample-card">
        <div className="sample-top"><span className="eyebrow">{tx('A FICTIONAL EXAMPLE', language)}</span><span className="sample-badge"><Sparkles size={13} /> {tx('DEMO ONLY', language)}</span></div>
        <div className="sample-art"><div className="sample-document"><span className="sample-doc-kicker mono">{tx('LABORATORY REPORT', language)}</span><div className="sample-rule" /><div className="sample-row"><i /><b>{tx('Test panel', language)}</b><em>{tx('Reference', language)}</em></div><div className="sample-row active"><i /><b>{tx('Marker A', language)}</b><em>{tx('as printed', language)}</em></div><div className="sample-row"><i /><b>{tx('Marker B', language)}</b><em>{tx('as printed', language)}</em></div><div className="sample-rule lower-rule" /></div><span className="sample-art-index">{tx('SYNTHETIC / 01', language)}</span></div>
        <h2 className="display-font">{demo?.title || (demoLoading ? 'Loading sample…' : 'A sample report')}</h2>
        <p>{tx('A clearly fictional report to explore the reading experience. No real patient information.', language)}</p>
        <Button variant="secondary" onClick={onOpenDemo} disabled={!demo && demoLoading}>{tx('Explore the sample', language)} <ArrowRight size={15} /></Button>
      </Card>
    </div>
    {uploadError && <ErrorNotice message={tx(uploadError, language)} />}
    <div className="section-label-row"><div><span className="eyebrow">{tx('A STEADY, SIMPLE FLOW', language)}</span><h2 className="display-font">{tx('From page to conversation.', language)}</h2></div><Link href="/app/how-it-works" className="subtle-link">{tx('Learn more', language)} <ArrowUpRight size={14} /></Link></div>
    <div className="workflow-row">{(data?.workflow || []).length ? data.workflow.map((step: any, i: number) => <div className="workflow-step" key={step.key}><span className="workflow-number">{language === 'ar' ? ['٠١','٠٢','٠٣','٠٤'][i] || '٠٥' : `0${i + 1}`}</span><div><b>{tx(step.title, language)}</b><p>{tx(step.description, language)}</p></div>{i < data.workflow.length - 1 && <ArrowRight className="workflow-arrow" size={15} />}</div>) : ['Read the page', 'Learn the language', 'Prepare to discuss'].map((title, i) => <div className="workflow-step" key={title}><span className="workflow-number">{language === 'ar' ? ['٠١','٠٢','٠٣'][i] : `0${i + 1}`}</span><div><b>{tx(title, language)}</b><p>{tx(['Keep the source in view.', 'Explore plain-language definitions.', 'Bring editable questions to your clinician.'][i], language)}</p></div>{i < 2 && <ArrowRight className="workflow-arrow" size={15} />}</div>)}</div>
    {analysis && <Card className="current-report"><div className="current-icon"><FileCheck2 size={20} /></div><div><span className="eyebrow">{tx('CURRENTLY IN THIS SESSION', language)}</span><h3>{analysis.title || analysis.fileName}</h3><p>{tx('Local extraction', language)} · {analysis.pageCount} {tx(analysis.pageCount === 1 ? 'page' : 'pages', language)} · {tx('Not saved between sessions', language)}</p></div><Link href="/app/analysis" className="subtle-link">{tx('Continue reading', language)} <ArrowRight size={14} /></Link></Card>}
    <div className="quiet-disclaimer"><Info size={15} /><span>{tx('MediLens AI offers educational context only. It does not diagnose, validate clinical results, or recommend treatment.', language)}</span></div>
  </div>;
}

function AnalysisPage({ analysis, isDemo, loading, error, retry, onDelete, onExplain, explanation, explanationLoading, explanationError, onUpload, uploading, uploadName, uploadError, onCancel }: {
  analysis: DocumentAnalysis | null; isDemo: boolean; loading: boolean; error: unknown; retry: () => void; onDelete: () => void;
  onExplain: (term: string) => void; explanation: { term: string; text: string; mode: string } | null; explanationLoading: boolean; explanationError: string;
  onUpload: () => void; uploading: boolean; uploadName: string; uploadError: string; onCancel: () => void;
}) {
  const language = useLanguage();
  if (loading) return <div className="page-stack"><LoadingCards /><LoadingCards /></div>;
  if (error && !analysis) return <div className="page-stack"><ErrorNotice message="The fictional sample could not be loaded." retry={retry} /></div>;
  if (!analysis) return <div className="page-stack fade-up"><PageTitle eyebrow="REPORT VIEW" title="Your reading room is clear." description="Choose a report for transient local extraction, or open the fictional sample." /><Card className="empty-state"><div className="empty-icon"><FileText size={27} /></div><h2 className="display-font">{tx('Nothing open yet.', language)}</h2><p>{tx('There’s no report in this session. Upload a file or explore the clearly labeled fictional example.', language)}</p><div className="empty-actions"><Button onClick={onUpload}><Upload size={15} /> {tx('Choose a report', language)}</Button><Link href="/app" className="button button-secondary">{tx('Go to overview', language)} <ArrowRight size={15} /></Link></div></Card>{uploadError && <ErrorNotice message={tx(uploadError, language)} />}{uploading && <Card className="upload-progress"><span className="skeleton progress-shimmer" /><span>{uploadName}</span><Button variant="ghost" onClick={onCancel}>{tx('Cancel', language)}</Button></Card>}</div>;
  const demo = isDemo || analysis.sourceMode === 'fictional_demo';
  return <div className="page-stack fade-up">
    <PageTitle eyebrow={demo ? 'FICTIONAL DEMONSTRATION / REPORT VIEW' : 'LOCAL EXTRACTION / REPORT VIEW'} title={analysis.title || analysis.fileName} description={demo ? 'Synthetic sample content only. These details do not describe a real person.' : `Extracted from ${analysis.fileName}. Original printed values and units are preserved as read.`} action={<Button variant="ghost" onClick={onDelete}><Trash2 size={15} /> {tx('Clear this view', language)}</Button>} />
    {uploadError && <ErrorNotice message={tx(uploadError, language)} />}
    <div className="report-meta"><span><FileText size={14} /> {analysis.pageCount} {tx(analysis.pageCount === 1 ? 'page' : 'pages', language)}</span><span><span className={`confidence-dot confidence-${analysis.confidence}`} /> {tx(analysis.confidence, language)} {tx('extraction confidence', language)}</span><span className={demo ? 'demo-label' : 'local-label'}>{tx(demo ? 'FICTIONAL DEMO' : 'LOCAL EXTRACTION', language)}</span></div>
    <div className={`notice-panel ${analysis.confidence !== 'high' ? 'notice-amber' : ''}`}><Info size={18} /><div><b>{tx('Read this as a learning aid, not a clinical interpretation.', language)}</b><p>{analysis.uncertainty}</p>{analysis.confidence !== 'high' && <p>{tx('Some details may be incomplete or uncertain. Check the source document and ask a clinician to interpret your specific results.', language)}</p>}</div></div>
    <div className="report-layout">
      <div className="report-main">
        <Card className="measurements-card"><div className="card-heading"><div><span className="eyebrow">{tx('AS PRINTED IN THE REPORT', language)}</span><h2 className="display-font">{tx('Measurements', language)}</h2></div><span className="preserved-tag"><Check size={13} /> {tx('Original values preserved', language)}</span></div>
          {analysis.measurements.length ? <div className="measurement-list">{analysis.measurements.map((item, i) => <div className="measurement-row" key={`${item.label}-${i}`}><div className="measurement-label"><b>{item.label}</b><span>{item.context}</span></div><div className="measurement-value mono">{item.originalValue} <small>{item.unit}</small></div><div className="measurement-range"><span className="eyebrow">{tx('PRINTED RANGE', language)}</span><b className="mono">{item.printedRange || tx('Not stated', language)}</b></div><div className="measurement-page">{tx('p.', language)} {item.page}</div></div>)}</div> : <div className="empty-inline">{tx('No measurements were extracted from this report.', language)}</div>}
          <p className="measurement-footnote"><Info size={13} /> {tx('Values, units, and printed reference ranges are reproduced exactly. No interpretation is added here.', language)}</p>
        </Card>
        <Card className="sections-card"><div className="card-heading"><div><span className="eyebrow">{tx('EXTRACTED SECTIONS', language)}</span><h2 className="display-font">{tx('What the page says', language)}</h2></div><span className="section-count">{analysis.sections.length} {tx('sections', language)}</span></div>
          {analysis.sections.length ? <div className="section-list">{analysis.sections.map((section, index) => <details className="source-section" key={`${section.title}-${index}`} open={index === 0}><summary><span className="section-marker mono">{language === 'ar' ? ['٠١','٠٢','٠٣','٠٤','٠٥'][index] || index + 1 : String(index + 1).padStart(2, '0')}</span><b>{section.title}</b><span className="classification">{section.classification.replaceAll('_', ' ')}</span><span className="page-tag">{tx('Page', language)} {section.page}</span><ChevronDown size={15} /></summary><p>{section.content}</p></details>)}</div> : <div className="empty-inline">{tx('No text sections were extracted. Try a higher-quality scan or consult the source document.', language)}</div>}
        </Card>
      </div>
      <aside className="report-aside">
        <Card className="term-card"><div className="card-heading"><div><span className="eyebrow">{tx('PLAIN-LANGUAGE COMPANIONS', language)}</span><h2 className="display-font">{tx('Terms to know', language)}</h2></div></div>
          {analysis.terms.length ? <div className="term-list">{analysis.terms.map((term, i) => <article className="term-item" key={`${term.term}-${i}`}><div className="term-item-top"><b>{term.term}</b><span className="term-page">{tx('p.', language)} {analysis.sections.find(s => s.content.toLowerCase().includes(term.term.toLowerCase()))?.page || '—'}</span></div><p>{language === 'ar' && term.simpleArabic ? term.simpleArabic : term.simple}</p><details><summary>{tx('More context', language)} <ChevronDown size={13} /></summary><p>{language === 'ar' && term.detailedArabic ? term.detailedArabic : term.detailed}</p>{term.example && <p className="term-example">{term.example}</p>}</details>{demo && <button className="term-explain" onClick={() => onExplain(term.term)} disabled={explanationLoading}>{tx('Explore demo explanation', language)} <ArrowUpRight size={13} /></button>}</article>)}</div> : <div className="empty-inline">{tx('No glossary terms are available.', language)}</div>}
          {explanationError && <p className="inline-error" role="alert">{explanationError}</p>}
          {explanation && <div className="explanation-box"><span className="eyebrow">{explanationModeLabel(explanation.mode, language)}</span><b>{explanation.term}</b><p>{explanation.text}</p><small>{tx(explanation.mode === 'static_demo' ? 'Static fictional sample explanation. Educational context only, not clinical advice.' : 'For this fictional demo only. Educational context, not clinical advice.', language)}</small></div>}
        </Card>
        <Card className="source-mini"><span className="eyebrow">CHECK THE CONTEXT</span><h3>Learning should be traceable.</h3><p>Explore the educational sources associated with this report.</p><Link href="/app/sources" className="text-link">View sources <ArrowRight size={14} /></Link></Card>
      </aside>
    </div>
    <div className="quiet-disclaimer"><ShieldCheck size={15} /><span>Report content is processed transiently and is not retained by MediLens. Clear this view to remove it from the current interface.</span></div>
  </div>;
}

function GlossaryPage({ data, loading, error, retry, search, onSearch, language, curatedTerms, onExplain, explanation, explanationLoading, explanationError }: {
  data?: any[]; loading: boolean; error: unknown; retry: () => void; search: string; onSearch: (value: string) => void; language: 'en' | 'ar';
  curatedTerms: string[];
  onExplain: (term: string) => void; explanation: { term: string; text: string; mode: string } | null; explanationLoading: boolean; explanationError: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <div className="page-stack fade-up">
    <PageTitle eyebrow="A LIVING REFERENCE / 02" title="Words, with room to breathe." description="Search educational explanations for common medical terminology. Definitions are not a reading of your personal results." />
    <div className="glossary-toolbar"><label className="search-box"><Search size={18} /><input type="search" value={search} onChange={event => onSearch(event.target.value)} placeholder={tx('Search a medical term…', language)} aria-label={tx('Search glossary', language)} data-testid="input-glossary-search" /><span className="search-hint">{tx('TERM SEARCH', language)}</span></label><span className="language-indicator"><Languages size={15} /> {language === 'ar' ? 'العربية' : 'English'}</span></div>
    {loading ? <LoadingCards /> : error ? <ErrorNotice message={tx('The glossary is unavailable at the moment.', language)} retry={retry} /> : null}
    {explanationError && <div className="inline-error" role="alert">{tx(explanationError, language)}</div>}
    {explanation && <div className="explanation-banner"><Sparkles size={18} /><div><span className="eyebrow">{explanationModeLabel(explanation.mode, language)}</span><b>{explanation.term}</b><p>{explanation.text}</p><small>{tx(explanation.mode === 'static_demo' ? 'Static fictional sample explanation. Educational context only, not clinical advice.' : 'This explanation is for the fictional sample only, not clinical advice.', language)}</small></div></div>}
    {!loading && !error && data?.length === 0 && <Card className="empty-state"><div className="empty-icon"><Search size={24} /></div><h2 className="display-font">{tx('No matching terms.', language)}</h2><p>{tx('Try a shorter or differently spelled search.', language)}</p><Button variant="secondary" onClick={() => onSearch('')}>{tx('Clear search', language)}</Button></Card>}
    <div className="glossary-list">{data?.map((entry, index) => <Card className="glossary-entry" key={`${entry.term}-${index}`}><div className="glossary-entry-top"><span className="glossary-number mono">{language === 'ar' ? ['٠١','٠٢','٠٣','٠٤','٠٥'][index] || index + 1 : String(index + 1).padStart(2, '0')}</span><div><h2>{entry.term}</h2><span className="source-count">{entry.sourceIds.length} {tx('educational', language)} {entry.sourceIds.length === 1 ? tx('source', language) : tx('sources', language)}</span></div><button className="expand-button" aria-expanded={expanded === entry.term} onClick={() => setExpanded(expanded === entry.term ? null : entry.term)}>{tx(expanded === entry.term ? 'Less' : 'Explore', language)} <ChevronDown size={15} /></button></div>
      <p className="glossary-simple">{language === 'ar' && entry.simpleArabic ? entry.simpleArabic : entry.simple}</p>
      {expanded === entry.term && <div className="glossary-expanded"><div><span className="eyebrow">{tx('MORE DETAIL', language)}</span><p>{language === 'ar' && entry.detailedArabic ? entry.detailedArabic : entry.detailed}</p></div>{entry.example && <div className="glossary-example"><span className="eyebrow">{tx('IN CONTEXT', language)}</span><p>{entry.example}</p></div>}{entry.sourceIds.length > 0 && <div className="glossary-source-ids"><span className="eyebrow">{tx('REFERENCE IDS', language)}</span><span className="mono">{entry.sourceIds.join(' · ')}</span></div>}{curatedTerms.includes(entry.term) && <div className="explain-demo-row"><span>{tx('Curated fictional-sample term only.', language)}</span><button className="text-link" disabled={explanationLoading} onClick={() => onExplain(entry.term)}>{tx(explanationLoading ? 'Preparing…' : 'Try demo explanation', language)} <Sparkles size={14} /></button></div>}</div>}
    </Card>)}</div>
    <div className="quiet-disclaimer"><Info size={15} /><span>{tx('Definitions offer general educational context. Terminology can vary by specialty and must be interpreted by a clinician in context.', language)}</span></div>
  </div>;
}

function QuestionsPage({ demo, groups, setGroups, terms, setTerms, onGenerate, loading, error, onError }: {
  demo?: DocumentAnalysis; groups: QuestionGroup[]; setGroups: (groups: QuestionGroup[]) => void; terms: string[]; setTerms: (terms: string[]) => void;
  onGenerate: () => void; loading: boolean; error: string; onError: (error: string) => void;
}) {
  const language = useLanguage();
  const [customQuestion, setCustomQuestion] = useState('');
  const addQuestion = () => {
    if (!customQuestion.trim()) return;
    const first = groups[0] || { topic: 'My questions', questions: [] };
    setGroups([{ ...first, questions: [...first.questions, customQuestion.trim()] }, ...groups.slice(1)]);
    setCustomQuestion('');
  };
  const editQuestion = (groupIndex: number, questionIndex: number, value: string) => {
    setGroups(groups.map((group, i) => i === groupIndex ? { ...group, questions: group.questions.map((question, j) => j === questionIndex ? value : question) } : group));
  };
  const removeQuestion = (groupIndex: number, questionIndex: number) => {
    setGroups(groups.map((group, i) => i === groupIndex ? { ...group, questions: group.questions.filter((_, j) => j !== questionIndex) } : group).filter(group => group.questions.length));
  };
  const copyQuestions = async () => {
    const text = groups.map(group => `${group.topic}\n${group.questions.map(question => `• ${question}`).join('\n')}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      onError(tx('Questions copied. They are yours to edit or bring to a clinician.', language));
    } catch {
      onError(tx('Copy is unavailable in this browser. You can still select and copy each question.', language));
    }
  };
  const exportSummary = () => {
    let objectUrl = '';
    try {
      if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
        throw new Error('Download APIs unavailable');
      }
      const lines = [
        tx('MediLens AI — clinician discussion notes', language),
        tx('Educational prompts for discussion. Not a diagnosis or treatment recommendation.', language),
        '',
        ...groups.flatMap(group => [group.topic, ...group.questions.map(question => `- ${question}`), '']),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'medilens-discussion-notes.txt';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      onError(tx('Questions exported as a text file.', language));
    } catch {
      if (objectUrl && typeof URL !== 'undefined') URL.revokeObjectURL(objectUrl);
      onError(tx('Export is unavailable in this browser. You can still copy or select your questions.', language));
    }
  };
  return <div className="page-stack fade-up">
    <PageTitle eyebrow="PREPARE TO DISCUSS / 03" title="Questions worth bringing." description="Build editable conversation prompts from terminology in the fictional sample, then personalize them for your visit." action={groups.length > 0 ? <div className="question-header-actions"><Button variant="secondary" onClick={copyQuestions}><Clipboard size={15} /> {tx('Copy all', language)}</Button><Button variant="secondary" onClick={exportSummary}><FileText size={15} /> {tx('Export summary', language)}</Button><Button variant="ghost" onClick={() => { setGroups([]); onError(''); }}>{tx('Clear prompts', language)}</Button></div> : null} />
    <div className="questions-layout">
      <Card className="question-builder"><div className="builder-icon"><Clipboard size={19} /></div><span className="eyebrow">{tx('START WITH A TERM', language)}</span><h2 className="display-font">{tx('What would you like to ask about?', language)}</h2><p>{tx('Select one or more terms from the fictional sample. Only curated demo terminology is used to create these educational prompts.', language)}</p>
        {demo?.sourceMode === 'fictional_demo' && demo.terms.length ? <div className="term-select-list">{demo.terms.map(term => <label key={term.term} className={`term-select ${terms.includes(term.term) ? 'term-selected' : ''}`}><input type="checkbox" checked={terms.includes(term.term)} onChange={event => { setTerms(event.target.checked ? [...terms, term.term].slice(0, 20) : terms.filter(item => item !== term.term)); onError(''); }} /><span className="custom-check">{terms.includes(term.term) && <Check size={12} />}</span><span><b>{term.term}</b><small>{term.simple}</small></span></label>)}</div> : <div className="muted-empty">The fictional sample is loading or unavailable. You can still add your own questions.</div>}
        <Button onClick={onGenerate} disabled={loading || !terms.length}>{loading ? <><span className="button-loader" /> {tx('Preparing prompts', language)}</> : <><Sparkles size={15} /> {tx('Prepare discussion prompts', language)}</>}</Button>
        {error && <p className={`form-message ${error.startsWith('Questions copied') || error.startsWith('Questions exported') || error.startsWith('تم نسخ') || error.startsWith('تم تصدير') ? 'success-message' : ''}`} role="status">{tx(error, language)}</p>}
        <div className="builder-note"><LockKeyhole size={14} /> Uploaded report terms are never sent to an AI provider.</div>
      </Card>
      <div className="question-workspace">
        {groups.length === 0 ? <Card className="question-empty"><div className="empty-icon"><CircleHelp size={23} /></div><span className="eyebrow">{tx('YOUR DISCUSSION NOTES', language)}</span><h2 className="display-font">{tx('A good question is a beginning.', language)}</h2><p>{tx('Choose demo terms to prepare suggested prompts, or write your own below. Nothing here replaces the conversation.', language)}</p><div className="empty-question-example"><span className="quote-mark">“</span><p>{tx('What does this term mean in the context of my health?', language)}</p></div></Card> : <div className="editable-groups">{groups.map((group, i) => <Card className="question-group" key={`${group.topic}-${i}`}><div className="group-heading"><span className="group-number mono">0{i + 1}</span><div><span className="eyebrow">{tx('DISCUSSION THEME', language)}</span><h2>{group.topic}</h2></div><span className="editable-tag">{tx('EDITABLE', language)}</span></div><div className="editable-question-list">{group.questions.map((question, j) => <div className="editable-question" key={`${j}-${group.topic}`}><span className="question-bullet" /><textarea aria-label={`${tx('Edit question', language)} ${j + 1}`} value={question} onChange={event => editQuestion(i, j, event.target.value)} rows={2} /><button className="icon-button remove-question" onClick={() => removeQuestion(i, j)} aria-label={tx('Remove question', language)}><X size={15} /></button></div>)}</div><button className="add-to-group" onClick={() => setGroups(groups.map((g, k) => k === i ? { ...g, questions: [...g.questions, tx('What else should I know about this?', language)] } : g))}>+ {tx('Add another prompt', language)}</button></Card>)}</div>}
        <Card className="add-question-card"><label htmlFor="custom-question" className="eyebrow">{tx('ADD A QUESTION OF YOUR OWN', language)}</label><div className="custom-question-input"><input id="custom-question" value={customQuestion} onChange={event => setCustomQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') addQuestion(); }} placeholder={tx('What would you like to ask your clinician?', language)} /><Button variant="secondary" onClick={addQuestion} disabled={!customQuestion.trim()}>{tx('Add', language)} <ArrowRight size={14} /></Button></div></Card>
        {groups.length > 0 && <div className="print-note"><Printer size={14} /> {tx('Your notes are editable. Use your browser’s print option to bring a paper copy.', language)}</div>}
      </div>
    </div>
    <div className="quiet-disclaimer"><Info size={15} /><span>Prompts are educational conversation starters—not recommendations. Your clinician can help interpret your individual situation.</span></div>
  </div>;
}

function HowItWorks() {
  const language = useLanguage();
  const steps = [
    { num: '01', title: 'Choose a file', icon: Upload, body: 'Select a PDF, JPG, or PNG report. The file is encoded locally in your browser and sent to a transient extraction endpoint.' },
    { num: '02', title: 'Read the extracted page', icon: FileText, body: 'Review extracted sections, page locations, and measurements. Original values, units, and printed ranges stay as they appear in your report.' },
    { num: '03', title: 'Explore the language', icon: BookOpen, body: 'Use educational glossary entries to understand common terms. General explanations are not clinical interpretations.' },
    { num: '04', title: 'Prepare to discuss', icon: Clipboard, body: 'Create and edit questions for a clinician. Your care team is the right place for personal interpretation.' },
  ];
  return <div className="page-stack fade-up"><PageTitle eyebrow="A TRANSPARENT PROCESS" title="Built to help you ask." description="MediLens is an educational companion for medical-report language—not a diagnostic system." />
    <Card className="how-hero"><div className="how-hero-copy"><span className="eyebrow">{tx('THE PRINCIPLE', language)}</span><h2 className="display-font">{tx('Technology can explain words.', language)}<br /><em>{tx('Care belongs in conversation.', language)}</em></h2><p>{tx('Our role is to help you arrive informed, with the source still in view and your questions in hand.', language)}</p></div><div className="how-hero-symbol orbital"><div><ShieldCheck size={29} /><span>{tx('CONTEXT', language)}<br />{tx('MATTERS', language)}</span></div></div></Card>
    <div className="steps-timeline">{steps.map((step, i) => <article className="timeline-step" key={step.num}><div className="timeline-marker"><span>{language === 'ar' ? ['٠١','٠٢','٠٣','٠٤'][i] : step.num}</span>{i < steps.length - 1 && <i />}</div><div className="timeline-content"><div className="timeline-icon"><step.icon size={19} /></div><div><span className="eyebrow">{tx(`STEP ${step.num}`, language)}</span><h2 className="display-font">{tx(step.title, language)}</h2><p>{tx(step.body, language)}</p></div></div></article>)}</div>
    <Card className="training-card">
      <div className="training-card-heading"><span className="training-icon"><FlaskConical size={20} /></span><div><span className="eyebrow">{tx('CLASSIFIER TRAINING', language)}</span><h2>{tx('A small synthetic training set helps organize report sections.', language)}</h2></div></div>
      <div className="training-stats"><div><b>60</b><span>{tx('synthetic training examples', language)}</span></div><div><b>20</b><span>{tx('separate test examples', language)}</span></div><div><b>5</b><span>{tx('document layout labels', language)}</span></div><div><b>1.00</b><span>{tx('macro F1 on this tiny split', language)}</span></div></div>
      <p className="training-caveat"><Info size={16} /> {tx('This score only describes the tiny synthetic test set. It is not clinical validation and must not be used to interpret health results.', language)}</p>
    </Card>
    <div className="two-col-info"><Card><ShieldCheck size={20} /><span className="eyebrow">{tx('PRIVACY', language)}</span><h3>{tx('Your file is transient.', language)}</h3><p>{tx('The file is processed in memory for extraction. MediLens does not retain the uploaded file. Clear the active view to remove it from the current interface.', language)}</p><Link href="/app/settings" className="text-link">{tx('Privacy settings', language)} <ArrowRight size={14} /></Link></Card><Card><CircleHelp size={20} /><span className="eyebrow">{tx('SCOPE', language)}</span><h3>{tx('Learning, not clinical advice.', language)}</h3><p>{tx('We do not diagnose, recommend treatment, or claim clinical validation. Extractions can be incomplete; always confirm the source and consult a clinician.', language)}</p><Link href="/app/sources" className="text-link">{tx('Explore sources', language)} <ArrowRight size={14} /></Link></Card></div>
  </div>;
}

function SourcesPage({ data, loading, error, retry }: { data?: EducationalSource[]; loading: boolean; error: unknown; retry: () => void }) {
  const language = useLanguage();
  return <div className="page-stack fade-up"><PageTitle eyebrow="FOLLOW THE EVIDENCE TRAIL" title="Sources & context." description="Educational references available to support plain-language learning. A source does not validate or interpret an individual report." />
    <div className="source-intro"><span className="source-intro-icon"><ShieldCheck size={20} /></span><div><b>{tx('Traceability matters.', language)}</b><p>{tx('Sources are provided for general education. Always use a qualified clinician for personal interpretation.', language)}</p></div></div>
    {loading ? <LoadingCards /> : error ? <ErrorNotice message={tx('Educational sources could not be loaded.', language)} retry={retry} /> : null}
    {!loading && !error && data?.length === 0 && <Card className="empty-state"><div className="empty-icon"><BookOpen size={24} /></div><h2 className="display-font">{tx('No sources are available right now.', language)}</h2><p>{tx('Try again later. MediLens will never invent a source to fill this space.', language)}</p><Button variant="secondary" onClick={retry}>{tx('Try again', language)}</Button></Card>}
    <div className="source-grid">{data?.map((source, i) => <Card className="source-card interactive-card" key={source.id}><div className="source-card-top"><span className="source-index mono">{tx('REF /', language)} {language === 'ar' ? ['٠١','٠٢','٠٣','٠٤','٠٥'][i] || i + 1 : String(i + 1).padStart(2, '0')}</span><span className="source-verified"><CheckCircle2 size={14} /> {tx('EDUCATIONAL', language)}</span></div><h2>{source.name}</h2><span className="source-publisher">{source.publisher}</span><p>{source.description}</p><a href={source.url} target="_blank" rel="noreferrer" className="source-external">{tx('Visit source', language)} <ArrowUpRight size={14} /><span className="sr-only">{tx(' (opens in a new tab)', language)}</span></a></Card>)}</div>
    <div className="quiet-disclaimer"><Info size={15} /><span>{tx('References provide educational background and are not a substitute for advice from a healthcare professional who knows your situation.', language)}</span></div>
  </div>;
}

function SettingsPage({ theme, setTheme, language, setLanguage, largeText, setLargeText, highContrast, setHighContrast, hasSessionData, onClearSession }: {
  theme: 'light' | 'dark'; setTheme: (value: 'light' | 'dark') => void; language: 'en' | 'ar'; setLanguage: (value: 'en' | 'ar') => void;
  largeText: boolean; setLargeText: (value: boolean) => void; highContrast: boolean; setHighContrast: (value: boolean) => void;
  hasSessionData: boolean; onClearSession: () => void;
}) {
  const confirmClear = () => {
    const message = language === 'ar'
      ? 'سيؤدي ذلك إلى مسح التقرير المفتوح وأسئلة النقاش والشرح من هذه الجلسة. لن يتم حذف أي ملف من الخادم لأن الملفات لا تُحتفظ بها. هل تريد المتابعة؟'
      : 'This clears the open report, discussion questions, and explanation from this session. No server-side deletion is needed because uploaded files are not retained. Continue?';
    if (window.confirm(message)) onClearSession();
  };
  return <div className="page-stack fade-up"><PageTitle eyebrow="MAKE IT YOURS" title="Preferences." description="A comfortable reading experience should adapt to you." />
    <div className="settings-layout">
      <div className="settings-main">
        <Card className="settings-card"><div className="settings-section-heading"><div className="settings-symbol"><Sun size={18} /></div><div><span className="eyebrow">{tx('APPEARANCE', language)}</span><h2>{tx('Choose your atmosphere', language)}</h2></div></div><div className="setting-choice-row"><button className={`theme-choice ${theme === 'light' ? 'theme-choice-active' : ''}`} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}><span className="theme-preview light-preview"><i /><i /><i /></span><span><b>{tx('Daylight', language)}</b><small>{tx('Soft, clear contrast', language)}</small></span>{theme === 'light' && <CheckCircle2 size={16} />}</button><button className={`theme-choice ${theme === 'dark' ? 'theme-choice-active' : ''}`} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}><span className="theme-preview dark-preview"><i /><i /><i /></span><span><b>{tx('Midnight', language)}</b><small>{tx('Low-light reading', language)}</small></span>{theme === 'dark' && <CheckCircle2 size={16} />}</button></div></Card>
        <Card className="settings-card"><div className="settings-section-heading"><div className="settings-symbol"><Globe2 size={18} /></div><div><span className="eyebrow">{tx('LANGUAGE & DIRECTION', language)}</span><h2>{tx('Read in your language', language)}</h2></div></div><div className="language-options"><button className={`language-option ${language === 'en' ? 'language-active' : ''}`} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}><span>EN</span><div><b>English</b><small>{tx('Left-to-right layout', language)}</small></div>{language === 'en' && <Check size={16} />}</button><button className={`language-option ${language === 'ar' ? 'language-active' : ''}`} onClick={() => setLanguage('ar')} aria-pressed={language === 'ar'}><span lang="ar">ع</span><div><b lang="ar">العربية</b><small>{tx('RTL layout enabled', language)}</small></div>{language === 'ar' && <Check size={16} />}</button></div><p className="setting-note">{tx('Glossary entries show Arabic text when available. Interface labels remain in English.', language)}</p></Card>
        <Card className="settings-card"><div className="settings-section-heading"><div className="settings-symbol"><Zap size={18} /></div><div><span className="eyebrow">{tx('ACCESSIBILITY', language)}</span><h2>{tx('Adjust your reading view', language)}</h2></div></div><ToggleRow title={tx('Larger text', language)} description={tx('Increase the base text size throughout the workspace.', language)} checked={largeText} onChange={setLargeText} /><div className="settings-divider" /><ToggleRow title={tx('Higher contrast', language)} description={tx('Strengthen foreground and border contrast.', language)} checked={highContrast} onChange={setHighContrast} /></Card>
      </div>
      <aside className="settings-aside"><Card className="privacy-card"><span className="privacy-seal"><LockKeyhole size={22} /></span><span className="eyebrow">{tx('PRIVACY, PLAINLY', language)}</span><h2 className="display-font">{tx('No file cabinet.', language)}</h2><p>{tx('Uploaded documents are processed transiently for text extraction. MediLens does not retain the file or send its content to an AI provider.', language)}</p><div className="privacy-rule" /><ul><li><Check size={14} /> {tx('Uploads processed transiently', language)}</li><li><Check size={14} /> {tx('No document retention', language)}</li><li><Check size={14} /> {tx('Delete clears the current view', language)}</li></ul><Link href="/app/how-it-works" className="text-link">{tx('Read how it works', language)} <ArrowRight size={14} /></Link><div className="session-clear"><p>{tx('Clear the open uploaded report, clinician questions, and demo explanation from this session. No server deletion is needed.', language)}</p><Button variant="secondary" onClick={confirmClear} disabled={!hasSessionData}><Trash2 size={14} /> {tx('Clear report & notes', language)}</Button>{!hasSessionData && <small>{tx('There is no session content to clear.', language)}</small>}</div></Card><div className="settings-tip"><Info size={15} /><p>{tx('Fictional demonstrations are clearly labeled. Their explanations are educational, not medical advice or clinical validation.', language)}</p></div></aside>
    </div>
  </div>;
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const language = useLanguage();
  return <div className="toggle-row"><div><b>{tx(title, language)}</b><p>{tx(description, language)}</p></div><button className={`switch-control ${checked ? 'switch-on' : ''}`} role="switch" aria-checked={checked} aria-label={tx(title, language)} onClick={() => onChange(!checked)}><span /></button></div>;
}

function NotFound() {
  return <div className="page-stack"><PageTitle eyebrow="NOT FOUND" title="That page isn’t here." description="The path may have changed. Head back to your workspace." /><Link href="/app" className="button button-primary">Return to overview <ArrowLeft size={15} /></Link></div>;
}

function RoutedBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><RoutedBoundary><AppRoot /></RoutedBoundary><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
