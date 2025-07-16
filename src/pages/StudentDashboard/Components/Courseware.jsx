import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book } from "lucide-react";
import { getAllStudentCourses } from "../../../services/course.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";

const semesters = [
  { name: "Semester 1", accessible: true },
  { name: "Semester 2", accessible: false },
  { name: "Semester 3", accessible: false },
  { name: "Semester 4", accessible: false },
  { name: "Semester 5", accessible: false },
  { name: "Semester 6", accessible: false },
];

const image = [
  "https://thumbs.dreamstime.com/b/businessman-looking-dice-sketch-thoughtful-chalkboard-connected-game-probability-theory-73451825.jpg",
  "https://i.ytimg.com/vi/96bNsQgv10A/maxresdefault.jpg",
];

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const Courseware = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllStudentCourses();
        image.forEach((img, index) => {
          if (data.courses[index]) {
            data.courses[index].coverImage = img; // Assign image to each course
          }
        });
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-7xl mx-auto ">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-md border-b border-gray-100">
        <ul className="flex space-x-4 px-4 py-2 bg-gray-50">
          {semesters.map((semester, index) => (
            <li key={index}>
              <button
                onClick={() => semester.accessible && setActiveTab(index)}
                className={`px-4 py-2 rounded-lg transition-all text-base ${
                  activeTab === index
                    ? "bg-primary/10 text-primary font-medium"
                    : semester.accessible
                    ? "text-tertiary hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                disabled={!semester.accessible}
              >
                {semester.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-primary mb-4">
            {semesters[activeTab].name} Courses
          </h1>

          {loading ? (
            <LoadingSpinner />
          ) : courses.length === 0 ? (
            <p className="text-center text-tertiary mt-4">
              No courses available for this semester.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/student/course/${course._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  style={{
                    maxWidth: "300px", // Set max width for the card
                    margin: "0 auto", // Center the card horizontally
                  }}
                >
                  <img
                    src={course.coverImage || DEFAULT_COURSE_IMAGE}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <Book className="h-8 w-8 text-primary flex-shrink-0 mr-2" />
                      <h2 className="text-[20px] font-semibold text-secondary truncate">
                        {course.title}
                      </h2>
                    </div>

                    <p className="text-sm text-tertiary mb-2 line-clamp-3">
                      {course.aboutCourse.substring(0, 100) + "..."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courseware;
