import React, { useState, useEffect } from "react";
import { Calendar, Plus, Edit, Trash, X, Users } from "lucide-react";
import { useCourse } from "../../../context/CourseContext";
import { useAuth } from "../../../context/AuthContext";

// API URL
const API_URL = "https://meeting-backend-theta.vercel.app/api/meetings";

export default function TeacherCreateMeeting() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const { courseData } = useCourse();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    startTime: "",
    endTime: "",
    instructor: user.name,
    roomNumber: "",
    color: "#4285F3",
    courseId: "cs1091",
    attendees: [],
    teacherId: user._id,
  });
  const [attendeeInput, setAttendeeInput] = useState("");

  // Fetch meetings when component mounts
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch meetings from API
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      // Fix the filter logic to properly filter teacher meetings
      setMeetings(data.filter((meeting) => meeting.teacherId === user._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new meeting
  const createMeeting = async () => {
    try {
      // Create a clean version of the form data for POST
      const meetingData = {
        subject: formData.subject,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        instructor: formData.instructor,
        roomNumber: formData.roomNumber,
        color: formData.color,
        courseId: formData.courseId,
        attendees: formData.attendees,
        teacherId: formData.teacherId,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      await fetchMeetings();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update an existing meeting
  const updateMeeting = async () => {
    try {
      // Create a clean version of the form data for PUT
      const updateData = {
        subject: formData.subject,
        description: formData.description,
        roomNumber: formData.roomNumber,
        color: formData.color,
        // Only include these if they were updated
        ...(formData.startTime && { startTime: formData.startTime }),
        ...(formData.endTime && { endTime: formData.endTime }),
        instructor: formData.instructor,
        courseId: formData.courseId,
        teacherId: formData.teacherId,
      };

      const response = await fetch(`${API_URL}/${currentMeeting._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update meeting");
      }

      await fetchMeetings();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a meeting
  const deleteMeeting = async (id) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete meeting");
      }

      await fetchMeetings();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding attendee
  const handleAddAttendee = () => {
    if (attendeeInput && !formData.attendees.includes(attendeeInput)) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, attendeeInput],
      });
      setAttendeeInput("");
    }
  };

  // Handle removing attendee
  const handleRemoveAttendee = (email) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((a) => a !== email),
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      subject: "",
      description: "",
      startTime: "",
      endTime: "",
      instructor: user.name,
      roomNumber: "",
      color: "#4285F3",
      courseId: "cs1091",
      attendees: [],
      teacherId: user._id,
    });
    setCurrentMeeting(null);
  };

  // Open modal for create/edit
  const openModal = (meeting = null) => {
    if (meeting) {
      // Format dates for input
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toISOString().slice(0, 16);
      };

      setFormData({
        subject: meeting.subject || "",
        description: meeting.description || "",
        startTime: formatDate(meeting.startTime),
        endTime: formatDate(meeting.endTime),
        instructor: meeting.instructor || user.name,
        roomNumber: meeting.roomNumber || "",
        color: meeting.color || "#4285F3",
        courseId: meeting.courseId || "cs1091",
        attendees: meeting.attendees || [],
        teacherId: meeting.teacherId || user._id,
      });
      setCurrentMeeting(meeting);
    } else {
      resetForm();
    }

    setShowModal(true);
  };

  // Format date for display
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">
              Meeting Manager
            </h1>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary/80 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary"
          >
            <Plus className="w-4 h-4 mr-1" /> New Meeting
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              No meetings found. Click "New Meeting" to create one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{
                        borderLeft: `4px solid ${meeting.color || "#4285F3"}`,
                        paddingLeft: "8px",
                      }}
                    >
                      {meeting.subject || "Untitled Meeting"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {meeting.description || "No description"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(meeting)}
                      className="text-gray-500 hover:text-primary p-1"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteMeeting(meeting._id)}
                      className="text-gray-500 hover:text-red-500 p-1"
                      title="Delete"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">When:</span>{" "}
                    {formatDateTime(meeting.startTime)} -{" "}
                    {formatDateTime(meeting.endTime)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Room:</span>{" "}
                    {meeting.roomNumber || "Not assigned"}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Course ID:</span>{" "}
                    {meeting.courseId || "Not assigned"}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Participants:</span>{" "}
                    {meeting.attendees ? meeting.attendees.length : 0}
                  </div>
                </div>

                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Attendees:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meeting.attendees.map((email, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-green-100 text-primary text-xs px-2 py-1 rounded-full"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {currentMeeting ? "Edit Meeting" : "Create Meeting"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {!currentMeeting && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="roomNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Room Number
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="courseId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Course ID
                  </label>
                  <input
                    type="text"
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="#4285F3">Blue</option>
                  <option value="#4CAF50">Green</option>
                  <option value="#FBBC05">Yellow</option>
                  <option value="#EA4335">Red</option>
                  <option value="#9C27B0">Purple</option>
                  <option value="#FF9800">Orange</option>
                </select>
              </div>

              {!currentMeeting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendees
                  </label>
                  <div className="flex">
                    <input
                      type="email"
                      value={attendeeInput}
                      onChange={(e) => setAttendeeInput(e.target.value)}
                      placeholder="Email address"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttendee}
                      className="px-4 py-2 bg-primary/80 text-white rounded-r-md hover:bg-primary"
                    >
                      Add
                    </button>
                  </div>

                  {formData.attendees.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.attendees.map((email, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center bg-green-100 text-primary text-xs rounded-full px-3 py-1"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttendee(email)}
                            className="ml-1 textprimary/80 hover:text-primary"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={currentMeeting ? updateMeeting : createMeeting}
                  className="px-4 py-2 bg-primary/80 text-white rounded-md hover:bg-primary"
                >
                  {currentMeeting ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
