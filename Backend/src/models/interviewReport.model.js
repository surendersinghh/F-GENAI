const mongoose = require("mongoose");

/**
 * Heading - Users send data to the server and server send to the AI MODEL  
 * 
 * - Job description schema
 * - resume text
 * - Self description
 * 
 * - MatchScore : Number
 * 
 * 
 * Heading - AI analyze and send data back to the users
 * 
 * - Technical questions : [{
 *                      question: "",
 *                      intention: "",
 *                      answers: ""
 *     }]
 * 
 * - Behavioral questions : [{
 *                      question: "",
 *                      intention: "",
 *                      answers: ""
 *     }]
 * 
 * - Skill Gaps : [{
 *                      skil: "",
 *                      soverity: {
 *              type: string,
 *              enum :["low", "medium", "high"]    
 *     }
 *     }]
 * 
 * - Preparation Plan: [{
 *                       day: number,
 *                       focus: string,
 *                       tasks: [string]
 * }]
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required"],
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type:String,
        required: [true, "Answer is required"],
    },
}, {
    _id: false
})


const behavioralQuestionSchema = new mongoose.Schema({
     question: {
        type: String,
        required: [true, "Technical question is required"],
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type:String,
        required: [true, "Answer is required"],
    }
}, {
    _id: false
})


const skillGapsSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"],
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required"],
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"],
    },
    focus: {
        type: String,
        required: [true, "Focus is required"],
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
})


const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapsSchema ],
    preparationPlan: [ preparationPlanSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: [true, "job title is required"],
    },
}, {
    timestamps: true
})


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);
module.exports = interviewReportModel;