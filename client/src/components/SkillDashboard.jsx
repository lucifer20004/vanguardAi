import { motion } from "framer-motion";
import { TrendingUp, Zap, DollarSign, BookOpen, Target } from "lucide-react";

export default function SkillDashboard({ trend = [], readiness = 0, skillIntelligence = {} }) {
  // Only use real data - no fallback hardcoded skills
  const skillsList = trend;

  // Map skills with intelligence
  const skillsWithIntelligence = skillsList.map((skill) => {
    const skillKey = skill.skill.toLowerCase();
    const intel = 
      (skill.intelligence) || 
      skillIntelligence[skillKey] || 
      {
        demand: "Medium",
        growth_rate: "10%",
        market_pay: "70k",
        learning_difficulty: "Medium",
        industry_impact: "Tech",
        recommendation: "Good to learn"
      };

    return {
      ...skill,
      name: skill.skill.charAt(0).toUpperCase() + skill.skill.slice(1),
      color:
        skill.status === "Surge"
          ? "bg-green-500"
          : skill.status === "Stable"
          ? "bg-blue-500"
          : "bg-yellow-500",
      intelligence: intel
    };
  });

  const getDemandColor = (demand) => {
    switch (demand) {
      case "High":
        return "bg-green-100 text-green-700 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getRecommendationColor = (rec) => {
    if (rec.includes("Must")) return "bg-red-50 border-l-4 border-red-500";
    if (rec.includes("Good")) return "bg-blue-50 border-l-4 border-blue-500";
    return "bg-slate-50 border-l-4 border-slate-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 flex flex-col max-h-[500px] overflow-hidden"
    >
      <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2 sticky top-0 bg-white/50 backdrop-blur py-1 z-10">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Skills & Intelligence
      </h3>

      {/* Skills Section */}
      {skillsWithIntelligence.length > 0 ? (
        <div className="space-y-3 mb-4 overflow-y-auto flex-1">
          {skillsWithIntelligence.map((skill, idx) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              {/* Skill Bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">{skill.name}</span>
                  <span className="text-xs font-bold text-slate-800">{skill.future_score}</span>
                </div>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.future_score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full ${skill.color} rounded-full`}
                  />
                </div>
              </div>

              {/* Skill Intelligence Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className={`p-3 rounded-lg border mb-3 text-xs space-y-2 bg-[#FFF9E3]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-600"><strong>{skill.status}</strong></span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getDemandColor(skill.intelligence.demand)}`}>
                    {skill.intelligence.demand}
                  </span>
                </div>

                {/* Intelligence Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Zap className="w-3 h-3 text-orange-500 flex-shrink-0" />
                    <span><strong>{skill.intelligence.growth_rate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <DollarSign className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span><strong>{skill.intelligence.market_pay}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <BookOpen className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <span><strong>{skill.intelligence.learning_difficulty}</strong></span>
                  </div>
                  <div className="col-span-2 text-slate-600">
                    <Target className="w-3 h-3 text-purple-500 inline flex-shrink-0 mr-1" />
                    <span><strong>{skill.intelligence.industry_impact}</strong></span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="text-xs font-semibold text-slate-700 pt-1">
                  📌 {skill.intelligence.recommendation}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="py-8 px-3">
            <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Upload your resume to see skill intelligence</p>
          </div>
        </div>
      )}

      {/* Readiness Section */}
      <div className="mt-auto pt-3 border-t border-slate-200 sticky bottom-0 bg-white/50 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">Readiness</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base font-bold text-blue-600"
          >
            {readiness}%
          </motion.span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${readiness}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}