import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Book } from "lucide-react";

export default function SyllabusAccordion({ course }) {
  // State to manage the accordion's open/closed status
  const [isOpen, setIsOpen] = useState(true);

  // Safely access the modules array from the new JSON structure
  const modules = course?.syllabus?.modules;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="border rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Book className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-800">Syllabus</span>
          </div>
          {/* Show up/down chevron based on state */}
          {isOpen ? <ChevronUp className="text-gray-600"/> : <ChevronDown className="text-gray-600"/>}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.section
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white border-t border-gray-200">
                {/* Check if modules data exists and is not empty */}
                {modules && modules.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Module No.
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Title
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Topics
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Map over the 'modules' array */}
                      {modules.map((module) => (
                        <tr key={module.moduleNumber} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 align-top w-28">
                            {module.moduleNumber}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 align-top font-medium text-gray-800">
                            {module.moduleTitle}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 align-top">
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
                ) : (
                  // Display this message if no syllabus is found
                  <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-md">
                    <p>The syllabus for this course has not been uploaded yet.</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}