import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const StudentProfilePage = () => {
  const navigate = useNavigate();

  const initialStudentDetails = {
    name: "Alexa Thompson",
    course: "Computer Science",
    year: "3rd Year",
    studentId: "CS2021034",
    email: "alex.thompson@university.edu",
    phone: "+1 (555) 123-4567",
    location: "University Campus, Block B",
    specialization: "Artificial Intelligence & Machine Learning",
  };

  const [studentDetails, setStudentDetails] = useState(initialStudentDetails);
  const [editMode, setEditMode] = useState(false);
  const { user } = useAuth();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const feeStructure = {
    tuitionPerSemester: "$12,000",
    labFees: "$800",
    libraryFees: "$200",
    activityFees: "$300",
    totalPerYear: "$26,600",
  };

  const handleDownloadBrochure = () => {
    console.log("Downloading course brochure...");
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
  };

  const handleSave = () => {
    console.log("Saved student details:", studentDetails);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent1/10 to-accent/20 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-accent1/80 hover:text-accent1 border-2 rounded-lg border-accent1/90 p-2 hover:"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <button
            onClick={editMode ? handleSave : handleEditToggle}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              editMode
                ? "bg-accent1/80 text-white hover:bg-accent1"
                : "bg-accent1/20 border border-accent1 text-accent1/80 hover:bg-accent1/10"
            }`}
          >
            {editMode ? "Save Changes" : "Edit"}
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-accent1/80 to-accent1 h-16"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-36 h-40 rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://app.xmu.edu.my/AskA/Documents/SampleEcard.jpg"
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.name}
                </h1>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 text-gray-600 text-sm">
                  <span className="flex items-center gap-1">
                    {studentDetails.course}
                  </span>
                  <span className="text-accent1 font-semibold">
                    {studentDetails.year}
                  </span>
                  <span className="text-gray-500">
                    ID: {studentDetails.studentId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Contact Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["email", "phone", "location"].map((field) => (
              <div
                key={field}
                className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1"
              >
                <label
                  htmlFor={field}
                  className="text-sm text-gray-500 font-medium capitalize"
                >
                  {field}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name={field}
                    id={field}
                    value={studentDetails[field]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent1"
                  />
                ) : (
                  <span className="text-gray-700">{studentDetails[field]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specialization */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Specialization
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
            {studentDetails.specialization}
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Fee Structure
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {Object.entries(feeStructure).map(([key, value], index) => (
              <div
                key={key}
                className={`p-4 rounded-lg ${
                  index === Object.entries(feeStructure).length - 1
                    ? "bg-accent1/10 col-span-2"
                    : "bg-gray-50"
                }`}
              >
                <div className="text-sm text-gray-600 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </div>
                <div
                  className={`font-semibold ${
                    index === Object.entries(feeStructure).length - 1
                      ? "text-accent1 text-lg"
                      : "text-gray-800"
                  }`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <button
            onClick={handleDownloadBrochure}
            className="bg-gradient-to-r from-accent1/80 to-accent1 hover:from-accent1 hover:to-accent1 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Download Brochure</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
