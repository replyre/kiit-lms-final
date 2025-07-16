import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import AssignmentCard from "./AssignmentCard";
import { useCourse } from "../../../../context/CourseContext";
import { getAllCourseAssignments } from "../../../../services/assignment.service";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

const AssignmentsList = ({setSelectedOption}) => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { courseData } = useCourse();
  const { courseID } = useParams();

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourseAssignments({ courseID });
      setAssignments(data.assignments);
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
  }, [courseID]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        {" "}
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Assignments</h2>
        <button
          onClick={() => {setSelectedOption("Recorded")}}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {assignments?.length > 0 ? (
          assignments.map((assignment, index) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              studentId={courseData?.student?.id}
              formatDate={formatDate}
              courseID={courseID}
              index={index}
            />
          ))
        ) : (
          <p className="text-gray-500">No assignments available.</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;
