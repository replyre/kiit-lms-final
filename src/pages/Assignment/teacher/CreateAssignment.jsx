import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Upload,
  Sparkles,
  FileText,
  Edit,
  Trash,
  Eye,
  Calendar,
  Clock,
  BookOpen,
  Target,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

// Dummy course data (you can replace this with useCourse hook)
const courseData = {
  id: "68a42cbdefa0d4e7c4f41706",
  title: "Fundamentals of Probability and Statistics",
  courseCode: "CS101",
  syllabus: {
    modules: [
      {
        _id: "68a42cbdefa0d4e7c4f41714",
        name: "Descriptive Statistics and Data Analysis",
        moduleNumber: 1
      },
      {
        _id: "68a42cbdefa0d4e7c4f41716", 
        name: "Probability Theory",
        moduleNumber: 2
      }
    ]
  }
};

// Dummy questions for AI generation
const dummyAIQuestions = [
  {
    id: 1,
    question: "What is the difference between population and sample in statistics?",
    type: "subjective",
    bloomLevel: "understand",
    courseOutcome: "CO1",
    options: null
  },
  {
    id: 2,
    question: "Calculate the mean of the following dataset: 5, 10, 15, 20, 25",
    type: "subjective",
    bloomLevel: "apply",
    courseOutcome: "CO1",
    options: null
  },
  {
    id: 3,
    question: "Which of the following is a measure of central tendency?",
    type: "objective",
    bloomLevel: "remember",
    courseOutcome: "CO1",
    options: ["Mean", "Range", "Variance", "Standard Deviation"],
    correctAnswer: "Mean"
  },
  {
    id: 4,
    question: "The probability of an impossible event is:",
    type: "objective", 
    bloomLevel: "remember",
    courseOutcome: "CO2",
    options: ["0", "1", "0.5", "Infinity"],
    correctAnswer: "0"
  },
  {
    id: 5,
    question: "Explain Bayes' theorem and provide a real-world example of its application.",
    type: "subjective",
    bloomLevel: "analyze",
    courseOutcome: "CO2",
    options: null
  }
];

const courseOutcomes = [
  "CO1: Master fundamental concepts of probability theory and statistical inference",
  "CO2: Apply various probability distributions to real-world problems", 
  "CO3: Perform hypothesis testing and statistical analysis on datasets",
  "CO4: Understand correlation, regression, and predictive modeling",
  "CO5: Interpret statistical results and draw meaningful conclusions from data"
];

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const questionTypes = ["Objective", "Subjective"];

// STEP 1: Moved StepIndicator outside the main component
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((step, index) => (
      <div key={step.number} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
            step.number === currentStep ? 'bg-blue-500' : 
            step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {step.number < currentStep ? <CheckCircle2 size={20} /> : step.number}
          </div>
          <div className="text-center mt-2">
            <div className={`font-medium ${step.number === currentStep ? 'text-blue-600' : 'text-gray-600'}`}>
              {step.title}
            </div>
            <div className="text-sm text-gray-500">{step.subtitle}</div>
          </div>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-24 h-0.5 mx-4 ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
        )}
      </div>
    ))}
  </div>
);

// STEP 2: Moved AssignmentDetailsStep outside and passed props
const AssignmentDetailsStep = ({
  assignmentTitle, setAssignmentTitle,
  description, setDescription,
  instructions, setInstructions,
  selectedModule, setSelectedModule,
  totalPoints, setTotalPoints,
  dueDate, setDueDate,
  dueTime, setDueTime
}) => (
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center gap-2 mb-6">
      <BookOpen className="text-blue-500" size={24} />
      <h2 className="text-2xl font-bold">Assignment Details</h2>
      <p className="text-gray-600 ml-2">Configure the basic information for your assignment</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Section - Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Brief description of the assignment"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <input
                type="text"
                value={`${courseData.courseCode} - ${courseData.title}`}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select module</option>
                {courseData.syllabus.modules.map(module => (
                  <option key={module._id} value={module._id}>
                    Module {module.moduleNumber}: {module.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Right Section - Instructions and Scheduling */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="6"
              placeholder="Use clear, concise language. Include any special requirements or resources students will need."
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Scheduling</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Points</label>
              <select
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={100}>100</option>
                <option value={50}>50</option>
                <option value={25}>25</option>
                <option value={10}>10</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// STEP 3: Moved QuestionsStep outside and passed props
const QuestionsStep = ({
  questions, activeTab, setActiveTab,
  uploadedFile, handleFileUpload,
  numQuestions, setNumQuestions,
  selectedBloomLevel, setSelectedBloomLevel,
  selectedModule2, setSelectedModule2,
  additionalContext, setAdditionalContext,
  generating, generateAIQuestions,
  editQuestion, removeQuestion
}) => (
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Sparkles className="text-blue-500" size={24} />
        <div>
          <h2 className="text-2xl font-bold">Questions</h2>
          <p className="text-gray-600">Upload or generate questions for your assignment</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{questions.length} questions</span>
        {questions.length > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={16} />
            <span className="text-sm text-green-600">Ready</span>
          </div>
        )}
      </div>
    </div>
    {/* Tab Navigation */}
    <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-fit">
      {[
        { key: "upload", icon: Upload, label: "Upload Questions" },
        { key: "generate", icon: Sparkles, label: "AI Generate" },
        { key: "list", icon: FileText, label: `Question List (${questions.length})` }
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
    {/* Tab Content */}
    <div className="min-h-[500px]">
      {activeTab === "upload" && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Question File</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV, Excel, or JSON file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Choose File
            </label>
            {uploadedFile && (
              <p className="mt-2 text-sm text-green-600">
                Uploaded: {uploadedFile.name}
              </p>
            )}
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Supported Formats:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• <strong>CSV:</strong> question, type, option_a, option_b, option_c, option_d, correct_answer</div>
              <div>• <strong>Excel:</strong> Same structure as CSV with columns</div>
              <div>• <strong>JSON:</strong> Array of question objects with properties: question, type, options[], correctAnswer</div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Sample JSON Format:</h5>
              <pre className="text-xs text-blue-800 bg-white p-2 rounded border overflow-x-auto">
{`[
{
  "question": "What is statistics?",
  "type": "subjective",
  "options": null,
  "correctAnswer": null
},
{
  "question": "Which is a measure of central tendency?", 
  "type": "objective",
  "options": ["Mean", "Range", "Variance", "Mode"],
  "correctAnswer": "Mean"
}
]`}
              </pre>
            </div>
          </div>
        </div>
      )}
      {activeTab === "generate" && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold">AI Question Generator</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                min="1"
                max="20"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bloom Taxonomy Level</label>
              <select
                value={selectedBloomLevel}
                onChange={(e) => setSelectedBloomLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select level</option>
                {bloomLevels.map(level => (
                  <option key={level} value={level.toLowerCase()}>{level}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Module</label>
              <select
                value={selectedModule2}
                onChange={(e) => setSelectedModule2(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select topic</option>
                {courseData.syllabus.modules.map(module => (
                  <option key={module._id} value={module._id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Provide any additional context, specific concepts, or requirements for the questions..."
              />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Generation Preview</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {numQuestions} questions will be generated</li>
              <li>• Complexity: {selectedBloomLevel || "Not specified"}</li>
              <li>• Topic: {selectedModule2 ? courseData.syllabus.modules.find(m => m._id === selectedModule2)?.name : "Not specified"}</li>
            </ul>
          </div>
          <button
            onClick={generateAIQuestions}
            disabled={generating || !numQuestions}
            className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Questions
              </>
            )}
          </button>
        </div>
      )}
      {activeTab === "list" && (
        <div className="bg-white rounded-lg shadow-sm border">
          {questions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Added</h3>
              <p className="text-gray-600 mb-4">Upload a file or generate questions using AI to get started.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload Questions
                </button>
                <button
                  onClick={() => setActiveTab("generate")}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  Generate with AI
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Q{index + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          q.type === 'objective' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {q.type === 'objective' ? 'MCQ' : 'Subjective'}
                        </span>
                        {q.source === 'ai' && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Sparkles size={10} />
                            AI Generated
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editQuestion(q.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-900 mb-3">{q.question}</p>
                    {q.type === 'objective' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded border text-sm ${
                              q.correctAnswer === option
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            {option}
                            {q.correctAnswer === option && (
                              <CheckCircle2 className="inline ml-2" size={14} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(q.bloomLevel || q.courseOutcome) && (
                      <div className="flex gap-2 mt-3">
                        {q.bloomLevel && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {q.bloomLevel}
                          </span>
                        )}
                        {q.courseOutcome && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {q.courseOutcome}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

// STEP 4: Moved ReviewStep outside and passed props
const ReviewStep = ({
  questions, assignmentTitle, description, selectedModule,
  totalPoints, dueDate, dueTime, loading, handleSave
}) => {
  const objectiveQuestions = questions.filter(q => q.type === 'objective').length;
  const subjectiveQuestions = questions.filter(q => q.type === 'subjective').length;
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="text-blue-500" size={24} />
        <div>
          <h2 className="text-2xl font-bold">Review & Publish</h2>
          <p className="text-gray-600">Review your assignment details and publish when ready</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assignment Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Assignment Summary</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{assignmentTitle || "Untitled Assignment"}</h4>
              <p className="text-sm text-gray-600">{description || "No description provided"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">COURSE</div>
                <div className="font-medium">{courseData.courseCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">MODULE</div>
                <div className="font-medium">
                  {selectedModule ? courseData.syllabus.modules.find(m => m._id === selectedModule)?.name : "Not selected"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">POINTS</div>
                <div className="font-medium">{totalPoints}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">QUESTIONS</div>
                <div className="font-medium">{questions.length}</div>
              </div>
            </div>
            {dueDate && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Calendar className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-900">
                  Due: {new Date(dueDate + "T" + dueTime).toLocaleDateString()} at {dueTime}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Question Review Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Question Review Status</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{questions.length}</div>
              <div className="text-sm text-green-600">Total</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{objectiveQuestions}</div>
              <div className="text-sm text-blue-600">Objective</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{subjectiveQuestions}</div>
              <div className="text-sm text-purple-600">Subjective</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Questions Overview</h4>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-sm text-gray-600">No questions added yet</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {questions.map((q, index) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                    <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{q.question}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        q.type === 'objective' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {q.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Final Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Ready to Publish?</h3>
            <p className="text-sm text-gray-600">Once published, students will be able to see and submit this assignment.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !assignmentTitle || questions.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Publish Assignment
              </>
            )}
          </button>
        </div>
        {(!assignmentTitle || questions.length === 0) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={16} />
              <p className="text-sm text-yellow-800">
                Please provide an assignment title and add at least one question before publishing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AssignmentCreator = ({ onBack, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Assignment Details State
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("upload"); // upload, generate, list
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // AI Generator State
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedBloomLevel, setSelectedBloomLevel] = useState("");
  const [selectedModule2, setSelectedModule2] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);

  const steps = [
    { number: 1, title: "Assignment Details", subtitle: "Basic information and settings" },
    { number: 2, title: "Questions", subtitle: "Upload or generate questions" },
    { number: 3, title: "Review & Publish", subtitle: "Review and publish assignment" }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      parseUploadedFile(file);
    }
  };

  const parseUploadedFile = (file) => {
    const sampleQuestions = [
      { id: Date.now() + 1, question: "What is the standard deviation?", type: "subjective", options: null, correctAnswer: null, source: "uploaded" },
      { id: Date.now() + 2, question: "Which is a probability distribution?", type: "objective", options: ["Normal", "Abnormal", "Informal", "Formal"], correctAnswer: "Normal", source: "uploaded" }
    ];
    setQuestions(prev => [...prev, ...sampleQuestions]);
  };

  const generateAIQuestions = () => {
    setGenerating(true);
    setTimeout(() => {
      const randomQuestions = dummyAIQuestions.sort(() => Math.random() - 0.5).slice(0, numQuestions).map(q => ({ ...q, id: Date.now() + Math.random(), source: "ai" }));
      setQuestions(prev => [...prev, ...randomQuestions]);
      setGenerating(false);
    }, 2000);
  };

  const removeQuestion = (id) => setQuestions(prev => prev.filter(q => q.id !== id));
  const editQuestion = (id) => console.log("Edit question", id);

  const handleNext = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      const assignmentData = { title: assignmentTitle, description, instructions, module: selectedModule, totalPoints, dueDate, dueTime, questions };
      console.log("Saving assignment:", assignmentData);
      onSave?.(assignmentData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              Back to Assignments
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-2xl font-bold">Create Assignment</h1>
              <p className="text-gray-600">Design and configure your assignment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <StepIndicator steps={steps} currentStep={currentStep} />
          
          <div className="mt-8">
            {currentStep === 1 && (
              <AssignmentDetailsStep
                assignmentTitle={assignmentTitle} setAssignmentTitle={setAssignmentTitle}
                description={description} setDescription={setDescription}
                instructions={instructions} setInstructions={setInstructions}
                selectedModule={selectedModule} setSelectedModule={setSelectedModule}
                totalPoints={totalPoints} setTotalPoints={setTotalPoints}
                dueDate={dueDate} setDueDate={setDueDate}
                dueTime={dueTime} setDueTime={setDueTime}
              />
            )}
            {currentStep === 2 && (
              <QuestionsStep
                questions={questions} activeTab={activeTab} setActiveTab={setActiveTab}
                uploadedFile={uploadedFile} handleFileUpload={handleFileUpload}
                numQuestions={numQuestions} setNumQuestions={setNumQuestions}
                selectedBloomLevel={selectedBloomLevel} setSelectedBloomLevel={setSelectedBloomLevel}
                selectedModule2={selectedModule2} setSelectedModule2={setSelectedModule2}
                additionalContext={additionalContext} setAdditionalContext={setAdditionalContext}
                generating={generating} generateAIQuestions={generateAIQuestions}
                editQuestion={editQuestion} removeQuestion={removeQuestion}
              />
            )}
            {currentStep === 3 && (
              <ReviewStep
                questions={questions} assignmentTitle={assignmentTitle} description={description}
                selectedModule={selectedModule} totalPoints={totalPoints} dueDate={dueDate}
                dueTime={dueTime} loading={loading} handleSave={handleSave}
              />
            )}
          </div>

          {currentStep < 3 && (
            <div className="flex justify-between mt-12 max-w-6xl mx-auto">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !assignmentTitle}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AssignmentSectionRevamp({ onSave, onCancel }) {
  return (
    <AssignmentCreator 
      onBack={onCancel}
      onSave={(data) => {
        console.log("Assignment saved:", data);
        onSave(data);
      }}
    />
  );
}