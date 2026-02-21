import { useMemo, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

import Sidebar from "../components/Sidebar";
import ChatTwin from "../components/ChatTwin";
import SkillDashboard from "../components/SkillDashboard";
import LearningRoadmap from "../components/LearningRoadmap";
import UploadResume from "../components/UploadResume";

function buildRoadmap(missingSkills = []) {
  const unique = Array.from(new Set(missingSkills.filter(Boolean)));
  if (unique.length === 0) {
    return [
      { day: "30 Days", title: "Sharpen Core Skills", color: "bg-orange-400" },
      { day: "60 Days", title: "Build Portfolio Projects", color: "bg-orange-500" },
      { day: "90 Days", title: "Interview Readiness", color: "bg-blue-500" },
    ];
  }

  const buckets = [unique.slice(0, 3), unique.slice(3, 6), unique.slice(6, 9)];
  const labels = ["30 Days", "60 Days", "90 Days"];
  const colors = ["bg-orange-400", "bg-orange-500", "bg-blue-500"];

  return labels.map((day, idx) => ({
    day,
    title: buckets[idx].length > 0 ? buckets[idx].join(", ") : "Project Practice & Mock Interviews",
    color: colors[idx],
  }));
}

export default function Dashboard() {
  const [trend, setTrend] = useState([]);
  const [readiness, setReadiness] = useState(0);
  const [futureSkills, setFutureSkills] = useState([]);
  const [skillIntelligence, setSkillIntelligence] = useState({});
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roadmapSteps = useMemo(
    () => buildRoadmap(gapAnalysis?.missing_skills || []),
    [gapAnalysis]
  );

  const runAnalysis = async (skills, role) => {
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/analyze", {
        skills,
        target_role: role,
      });

      const trendAnalysis = res.data.trend_analysis || [];
      const readinessScore = res.data.ai_readiness || 0;
      const gap = res.data.gap_analysis || null;
      const skillIntel = res.data.skill_intelligence || {};

      setTrend(trendAnalysis);
      setReadiness(readinessScore);
      setSkillIntelligence(skillIntel);
      setGapAnalysis(gap);
      setFutureSkills(
        trendAnalysis
          .filter((item) => item.status === "Surge")
          .map((item) => item.skill)
      );

      setChatContext({
        role,
        readiness: readinessScore,
        topSurge: trendAnalysis
          .filter((item) => item.status === "Surge")
          .slice(0, 3)
          .map((item) => item.skill),
        missingSkills: (gap?.missing_skills || []).slice(0, 6),
      });
    } catch (e) {
      console.error(e);
      setError("Analysis failed. Please retry with another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-sm selection:bg-blue-100 bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass-blue py-3 px-6 text-center text-white sticky top-0 z-50 shadow-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[1600px] mx-auto flex justify-center items-center gap-2"
        >
          <div className="text-xl font-bold">Career</div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none uppercase">
              Vanguard AI
            </h1>
            <p className="text-[7px] font-bold opacity-80 mt-0.5 tracking-[0.15em]">
              Career Counsellor
            </p>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full overflow-hidden">
        {/* Left Sidebar - Scrollable */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0"
          >
            <UploadResume onAnalyze={runAnalysis} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <SkillDashboard trend={trend} readiness={readiness} skillIntelligence={skillIntelligence} />
          </motion.div>
        </div>

        {/* Center - Chat and Roadmap */}
        <div className="lg:col-span-6 space-y-4 flex flex-col min-h-0 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-h-[300px]"
          >
            <ChatTwin analysis={chatContext} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            <LearningRoadmap steps={roadmapSteps} />
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 text-xs font-medium"
            >
              ⚠️ {error}
            </motion.div>
          ) : null}
        </div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 flex flex-col min-h-0"
        >
          <Sidebar
            futureSkills={futureSkills}
            targetRole={gapAnalysis?.target_role || "software developer"}
            completionPercent={gapAnalysis?.completion_percent || 0}
          />
        </motion.div>
      </div>
    </div>
  );
}