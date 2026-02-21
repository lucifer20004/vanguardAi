import { useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";

export default function UploadResume({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post("/scan-resume", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Resume response:", res.data);

      const skillsString = res.data.skills || "";
      const skills = skillsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      console.log("Parsed skills:", skills);

      // Store resume data for display
      setResumeData({
        skills,
        experience: res.data.experience_years || 0,
        summary: res.data.experience_summary || "",
        education: res.data.education || "",
        certifications: res.data.certifications || ""
      });

      // Trigger analysis only if we have skills
      if (skills.length > 0) {
        await onAnalyze(skills, "software developer");
      } else {
        setError("No skills found in resume. Please check your file.");
      }
      setFile(null);
    } catch (err) {
      console.error("Upload failed", err);
      setError("Something went wrong during upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3 max-h-fit"
    >
      <h2 className="text-sm font-bold text-slate-800">Upload Resume</h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Upload className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
        <label className="text-xs text-slate-600 font-medium cursor-pointer">
          {file ? file.name : "Drag or Click"}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg p-2 font-semibold transition-all text-xs"
      >
        {loading ? "Analyzing..." : "Upload"}
      </button>

      {error ? <p className="text-xs text-red-600 text-center font-medium">{error}</p> : null}

      {/* Resume Data Preview */}
      {resumeData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 pt-3 border-t border-slate-200 space-y-2 max-h-[200px] overflow-y-auto"
        >
          <div className="text-xs text-slate-600 space-y-1.5">
            {resumeData.experience > 0 && (
              <div>
                <span className="font-semibold text-slate-700">Exp:</span> {resumeData.experience}y
              </div>
            )}
            
            <div>
              <span className="font-semibold text-slate-700">Skills:</span> {resumeData.skills.length} found
              <div className="flex flex-wrap gap-1 mt-1.5">
                {resumeData.skills.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {resumeData.skills.length > 4 && (
                  <span className="text-slate-500 text-xs font-medium">+{resumeData.skills.length - 4}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}