import React, { useState } from "react";
import { createAssignment } from "../../../services/assignment.service";

const AssignmentForm = ({ courseID, fetchAssignments }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // AI Question Generator states
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [selectedBloomLevel, setSelectedBloomLevel] = useState("");
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [aiError, setAiError] = useState(null);

  // Course outcomes options
  const courseOutcomes = [
    "Identify different types of concrete and its properties.",
    "Determine the workability of concrete.",
    "Determine strength and durability of concrete.",
    "Design concrete mixes for the given conditions.",
    "Perform tests of hardened concrete.",
    "Select types of admixture and special concrete for given condition.",
  ];

  // Bloom's taxonomy levels
  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];

  // Handle file upload - accept multiple PDFs
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments((prevAttachments) => [...prevAttachments, ...newFiles]);
    }
  };

  // Remove selected file by index
  const handleRemoveFile = (index) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  // Generate question using the API
  const generateQuestion = async () => {
    if (!selectedOutcome || !selectedBloomLevel) {
      setAiError(
        "Please select both a course outcome and a Bloom's taxonomy level"
      );
      return;
    }

    setGeneratingQuestion(true);
    setAiError(null);

    try {
      // Mock the API response for development until CORS is resolved
      // In a real-world scenario, you would use a proper backend proxy

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a mock response based on the selected outcome and bloom level
      let mockResponse;

      // Generate a contextually relevant question based on selection
      const outcomeKeyword = selectedOutcome.split(" ")[1]; // Extract key term from outcome
      const bloomLevelLower = selectedBloomLevel.toLowerCase();

      if (
        bloomLevelLower === "analyze" &&
        selectedOutcome.includes("hardened concrete")
      ) {
        mockResponse = {
          questions: {
            subjective:
              "Compare and contrast the rebound hammer test and ultrasonic pulse velocity test for evaluating hardened concrete strength. What factors might affect the accuracy of each method?",
          },
        };
      } else if (
        bloomLevelLower === "apply" &&
        selectedOutcome.includes("hardened concrete")
      ) {
        mockResponse = {
          questions: {
            subjective:
              "A concrete structure shows signs of surface scaling. Describe the test procedures you would use to evaluate the extent of damage and determine the remaining strength of the concrete.",
          },
        };
      } else if (
        bloomLevelLower === "evaluate" &&
        selectedOutcome.includes("admixture")
      ) {
        mockResponse = {
          questions: {
            subjective:
              "Evaluate the effectiveness of using a superplasticizer admixture in a high-strength concrete mix. What criteria would you use to determine if it's the optimal choice for a high-rise building project?",
          },
        };
      } else if (
        bloomLevelLower === "create" &&
        selectedOutcome.includes("concrete mixes")
      ) {
        mockResponse = {
          questions: {
            subjective:
              "Design a concrete mix for a marine structure exposed to seawater splashing. Specify all components, proportions, and justify your choices based on durability requirements.",
          },
        };
      } else if (
        bloomLevelLower === "understand" &&
        selectedOutcome.includes("workability")
      ) {
        mockResponse = {
          questions: {
            subjective:
              "Explain how temperature and humidity affect the workability of fresh concrete and how these factors should be accounted for in field conditions.",
          },
        };
      } else if (
        bloomLevelLower === "remember" &&
        selectedOutcome.includes("types of concrete")
      ) {
        mockResponse = {
          questions: {
            subjective:
              "List five different types of specialized concrete and state one primary application for each type.",
          },
        };
      } else {
        // Generic fallback based on bloom level and outcome
        let questionStarter = "";

        switch (bloomLevelLower) {
          case "remember":
            questionStarter = "Define and list the key characteristics of";
            break;
          case "understand":
            questionStarter = "Explain the principles behind";
            break;
          case "apply":
            questionStarter = "Demonstrate how you would apply";
            break;
          case "analyze":
            questionStarter = "Analyze the factors that influence";
            break;
          case "evaluate":
            questionStarter = "Evaluate the effectiveness of";
            break;
          case "create":
            questionStarter = "Design a solution using";
            break;
          default:
            questionStarter = "Discuss";
        }

        mockResponse = {
          questions: {
            subjective: `${questionStarter} ${outcomeKeyword} with respect to ${selectedOutcome.toLowerCase()}`,
          },
        };
      }

      const data = mockResponse;

      // Extract subjective question and add it to the history
      if (data.questions && data.questions.subjective) {
        const newQuestion = {
          question: data.questions.subjective,
          outcome: selectedOutcome,
          bloomLevel: selectedBloomLevel,
        };

        setGeneratedQuestions((prev) => [newQuestion, ...prev]);
      } else {
        throw new Error("No subjective question was generated");
      }
    } catch (err) {
      console.error("Error generating question:", err);
      setAiError(
        err.message || "Failed to generate question. Please try again."
      );
    } finally {
      setGeneratingQuestion(false);
    }
  };

  // Add selected question to description
  const addQuestionToDescription = (question) => {
    // Add "Q)" prefix to the question
    const formattedQuestion = `Q) ${question}`;

    // If description is empty, just add the question
    if (!description.trim()) {
      setDescription(formattedQuestion);
    } else {
      // Otherwise, append the question to the existing description
      setDescription((prev) => `${prev}\n\n${formattedQuestion}`);
    }
  };

  // Remove question from the list
  const removeQuestion = (indexToRemove) => {
    setGeneratedQuestions((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();

      // Append text fields exactly as shown in Postman
      formData.append("title", title);
      formData.append("description", description);
      formData.append("totalPoints", totalPoints.toString());
      formData.append("dueDate", dueDate);

      // Append multiple attachments
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // Call the createAssignment service function
      const result = await createAssignment(courseID, formData);

      // Handle success
      setSuccess(true);

      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setAttachments([]);
      setTotalPoints(100);
      setDueDate("");
      setTimeout(() => {
        fetchAssignments();
      }, 1000);
    } catch (err) {
      // Handle error
      setError(
        err.response?.data?.message ||
          "Failed to create assignment. Please try again."
      );
      console.error("Error creating assignment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full p-6 max-h-[90vh] overflow-y-auto"
    >
      {/* Left Section - Assignment Form */}
      <div className="w-2/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Create Assignment</h2>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded mb-4"
          placeholder="Description"
          rows="8"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* AI Question Generator */}
        <div className="mb-6 p-4 border rounded border-blue-200 bg-blue-50">
          <h3 className="text-md font-semibold mb-2 text-blue-700">
            AI Question Generator
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Outcome
              </label>
              <select
                className="w-full border p-2 rounded"
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
              >
                <option value="">Select a Course Outcome</option>
                {courseOutcomes.map((outcome, index) => (
                  <option key={index} value={outcome}>
                    {outcome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Bloom's Level
              </label>
              <select
                className="w-full border p-2 rounded"
                value={selectedBloomLevel}
                onChange={(e) => setSelectedBloomLevel(e.target.value)}
              >
                <option value="">Select a Bloom's Level</option>
                {bloomLevels.map((level, index) => (
                  <option key={index} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 mb-3"
            onClick={generateQuestion}
            disabled={
              generatingQuestion || !selectedOutcome || !selectedBloomLevel
            }
          >
            {generatingQuestion ? "Generating..." : "Generate Question"}
          </button>

          {aiError && (
            <div className="text-red-600 text-sm mb-3">{aiError}</div>
          )}

          {/* Generated Questions Display */}
          {generatedQuestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-2">
                Generated Questions:
              </h4>
              <div className="space-y-3">
                {generatedQuestions.map((item, index) => (
                  <div key={index} className="p-3 border rounded bg-white">
                    <div className="flex justify-between items-start">
                      <p className="text-sm mb-2">{item.question}</p>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 ml-2 text-sm"
                        title="Remove question"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-between mt-2">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        onClick={() => addQuestionToDescription(item.question)}
                      >
                        Use This Question
                      </button>
                      <div className="text-xs text-gray-500">
                        {item.bloomLevel} - {item.outcome.substring(0, 30)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section - PDF only, multiple files */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Attachments (PDF only)
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Files Preview Section */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">
                Selected Attachments ({attachments.length})
              </h4>
              <div className="border rounded p-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">📄</span>
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/3 p-4 bg-gray-100 shadow-md rounded-lg ml-4">
        <h3 className="text-md font-semibold mb-2">Assignment Settings</h3>

        <div className="mb-4">
          <label className="block font-medium">Total Points</label>
          <select
            className="w-full border p-2 rounded"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
          >
            <option value="100">4</option>
            <option value="50">3</option>
            <option value="25">2</option>
            <option value="10">1</option>
            <option value="0">Ungraded</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium">Due Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading || !title || !dueDate}
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>

        {/* Display success or error message */}
        {success && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            Assignment created successfully!!!
          </div>
        )}

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </form>
  );
};

export default AssignmentForm;
