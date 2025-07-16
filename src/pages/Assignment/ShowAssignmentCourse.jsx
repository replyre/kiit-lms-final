import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Upload,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useCourse } from "../../context/CourseContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllCourseAssignments,
  submitAssignment,
} from "../../services/assignment.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../../utils/LoadingAnimation";

const StudentAssignmentSectionCourse = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { courseData } = useCourse();
  const navigate = useNavigate();
  
  // Get parameters from URL
  const { courseID, selectedID } = useParams();

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      console.log(courseID);
      const data = await getAllCourseAssignments({ courseID });

      setAssignments(data.assignments);

      // Find the selected assignment by ID
      if (data && data.assignments.length > 0) {
        const foundAssignment = data.assignments.find(
          assignment => assignment._id === selectedID
        );
        
        if (foundAssignment) {
          console.log("Found assignment:", foundAssignment);
          setSelectedAssignment(foundAssignment);
        } else {
          // If selectedID doesn't match any assignment, select the first one
          console.log("Assignment not found, selecting first assignment");
          setSelectedAssignment(data.assignments[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchAssignments();
    }
  }, [courseID, selectedID]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedAssignment) return;

    try {
      // Create FormData object
      const formData = new FormData();

      // Add the file with key 'submissionFile' as shown in the Postman screenshot
      formData.append("submissionFile", selectedFile);

      // Call the submitAssignment function
      const response = await submitAssignment(selectedAssignment._id, formData);

      console.log("Assignment submitted successfully:", response);

      // Show success message
      toast.success("Assignment submitted successfully!");

      // Clear selected file
      setSelectedFile(null);

      // Refresh assignments if needed
      fetchAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error(`Failed to submit assignment: ${error.message}`);
    }
  };

  const handleAssignmentSelect = (assignment) => {
    setSelectedAssignment(assignment);
    // Update URL to reflect the selected assignment
    navigate(`/student/assignment/${courseID}/${assignment._id}`);
  };

  const handleBackToAssignments = () => {
    navigate('/student/dashboard'); // Adjust this path to your assignments list route
  };

  const getCurrentSubmission = () => {
    if (!selectedAssignment || !courseData?.student?.id) return null;

    return selectedAssignment.submissions.find(
      (submission) => submission.student === courseData.student.id
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!assignments || assignments.length === 0)
    return <div className="p-4">No assignments found.</div>;

  const submission = getCurrentSubmission();

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 p-4 border-r min-h-screen">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackToAssignments}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">Assignments</h2>
        </div>
        <div className="space-y-2">
          {assignments.map((assignment) => {
            const hasSubmitted = assignment.submissions.some(
              (sub) => sub.student === courseData?.student?.id
            );

            return (
              <div
                key={assignment._id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedAssignment?._id === assignment._id
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleAssignmentSelect(assignment)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{assignment.title}</h3>
                  {hasSubmitted && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Submitted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Due: {formatDate(assignment.dueDate)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      {selectedAssignment && (
        <div className="w-3/4">
          <div className="space-y-6 max-w-7xl m-auto py-6 px-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedAssignment.title}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Course: {courseData?.title || "Loading course..."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Due: {formatDate(selectedAssignment.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAssignment.totalPoints} points
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Assignment Details
                  </h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedAssignment.description}</p>
                    <h3 className="text-lg font-semibold mt-4">
                      Requirements:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Complete all questions in the provided worksheet</li>
                      <li>Show your work for calculations</li>
                      <li>Include your name and student ID</li>
                    </ul>
                  </div>

                  {selectedAssignment.attachments &&
                    selectedAssignment.attachments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold">Attachments:</h3>
                        <div className="mt-2 space-y-2">
                          {selectedAssignment.attachments.map((attachment) => (
                            <a
                              key={attachment._id}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                            >
                              <FileText className="h-4 w-4" />
                              <span>{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {submission ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold">
                        Your Submission
                      </h2>
                      <span className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Submitted</span>
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <a
                          href={submission.submissionFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                        >
                          <FileText className="h-5 w-5" />
                          <span>View Your Submission</span>
                        </a>
                        <p className="text-sm text-gray-500 mt-2">
                          Submitted on: {formatDate(submission.submissionDate)}
                        </p>
                      </div>
                      {submission.feedback && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-gray-900">
                            Feedback
                          </h3>
                          <p className="text-gray-600 mt-2">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                      {submission.grade !== undefined && submission.grade !== null && (
                        <div className="mt-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {submission.grade}
                          </span>
                          <span className="text-gray-600">
                            /{selectedAssignment.totalPoints}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      Submit Assignment
                    </h2>
                    {new Date(selectedAssignment.dueDate) - new Date() > 0 ||
                    selectedAssignment.isActive ? (
                      <div className="space-y-4">
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                          onClick={() =>
                            document.getElementById("file-upload").click()
                          }
                        >
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            {selectedFile
                              ? `Selected: ${selectedFile.name}`
                              : "Drag and drop your files here, or click to select files"}
                          </p>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.zip"
                          />
                          <button
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            onClick={() =>
                              document.getElementById("file-upload").click()
                            }
                          >
                            Select Files
                          </button>
                        </div>
                        <button
                          className={`w-full px-4 py-2 rounded-lg transition-colors ${
                            selectedFile
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          onClick={handleSubmit}
                          disabled={!selectedFile}
                        >
                          Submit Assignment
                        </button>
                      </div>
                    ) : (
                      <div className="border border-amber-200 bg-amber-50 rounded-lg p-6 text-center space-y-3">
                        <Clock className="h-8 w-8 text-amber-500 mx-auto" />
                        <h3 className="text-lg font-medium text-amber-800">
                          Submission Unavailable
                        </h3>
                        <p className="text-amber-700">
                          {new Date(selectedAssignment.dueDate) - new Date() < 0
                            ? "This assignment has passed its due date and is no longer accepting submissions."
                            : "This assignment is not currently accepting submissions."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Assignment Status
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      {new Date(selectedAssignment.dueDate) - new Date() > 0 ||
                      selectedAssignment.isActive ||
                      submission ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            submission
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {submission ? "Submitted" : "Pending"}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                          Not Submitted
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Due Date</span>
                      <span className="text-gray-900">
                        {formatDate(selectedAssignment.dueDate)}
                      </span>
                    </div>
                    {submission && submission.grade !== undefined && submission.grade !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Grade</span>
                        <span className="text-gray-900">
                          {submission.grade}/{selectedAssignment.totalPoints}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Resources</h2>
                  <div className="space-y-3">
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-green-600 hover:text-green-700"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Assignment Guidelines</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-green-600 hover:text-green-700"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Grading Rubric</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentSectionCourse;