import React, { useState } from "react";
import axios from "axios";

export const ResumeImprover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);

    const response = await axios.post(
      "http://localhost:5000/improve_resume",
      formData,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Improved_Resume.docx");
    document.body.appendChild(link);
    link.click();
    link.remove();

    setLoading(false);
  };
  return (
    <div>
      <h1>Resume Improver</h1>
      <input
        type="file"
        accept=".doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <br />
      <br />
      <textarea
        placeholder="Paste job description here ..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={10}
        cols={50}
      ></textarea>
      <br />
      <br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "improving..." : "Improve Resume"}
      </button>
    </div>
  );
};
