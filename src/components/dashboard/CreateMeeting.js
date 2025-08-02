import React, { useEffect, useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  FaVideo,
  FaClock,
  FaUserTie,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { useMeeting } from "../../context/MeetingContext"; // 1. Import the context hook

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// --- Child Components (No changes needed here) ---
const EventComponent = ({ event }) => (
  <div
    className="flex items-center h-full p-1 overflow-hidden"
    style={{
      backgroundColor: event.color,
      borderLeft: `4px solid ${event.color}`,
    }}
    data-tooltip-id={`tooltip-${event._id}`}
  >
    <span className="text-white text-sm font-medium truncate">
      {event.subject}
    </span>
  </div>
);

const SubjectMeeting = ({ meeting, onJoin }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{meeting.subject}</h2>
        <p className="text-gray-500 text-sm mt-1">{meeting.description}</p>
      </div>
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: meeting.color }}
      ></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex items-center text-gray-600">
        <FaUserTie className="mr-2 text-gray-400" />
        <span>{meeting.instructor}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaClock className="mr-2 text-gray-400" />
        <span>
          {moment(meeting.start).format("h:mm A")} -{" "}
          {moment(meeting.end).format("h:mm A")}
        </span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaCalendarAlt className="mr-2 text-gray-400" />
        <span>{moment(meeting.date).format("dddd, MMMM D, YYYY")}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaChalkboardTeacher className="mr-2 text-gray-400" />
        <span>{meeting.roomNumber}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaUsers className="mr-2 text-gray-400" />
        <span>{meeting.participants} participants</span>
      </div>
    </div>
    <a
      href={meeting.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-accent1 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors duration-300 mt-2"
      onClick={(e) => {
        e.preventDefault();
        onJoin(meeting);
      }}
    >
      <div className="flex items-center justify-center">
        <FaVideo className="mr-2" />
        Join Meeting
      </div>
    </a>
  </div>
);

// --- Main Component (Refactored) ---
const CreateMeeting = () => {
  // 2. Get meetings and loading state from the context
  const { meetings, loading, error } = useMeeting();

  // Local UI state remains here
  const [view, setView] = useState("cards"); // 'calendar' or 'cards'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // 3. Process the meetings from context to create Date objects for the calendar
  // useMemo ensures this only runs when the meetings data changes
  const processedMeetings = useMemo(() => {
    return meetings.map((meeting) => ({
      ...meeting,
      date: new Date(meeting.date),
      start: new Date(meeting.start),
      end: new Date(meeting.end),
    }));
  }, [meetings]);

  // Filter meetings for the selected date in card view
  const filteredMeetings =
    view === "cards"
      ? processedMeetings.filter(
          (meeting) =>
            moment(meeting.date).format("YYYY-MM-DD") ===
            moment(selectedDate).format("YYYY-MM-DD")
        )
      : processedMeetings;

  // Handle calendar event selection
  const handleSelectEvent = (event) => {
    setSelectedMeeting(event);
  };

  // Handle calendar navigation
  const handleNavigate = (date) => {
    setSelectedDate(date);
  };

  // Handle join meeting
  const handleJoinMeeting = (meeting) => {
    window.open(meeting.link, "_blank");
  };

  // Create events for the calendar from the processed data
  const calendarEvents = processedMeetings.map((meeting) => ({
    ...meeting,
    title: meeting.subject,
  }));

  // Custom calendar components and styling
  const calendarComponents = {
    event: EventComponent,
  };

  // 4. Use the loading state from the context
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading meetings...</p>
      </div>
    );
  }

  // Handle any errors from the context
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Class Meetings Calendar
            </h1>
            <p className="text-gray-500 mt-1">
              Schedule and join your virtual classroom sessions
            </p>
          </div>

          {/* View toggle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
            <button
              className={`px-4 py-2 rounded ${
                view === "calendar"
                  ? "bg-accent1 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </button>
            <button
              className={`px-4 py-2 rounded ${
                view === "cards"
                  ? "bg-accent1 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setView("cards")}
            >
              List View
            </button>
          </div>
        </div>

        {/* Main content area */}
        {view === "calendar" ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div style={{ height: 600 }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={["month", "week", "day"]}
                defaultView="day"
                selectable
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate}
                components={calendarComponents}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: event.color,
                  },
                })}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100"
                  onClick={() =>
                    setSelectedDate(
                      moment(selectedDate).subtract(1, "days").toDate()
                    )
                  }
                >
                  &larr; Previous Day
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  {moment(selectedDate).format("dddd, MMMM D, YYYY")}
                </h2>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100"
                  onClick={() =>
                    setSelectedDate(
                      moment(selectedDate).add(1, "days").toDate()
                    )
                  }
                >
                  Next Day &rarr;
                </button>
              </div>
            </div>

            {filteredMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeetings.map((meeting) => (
                  <SubjectMeeting
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={handleJoinMeeting}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
                <p className="text-gray-500 text-lg">
                  No meetings scheduled for this day.
                </p>
                <button
                  className="mt-4 bg-accent1 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Return to Today
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meeting details tooltip */}
      {processedMeetings.map((meeting) => (
        <Tooltip
          key={meeting._id}
          id={`tooltip-${meeting._id}`}
          place="top"
          content={
            <div className="p-2 max-w-xs">
              <div className="font-bold mb-1">{meeting.subject}</div>
              <div className="text-sm">{meeting.instructor}</div>
              <div className="text-sm">
                {moment(meeting.start).format("h:mm A")} -{" "}
                {moment(meeting.end).format("h:mm A")}
              </div>
              <div className="text-sm mt-1">{meeting.description}</div>
            </div>
          }
        />
      ))}

      {/* Meeting detail modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {selectedMeeting.subject}
            </h2>
            <p className="text-gray-600 mb-4">{selectedMeeting.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <FaUserTie className="mr-2 text-gray-400" />
                <span>{selectedMeeting.instructor}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-gray-400" />
                <span>
                  {moment(selectedMeeting.start).format("h:mm A")} -{" "}
                  {moment(selectedMeeting.end).format("h:mm A")}
                </span>
              </div>
              <div className="flex items-center">
                <FaChalkboardTeacher className="mr-2 text-gray-400" />
                <span>{selectedMeeting.roomNumber}</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                className="flex-1 bg-accent1 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                onClick={() => window.open(selectedMeeting.link, "_blank")}
              >
                <FaVideo className="mr-2" />
                Join Meeting
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                onClick={() => setSelectedMeeting(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMeeting;