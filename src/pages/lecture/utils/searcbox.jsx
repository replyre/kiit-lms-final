import React, { useRef, useEffect, useState } from "react";
import {
  Search,
  Upload,
  Sparkles,
  ChevronDown,
  Link2,
  Image,
  Loader,
  Square,
  ChevronUp,
} from "lucide-react";

import ReactMarkdown from "react-markdown";

const AutoResizeTextbox = () => {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("v1");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [responseIndex, setResponseIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [text]);

  // Typewriter effect for response
  useEffect(() => {
    if (response && responseIndex < response.length && isGenerating) {
      const timer = setTimeout(() => {
        setDisplayedResponse((prev) => prev + response[responseIndex]);
        setResponseIndex((prevIndex) => prevIndex + 1);
      }, 15); // Speed of typewriter effect

      return () => clearTimeout(timer);
    } else if (responseIndex >= response.length && isGenerating) {
      setIsGenerating(false);
    }
  }, [response, responseIndex, isGenerating]);

  // When response is set, immediately start displaying it
  useEffect(() => {
    if (response && responseIndex === 0) {
      setIsGenerating(true);
    }
  }, [response, responseIndex]);

  // Auto scroll response container
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [displayedResponse]);

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  const handleSearch = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResponse("");
    setDisplayedResponse("");
    setResponseIndex(0);
    setIsGenerating(true);

    try {
      // Use a CORS proxy to handle the HTTP request
      const apiUrl = "http://16.171.234.123:4000/ask";

      // Using CORS Anywhere as a public proxy (you may want to set up your own)
      const corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
      // Alternative public proxies you can try:
      // const corsProxyUrl = "https://api.allorigins.win/raw?url=";
      // const corsProxyUrl = "https://corsproxy.io/?";

      const proxyUrl = `${corsProxyUrl}${apiUrl}`;

      const res = await fetch(
        "https://ca-dev-chatbot.whitegrass-ce3c3d28.centralindia.azurecontainerapps.io/api/chat ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest", // Required by some CORS proxies
          },
          body: JSON.stringify({ question: text, show_chunks: false }),
        }
      );

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      console.log(data.answer);

      // Ensure we have a valid response that's not empty
      const answer = data.answer || "No response received";
      setResponse(answer);

      // If for some reason the response is empty or undefined, show an error
      if (!answer || answer.trim() === "") {
        setDisplayedResponse("No response received from the server.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResponse(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setDisplayedResponse(response);
    setResponseIndex(response.length);
  };

  return (
    <div className="w-full flex flex-col justify-between bg-gray-50 min-h-fit">
      <div className="w-full max-w-7xl mx-auto p-4 flex flex-col h-full">
        {/* Response Area - Always rendered but with conditional content */}
        <div
          ref={responseRef}
          className="bg-white rounded-2xl shadow-lg mb-4 p-6 flex-grow overflow-y-auto max-h-[60vh]"
          style={{ display: loading || displayedResponse ? "block" : "none" }}
        >
          {loading && (
            <div className="flex justify-center items-center h-16">
              <Loader size={24} className="text-emerald-600 animate-spin" />
            </div>
          )}
          {displayedResponse && (
            <div className="prose max-w-none">
              <ReactMarkdown>{displayedResponse}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className="relative bg-white rounded-2xl shadow-lg"
          ref={containerRef}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <Sparkles size={16} className="text-emerald-600" />
                <span className="text-sm font-medium">{selectedModel}</span>
                {isDropdownOpen ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleModelSelect("v1")}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedModel === "v1" ? "bg-gray-100 font-medium" : ""
                    }`}
                  >
                    v1
                  </button>
                  <button
                    onClick={() => handleModelSelect("v2")}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedModel === "v2" ? "bg-gray-100 font-medium" : ""
                    }`}
                  >
                    v2
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Input Area */}
          <div className="relative flex items-end px-4 pb-4">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full min-h-[40px] max-h-[400px] pr-12 pl-3 py-3
                        resize-none overflow-y-auto focus:outline-none
                        flex flex-col-reverse text-gray-800"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              rows={1}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`absolute right-6 bottom-6 p-2 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        transition-colors duration-200 ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                        }`}
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>

          {/* Bottom Bar with Options */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Focus: Accurate</span>
              <span>•</span>
              <span>Length: Balanced</span>
            </div>
            <div className="text-xs text-gray-500">
              {text.length > 0
                ? `Characters: ${text.length}`
                : "Powered by Dhamm AI"}
            </div>
          </div>
        </div>

        {/* Stop Generation Button - Only visible when generating text */}
        {isGenerating && (
          <div className="flex justify-center mt-4">
            <button
              onClick={stopGeneration}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Square size={16} fill="white" />
              <span>Stop Generating</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoResizeTextbox;
