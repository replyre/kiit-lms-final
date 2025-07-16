import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Book } from "lucide-react";

const syllabus = [
  {
    moduleNumber: 1,
    moduleTitle: "Introduction to Statistics and Data Analysis",
    topics: [
      "Measures of central tendency",
      "Measures of variability, moments, Skewness, Kurtosis",
      "Correlation, Coefficient of Correlation, Lines of Regression, Rank Correlation",
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Fundamentals of Probability",
    topics: [
      "Conditional probability, Random Variable, Distribution Function",
      "Expectation, Moment Generating Function, Probability Generating Function",
      "Mean and Variance of distributions, Transformation of random variable",
    ],
  },
];

export default function SyllabusAccordion({ course }) {

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="border  rounded-lg shadow-md">
        <button
          className="w-full flex items-center justify-between p-4  rounded-t-lg"
        >
          <div className="flex items-center space-x-2">
            <Book className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-semibold">Syllabus</span>
          </div>
        </button>

        <motion.div
          initial={{ height: 'auto', opacity: 1 }}
          
          className="overflow-hidden"
        >
          <div className="p-4 bg-white">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Module No.
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Topics
                  </th>
                </tr>
              </thead>
              <tbody>
                {course?.syllabus.map((module) => (
                  <tr key={module.moduleNumber} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {module.moduleNumber}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {module.moduleTitle}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {module.topics.map((topic, index) => (
                          <li key={index}>{topic}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
