import React, { useState } from "react";

export const CoverLetterGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    hiringManagerName: "",
    hiringManagerTitle: "",
    companyName: "",
    companyAddress: "",
    positionTitle: "",
    howHeardAbout: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) {
      alert("Please upload a resume and provide job description");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);
    formData.append("personalInfo", JSON.stringify(personalInfo));

    try {
      const response = await fetch(
        "http://localhost:5000/generate_cover_letter",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Cover_Letter.docx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        throw new Error("Failed to generate cover letter");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Error generating cover letter. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Cover Letter Generator
      </h1>

      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={personalInfo.fullName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={personalInfo.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={personalInfo.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="address"
              placeholder="Your Address"
              value={personalInfo.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Company Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="positionTitle"
              placeholder="Position Title (e.g., Software Engineer)"
              value={personalInfo.positionTitle}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={personalInfo.companyName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="hiringManagerName"
              placeholder="Hiring Manager Name (optional)"
              value={personalInfo.hiringManagerName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="hiringManagerTitle"
              placeholder="Hiring Manager Title (optional)"
              value={personalInfo.hiringManagerTitle}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="companyAddress"
              placeholder="Company Address (optional)"
              value={personalInfo.companyAddress}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-full"
            />
            <input
              type="text"
              name="howHeardAbout"
              placeholder="How did you hear about this position?"
              value={personalInfo.howHeardAbout}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-full"
            />
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Upload Resume
          </h2>
          <div className="relative">
            <input
              type="file"
              accept=".doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
          )}
        </div>

        {/* Job Description Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Job Description
          </h2>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            cols={80}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !file || !jobDescription.trim()}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Cover Letter"
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Instructions:
        </h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>Fill in your personal information for the header</li>
          <li>Add company details and position information</li>
          <li>Upload your resume in .doc or .docx format</li>
          <li>Paste the complete job description</li>
          <li>
            The generated cover letter will follow professional formatting with
            proper structure
          </li>
          <li>
            Your skills and experience will be matched to the job requirements
          </li>
        </ul>
      </div>
    </div>
  );
};
