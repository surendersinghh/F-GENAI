const { GoogleGenAI } = require("@google/genai");
const z = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

//serive for whole content creation including
// technical Q, behavioral Q, skill Gaps, preparation plan
const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 to 100 indicating how well the candidate's profile matches the job description",
    ),

  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The techincal question can be asked in the interview."),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking the question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, What approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with thier intention and how to answer them.",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The techincal question can be asked in the interview."),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking the question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, What approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with thier intention and how to answer them.",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skil which candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of this skill gap etc."),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with thier severity",
    ),

  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .string()
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specifc book, including learning topics, practice exercises, projects, revision, and interview preparaton activities.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation for the candidate to follow in order to prepare for the interview effectively.",
    ),
  title: z
    .string()
    .describe("The title of the job for which the interview is gernerated"),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical interviewer and career coach.

Analyze the given Resume, Self Description, and Job Description.

Return ONLY valid JSON matching this structure exactly:


Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  // console.log("RAW RESPONSE");
  // console.log(response.text);

  const data = JSON.parse(response.text);

  console.log(typeof data); // object aana chahiye
  console.log(data);

  const parsed = interviewReportSchema.safeParse(data);
  if (!parsed.success) {
    console.error(parsed.error.format());
    throw new Error("Invalid AI response");
  }

  return parsed.data;
}

//service for only pdf creation on the behalf of job description

const resumePdfSchema = z.object({
  html: z
    .string()
    .describe(
      "The HTML of the resume which can be converted to PDF using any library like puppeteer.",
    ),
});

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: ["load", "networkidle0"] });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Genrate a resume for a candidate with the following details:
  Resume: ${resume},
  Self Description: ${selfDescription},
  Job Description: ${jobDescription},

  the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
  The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
  The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
  you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
  The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
  The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
  Do not use JavaScript.
  Keep the resume to 1–2 A4 pages.
  Use professional fonts (Arial, Calibri, Helvetica).
  Ensure all sections fit within A4 margins.
  Avoid fixed positioning unless necessary.
  Avoid page breaks inside Experience, Education, or Projects sections.
  Use semantic HTML (header, section, h1, h2, ul, li).
  Make it ATS-friendly (single-column layout, no tables for main content).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
