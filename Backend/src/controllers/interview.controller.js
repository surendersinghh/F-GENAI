const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterViewController(req, res) {
  const resumeFile = req.file;
  // console.log("===========");
  //   console.log("req.file:", req.file);
  //   console.log("req.body:", req.body);
  //   console.log("===========");

  const resumeContent = await new pdfParse.PDFParse(
    Uint8Array.from(resumeFile.buffer),
  ).getText();
  const { selfDescription, jobDescription } = req.body;

  const interViewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interViewReportByAi,
  });

  res.status(201).json({
    message: "Interview report generated successfuly",
    interviewReport,
  });
}

/**
 * @description Controller to get interview report by interviewId.
 */

async function getInterviewReportByIdController(req, res) {
  console.log("Interview ID:", req.params.interviewId);
  const { interviewId } = req.params;

  if (!interviewId || interviewId === "undefined") {
    return res.status(400).json({
      message: "Invalid interview id",
    });
  }

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */

async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({
      user: req.user.id,
    })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -JobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully",
    interviewReports,
  });
}

/**
 *@description Controller to gernerate resume PDF based on user self description, resume and job description.
 */

async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;

  const interviewReport =
    await interviewReportModel.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found",
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; fileName=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
}

module.exports = {
  generateInterViewController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
